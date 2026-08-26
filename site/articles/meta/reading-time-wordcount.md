---
title: 阅读时长与字数怎么算
date: 2026-08-12
tags: [vitepress, meta]
description: 列表用构建期去掉 YAML 后的字符数，正文页用浏览器对 .vp-doc 再数一遍。
---

## 列表里的数字

`site/.vitepress/posts.ts` 的 `toPost`：去掉 frontmatter 后对正文 `replace(/\s/g, '')` 得到字符数（中文按字，英文按字符，空格不计）。阅读时长 `Math.max(1, Math.ceil(wordCount / 400))`，400 是本站常数，偏中文阅读。

## 正文页为什么再算一次

`Layout.vue` 在客户端查 `.vp-doc` 的 `textContent`，用同一套去空白和 400 字/分钟。构建期 loader 拿的是 Markdown 源，客户端拿的是渲染后的 DOM（含代码块、表格、组件注入的字）。两者可以差几十到几百字。

## 接受差异

列表用来扫文、RSS 和首页卡片；页内数字用来读这页时心里有个数。不把其中一个回写成 frontmatter，以免每次改主题都要重算 Git 历史。若以后要完全一致，只保留构建期字段并在 Layout 读取 `articles.data`，那是另一次改动。当前实现里两处常数必须同为 400，改一处就要改另一处。
