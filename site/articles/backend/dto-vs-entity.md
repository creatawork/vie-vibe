---
title: DTO 和 Entity 什么时候拆
date: 2026-08-10
tags: [springboot, design]
description: 接口入参/出参与持久化模型分离的样本场景，避免把表结构暴露给前端。
---

## 拆

- 对外 API 字段 ≠ 表字段（隐藏内部 ID、脱敏）
- 组合多个表的数据成一个响应
- 校验规则只作用于入参 DTO

## 不拆（样本里可接受）

- 内部 CRUD 原型、单表简单资源
- 个人项目体量小，**先跑通再拆** 也可写进文章

## 样本结论

个人站统计 API：`TrackRequest` DTO + `PageView` Entity，Summary 用只读 VO。
