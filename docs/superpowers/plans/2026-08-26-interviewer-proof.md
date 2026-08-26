# 面试官 3 分钟可验证 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 去掉样本口吻，让面试官 3 分钟内读到定位、真文与唯一项目 Vie，并接上本地搜索、RSS 声明与 OG。

**Architecture:** 只改 `site/` 内容/主题与 CI 的站点 job。项目数据仍是 `projects.data.ts`；发现层集中在 `seo.ts` 的 `headTagsForPage` + `config.mts` 的 `search` / `transformHead`（动态 import 避免与 `SITE_URL` 循环依赖）。用 `scripts/check-content.mjs` 做构建前契约，不引入 Vitest。

**Tech Stack:** VitePress 1.6、Vue 3、已有 `gray-matter` / `feed`、GitHub Actions。禁止新增运行时依赖。

**Spec:** `docs/superpowers/specs/2026-08-26-interviewer-proof-design.md`（文章全文以 spec 附录 A 为准，禁止改写叙事）。

## Global Constraints

- 展示名 Vie（V 大写，ie 小写）；定位句「写清楚每一个技术决策」
- URL 冻结：`/`、`/articles/`、`/projects`、`/series/`、`/stats-view`
- 不做：评论、登录、后台、多语言、邮件订阅、简介页、新路由、标签页、JSON-LD、自托管字体、公开 PV、探测 `/api`
- 不新增 npm 运行时依赖；允许新增 `site/scripts/check-content.mjs`
- 正文与 description 禁止出现：`正文占位`、`样本`、`静态模拟`
- 提交不得含 `Co-authored-by: Cursor`。PowerShell 干净提交：

```powershell
git add <files>
$tree = git write-tree
$commit = git commit-tree $tree -p HEAD -m @"
<message>

"@
git update-ref HEAD $commit
git log -1 --format="%B"
```

若输出含 `co-authored` / `cursoragent`，停止，先清掉再继续。

---

## File map

| File | Role |
|------|------|
| Create `site/scripts/check-content.mjs` | 内容契约 |
| Modify `site/package.json` | `check:content` script |
| Modify `site/projects.data.ts` | 单项目 + `decisions` |
| Modify `site/.vitepress/theme/components/Projects.vue` | 决策列表 |
| Modify `site/.vitepress/theme/components/HomeBento.vue` | 定位句、系列/总览格 |
| Modify `site/.vitepress/theme/vie-bento.css` | 次要卡作为链接的 hover |
| Modify `site/.vitepress/seo.ts` | `headTagsForPage`、Feed 标题 Vie |
| Modify `site/.vitepress/config.mts` | local search、`transformHead` |
| Replace 8 files under `site/articles/` | 附录 A |
| Modify `.github/workflows/deploy.yml` | build 前 check:content |
| Create `site/public/images/vie-home.png` | 截图 / OG |
| Modify `DESIGN.md` | Home 磁贴列表 |

---

### Task 1: 内容契约脚本（先红）

**Files:**
- Create: `site/scripts/check-content.mjs`
- Test: run the script from `site/`

**Interfaces:**
- Consumes: `articles/**/*.md`、`projects.data.ts` 文本、`HomeBento.vue`、`config.mts`、`seo.ts`
- Produces: CLI 退出码 0/1；实现其余任务后必须为 0

- [ ] **Step 1: 写 `site/scripts/check-content.mjs`**

```js
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FORBIDDEN = ['正文占位', '样本', '静态模拟']
const POSITIONING = '应届 · 全栈 · 文章是决策日志，成果是上线证明'

const errors = []

function walkMd(dir, acc = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name)
    if (name.isDirectory()) walkMd(full, acc)
    else if (name.name.endsWith('.md')) acc.push(full)
  }
  return acc
}

function hasForbidden(text) {
  return FORBIDDEN.filter((w) => text.includes(w))
}

const articlesDir = path.join(siteRoot, 'articles')
for (const file of walkMd(articlesDir)) {
  const rel = path.relative(siteRoot, file).replaceAll('\\', '/')
  if (rel === 'articles/index.md') continue
  const raw = fs.readFileSync(file, 'utf8')
  const { data, content } = matter(raw)
  const title = typeof data.title === 'string' ? data.title.trim() : ''
  const date = data.date
  const description = typeof data.description === 'string' ? data.description.trim() : ''
  if (!title) errors.push(`${rel}: missing title`)
  if (!date) errors.push(`${rel}: missing date`)
  if (description.replace(/\s/g, '').length < 12) {
    errors.push(`${rel}: description too short`)
  }
  const bodyChars = content.replace(/\s/g, '').length
  if (bodyChars < 400) errors.push(`${rel}: body ${bodyChars} < 400`)
  for (const w of hasForbidden(description + '\n' + content)) {
    errors.push(`${rel}: forbidden "${w}"`)
  }
}

const projectsSrc = fs.readFileSync(path.join(siteRoot, 'projects.data.ts'), 'utf8')
const vieNames = projectsSrc.match(/name: 'Vie'/g) || []
if (vieNames.length !== 1) {
  errors.push(`projects.data.ts: expected exactly one name: 'Vie', got ${vieNames.length}`)
}
if (!projectsSrc.includes('featured: true')) {
  errors.push(`projects.data.ts: missing featured: true`)
}
const hrefs = projectsSrc.match(/href: '\/articles\//g) || []
if (hrefs.length < 3) {
  errors.push(`projects.data.ts: expected >= 3 decision hrefs, got ${hrefs.length}`)
}

const home = fs.readFileSync(
  path.join(siteRoot, '.vitepress/theme/components/HomeBento.vue'),
  'utf8',
)
if (!home.includes(POSITIONING)) {
  errors.push('HomeBento.vue: missing positioning line')
}

const config = fs.readFileSync(path.join(siteRoot, '.vitepress/config.mts'), 'utf8')
if (!config.includes("provider: 'local'")) {
  errors.push("config.mts: missing search provider: 'local'")
}

const seo = fs.readFileSync(path.join(siteRoot, '.vitepress/seo.ts'), 'utf8')
if (!seo.includes("rel: 'alternate'")) errors.push('seo.ts: missing RSS alternate')
if (!seo.includes('og:description')) errors.push('seo.ts: missing og:description')

if (errors.length) {
  console.error('check-content failed:\n' + errors.map((e) => ` - ${e}`).join('\n'))
  process.exit(1)
}
console.log('check-content ok')
```

- [ ] **Step 2: 在 `site/` 运行，确认当前仓库为失败**

```powershell
cd site
node scripts/check-content.mjs
```

Expected: exit 1，错误至少包含文章里的 `样本`/`正文占位`、缺定位句、缺 `provider: 'local'`、缺 OG/RSS。不要在这一 task 修内容。

- [ ] **Step 3: Commit**

```powershell
git add site/scripts/check-content.mjs
```

message: `test(site): add check-content contract script`

---

### Task 2: 唯一项目 Vie 与决策列表

**Files:**
- Modify: `site/projects.data.ts`
- Modify: `site/.vitepress/theme/components/Projects.vue`

**Interfaces:**
- Consumes: 无
- Produces: `ProjectDecision { text: string; href?: string }`；`Project.decisions?: ProjectDecision[]`；单条 `name: 'Vie'`

- [ ] **Step 1: 替换 `site/projects.data.ts` 为**

```ts
export interface ProjectDecision {
  text: string
  href?: string
}

export interface Project {
  name: string
  description: string
  image?: string
  tags: string[]
  github?: string
  demo?: string
  featured: boolean
  decisions?: ProjectDecision[]
}

const projectsSource: Project[] = [
  {
    name: 'Vie',
    description:
      'VitePress 静态站 + 同域 SpringBoot 统计 + Caddy / GitHub Actions 发布。',
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
]

declare const data: Project[]
export { data }

export default {
  watch: [],
  load(): Project[] {
    return projectsSource
  },
}
```

本步**不要**加 `image` 字段。

- [ ] **Step 2: 替换 `site/.vitepress/theme/components/Projects.vue` 为**

```vue
<script setup lang="ts">
import { data as projects } from '../../../projects.data'
import VieShell from './VieShell.vue'
</script>

<template>
  <VieShell path="projects/" hint="ship">
    <div class="vie-project-grid">
      <article
        v-for="(p, i) in projects"
        :key="p.name"
        class="vie-tile vie-tile--ship vie-project-tile"
      >
        <div class="vie-tile-tab vie-mono">projects/{{ p.name.toLowerCase().replace(/\s+/g, '-') }}</div>
        <span class="vie-badge vie-mono">{{ p.featured ? 'featured' : `p${i + 1}` }}</span>
        <img
          v-if="p.image"
          :src="p.image"
          :alt="p.name"
          class="vie-project-img"
          loading="lazy"
          decoding="async"
        />
        <h2>{{ p.name }}</h2>
        <p>{{ p.description }}</p>
        <ul v-if="p.decisions?.length" class="vie-feed vie-decisions">
          <li v-for="(d, j) in p.decisions" :key="j">
            <span class="vie-ln vie-mono">{{ String(j + 1).padStart(2, '0') }}</span>
            <a v-if="d.href" :href="d.href">{{ d.text }}</a>
            <span v-else>{{ d.text }}</span>
          </li>
        </ul>
        <div class="vie-chip-row">
          <span v-for="t in p.tags" :key="t" class="vie-chip vie-chip--accent">{{ t }}</span>
        </div>
        <div class="vie-link-row vie-mono">
          <a v-if="p.github" :href="p.github" target="_blank" rel="noopener">gh</a>
          <a v-if="p.demo" :href="p.demo" target="_blank" rel="noopener">demo</a>
        </div>
      </article>
    </div>
  </VieShell>
</template>
```

- [ ] **Step 3: 抽查数据契约（脚本仍会因文章/搜索失败，但项目三项应消失）**

```powershell
cd site
node scripts/check-content.mjs 2>&1 | Select-String projects
```

Expected: 没有 `projects.data.ts` 相关行。

- [ ] **Step 4: Commit**

message: `feat(site): collapse projects to Vie with decision links`

---

### Task 3: 首页定位与系列/总览格

**Files:**
- Modify: `site/.vitepress/theme/components/HomeBento.vue`
- Modify: `site/.vitepress/theme/vie-bento.css`

**Interfaces:**
- Consumes: `seriesGroups`、`posts`（`how-this-site-works`）、Task 2 的单项目
- Produces: 定位句原文；`SERIES_NAME = '个人网站开发实录'`

- [ ] **Step 1: 替换 `site/.vitepress/theme/components/HomeBento.vue` 为**

```vue
<script setup lang="ts">
import { data as posts } from '../../../articles.data'
import { data as projects } from '../../../projects.data'
import { data as seriesGroups } from '../../../series.data'

const SERIES_NAME = '个人网站开发实录'
const POSITIONING = '应届 · 全栈 · 文章是决策日志，成果是上线证明'

const latest = posts.slice(0, 6)
const lead = projects.find((p) => p.featured) ?? projects[0]
const series = seriesGroups.find((g) => g.name === SERIES_NAME)
const overview = posts.find((p) => p.url.includes('how-this-site-works'))
const heroPost = latest[0]
const morePosts = latest.slice(1, 6)

const stack = ['VitePress', 'Vue 3', 'SpringBoot', 'Docker', 'GitHub Actions', 'TypeScript']
</script>

<template>
  <div class="vie-bento-home">
    <div class="vie-status-bar" aria-hidden="true">
      <span class="vie-status-dot" />
      <span>vie-vibe.cn</span>
      <span class="vie-status-sep">·</span>
      <span class="vie-mono">{{ posts.length }} posts</span>
      <span class="vie-status-sep">·</span>
      <span class="vie-mono">{{ projects.length }} projects</span>
      <span class="vie-status-sep">·</span>
      <span class="vie-mono vie-syntax-fn">vibe-coding</span>
    </div>

    <div class="vie-bento-grid">
      <section class="vie-tile vie-tile--thesis" aria-labelledby="home-thesis">
        <div class="vie-tile-tab vie-mono">src/index.tsx</div>
        <p class="vie-code-comment">// 全栈开发 · 技术实现细节与思路</p>
        <h1 id="home-thesis" class="vie-tile-title">
          <span class="vie-syntax-kw">const</span>
          <span class="vie-syntax-fn"> thesis</span>
          <span class="vie-syntax-op"> = </span>
          <span class="vie-syntax-str">"写清楚每一个技术决策"</span>
          <span class="vie-cursor" aria-hidden="true" />
        </h1>
        <p class="vie-code-comment vie-mono">// {{ POSITIONING }}</p>
        <div class="vie-stack-chips" aria-label="技术栈">
          <span v-for="s in stack" :key="s" class="vie-chip">{{ s }}</span>
        </div>
        <div class="vie-tile-actions">
          <a class="vie-run-btn" href="/articles/">
            <span class="vie-mono" aria-hidden="true">→</span>
            阅读文章
          </a>
          <a class="vie-ghost-btn vie-mono" href="/projects">open projects/</a>
          <a class="vie-ghost-btn vie-mono" href="/series/">ls series/</a>
        </div>
      </section>

      <article v-if="lead" class="vie-tile vie-tile--ship">
        <div class="vie-tile-tab vie-mono">projects/featured</div>
        <span class="vie-badge vie-mono">ship</span>
        <h2>{{ lead.name }}</h2>
        <p>{{ lead.description }}</p>
        <div class="vie-chip-row">
          <span v-for="t in lead.tags" :key="t" class="vie-chip vie-chip--accent">{{ t }}</span>
        </div>
        <div class="vie-link-row vie-mono">
          <a v-if="lead.github" :href="lead.github" target="_blank" rel="noopener">gh</a>
          <a v-if="lead.demo" :href="lead.demo" target="_blank" rel="noopener">demo</a>
        </div>
      </article>

      <section class="vie-tile vie-tile--metrics" aria-label="站点规模">
        <div class="vie-tile-tab vie-mono">metrics/</div>
        <div class="vie-metrics-grid">
          <div class="vie-metric">
            <b>{{ posts.length }}</b>
            <span class="vie-mono">posts</span>
          </div>
          <div class="vie-metric">
            <b>{{ seriesGroups.length }}</b>
            <span class="vie-mono">series</span>
          </div>
          <div class="vie-metric">
            <b>{{ projects.length }}</b>
            <span class="vie-mono">ships</span>
          </div>
          <div class="vie-metric">
            <b class="vie-syntax-fn">live</b>
            <span class="vie-mono">status</span>
          </div>
        </div>
      </section>

      <a
        v-if="heroPost"
        class="vie-tile vie-tile--post"
        :href="heroPost.url"
      >
        <div class="vie-tile-tab vie-mono">articles/latest.md</div>
        <span class="vie-badge vie-mono vie-badge--post">{{ heroPost.category }}</span>
        <h2>{{ heroPost.title }}</h2>
        <p class="vie-mono vie-tile-meta">
          {{ heroPost.date.slice(0, 10) }} · ~{{ heroPost.readingTime }}min
        </p>
      </a>

      <section class="vie-tile vie-tile--feed" aria-labelledby="recent-feed">
        <div class="vie-tile-tab vie-mono">articles/recent</div>
        <h2 id="recent-feed" class="vie-feed-label vie-mono">recent[]</h2>
        <ul class="vie-feed">
          <li v-for="(p, i) in morePosts" :key="p.url">
            <span class="vie-ln vie-mono">{{ String(i + 1).padStart(2, '0') }}</span>
            <a :href="p.url">{{ p.title }}</a>
            <span class="vie-feed-desc">{{ p.description }}</span>
            <span class="vie-feed-meta vie-mono">{{ p.category }} · {{ p.date.slice(0, 10) }}</span>
          </li>
        </ul>
        <a class="vie-more vie-mono" href="/articles/">ls articles/ →</a>
      </section>

      <a
        v-if="series"
        class="vie-tile vie-tile--ship vie-tile--ship-sm"
        :href="'/series/' + encodeURIComponent(series.name)"
      >
        <div class="vie-tile-tab vie-mono">series/log</div>
        <span class="vie-badge vie-mono">series</span>
        <h2>{{ series.name }}</h2>
        <p class="vie-mono vie-tile-meta">{{ series.posts.length }} posts</p>
      </a>

      <a
        v-if="overview"
        class="vie-tile vie-tile--ship vie-tile--ship-sm"
        :href="overview.url"
      >
        <div class="vie-tile-tab vie-mono">articles/meta</div>
        <span class="vie-badge vie-mono">read</span>
        <h2>{{ overview.title }}</h2>
        <p class="vie-mono vie-tile-meta">{{ overview.description }}</p>
      </a>

      <section class="vie-tile vie-tile--terminal" aria-label="站点说明">
        <div class="vie-tile-tab vie-mono">~</div>
        <pre class="vie-mono vie-terminal"><code><span class="vie-syntax-fn">$</span> vie whoami
<span class="vie-syntax-str">full-stack builder</span>
<span class="vie-syntax-comment">// posts = decision logs</span>
<span class="vie-syntax-comment">// projects = shipped proof</span>
<span class="vie-syntax-kw">export</span> <span class="vie-syntax-op">{</span> <span class="vie-syntax-fn">read</span>, <span class="vie-syntax-fn">ship</span> <span class="vie-syntax-op">}</span></code></pre>
      </section>
    </div>
  </div>
</template>
```

- [ ] **Step 2: 在 `vie-bento.css` 的 `.vie-tile--ship-sm` 规则后追加**

```css
a.vie-tile--ship-sm {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

a.vie-tile--ship-sm:hover {
  border-color: color-mix(in srgb, var(--vie-str) 45%, var(--vie-border));
  transform: translateY(-2px);
}

@media (prefers-reduced-motion: reduce) {
  a.vie-tile--ship-sm:hover {
    transform: none;
  }
}
```

若文件底部已有全局 `prefers-reduced-motion: reduce` 关掉所有 `transform`，可省略内层 media query，但链接 hover 的 `border-color` 必须保留。

- [ ] **Step 3: 确认定位句检查通过**

```powershell
cd site
node scripts/check-content.mjs 2>&1 | Select-String HomeBento
```

Expected: 无 `HomeBento` 行。

- [ ] **Step 4: Commit**

message: `feat(site): home positioning and series tiles`

---

### Task 4: 搜索、RSS alternate、OG

**Files:**
- Modify: `site/.vitepress/seo.ts`
- Modify: `site/.vitepress/config.mts`

**Interfaces:**
- Consumes: `SITE_URL`（仍由 `config.mts` 导出）
- Produces: `headTagsForPage(pageData, siteUrl): HeadConfig[]`；`transformHead` 动态 import 该函数

- [ ] **Step 1: 在 `seo.ts` 顶部增加类型 import，Feed `title` 改为 `'Vie'`，并追加下列函数（放在 `generateFeed` 之前或之后均可）**

现有 `import { SITE_URL } from './config.mts'` 保留给 sitemap/feed。新增：

```ts
import type { HeadConfig } from 'vitepress'

interface HeadPageData {
  relativePath: string
  title: string
  description: string
  frontmatter: Record<string, unknown>
}

export function pageUrl(relativePath: string, siteUrl: string): string {
  const path = relativePath
    .replace(/\\/g, '/')
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, '')
    .replace(/\/$/, '')
  return path ? `${siteUrl}/${path}` : siteUrl
}

export function headTagsForPage(pageData: HeadPageData, siteUrl: string): HeadConfig[] {
  const fmDesc = pageData.frontmatter.description
  const description =
    (typeof fmDesc === 'string' && fmDesc) ||
    pageData.description ||
    '技术实现细节与思路'
  const url = pageUrl(pageData.relativePath, siteUrl)
  const rel = pageData.relativePath.replace(/\\/g, '/')
  const isArticle = rel.startsWith('articles/') && !rel.endsWith('index.md')
  const image = `${siteUrl}/images/vie-home.png`
  return [
    [
      'link',
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        href: `${siteUrl}/feed.xml`,
        title: 'Vie RSS',
      },
    ],
    ['meta', { property: 'og:site_name', content: 'Vie' }],
    ['meta', { property: 'og:title', content: pageData.title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: url }],
    ['meta', { property: 'og:type', content: isArticle ? 'article' : 'website' }],
    ['meta', { property: 'og:image', content: image }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: pageData.title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: image }],
  ]
}
```

`generateFeed` 里 `title: 'VIE'` 改为 `title: 'Vie'`。

- [ ] **Step 2: 改 `config.mts`**

在 `themeConfig` 内 `nav` 同级增加：

```ts
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索文章' },
          modal: {
            noResultsText: '没有找到',
            resetButtonTitle: '清除',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
      },
    },
```

在 `defineConfig` 对象内、`themeConfig` 旁增加：

```ts
  async transformHead({ pageData }) {
    const { headTagsForPage } = await import('./seo')
    return headTagsForPage(pageData, SITE_URL)
  },
```

不要改成静态 `import './seo'`，否则与 `seo.ts` import `config.mts` 循环依赖。

- [ ] **Step 3: 再跑契约**

```powershell
cd site
node scripts/check-content.mjs 2>&1 | Select-String "config.mts|seo.ts|HomeBento|projects"
```

Expected: 这四类文件不再报错。仍应有 articles 的 forbidden/body 错误。

- [ ] **Step 4: Commit**

message: `feat(site): local search, RSS alternate, and OG tags`

---

### Task 5: 按附录 A 替换八篇文章

**Files:**
- Replace: `site/articles/meta/how-this-site-works.md`（A.1）
- Replace: `site/articles/frontend/vitepress-theme.md`（A.2）
- Replace: `site/articles/backend/springboot-stats-api.md`（A.3）
- Replace: `site/articles/devops/github-actions-deploy.md`（A.4）
- Replace: `site/articles/devops/caddy-reverse-proxy.md`（A.5）
- Replace: `site/articles/backend/dto-vs-entity.md`（A.6）
- Replace: `site/articles/notes/redis-cache-pattern.md`（A.7）
- Replace: `site/articles/meta/reading-time-wordcount.md`（A.8）

**Interfaces:**
- Consumes: spec 附录 A 的围栏内全文（A.1/A.5 外层是四重反引号 `````markdown`）
- Produces: 无 `样本`/`正文占位`/`静态模拟`；每篇正文去空白 ≥ 400 字

- [ ] **Step 1: 写入八个文件**

打开 `docs/superpowers/specs/2026-08-26-interviewer-proof-design.md`。对 A.1–A.8：把围栏**内部**（从 `---` 到正文最后一行，不含围栏本身）原样写入对应路径。不要改写、不要加「样本」。A.1 必须保留 mermaid 代码块；A.5 必须保留 Caddy 片段。

- [ ] **Step 2: 跑契约，必须通过**

```powershell
cd site
node scripts/check-content.mjs
```

Expected: 打印 `check-content ok`，exit 0。若某篇 `< 400`，只在该篇末尾补一句对照仓库的事实，禁止重新引入禁用词。

- [ ] **Step 3: Commit**

message: `content(site): rewrite posts as verifiable decision logs`

---

### Task 6: npm script、CI、构建验收

**Files:**
- Modify: `site/package.json`
- Modify: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: Task 1 的脚本
- Produces: `npm run check:content`；CI `site` job 在 `npm ci` 之后、`npm run build` 之前调用它

- [ ] **Step 1: `site/package.json` 的 `scripts` 改为**

```json
  "scripts": {
    "dev": "vitepress dev",
    "build": "vitepress build",
    "preview": "vitepress preview",
    "check:content": "node scripts/check-content.mjs"
  },
```

- [ ] **Step 2: 改 `.github/workflows/deploy.yml` 的 `site` job「构建静态站」步骤为**

```yaml
      - name: 构建静态站
        working-directory: site
        run: |
          npm ci
          npm run check:content
          npm run build
```

- [ ] **Step 3: 本地构建并抽查产物**

```powershell
cd site
npm run check:content
npm run build
```

Expected: 构建成功。然后：

```powershell
Select-String -Path .vitepress/dist/index.html -Pattern "应届 · 全栈 · 文章是决策日志" | Select-Object -First 1
Select-String -Path .vitepress/dist/index.html -Pattern 'application/rss\+xml' | Select-Object -First 1
Select-String -Path .vitepress/dist/feed.xml -Pattern '<title>Vie' | Select-Object -First 1
Get-ChildItem -Recurse .vitepress/dist | Where-Object { $_.Name -match 'localSearch|LocalSearch' } | Select-Object -First 5 Name
```

Expected: 三处 `Select-String` 均有命中；dist 内存在本地搜索相关文件。

- [ ] **Step 4: Commit**

message: `ci(site): run check-content before VitePress build`

---

### Task 7: 首页截图、OG 图、DESIGN.md

**Files:**
- Create: `site/public/images/vie-home.png`
- Modify: `site/projects.data.ts`（补 `image`）
- Modify: `DESIGN.md`

**Interfaces:**
- Consumes: 已改完的 HomeBento
- Produces: 1280×800 量级 PNG；`image: '/images/vie-home.png'`；DESIGN Home 磁贴列表

- [ ] **Step 1: 预览并截图**

```powershell
cd site
npm run preview -- --host 127.0.0.1 --port 4173
```

浏览器打开 `http://127.0.0.1:4173/`，视口约 1280×800，截首页首屏（含 thesis、featured、metrics）。保存为 `site/public/images/vie-home.png`（可先截全页再裁到首屏）。目录 `site/public/images/` 若不存在则创建。停掉 preview。

- [ ] **Step 2: 在 Vie 项目对象上增加**

```ts
    image: '/images/vie-home.png',
```

放在 `description` 之后、`tags` 之前。

- [ ] **Step 3: 把 `DESIGN.md` 的 Home 那一行改成**

```markdown
- **Home:** `<HomeBento />` — status bar, thesis tile (plus positioning line), featured ship, metrics, latest post, feed, series tile, overview-article tile, terminal snippet.
```

- [ ] **Step 4: 再构建一次，确认 png 进 dist**

```powershell
cd site
npm run check:content
npm run build
Test-Path .vitepress/dist/images/vie-home.png
```

Expected: `True`；`check-content ok`。

- [ ] **Step 5: Commit**

message: `feat(site): home screenshot for project card and OG`

---

## 实现后手工验收

1. 首页能读到定位句；ships 为 1；两张小卡分别进系列页与总览文。
2. `/projects` 仅一张 Vie，四条决策可点。
3. 导航搜索「Caddy」能出反代那篇。
4. 查看任意文章页源码含 `og:description` 与 `rel="alternate"`。
5. 窄屏（≤900px）Bento 单列，无横向溢出。
6. `/stats-view` 未在前台导航出现。
