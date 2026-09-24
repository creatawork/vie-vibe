# 项目专栏真数据化 + vie-gallery 开发日志 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/projects` 与 `/articles/` 从假数据切到真数据，并为 `vie-gallery` 建立独立详情页（纵向开发日志时间线），日志可持续手动追加。

**Architecture:** 数据源头唯一：`site/projects.source.ts` 承载全部类型与 `projectsSource` 数组（纯 TS，vitest 可直接导入——`projects.data.ts` 的 `declare const data` + `export { data }` 是 VitePress 构建期虚拟导出，测试无法 import，这是拆分的原因）；`site/projects.data.ts` 只留 loader 薄壳。`Projects.vue` 消费数据渲染列表，新组件 `ProjectDetail.vue` 渲染详情时间线；`ArticleList.vue` 已存在只接路由。删除 `DevNotesHub.vue` 假数据组件。`seo.ts` 补 og:image 的 frontmatter 支持；`test:data` 钉住数据契约，CI `site` job 接入。

**Tech Stack:** VitePress 1.6、Vue 3、`@lucide/vue`、vitest（均为已有 devDependency）。禁止新增任何 npm 依赖。

**Spec:** `docs/superpowers/specs/2026-09-24-project-devlog-design.md`（数据 schema、初始文案、图标映射以 spec 为准）。

## Global Constraints

- 展示名 Vie（V 大写，ie 小写）；定位句「写清楚每一个技术决策」
- URL 冻结修订后：`/`、`/articles/`、`/projects`、`/projects/<slug>`、`/series/`、`/tools`、`/tools/*`、隐藏 `/stats-view`；`<slug>` 限于 `projects.source.ts` 显式登记且页面文件显式创建
- 站内链接一律不带尾斜杠（与 nav `link: '/projects'`、文章 `post.url` 一致），交给 Caddy `try_files` 解析
- 不做：评论、登录、后台、多语言、git 自动同步、VitePress 动态路由、日志进 RSS、`HomeBento` 改版
- 不新增 npm 依赖；样式只用 `custom.css` 的 `--vie-*` token 与现有类（`.vie-badge` / `.vie-chip` / `.vie-chip-row` / `.vie-link-row` / `.vie-ln` / `.vie-empty`），新样式单独成 `project-log.css`，不引入新颜色值
- `log` 数组顺序 = 展示顺序（新的在前）；条目 `date` 严格降序；`title` / `tech` 非空
- 中文为主；代码/路径保持原名。提交不得含 `Co-authored-by: Cursor`——每次提交后执行 `git log -1 --format=%B | grep -i co-authored`，有输出即停止并修复
- 命令工作目录：git 在仓库根 `E:/VIE`，npm 在 `E:/VIE/site`

## Review Focus

1. **slug 与页面文件脱节**：数据登记了 `slug` 但 `site/projects/<slug>.md` 缺失 → 日志入口指向 404。期望：`test:data` 失败并指名项目。（pin：Task 7 用例 2）
2. **相邻条目同日期或乱序**：录入时插错位置。期望：`test:data` 严格降序失败并打印两条日期。（pin：Task 7 用例 3）
3. **article 断链**：`article: '/articles/...'` 指向不存在或已改名页面。期望：`test:data` 失败并给出项目名 + 路径。（pin：Task 7 用例 4）
4. **单条全字段渲染**（article + link + image 同条目）：链接行与截图不重叠；无链接时链接行整体不渲染、不留空段。期望：模板链接行 `v-if="e.article || e.link"`，临时全字段条目构建验证。（pin：Task 8 Step 5）
5. **≤900px 时间线**：左线与节点不溢出视口、卡片无横向滚动。期望：移动端截图通过。（pin：Task 8 Step 6）

---

## File map

| File | Role |
|------|------|
| Create `site/projects.source.ts` | 全部类型 + `projectsSource` 数据（纯 TS） |
| Replace `site/projects.data.ts` | loader 薄壳（`load()` 从 source 组装） |
| Modify `site/projects.md` | 路由 `<Projects />` |
| Modify `site/.vitepress/theme/components/Projects.vue` | 状态徽章 + 日志入口 |
| Create `site/projects/vie-gallery.md` | 详情页路由 |
| Create `site/.vitepress/theme/components/ProjectDetail.vue` | 页头 + 时间线 |
| Create `site/.vitepress/theme/project-log.css` | 时间线样式 |
| Modify `site/.vitepress/theme/index.ts` | 注册 ProjectDetail、导入新样式、移除 DevNotesHub |
| Modify `site/articles/index.md` | 路由 `<ArticleList />` |
| Modify `site/.vitepress/seo.ts` | og:image 支持 frontmatter |
| Delete `site/.vitepress/theme/components/DevNotesHub.vue`、`site/.vitepress/theme/hub-reference.css` | 假数据组件与样式 |
| Modify `site/scripts/check-content.mjs` | 读取路径换 source + 项目断言同步 |
| Create `site/.vitepress/theme/data/projects.data.test.ts` | 数据契约测试 |
| Modify `site/package.json` | `test:data` script |
| Modify `.github/workflows/deploy.yml` | site job 加 `test:data` |
| Create `site/public/images/projects/vie-gallery-viewer.png` | 卡片/OG 截图 |
| Modify `PRODUCT.md`、`DESIGN.md` | URL 条款与组件清单同步 |

---

### Task 1: 数据模型与初始数据（source + loader）

**Files:**
- Create: `site/projects.source.ts`
- Replace: `site/projects.data.ts`

**Interfaces:**
- Produces（后续任务依赖，逐字一致）：
  - 类型 `ProjectStatus = 'building' | 'live'`、`LogEntryType = 'feature' | 'fix' | 'milestone' | 'decision'`
  - 接口 `ProjectLogEntry { date: string; title: string; detail?: string; type: LogEntryType; tech: string[]; article?: string; link?: string; image?: string }`
  - 接口 `Project { name: string; slug?: string; status: ProjectStatus; description: string; image?: string; tags: string[]; github?: string; demo?: string; featured: boolean; decisions?: ProjectDecision[]; log?: ProjectLogEntry[] }`
  - `export const projectsSource: Project[]`（在 `projects.source.ts`）
  - `projects.data.ts` 保持默认导出 `{ watch: [], load(): Project[] }` 与 `export { data }`——`Projects.vue` / `HomeBento` / `VieAmbient` 现有导入不变

- [ ] **Step 1: 新建 `site/projects.source.ts`**

```ts
export interface ProjectDecision {
  text: string
  href?: string
}

export type ProjectStatus = 'building' | 'live'
export type LogEntryType = 'feature' | 'fix' | 'milestone' | 'decision'

export interface ProjectLogEntry {
  date: string
  title: string
  detail?: string
  type: LogEntryType
  tech: string[]
  article?: string
  link?: string
  image?: string
}

export interface Project {
  name: string
  slug?: string
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

export const projectsSource: Project[] = [
  {
    name: 'Vie',
    status: 'live',
    description:
      'VitePress 静态站 + 同域 SpringBoot 统计 + Caddy / GitHub Actions 发布。',
    image: '/images/vie-home.png',
    tags: ['VitePress', 'Vue 3', 'SpringBoot', 'Docker', 'GitHub Actions'],
    github: 'https://github.com/creatawork/vie-vibe',
    demo: 'https://vie-vibe.cn',
    featured: true,
    decisions: [
      {
        text: '静态站 SSG，而不是 SSR',
        href: '/articles/meta/how-this-site-works',
      },
      {
        text: '统计自建，IP 只存日盐哈希',
        href: '/articles/backend/springboot-stats-api',
      },
      {
        text: 'CI 拆 site 与 server 两个 job，静态目录原子切换',
        href: '/articles/devops/github-actions-deploy',
      },
      {
        text: '首页用 Bento，不用 VitePress 默认 Hero',
        href: '/articles/frontend/vitepress-theme',
      },
    ],
  },
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
  },
]
```

- [ ] **Step 2: 整文件替换 `site/projects.data.ts` 为薄壳**

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

- [ ] **Step 3: 构建验证（类型与 loader 均无误）**

Run: `cd E:/VIE/site && npm run build`
Expected: 构建成功（此时 `/projects` 仍由 DevNotesHub 渲染，不影响）。

- [ ] **Step 4: Commit**

```bash
cd E:/VIE
git add site/projects.source.ts site/projects.data.ts
git commit -m "feat: extend project data with devlog model"
git log -1 --format=%B | grep -i co-authored
```

Expected: 提交成功，grep 无输出。

---

### Task 2: 成果列表页切真数据 + 状态徽章 + 日志入口

**Files:**
- Replace: `site/projects.md`
- Modify: `site/.vitepress/theme/components/Projects.vue`

**Interfaces:**
- Consumes: Task 1 的 `Project`（必填 `status`，可选 `slug`）；`Projects` 已在 theme 注册
- Produces: 列表页两卡片；状态徽章（`已上线` / `开发中`）；有 `slug` 的卡片渲染日志入口 → `/projects/<slug>`

- [ ] **Step 1: `site/projects.md` 整文件替换**

```md
---
title: 项目
aside: false
titleTemplate: false
---

<Projects />
```

- [ ] **Step 2: `Projects.vue` 三处编辑（精确 old → new）**

Edit A —— `v-for` 去掉不再使用的 `i`：

```vue
<!-- old -->
      <article
        v-for="(p, i) in projects"
        :key="p.name"
        class="vie-project-tile"
      >
<!-- new -->
      <article
        v-for="p in projects"
        :key="p.name"
        class="vie-project-tile"
      >
```

Edit B —— 徽章改为状态（`featured` 语义保留给首页，列表不再显示）：

```vue
<!-- old -->
        <span class="vie-badge">{{ p.featured ? 'featured' : `p${i + 1}` }}</span>
<!-- new -->
        <span class="vie-badge">{{ p.status === 'live' ? '已上线' : '开发中' }}</span>
```

Edit C —— 链接行加日志入口（放在 gh 之前；无尾斜杠）：

```vue
<!-- old -->
        <div class="vie-link-row vie-mono">
          <a v-if="p.github" :href="p.github" target="_blank" rel="noopener">gh</a>
          <a v-if="p.demo" :href="p.demo" target="_blank" rel="noopener">demo</a>
        </div>
<!-- new -->
        <div class="vie-link-row vie-mono">
          <a v-if="p.slug" :href="`/projects/${p.slug}`">日志</a>
          <a v-if="p.github" :href="p.github" target="_blank" rel="noopener">gh</a>
          <a v-if="p.demo" :href="p.demo" target="_blank" rel="noopener">demo</a>
        </div>
```

- [ ] **Step 3: 构建验证**

Run: `cd E:/VIE/site && npm run build && grep -c "VIE Gallery" .vitepress/dist/projects.html && grep -c "开发中" .vitepress/dist/projects.html`
Expected: 两个 grep 均输出 ≥ 1。

- [ ] **Step 4: Commit**

```bash
cd E:/VIE
git add site/projects.md site/.vitepress/theme/components/Projects.vue
git commit -m "feat: real data projects list page"
git log -1 --format=%B | grep -i co-authored
```

Expected: grep 无输出。

---

### Task 3: 项目详情页（组件 + 页面 + 样式 + 注册）

**Files:**
- Create: `site/.vitepress/theme/components/ProjectDetail.vue`
- Create: `site/projects/vie-gallery.md`
- Create: `site/.vitepress/theme/project-log.css`
- Modify: `site/.vitepress/theme/index.ts`

**Interfaces:**
- Consumes: Task 1 的 `projects.data`（`import { data as projects }`）、`VieShell`（props `path: string; hint?: string`）、`@lucide/vue` 的 `Flag` / `Sparkles` / `Wrench` / `GitBranch`
- Produces: 全局组件 `<ProjectDetail slug="..." />`（prop `slug: string` 必填）；样式类 `vie-project-detail` / `vie-detail-*` / `vie-timeline-*`（Task 8 视觉验收与后续微调用）

- [ ] **Step 1: 新建 `site/.vitepress/theme/components/ProjectDetail.vue`**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { Flag, GitBranch, Sparkles, Wrench } from '@lucide/vue'
import { data as projects } from '../../../projects.data'
import VieShell from './VieShell.vue'

const props = defineProps<{ slug: string }>()

const typeIcon = {
  milestone: Flag,
  feature: Sparkles,
  fix: Wrench,
  decision: GitBranch,
} as const

const statusLabel = { building: '开发中', live: '已上线' } as const

const project = computed(() => projects.find((p) => p.slug === props.slug))
const entries = computed(() => project.value?.log ?? [])
</script>

<template>
  <VieShell path="projects/" hint="log">
    <p v-if="!project" class="vie-empty vie-mono">// project not found</p>
    <div v-else class="vie-project-detail">
      <p class="vie-detail-crumb vie-mono">
        <a href="/projects">projects/</a>
        <span aria-hidden="true">/</span>
        <span>{{ project.slug }}</span>
      </p>
      <div class="vie-detail-title">
        <h2>{{ project.name }}</h2>
        <span class="vie-badge">{{ statusLabel[project.status] }}</span>
      </div>
      <p class="vie-detail-desc">{{ project.description }}</p>
      <div class="vie-chip-row">
        <span v-for="t in project.tags" :key="t" class="vie-chip vie-chip--accent">{{ t }}</span>
      </div>
      <div class="vie-link-row vie-mono">
        <a v-if="project.github" :href="project.github" target="_blank" rel="noopener">gh</a>
        <a v-if="project.demo" :href="project.demo" target="_blank" rel="noopener">demo</a>
      </div>

      <section class="vie-timeline" aria-label="开发日志">
        <ol v-if="entries.length" class="vie-timeline-list">
          <li
            v-for="(e, i) in entries"
            :key="e.date + '-' + i"
            class="vie-timeline-item"
          >
            <span class="vie-timeline-node" aria-hidden="true">
              <component :is="typeIcon[e.type]" :size="14" />
            </span>
            <div class="vie-timeline-card">
              <div class="vie-timeline-meta">
                <time :datetime="e.date" class="vie-mono">{{ e.date }}</time>
                <span class="vie-ln vie-mono" aria-hidden="true">{{
                  String(entries.length - i).padStart(2, '0')
                }}</span>
              </div>
              <h3>{{ e.title }}</h3>
              <p v-if="e.detail" class="vie-timeline-desc">{{ e.detail }}</p>
              <img
                v-if="e.image"
                :src="e.image"
                :alt="e.title"
                class="vie-timeline-img"
                loading="lazy"
                decoding="async"
              />
              <div class="vie-chip-row">
                <span v-for="t in e.tech" :key="t" class="vie-chip">{{ t }}</span>
              </div>
              <p v-if="e.article || e.link" class="vie-timeline-links vie-mono">
                <a v-if="e.article" :href="e.article">深度文章 →</a>
                <a v-if="e.link" :href="e.link" target="_blank" rel="noopener">来源 →</a>
              </p>
            </div>
          </li>
        </ol>
        <p v-else class="vie-empty vie-mono">// log empty — 开发继续，记录待补</p>
      </section>
    </div>
  </VieShell>
</template>
```

- [ ] **Step 2: 新建 `site/projects/vie-gallery.md`**

```md
---
title: VIE Gallery
description: 个人相册产品：admin + viewer 双端。原图保存、相册整理、2D/3D 空间展示、受控链接分享。
aside: false
---

<ProjectDetail slug="vie-gallery" />
```

- [ ] **Step 3: 新建 `site/.vitepress/theme/project-log.css`**

```css
/* /projects/<slug> — project detail & dev-log timeline */
.vie-project-detail {
  max-width: 760px;
  margin: 0 auto;
  padding: 8px 20px 64px;
}

.vie-detail-crumb {
  margin: 0 0 18px;
  font-size: 0.78rem;
  color: var(--vie-ink-soft);
}

.vie-detail-crumb a {
  color: var(--vie-green);
  text-decoration: none;
}

.vie-detail-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.vie-detail-title h2 {
  margin: 0;
  font-size: 1.6rem;
  line-height: 1.3;
  color: var(--vie-ink);
}

.vie-detail-desc {
  margin: 10px 0 0;
  color: var(--vie-ink-soft);
  font-size: 0.95rem;
  line-height: 1.7;
}

.vie-project-detail .vie-link-row {
  margin-top: 14px;
}

.vie-timeline {
  margin-top: 40px;
}

.vie-timeline-list {
  list-style: none;
  margin: 0;
  padding: 0 0 0 22px;
  border-left: 2px solid var(--vie-line);
}

.vie-timeline-item {
  position: relative;
  padding: 4px 0 28px;
}

.vie-timeline-item:last-child {
  padding-bottom: 0;
}

.vie-timeline-node {
  position: absolute;
  top: 8px;
  left: -31px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 1px solid var(--vie-line);
  border-radius: 999px;
  background: var(--vie-green-soft);
  color: var(--vie-green);
}

.vie-timeline-card {
  padding: 14px 16px;
  border: 1px solid var(--vie-line);
  border-radius: var(--vie-radius-sm);
  background: var(--vie-panel-soft);
}

.vie-timeline-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.74rem;
  color: var(--vie-ink-soft);
}

.vie-timeline-card h3 {
  margin: 6px 0 0;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--vie-ink);
}

.vie-timeline-desc {
  margin: 6px 0 0;
  color: var(--vie-ink-soft);
  font-size: 0.88rem;
  line-height: 1.7;
}

.vie-timeline-img {
  display: block;
  width: 100%;
  margin-top: 10px;
  border: 1px solid var(--vie-line);
  border-radius: 8px;
}

.vie-timeline-card .vie-chip-row {
  margin-top: 10px;
}

.vie-timeline-links {
  display: flex;
  gap: 14px;
  margin: 10px 0 0;
  font-size: 0.8rem;
}

.vie-timeline-links a {
  color: var(--vie-green);
  text-decoration: none;
  font-weight: 700;
}

@media (max-width: 900px) {
  .vie-project-detail {
    padding: 8px 16px 48px;
  }
}
```

- [ ] **Step 4: `theme/index.ts` 三处精确插入**

`import Projects from './components/Projects.vue'` 行后加：

```ts
import ProjectDetail from './components/ProjectDetail.vue'
```

`import './tools.css'` 行后加：

```ts
import './project-log.css'
```

`app.component('Projects', Projects)` 行后加：

```ts
    app.component('ProjectDetail', ProjectDetail)
```

- [ ] **Step 5: 构建验证**

Run: `cd E:/VIE/site && npm run build && grep -c "V1 签收" .vitepress/dist/projects/vie-gallery.html && grep -c "开发日志" .vitepress/dist/projects/vie-gallery.html`
Expected: 两个 grep 均输出 ≥ 1。

- [ ] **Step 6: Commit**

```bash
cd E:/VIE
git add site/.vitepress/theme/components/ProjectDetail.vue site/projects/vie-gallery.md site/.vitepress/theme/project-log.css site/.vitepress/theme/index.ts
git commit -m "feat: add vie-gallery project detail page"
git log -1 --format=%B | grep -i co-authored
```

Expected: grep 无输出。

---

### Task 4: 文章页切真数据

**Files:**
- Replace: `site/articles/index.md`

**Interfaces:**
- Consumes: 已注册的 `ArticleList`（读真数据 `articles.data.ts`）
- Produces: `/articles/` 真数据索引；`DevNotesHub kind="articles"` 摘除（组件本体删除在 Task 6）

- [ ] **Step 1: `site/articles/index.md` 整文件替换**

```md
---
title: 文章
aside: false
titleTemplate: false
---

<ArticleList />
```

- [ ] **Step 2: 构建验证**

Run: `cd E:/VIE/site && npm run build && grep -c "vie-category-panel" .vitepress/dist/articles/index.html && grep -c "学习进度" .vitepress/dist/articles/index.html; echo exit=$?`
Expected: 第一个 grep ≥ 1；第二个 grep 输出 0（echo 显示 `exit=1`）。

- [ ] **Step 3: Commit**

```bash
cd E:/VIE
git add site/articles/index.md
git commit -m "feat: route articles index to real data"
git log -1 --format=%B | grep -i co-authored
```

Expected: grep 无输出。

---

### Task 5: og:image 支持 frontmatter

**Files:**
- Modify: `site/.vitepress/seo.ts`（`headTagsForPage` 内一处替换）

**Interfaces:**
- Consumes: 页面 frontmatter `image: string`（站点相对路径，如 `/images/...`）
- Produces: `og:image` / `twitter:image` 解析规则——frontmatter 优先，缺省 `${siteUrl}/images/vie-home.png`

- [ ] **Step 1: 精确替换**

```ts
// old
  const image = `${siteUrl}/images/vie-home.png`
// new
  const fmImage = pageData.frontmatter.image
  const image =
    (typeof fmImage === 'string' && fmImage && `${siteUrl}${fmImage}`) ||
    `${siteUrl}/images/vie-home.png`
```

- [ ] **Step 2: 构建验证**

Run: `cd E:/VIE/site && npm run build && grep -c "og:image" .vitepress/dist/index.html`
Expected: 输出 ≥ 1（缺省规则不变）。

- [ ] **Step 3: Commit**

```bash
cd E:/VIE
git add site/.vitepress/seo.ts
git commit -m "feat: og image from page frontmatter"
git log -1 --format=%B | grep -i co-authored
```

Expected: grep 无输出。

---

### Task 6: 死代码清理 + 守卫同步

**Files:**
- Delete: `site/.vitepress/theme/components/DevNotesHub.vue`、`site/.vitepress/theme/hub-reference.css`
- Modify: `site/.vitepress/theme/index.ts`（删三处引用）
- Modify: `site/scripts/check-content.mjs`

**Interfaces:**
- Consumes: Task 2 / Task 4 已摘除的路由（此时 `DevNotesHub` 零使用）
- Produces: `check-content.mjs` 从 `projects.source.ts` 读文本，断言 `name: 'Vie'` 恰一次、`name: 'VIE Gallery'` 恰一次、`slug: 'vie-gallery'` 恰一次

- [ ] **Step 1: 删除两个假数据文件**

```bash
cd E:/VIE/site
git rm .vitepress/theme/components/DevNotesHub.vue .vitepress/theme/hub-reference.css
```

- [ ] **Step 2: `theme/index.ts` 删除三行（精确匹配）**

```ts
// 删除这一行
import DevNotesHub from './components/DevNotesHub.vue'
// 删除这一行
import './hub-reference.css'
// 删除这一行
    app.component('DevNotesHub', DevNotesHub)
```

- [ ] **Step 3: `scripts/check-content.mjs` 两处修改**

修改读取路径（数据已搬家到 source 文件）：

```js
// old
const projectsSrc = fs.readFileSync(path.join(siteRoot, 'projects.data.ts'), 'utf8')
// new
const projectsSrc = fs.readFileSync(path.join(siteRoot, 'projects.source.ts'), 'utf8')
```

在 `vieNames` 断言块之后追加：

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

- [ ] **Step 4: 守卫与构建验证**

Run: `cd E:/VIE/site && npm run check:content && npm run build && grep -c "标签云" .vitepress/dist/articles/index.html .vitepress/dist/projects.html; echo done`
Expected: `check:content` 通过、构建成功；两个文件的 `标签云` 计数均为 0。

- [ ] **Step 5: Commit**

```bash
cd E:/VIE
git add site/.vitepress/theme/index.ts site/scripts/check-content.mjs
git commit -m "chore: remove DevNotesHub mock hub"
git log -1 --format=%B | grep -i co-authored
```

Expected: grep 无输出。

---

### Task 7: 数据契约测试 + CI 接入

**Files:**
- Create: `site/.vitepress/theme/data/projects.data.test.ts`
- Modify: `site/package.json`（scripts 加 `test:data`）
- Modify: `.github/workflows/deploy.yml`（site job 加一步）

**Interfaces:**
- Consumes: Task 1 的 `projects.source`（`import { projectsSource, type Project } from '../../../projects.source'`——相对路径从 `.vitepress/theme/data/` 回到 `site/`）
- Produces: npm script `test:data`（CI 在 `check:content` 后运行）；四条校验 = spec §13.1

- [ ] **Step 1: 新建测试文件 `site/.vitepress/theme/data/projects.data.test.ts`**

```ts
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { projectsSource, type Project } from '../../../projects.source'

const siteRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
)

const projects: Project[] = projectsSource

describe('projects data', () => {
  it('slugs are unique and vie-gallery is registered', () => {
    const slugs = projects.filter((p) => p.slug).map((p) => p.slug as string)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(slugs).toContain('vie-gallery')
  })

  it('every slug has a page file', () => {
    for (const p of projects) {
      if (!p.slug) continue
      expect(
        fs.existsSync(path.join(siteRoot, 'projects', `${p.slug}.md`)),
        `${p.name}: missing site/projects/${p.slug}.md`,
      ).toBe(true)
    }
  })

  it('log entries are well-formed and strictly newest-first', () => {
    for (const p of projects) {
      expect(['building', 'live'], p.name).toContain(p.status)
      let prevDate: string | null = null
      for (const e of p.log ?? []) {
        expect(e.title.trim().length > 0, p.name).toBe(true)
        expect(e.tech.length > 0, e.title).toBe(true)
        expect(['feature', 'fix', 'milestone', 'decision'], e.title).toContain(e.type)
        expect(e.date, e.title).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(Number.isNaN(+new Date(e.date)), e.title).toBe(false)
        if (prevDate) {
          expect(
            +new Date(prevDate),
            `${p.name}: ${prevDate} must be newer than ${e.date}`,
          ).toBeGreaterThan(+new Date(e.date))
        }
        prevDate = e.date
      }
    }
  })

  it('article/link/image references resolve', () => {
    for (const p of projects) {
      for (const e of p.log ?? []) {
        if (e.article) {
          expect(e.article.startsWith('/'), e.title).toBe(true)
          const rel = e.article.replace(/^\//, '')
          const exists =
            fs.existsSync(path.join(siteRoot, `${rel}.md`)) ||
            fs.existsSync(path.join(siteRoot, rel, 'index.md'))
          expect(exists, `${p.name}: broken article link ${e.article}`).toBe(true)
        }
        if (e.link) {
          expect(e.link.startsWith('https://'), e.title).toBe(true)
        }
        if (e.image) {
          expect(
            fs.existsSync(path.join(siteRoot, 'public', e.image)),
            `${p.name}: missing image ${e.image}`,
          ).toBe(true)
        }
      }
      if (p.image) {
        expect(
          fs.existsSync(path.join(siteRoot, 'public', p.image)),
          `${p.name}: missing image ${p.image}`,
        ).toBe(true)
      }
    }
  })
})
```

- [ ] **Step 2: `site/package.json` scripts 增行（`test:tools` 之后）**

```json
    "test:data": "vitest run --dir .vitepress/theme/data",
```

- [ ] **Step 3: 运行测试**

Run: `cd E:/VIE/site && npm run test:data`
Expected: 4 个用例全 PASS（当前数据：slug 唯一、单条里程碑、无 article/link 引用、Vie 的 image 已存在）。

- [ ] **Step 4: `.github/workflows/deploy.yml` site job 插入一行**

```yaml
# old
          npm ci
          npm run check:content
          npm run build
# new
          npm ci
          npm run check:content
          npm run test:data
          npm run build
```

- [ ] **Step 5: Commit**

```bash
cd E:/VIE
git add site/.vitepress/theme/data/projects.data.test.ts site/package.json .github/workflows/deploy.yml
git commit -m "test: add project data contract checks"
git log -1 --format=%B | grep -i co-authored
```

Expected: grep 无输出。

---

### Task 8: 截图落图 + image 字段 + 全字段验证 + 三页视觉验收

**Files:**
- Create: `site/public/images/projects/vie-gallery-viewer.png`
- Modify: `site/projects.source.ts`（VIE Gallery 条目加 `image`）
- Modify: `site/projects/vie-gallery.md`（frontmatter 加 `image`）

**Interfaces:**
- Consumes: Task 7 的 `test:data`（校验 image 文件存在）、Task 3 的详情页模板
- Produces: 卡片缩略图与 og:image 同图；三页视觉验收结论

- [ ] **Step 1: 落图**

```bash
mkdir -p E:/VIE/site/public/images/projects
cp E:/workspace/vie-gallery/spatial-gallery-production-test.png E:/VIE/site/public/images/projects/vie-gallery-viewer.png
ls -la E:/VIE/site/public/images/projects/
```

Expected: 文件存在。**若源图不存在：跳过 Step 2、3，image 字段保持缺省，并在验收结论中报告 skipped**（schema 对缺省 image 不报错；不得选另一张未确认的图顶替）。

- [ ] **Step 2: `site/projects.source.ts` VIE Gallery 条目在 `description` 之后加一行**

```ts
    image: '/images/projects/vie-gallery-viewer.png',
```

- [ ] **Step 3: `site/projects/vie-gallery.md` frontmatter 在 `description` 之后加一行**

```md
image: /images/projects/vie-gallery-viewer.png
```

- [ ] **Step 4: 测试与构建**

Run: `cd E:/VIE/site && npm run test:data && npm run build && grep -c "vie-gallery-viewer" .vitepress/dist/projects/vie-gallery.html`
Expected: `test:data` PASS；grep 输出 ≥ 1（og:image 与卡片引用同图）。

- [ ] **Step 5: 全字段渲染验证（临时条目，验证后还原）**

临时给 VIE Gallery 首条 log 增加两个字段：`article: '/articles/meta/how-this-site-works'` 与 `link: 'https://github.com/creatawork'`。

Run: `cd E:/VIE/site && npm run build && grep -c "深度文章" .vitepress/dist/projects/vie-gallery.html`
Expected: 输出 ≥ 1（链接行与截图同屏、间距正常）。

随后**删除这两个临时字段**（编辑器内撤销该两行），重新 `npm run build` 确认 grep 输出 0。临时状态不提交。

- [ ] **Step 6: 三页视觉验收**

Run: `cd E:/VIE/site && npm run preview`
对三页截图（桌面 1280×800 与 ≤900px 各一）：`/projects`（两张真卡、状态徽章、日志入口）、`/projects/vie-gallery`（面包屑、页头、时间线、截图）、`/articles/`（分类分组真数据）。移动端检查：时间线左线与节点不溢出视口、卡片无横向滚动。任何断裂 → 修复后重截。

- [ ] **Step 7: Commit**

```bash
cd E:/VIE
git add site/public/images/projects/vie-gallery-viewer.png site/projects.source.ts site/projects/vie-gallery.md
git commit -m "feat: add vie-gallery screenshot"
git log -1 --format=%B | grep -i co-authored
```

Expected: grep 无输出。

---

### Task 9: PRODUCT.md / DESIGN.md 同步

**Files:**
- Modify: `PRODUCT.md`
- Modify: `DESIGN.md`

**Interfaces:** 无代码接口；文档与实现对齐。

- [ ] **Step 1: `PRODUCT.md` URL 行精确替换**

```md
<!-- old -->
- URL 结构冻结（`/`、`/articles/`、`/projects`、`/series/`、`/tools`、`/tools/*`、隐藏 `/stats-view`）。
<!-- new -->
- URL 结构冻结（`/`、`/articles/`、`/projects`、`/projects/<slug>`、`/series/`、`/tools`、`/tools/*`、隐藏 `/stats-view`）；`<slug>` 限于 `projects.source.ts` 显式登记的项目，页面文件显式创建。
```

- [ ] **Step 2: `PRODUCT.md` Capabilities 追加一行（「成果展示」之后）**

```md
- 项目开发日志：成果页真数据 + 项目详情页时间线（数据文件手动录入）
```

- [ ] **Step 3: `DESIGN.md` Hub pages 行插入组件名**

```md
<!-- old -->
- **Hub pages:** `ArticleList`, `Projects`, `SeriesIndex`, `SeriesPage`, `StatsView` use `VieShell` + `vie-panel` / `vie-tile` / `vie-feed`.
<!-- new -->
- **Hub pages:** `ArticleList`, `Projects`, `ProjectDetail`, `SeriesIndex`, `SeriesPage`, `StatsView` use `VieShell` + `vie-panel` / `vie-tile` / `vie-feed`.
```

- [ ] **Step 4: 最终全量验证**

Run: `cd E:/VIE/site && npm run check:content && npm run test:data && npm run build`
Expected: 三条全绿。

- [ ] **Step 5: Commit**

```bash
cd E:/VIE
git add PRODUCT.md DESIGN.md
git commit -m "docs: sync product and design for project devlog"
git log -1 --format=%B | grep -i co-authored
```

Expected: grep 无输出。

---

## 验收清单（对照 spec §13）

- [ ] `npm run check:content` 绿（含两个新项目断言）
- [ ] `npm run test:data` 绿（4 用例）
- [ ] `npm run build` 绿；`dist/projects.html` 含「VIE Gallery」「开发中」；`dist/projects/vie-gallery.html` 含「V1 Ready」；`dist/articles/index.html` 含 `vie-category-panel` 且不含「学习进度」「标签云」
- [ ] 三页视觉验收通过（桌面 + ≤900px）
- [ ] `PRODUCT.md` / `DESIGN.md` 已同步
- [ ] 全部提交不含 `Co-authored-by: Cursor`
