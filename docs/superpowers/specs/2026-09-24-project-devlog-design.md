# 项目专栏真数据化 + vie-gallery 开发日志 — Design Spec

日期：2026-09-24  
站点：Vie（`vie-vibe.cn`）  
状态：设计已确认；待实现

## 1. 问题

- `/projects` 与 `/articles/` 渲染的是 `DevNotesHub.vue` 的一整套假数据：假项目（"Spring Boot 3.x 静态开发框架"等）、假浏览量、假侧边栏计数，以及与站点定位冲突的「登录 / 注册」假入口。
- 对应的真组件 `Projects.vue`（读 `projects.data.ts`）与 `ArticleList.vue`（读 `articles.data.ts`）已实现并注册，但未被任何页面路由。
- `vie-gallery` 已达 V1 Ready（2026-09-12 签收，`docs/v1-ready-signoff.md`），开发过程无处沉淀，项目地址无法挂在站点成果页。
- 已知遗留（本单不动）：首页 `HomeBento.vue` 的 `metrics`（「文章 56 篇 / 项目 12 个」等假数字）与本地假文章卡也是写死的；首页真数据化按已定范围另单处理。`VieAmbient.vue` 读真数据（仅 `projects.length`），不受本单影响。

成功标准：`/projects` 展示真实项目卡片；`vie-gallery` 有独立详情页，时间线记录开发里程碑并可持续追加；日志能点进站内真实文章；两页假数据组件下线；记录流程轻到"完成一个功能点加一个对象"。

## 2. 范围

### 做

1. 新建 `projects.source.ts`（全部类型 + `projectsSource` 数据，纯 TS）并把 `projects.data.ts` 收成 loader 薄壳；录入 `VIE Gallery` 数据（含首条里程碑）。
2. `projects.md` 路由切换到 `Projects`；`Projects.vue` 增加 status 徽章与「日志 →」入口。
3. 新页面 `site/projects/vie-gallery.md` + 新组件 `ProjectDetail.vue`（纵向时间线）+ 新样式 `project-log.css`。
4. `articles/index.md` 路由切换到 `ArticleList`（组件已实现，零新开发）。
5. `seo.ts`：`og:image` / `twitter:image` 支持 frontmatter `image`，缺省仍为 `vie-home.png`。
6. 死代码清理：删除 `DevNotesHub.vue`、`hub-reference.css` 及 theme 入口引用；同步 `check-content.mjs` 的项目数断言。
7. 新增 vitest 数据校验（`test:data`），CI `site` job 接入。
8. `PRODUCT.md` URL 冻结条款修订、`Capabilities` 增行；`DESIGN.md` Hub pages 一行增补。
9. 初始内容起草（卡片文案、首条里程碑文案、可选截图），由用户改定。

### 不做

评论、登录、后台、多语言；git API / CI 自动同步日志（手动录入数据文件）；VitePress 动态路由（`[slug].md` + `routes.ts`，项目数 ≤2 不值得）；日志进 RSS feed；标签页；`HomeBento` 改版（首页 metrics 与文章卡也是写死的本地常量，见 §1 已知遗留——首页真数据化按已定范围另单处理）；`vie-gallery` 全史回填（以当前状态为基准，向前持续记录）；文章/工具以外的新内容类型。

## 3. 约束（全局）

- 沿用上一单（`2026-08-26-interviewer-proof`）：品牌 Vie；原则「内容质量 > 视觉呈现 > 功能复杂度」；统计仅后台；尊重 `prefers-reduced-motion`；Git 提交不带 `Co-authored-by: Cursor`。
- 不新增运行时依赖：`vitest`、`@lucide/vue` 均已在 `site/package.json` devDependencies。
- 样式沿用已实现的浅色 token（`custom.css` 的 `--vie-*`），复用 `.vie-badge` / `.vie-chip` / `.vie-link-row` / `.vie-feed` / `.vie-empty` 等现有类；新样式单独成文件，不塞进 `vie-bento.css`。
- URL 冻结修订：新增 `/projects/<slug>`；slug 必须在 `projects.source.ts` 显式登记，且页面文件 `site/projects/<slug>.md` 显式创建——不产生任意 URL。
- 日志为手动记录，以当前状态为基准（不回填全史），之后每完成一个功能点追加一条。

## 4. 架构

仍是静态站，本迭代只动 `site/` 内容与主题。数据源头唯一：`projects.source.ts`（手编 TS，编译期类型校验；`projects.data.ts` 只留 loader 薄壳），构建期进 SSG，无新后端、无新运行时。

```text
访客
  → /projects          Projects.vue（真数据网格 + 状态徽章 + 日志入口）
  → /projects/vie-gallery/   ProjectDetail.vue（页头 + 纵向里程碑时间线）
  → 时间线条目 → 站内文章（深度展开）或外部来源（commit/issue）
构建与守卫
  → vitest（projects.data 契约）→ check-content.mjs → vitepress build
发现层
  → sitemap 自动收录详情页；RSS 保持文章专用；track.ts 全站埋点自动覆盖
```

| 单元 | 职责 | 依赖 |
|------|------|------|
| `site/projects.source.ts`（新） | 唯一数据源：全部类型 + `projectsSource` 数组（纯 TS，vitest 可直接导入） | 无 |
| `site/projects.data.ts` | VitePress data loader 薄壳，从 source 组装 `load()` | `projects.source` |
| `site/projects.md` | 路由 `<Projects />` | theme 注册 |
| `site/projects/vie-gallery.md` | 详情页路由，frontmatter 承载 title/description | theme 注册 |
| `theme/components/Projects.vue` | 列表网格：徽章、决策、chips、gh/demo、日志入口 | `projects.data` |
| `theme/components/ProjectDetail.vue`（新） | 详情页：页头 + 时间线渲染 | `projects.data` |
| `theme/project-log.css`（新） | 详情页与时间线样式，只新增不重写 | `--vie-*` token |
| `theme/components/ArticleList.vue` | 文章索引（已有，仅接路由） | `articles.data` |
| `.vitepress/seo.ts` | og/twitter image 支持页面 frontmatter | `SITE_URL` |
| `.vitepress/theme/data/projects.data.test.ts`（新） | 数据契约校验 | `projects.data`、fs |
| `scripts/check-content.mjs` | 构建前内容契约（断言同步） | `gray-matter` |

## 5. 内容模型

数据与类型集中在 `site/projects.source.ts`（纯 TS 模块，无 VitePress 虚拟导出，vitest 可直接 import）；`site/projects.data.ts` 只留 loader 薄壳：

```ts
// site/projects.source.ts —— 接口与数据
export interface ProjectDecision {
  text: string
  href?: string
}

export type ProjectStatus = 'building' | 'live'
export type LogEntryType = 'feature' | 'fix' | 'milestone' | 'decision'

export interface ProjectLogEntry {
  date: string          // 'YYYY-MM-DD'
  title: string         // 完成了什么，一句话
  detail?: string       // 可选 1~3 句补充
  type: LogEntryType
  tech: string[]        // 本条涉及的技术点，非空
  article?: string      // 站内文章路径，如 '/articles/...'；必须指向真实 md 页面
  link?: string         // 外部来源，如 commit range / issue / PR，'https://' 开头
  image?: string        // 截图，'/images/...'；必须存在于 site/public/
}

export interface Project {
  name: string
  slug?: string         // 有 slug ⇒ 有详情页 site/projects/<slug>.md 与「日志」入口
  status: ProjectStatus
  description: string
  image?: string
  tags: string[]
  github?: string
  demo?: string
  featured: boolean
  decisions?: ProjectDecision[]
  log?: ProjectLogEntry[]
}
```

`site/projects.data.ts` 薄壳（`projectsSource` 数组本体在 source 文件里，§6）：

```ts
import { projectsSource, type Project } from './projects.source'

declare const data: Project[]
export { data }

export default {
  watch: [],
  load(): Project[] {
    return projectsSource
  },
}
```

数据契约（由 Task 测试强制）：

- `slug` 在全部项目内唯一；有 `slug` 的项目必须存在 `site/projects/<slug>.md`。
- `log` 数组顺序 = 展示顺序，**新的在前**；录入即插入数组头部。相邻条目 date 严格降序（新 > 旧）。
- `status` 必填；`live` 徽章「已上线」，`building` 徽章「开发中」。
- 条目：`title` 非空、`tech` 非空、`date` 可解析；`article` 必须命中站内真实 md；`link` 必须 `https://` 开头；`image` 必须存在于 `site/public/`。

录入流程（日常使用）：完成一个功能点 → 在对应项目 `log` 数组头部加一个对象（约 3~5 行）；里程碑需要展开的 → 写文章，回填 `article` 字段。无后台、无自动同步，这与「无后台」约束一致。

type 图标映射（`@lucide/vue`）：

| type | 图标 | 含义 |
|------|------|------|
| `milestone` | `Flag` | 阶段签收 / 版本 |
| `feature` | `Sparkles` | 新功能点 |
| `fix` | `Wrench` | 修复 / 硬化 |
| `decision` | `GitBranch` | 技术选型 / 方向 |

## 6. 初始数据

两条记录（位于 `projectsSource` 数组；`featured` 仅 Vie 为 `true`，首页 featured 卡行为不变）：

1. **Vie**：现有字段全部保留，新增 `status: 'live'`，不加 `slug` 与 `log`（无详情页）。
2. **VIE Gallery**（文案为草案，用户改定后为准）：

```ts
{
  name: 'VIE Gallery',
  slug: 'vie-gallery',
  status: 'building',
  description:
    '个人相册产品：admin + viewer 双端。原图保存、相册整理、2D/3D 空间展示、受控链接分享。',
  tags: ['Vue 3', 'Three.js', 'Spring Boot', 'MyBatis-Plus', 'Docker'],
  featured: false,
  log: [
    {
      date: '2026-09-12',
      title: 'V1 签收：个人相册 V1 Ready 验收通过',
      detail:
        '双端（admin 工作台 / viewer）达到 V1 Ready：原图保存、相册管理、2D/3D 展示、受控链接分享、上传任务中心、配置版本化与资源变体通过真实环境验收；M7.5 综合回归在本机 Docker + 自动化门禁下通过。',
      type: 'milestone',
      tech: ['Vue 3', 'Three.js', 'Spring Boot', 'MyBatis-Plus', 'Docker'],
    },
  ],
}
```

- `github` / `demo` 暂缺：用户提供地址后仅添加字段（数据文件一行）；`github` 字段不填则详情页与卡片不渲染 gh 链接。
- 项目级 `image` 暂缺；截图来源见 §13 验收（从 `vie-gallery` 仓库现有验收截图落图，或用户另拍）。

## 7. 成果列表页（`Projects.vue` 小改）

- `site/projects.md` frontmatter 不变，组件由 `<DevNotesHub kind="projects" />` 换为 `<Projects />`。
- 徽章改为状态：`{{ p.status === 'live' ? '已上线' : '开发中' }}`（替换现有 `featured / p1` 文案；`featured` 字段语义保留，仅供首页）。
- `vie-link-row` 增加：有 `slug` 的项目渲染 `<a :href="'/projects/' + p.slug + '/'">日志</a>`（mono 风格同 gh / demo；无 slug 不渲染）。
- 其余（截图、描述、decisions、chips）不变。

## 8. 项目详情页

### 8.1 路由文件

`site/projects/vie-gallery.md`（与 `site/projects.md` 同目录共存，VitePress 分别生成 `/projects` 与 `/projects/vie-gallery`）：

```md
---
title: VIE Gallery
description: 个人相册产品：admin + viewer 双端。原图保存、相册整理、2D/3D 空间展示、受控链接分享。
aside: false
---

<ProjectDetail slug="vie-gallery" />
```

`titleTemplate` 不设（页签显示 `VIE Gallery | Vie`）；`aside: false` 与其余列表页一致。

### 8.2 `ProjectDetail.vue`（新组件）

- `defineProps<{ slug: string }>()`；`projects.find((p) => p.slug === slug)`，找不到渲染 mono 空态 `// project not found`。
- 外壳 `VieShell path="projects/"`——页头 h1「项目」由 `ViePageHeader` 承担，组件内不再造 h1。
- 内容结构（自上而下）：
  1. mono 面包屑行：`<a href="/projects/">projects/</a> / vie-gallery`
  2. `h2` 项目名 + status 徽章（同一行）
  3. 一句话 description
  4. tags chips（复用 `.vie-chip-row` / `.vie-chip`）
  5. gh / demo 链接行（复用 `.vie-link-row`；字段缺失不渲染）
  6. 时间线 `<section aria-label="开发日志">`：`<ol>` 列表，每条 `<li>` = 节点圆点（type 图标 14px）+ `<time>` mono 日期 + 标题 `h3` + detail 段落 + 可选截图（`loading="lazy" decoding="async"`，有才渲染）+ tech chips + 链接行（`article` →「深度文章 →」站内；`link` →「来源 →」新窗口）+ 行号（`vie-ln` mono，从最新条目起 `N…01` 递减）
  7. `log` 为空时渲染 mono 空态 `// log empty — 开发继续，记录待补`
- 语义与 a11y：时间线用 `ol/li`；图标装饰性（`aria-hidden`）；对比度用现有 token；不新增动画（`prefers-reduced-motion` 自然满足）。

### 8.3 样式

新建 `site/.vitepress/theme/project-log.css`，`theme/index.ts` 导入。只定义 `.vie-project-detail` 作用域下的新类（面包屑行、标题行、时间线线与节点、条目卡），颜色/圆角/边框一律引用 `--vie-*` token 与现有 `.vie-badge` / `.vie-chip` / `.vie-empty` / `.vie-ln`，不引入新颜色值。

## 9. 文章页路由切换

`site/articles/index.md` 组件由 `<DevNotesHub kind="articles" />` 换为 `<ArticleList />`（组件读真数据 `articles.data.ts`，含分类分组、锚点侧栏、阅读时长）。无新开发。

## 10. SEO / 埋点 / 数据流

- `seo.ts` 的 `headTagsForPage`：

```ts
const fmImage = pageData.frontmatter.image
const image =
  (typeof fmImage === 'string' && fmImage && `${siteUrl}${fmImage}`) ||
  `${siteUrl}/images/vie-home.png`
```

`og:image` 与 `twitter:image` 同用该值；`og:type` 逻辑不变（详情页为 `website`）。
- sitemap：详情页是普通 VitePress 页面，`generateSitemap` 自动收录，零改动。
- RSS：保持文章专用，日志不进 feed（另单再议）。
- 埋点：`track.ts` 全站自动覆盖 `/projects/vie-gallery`，`/stats-view` 可见，零改动。

## 11. 死代码清理与守卫同步

- 删除：`theme/components/DevNotesHub.vue`、`theme/hub-reference.css`，及 `theme/index.ts` 中的 import / `app.component` / css import 三处引用（该组件内含的假计数、「登录/注册」假入口一并消失）。
- `scripts/check-content.mjs` 的 `projectsSrc` 读取路径由 `projects.data.ts` 改为 `projects.source.ts`（数据搬家）；「`name: 'Vie'` 恰好一次」保留，追加：

```js
const galleryNames = projectsSrc.match(/name: 'VIE Gallery'/g) || []
if (galleryNames.length !== 1) {
  errors.push(`projects.source.ts: expected exactly one name: 'VIE Gallery', got ${galleryNames.length}`)
}
const slugNames = projectsSrc.match(/slug: 'vie-gallery'/g) || []
if (slugNames.length !== 1) {
  errors.push(`projects.source.ts: expected exactly one slug: 'vie-gallery', got ${slugNames.length}`)
}
```

## 12. 错误处理

- `log` 为空 / 项目缺 `slug`：详情不渲染，入口不出现，不抛错。
- `article` 断链、`slug` 无对应页面文件、`image` 文件缺失：由 `test:data` 在构建前拦截（见 §13）。
- 数据类型错误：TS 编译期拦截（`status` / `type` 为字面量联合）。
- 数据文件手编导致 `load()` 异常：构建即红，不发布，无运行时回退逻辑（与既有守卫同哲学）。

## 13. 测试与验收

### 13.1 数据契约测试（新 `test:data`）

`site/package.json` 增加 `"test:data": "vitest run --dir .vitepress/theme/data"`。测试文件 `.vitepress/theme/data/projects.data.test.ts`，从 `projects.source` 导入 `projectsSource`（`.data.ts` 的虚拟 `data` 导出在 vitest 下不可解析，这正是 source/data 拆分的原因）。断言：

1. 有 `slug` 的项目 slug 唯一，且包含 `'vie-gallery'`；
2. 每个有 `slug` 的项目存在 `site/projects/<slug>.md`；
3. 每条 log：`date` 匹配 `YYYY-MM-DD` 且可解析；相邻条目 date 严格降序；`title`、`tech` 非空；
4. `article` 若存在 → 以 `/` 开头且对应 md 文件存在（`<path>.md` 或 `<path>/index.md`）；
5. `link` 若存在 → `https://` 开头；`image`（项目级与条目级）→ `site/public` 下文件存在。

### 13.2 内容守卫与构建

- `npm run check:content` 全绿（含 §11 新断言）。
- `npm run build` 成功，产物检查：`dist/projects.html` 含「VIE Gallery」「开发中」；`dist/projects/vie-gallery.html` 存在且含「V1 Ready」；两个页面均不再含 DevNotesHub 专属字符串（「标签云」「学习进度」「登录 / 注册」）。
- CI：`.github/workflows/deploy.yml` 的 `site` job 在 `check:content` 后、`build` 前加一行 `npm run test:data`。

### 13.3 视觉验收

三页渲染过审（截图人工或 visual-judge）：`/projects`（两张真卡、徽章、日志入口）、`/projects/vie-gallery`（页头 + 时间线 + 空态/首条渲染）、`/articles/`（真数据索引）。移动端 ≤900px 不断裂（项目网格现有断点行为不变）。

### 13.4 内容落定

- vie-gallery 卡片与首条里程碑文案：实现时按 §6 草案落地，用户改定为准。
- 截图：首选从 `E:\workspace\vie-gallery` 现有验收截图（如 `spatial-gallery-production-test.png`）复制为 `site/public/images/projects/vie-gallery-viewer.png`（源文件缺失则跳过，相关字段保持缺省——测试对缺省字段不报错）；落图后在项目数据与详情页 frontmatter 补 `image` 字段。

## 14. PRODUCT.md / DESIGN.md 同步

- `PRODUCT.md` Constraints：URL 冻结行改为「`/`、`/articles/`、`/projects`、`/projects/<slug>`、`/series/`、`/tools`、`/tools/*`、隐藏 `/stats-view`；`<slug>` 限于 `projects.source.ts` 显式登记的项目」。
- `PRODUCT.md` Capabilities 增一行：「项目开发日志：成果页真数据 + 项目详情页时间线（数据文件手动录入）」。
- `DESIGN.md` Hub pages 行的组件清单追加 `ProjectDetail`。

## 15. 实现顺序（摘要）

1. `site/projects.source.ts`（类型 + `projectsSource` 数据）与 `site/projects.data.ts`（loader 薄壳）；Vie 补 `status`，VIE Gallery 全量数据  
2. `Projects.vue`：状态徽章 + 日志入口  
3. `ProjectDetail.vue` + `site/projects/vie-gallery.md` + `project-log.css` + theme 注册  
4. `articles/index.md` 路由切换  
5. `seo.ts` og:image frontmatter 支持  
6. 死代码清理 + `check-content.mjs` 断言同步  
7. `test:data` 测试 + npm script + CI 接入  
8. 截图落图 + `image` 字段 + 三页视觉验收  
9. `PRODUCT.md` / `DESIGN.md` 同步

详细步骤、完整代码与验收命令见 `docs/superpowers/plans/2026-09-24-project-devlog.md`。
