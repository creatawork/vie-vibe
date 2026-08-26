---
title: DTO 和 Entity 什么时候拆
date: 2026-08-10
tags: [springboot, design]
description: 统计 API 把上报入参、表实体和汇总 VO 分开，避免把表字段直接暴露给页面。
---

## 这个项目里的三层

- 入参：`TrackRequest` 只有 `path` 与 `referrer`，对应 `POST /api/track` 的 JSON。
- 实体：`PageView` 另有 `source`、`ip_hash`、`created_at`，这些由服务端计算，客户端不许传。
- 出参：`Summary` 是聚合后的 PV/UV、按日趋势、Top 路径，不是 `List<PageView>`。

## 什么时候必须拆

对外字段和表字段不一致时：例如 UV 用哈希而不是 IP，来源用解析后的 `source` 而不是原始 referrer 长串。还要在入参上做校验（路径必须以 `/` 开头、长度 ≤ 512），这些规则不属于实体。

## 什么时候可以先不拆

内部一次性脚本、没有外部调用方的表，先用实体跑通再抽 DTO 也可以。本站的统计从第一天就有浏览器调用方，所以第一天就拆了。

`/api/stats/summary` 如果直接序列化 `PageView`，等于把哈希和原始 referrer 形态泄露到口令泄漏时的响应里。VO 把泄漏面收成聚合数字。
