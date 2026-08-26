---
title: Caddy 反代静态站与 API
date: 2026-08-05
tags: [caddy, docker, devops]
description: 同域根路径走静态文件，/api 反代 app 容器，顺带自动 HTTPS 与安全头。
---

## 目标

浏览器只访问 `vie-vibe.cn`。静态页和埋点同站，不必配 CORS，Cookie 策略也简单。配置在 `deploy/Caddyfile`，域名来自 Compose 的 `DOMAIN`。

## 实际分流

```caddy
{$DOMAIN} {
	root * /srv/site
	encode zstd gzip

	handle /api/* {
		reverse_proxy app:8080
	}

	try_files {path} {path}.html {path}/index.html
	file_server
}
```

`/api/*` 进 `app:8080`（Compose 服务名，不是宿主机 localhost）。其余 `try_files` 适配 VitePress 的 `cleanUrls`：先文件，再 `.html`，再目录 `index.html`。`www.{$DOMAIN}` 301 到裸域。

## TLS 与错误页

Caddy 自动 HTTPS，证书在 `caddy-data` 卷。响应头加上 HSTS、`nosniff`、`DENY` frame、`strict-origin-when-cross-origin`。`handle_errors` 把错误改写到 `/404.html`，避免 API 失败时露出默认文本页。

反代目标必须是 Docker 网络里的 `app`。写 `localhost:8080` 会打到 Caddy 容器自己，统计接口会全部 502。
