---
title: GitHub Actions 自动发布到 VPS
date: 2026-08-15
tags: [github-actions, deploy, docker]
series: 个人网站开发实录
description: 构建 VitePress、同步 dist、重启容器的流水线样本（静态模拟说明）。
---

## 流水线阶段（样本）

1. `npm ci && npm run build`（`site/` 目录）
2. rsync `dist` 到服务器目录
3. SSH 执行 `docker compose pull && up -d`（若后端变更）

## 密钥与权限

- `DEPLOY_KEY` 存 GitHub Secrets
- 服务器只开放 22 / 443，**不**把口令写进仓库

## 失败时

构建失败 → PR 红；部署失败 → 保留上一版静态文件，避免整站空白。

（本文为静态样本，描述 intended 流程。）
