# 个人网站设计文档

日期：2026-08-25
状态：已确认

## 1. 背景与目标

应届生全栈开发者的个人网站，两个核心目标：

1. **求职作品集**：简历挂链接，向面试官/HR 展示技术深度（文章）与项目成果。
2. **技术影响力**：文章被搜索引擎收录，长期积累读者。

核心原则：**内容质量 > 视觉呈现 > 功能复杂度**。架构为内容服务，不为炫技。

## 2. 需求范围

### 2.1 栏目

| 栏目 | 说明 |
|---|---|
| 首页 | 一句话定位 + 最新文章列表 + 精选成果入口（无个人简介） |
| 技术文章 | Markdown 撰写，含实现细节/思路/样例，支持分类、标签、系列 |
| 成果展示 | 项目卡片：截图、描述、技术栈标签、GitHub/Demo 链接 |
| 访问统计 | 仅后台收集，前台不展示；通过隐藏路径页面查看 |

### 2.2 明确不做（YAGNI）

评论、登录、后台管理、全文搜索（用 VitePress 内置本地搜索）、多语言、邮件订阅、个人简介页。

### 2.3 内容增强能力

- Mermaid 图表（架构图/流程图/时序图）
- 阅读时长 / 字数统计
- 系列文章（专题聚合 + 上一篇/下一篇导航）
- 不需要数学公式

### 2.4 订阅与留存

RSS（构建期自动生成 feed）+ 页面挂社交入口（GitHub/知乎/公众号等）。

## 3. 架构总览

**方案：VitePress 静态内容站 + SpringBoot 轻量 API，Monorepo，Docker Compose 部署，GitHub Actions 自动发布。**

```
vie/
├── site/                  # VitePress
│   ├── articles/          # Markdown 文章（按分类分目录）
│   ├── projects.md + projects.data.ts
│   └── .vitepress/        # 配置 + 自定义主题（theme/ 集中定制）
├── server/                # SpringBoot（单模块）
├── deploy/
│   ├── docker-compose.yml
│   └── Caddyfile
├── .github/workflows/deploy.yml
└── docs/
```

选 Monorepo 的理由：一次 push 触发整体部署；文章、代码、部署配置同仓演进，回滚一致。

## 4. URL 结构（冻结，SEO 命门）

```
/                              首页
/articles/                     文章总列表
/articles/<分类>/<slug>        文章详情
/projects                      成果展示
/series/<系列名>               系列专题页
/stats-view                    统计查看页（robots 禁收录 + noindex）
```

- slug 规则：英文小写 + 连字符，**不含日期**。URL 与 VitePress 文件路径一一对应，写文章时即定终身。
- `www` 与裸域 301 统一到裸域，全站 HTTPS。
- 构建期自动生成 `sitemap.xml`，上线后提交百度/Google Search Console。

## 5. 内容模型（frontmatter 规范冻结）

```yaml
---
title: 用 SpringBoot 实现访问统计
date: 2026-08-25
tags: [springboot, mysql, 统计]
series: 个人网站开发实录        # 可选
description: 一句话摘要，用于 SEO meta 和列表页
---
```

- 分类 = 目录；标签 = frontmatter 数组；系列 = frontmatter 字符串。三者正交。
- 系列页自动生成：按 `series` 聚合，按日期排序，文章页内显示系列导航。
- Mermaid、阅读时长通过构建期插件注入，对 Markdown 源码零侵入。

## 6. 后端：SpringBoot 统计 API

单模块，SpringBoot 3 + Spring Data JPA + MySQL 8。

| 接口 | 说明 |
|---|---|
| `POST /api/track` | 前端每次进入页面/路由切换时调用；记录路径、referrer、解析后的来源、IP 哈希、时间 |
| `GET /api/stats/summary` | 总 PV/UV、近 30 天趋势、文章访问排行；需带口令参数 `key` |

### 6.1 数据模型（冻结）

```sql
CREATE TABLE page_view (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  path         VARCHAR(512) NOT NULL,
  referrer     VARCHAR(512),
  source       VARCHAR(64),                -- baidu/google/github/direct...
  ip_hash      CHAR(64) NOT NULL,          -- SHA-256(IP + 每日盐)
  created_at   DATETIME NOT NULL,
  INDEX idx_created (created_at),
  INDEX idx_path_created (path, created_at)
);
```

- UV = 当天 `DISTINCT ip_hash`；每日盐使 IP 哈希跨天不可关联，兼顾隐私。
- 已知限制：现代浏览器不在 referrer 中携带搜索关键词，来源分析只能到"来源域"粒度；关键词数据由 Search Console 补充。
- 低流量不预聚合，查询实时计算 + 接口 1 分钟缓存；数据量到百万行再加聚合表（加表不改表）。

### 6.2 统计查看页

VitePress 中不在导航出现的 `/stats-view` 页面，输入口令后调 `/api/stats/summary` 展示图表。口令存服务端环境变量 `STATS_KEY`。

### 6.3 安全

- `/api/track`：每 IP 每分钟限 60 次；同 IP 同路径 30 秒内重复请求只记一次。
- `/api/stats/*`：校验 `STATS_KEY`，连续错误 5 次封 IP 10 分钟。
- track 接口失败时前端静默忽略，不影响阅读体验。

## 7. 部署架构

三个容器：

| 容器 | 职责 |
|---|---|
| `caddy` | 唯一暴露 80/443；托管静态文件；反代 `/api` 到 app；自动申请/续期 Let's Encrypt 证书；安全响应头（HSTS 等） |
| `app` | SpringBoot，仅内网 |
| `mysql` | MySQL 8，仅内网，不暴露端口 |

- 数据卷：`mysql-data`、`caddy-data`（证书）。
- 备份：宿主机 cron 每日 `mysqldump`，保留最近 14 份；文章在 Git 中天然有备份。
- 服务器一次性前置条件：装好 Docker + Docker Compose、开放 80/443、域名解析指向服务器 IP。

## 8. 发布流水线（GitHub Actions）

```
push 到 main
  ├─ job1: 构建 VitePress → dist 静态产物
  ├─ job2: Maven 打包 SpringBoot → jar
  └─ job3: scp 产物到服务器 → ssh 执行 docker compose up -d --build
```

- **构建在 Actions 跑，服务器只运行容器**：服务器端 `docker build` 仅 COPY 现成产物，秒级完成，对低配置云服务器友好。
- GitHub Actions 是"快递员"，不托管运行时；GitHub 挂了网站照常运行，仅无法自动发布。
- 服务器 IP、SSH 私钥存 GitHub Secrets；`MYSQL_PASSWORD`、`STATS_KEY` 存服务器 `.env`，不进仓库。

## 9. 扩展预留

| 未来可能 | 预留方式 |
|---|---|
| 加评论（Giscus 等） | 纯前端嵌入，架构零改动 |
| 加登录/后台管理 | `/api/admin/**` 路径段预留，Caddy 无需改 |
| 统计加维度（设备/地域） | `page_view` 加列，JPA 平滑迁移 |
| 迁移 Nuxt/SSR | Markdown 内容 + URL 结构不变，只换渲染层 |
| 邮件订阅 | 届时独立模块，不碰现有代码 |

## 10. 测试

- 后端：MockMvc 接口测试——埋点写入、口令校验、防刷去重、限流。
- 前端：以构建通过 + 人工验收为主，不引入前端单测框架。

## 11. 实施顺序

1. VitePress 站点 + 首页/成果页定制 → 先部署上线（纯静态，无后端）
2. 写 2~3 篇种子文章
3. SpringBoot 统计 API + 统计查看页
4. 接入 Search Console、RSS、社交入口，持续写文

## 12. 风险与预期管理

- **SEO 是慢功夫**：新域名有沙盒期， realistically 需持续更新 3~6 个月才有稳定搜索流量；短期求职价值主要来自主动递链接。
- **最大风险是断更**：目标定为每月一篇，能执行两年的计划才是好计划。
- **防烂尾**：尽快上线第一版（哪怕只有首页 + 一篇文章），建立心理锚点。
