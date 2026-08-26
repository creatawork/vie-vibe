---
title: VitePress 主题定制与 vibe 布局
date: 2026-08-18
tags: [vitepress, vue, css]
series: 个人网站开发实录
description: 用 Layout 插槽和 Bento 首页换掉默认 Hero，样式拆成 token 与磁贴两层。
---

## 决策

VitePress 默认 `layout: home` 的 Hero 适合文档产品，不适合「打开就能扫到定位和最新文章」。首页 Markdown 只挂 `<HomeBento />`，识别度来自磁贴、语法色和 Vie 字标，而不是再套一层终端皮肤。

## 怎么挂进去

`site/.vitepress/theme/index.ts` 扩展默认主题，替换 `Layout`。`Layout.vue` 只做三件事：字标插到 `nav-bar-title-before`，文章页 `doc-before` 里写日期/字数/系列，以及挂 `SeriesNav`。列表页自己包 `VieShell`，不和首页抢结构。

## 样式分层

- `custom.css`：颜色 token、导航、文章阅读面板、字数行。
- `vie-bento.css`：首页 grid、磁贴、feed、成果卡、统计页。

组件边界：`HomeBento.vue` 只组首页；`ArticleList` / `Projects` / `SeriesIndex` 共用 `VieShell`。新增列表页时先套壳，再加一种磁贴，避免第三份布局语言。

## 边界

不改 VitePress 的文章 HTML 管线。代码高亮、目录、上一篇下一篇走默认主题；我们只在外壳上表达 vibe-coding。阅读面板颜色和点阵底在 `DESIGN.md`，改视觉先改 token，再动组件。
