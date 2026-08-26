---
title: GitHub Actions 自动发布到 VPS
date: 2026-08-15
tags: [github-actions, deploy, docker]
series: 个人网站开发实录
description: site 与 server 分成两个 job，静态目录先写新再切，失败时旧 dist 仍可服务。
---

## 为什么拆成两个 job

`.github/workflows/deploy.yml` 在 `main` 上并行：

- `server`：`server/` 下 `mvn -B verify`，把 `server.jar` scp 到 `/opt/vie/app/deploy`，再 `docker compose up -d --build app`。
- `site`：`site/` 下 `npm ci`，先 `npm run check:content` 拦住空壳文章，再 `npm run build`，把 `site/.vitepress/dist/*` 传到 `site-dist-new`。

前端改文不该等 Java 测试；后端改限流不该重传整站静态资源。密钥用 `SERVER_HOST` / `SERVER_USER` / `SERVER_SSH_KEY`，仓库里没有口令。

## 静态站怎么做到可回退

SSH 脚本把现有 `site-dist` 改名为 `site-dist-old`，再把 `site-dist-new` 改成 `site-dist`。Caddy 的 `./site-dist:/srv/site` 是 bind mount，目录 inode 变了进程仍握着旧挂载，所以必须 `docker compose up -d --force-recreate caddy`。若构建失败，job 在上传前红掉，服务器上的 `site-dist` 不会被半套文件替换。

## 边界

没有自动回滚 jar 的第二套槽位：`app` 是 `--build` 后直接 up。静态站有 `site-dist-old` 可人工切回。这是有意的不对称——页面更新更频繁，也更需要原子切换。
