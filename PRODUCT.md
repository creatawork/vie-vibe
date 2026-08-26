# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** 求职场景中的面试官 / HR，通过简历链接快速判断技术深度与项目落地能力。
- **Secondary:** 搜索引擎与技术读者，通过文章获得实现细节与思路。

（推断自站点定位与 `DESIGN.md`，未做二次访谈。）

## Product Purpose

应届生全栈开发者的个人站点 **VIE**（域名 `vie-vibe.cn`）：用技术文章证明「写清楚每一个技术决策」，用成果页展示项目；长期靠 SEO 与 RSS 积累读者。

成功标准：面试官能在几分钟内读到定位、最新文章与项目；文章可被收录；站点稳定可维护。

## Positioning

不是通用博客模板或简历落地页，而是 **以可验证的实现细节为主的技术作品集**：分类文章 + 系列专题 + 项目卡片；无个人简介页。

## Constraints

- 原则：内容质量 > 视觉呈现 > 功能复杂度。
- 明确不做：评论、登录、后台、多语言、邮件订阅、个人简介页；搜索用 VitePress 本地搜索。
- URL 结构冻结（`/`、`/articles/`、`/projects`、`/series/`、隐藏 `/stats-view`）。
- 统计仅后台；前台不展示访问数据。

## Brand Commitments

- 产品名：**Vie**（展示：V 大写，ie 小写；域名/仓库仍可保留 vie）
- 定位句：写清楚每一个技术决策
- 副文案：全栈开发 · 技术实现细节与思路
- 社交：GitHub `creatawork`
- 视觉：Bento 首页 + **vibe-coding** 语法色与 IDE 节奏（非整站终端皮肤）。字标 Vie、JetBrains Mono + Syne、深色点阵底。详见 `DESIGN.md`。

## Capabilities

- Markdown 文章（分类 / 标签 / 系列）、Mermaid、阅读时长
- 成果展示（截图、描述、技术栈、GitHub/Demo）
- RSS、sitemap、全站埋点 + 口令统计页

## Accessibility

未单独约定；保持可读对比度、键盘焦点、尊重 `prefers-reduced-motion`。

## Open Questions

- 是否有必须保留的既有视觉资产（无 logo 文件时以字标 VIE 为准）——待方向轮确认。
