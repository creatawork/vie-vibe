---
title: 本地缓存 vs Redis：个人项目怎么选
date: 2026-08-08
tags: [redis, cache, notes]
description: 单实例汇总接口用 60 秒内存缓存；没有多进程共享需求时不引入 Redis。
---

## 场景

`StatsService.summary()` 要算 30 天趋势和 Top 页，读多写少。部署是 Compose 里一个 `app` 容器，没有水平扩展。

## 实际选择

`StatsService` 用 `volatile Summary cached` 加时间戳，60 秒内重复请求直接返回。`track()` 成功写入后把 `cached = null`，避免新 PV 最长脏读超过缓存窗口加一次写入。

| 条件 | 选择 |
|------|------|
| 单实例、读多写少 | 进程内缓存（当前） |
| 多个 API 副本要共享同一份汇总 | Redis 存日汇总 |
| 只有静态站、没有 API | 没有缓存层 |

## 什么时候才加 Redis

出现第二个 `app` 副本，或 summary 的计算明显超过 60 秒窗口仍打满数据库时。现在加 Redis 要多一个容器、一套失效策略，而失效已经靠写路径清空内存引用解决了。文章只把边界写清，不预埋客户端代码。若以后流量上来，优先看能否用更窄的 SQL 和索引，再考虑外置缓存。
