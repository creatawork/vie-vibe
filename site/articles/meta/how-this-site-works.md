---
title: 这个网站是怎么搭起来的
date: 2026-08-25
tags: [vitepress, 建站]
series: 个人网站开发实录
description: 个人网站的技术选型与搭建过程记录。
---

## 为什么这样选

（正文占位：记录 VitePress + SpringBoot 的选型理由。）

## 架构

（正文占位：整体架构说明。）

```mermaid
flowchart LR
  访客 --> Caddy --> 静态文件
  Caddy -->|/api| SpringBoot --> MySQL
```
