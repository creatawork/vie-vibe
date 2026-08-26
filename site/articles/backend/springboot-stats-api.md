---
title: SpringBoot 统计接口怎么设计
date: 2026-08-20
tags: [springboot, api, mysql]
series: 个人网站开发实录
description: 同域上报 PV、日盐哈希 UV、内存缓存汇总，口令接口与页面写入分离。
---

## 需求边界

前台只上报路径和 `referrer`，见 `site/.vitepress/theme/track.ts`。后台用口令拉汇总。不做实时大屏，前台也不渲染访问数字。

## 接口与模型

`StatsController` 挂在 `/api`：

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/track` | 上报一次浏览，成功 `204` |
| GET | `/api/stats/summary?key=` | 汇总、30 日趋势、Top 页；口令错误 `401`，连续失败封禁 `429` |

写入用 `TrackRequest(path, referrer)` 入参 DTO，持久化是 `PageView` 实体（`path`、`referrer`、`source`、`ip_hash`、`created_at`）。汇总形状是只读 `Summary`，不会把实体列表丢给浏览器。

## 隐私与限流

原始 IP 不入库。`IpHasher` 用当天日期加 `IP_SECRET` 做 HMAC-SHA256，次日哈希换盐，避免长期追踪。同一 `ip_hash + path` 30 秒内去重；按 IP 每分钟最多 60 次写入（`RateLimiter`）。`summary()` 进程内缓存 60 秒，单实例足够，查询不必每次扫全表细节。

口令来自环境变量 `STATS_KEY`，由 `KeyGuard` 对失败次数计数。密钥只在服务器 `.env`，不进 Git。

## 为什么自建

第三方脚本会把阅读行为送出站点，也很难写进「我如何设计接口」这种面试叙事。自建的代价是要自己做校验、去重和口令，这些代价有对应代码：`StatsService.track` 与 `StatsController.summary`。
