---
title: Caddy 反代静态站与 API
date: 2026-08-05
tags: [caddy, docker, devops]
description: 同域 `/` 走静态文件、`/api` 反代 SpringBoot 的 Caddy 配置样本。
---

## 目标

浏览器只访问 `vie-vibe.cn`，Cookie 与同域策略简单；埋点 POST 无跨域。

## 样本配置片段

```text
vie-vibe.cn {
  root * /var/www/vie
  file_server
  handle /api/* {
    reverse_proxy localhost:8080
  }
}
```

## TLS

Caddy 自动 HTTPS；证书续期不用单独 certbot（样本运维点）。
