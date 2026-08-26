---
title: SpringBoot 统计接口怎么设计
date: 2026-08-20
tags: [springboot, api, mysql]
series: 个人网站开发实录
description: 埋点上报、按日聚合与口令鉴权的 API 分层与表结构样本。
---

## 需求边界

前台只上报路径与来源；后台用口令拉汇总。不做实时大屏，**样本目标**是面试官能看懂数据从哪来、怎么存。

## 接口（样本）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/track` | 上报一次 PV |
| GET | `/api/stats/summary?key=` | 汇总 + 近 30 日趋势 |

## 表结构要点

- `page_view`：路径、来源、时间戳
- 按日聚合用 `DATE(created_at)` 分组，UV 用 IP 或访客标识去重（样本用 IP）

## 为什么不用第三方统计

可控、可写进简历、和静态站同域部署，**决策可解释**。
