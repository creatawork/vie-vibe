---
title: 阅读时长与字数怎么算
date: 2026-08-12
tags: [vitepress, meta]
description: 正文去 frontmatter 后计字、按 400 字/分钟估算阅读时长的样本逻辑。
---

## 计字

去掉 YAML frontmatter，正文 `replace(/\s/g, '')` 得字符数（中文友好）。

## 阅读时长

`Math.max(1, Math.ceil(wordCount / 400))` — 样本常数，后续可按中英文混合调参。

## 展示位置

- 列表：`articles.data` 派生字段
- 正文：`Layout.vue` 客户端对 `.vp-doc` 再算一遍（与列表可能略有差异，样本接受）
