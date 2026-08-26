---
title: VitePress 主题定制与 vibe 布局
date: 2026-08-18
tags: [vitepress, vue, css]
series: 个人网站开发实录
description: Layout 注入、Bento 首页、磁贴组件与全站暗色阅读面板的实现样本。
---

## 结构

- `Layout.vue`：字标、文章元信息、`SeriesNav`
- `HomeBento.vue`：首页 Bento 磁贴
- `VieShell.vue`：列表页统一壳（状态栏 + panel）

## 样式分层

1. `custom.css` — 全站 token、导航、阅读面板
2. `vie-bento.css` — 磁贴、feed、统计页组件

## 样本页职责

| 页面 | 组件 |
|------|------|
| 首页 | HomeBento |
| 文章列表 | ArticleList + VieShell |
| 成果 | Projects |

不做 `layout: home` 默认 Hero，首页用自定义 Bento 保证 **vibe-coding** 识别度。
