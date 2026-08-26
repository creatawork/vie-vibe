# 不对称刊头全站视觉改造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 全站换成左刊头 + 右内容，加深 Vie / 冷纸 / 海军蓝，去掉 VitePress 默认 Hero。

**Architecture:** 纯函数 `mastheadDensity(path, hasDate)` 决定刊头四档密度。`Layout.vue` 用 `#layout-top` 注入 `Masthead.vue`，CSS Grid 把 `.Layout` 排成顶栏全宽、下方左刊头右内容。首页改为普通文档页，只挂文章流与精选成果。正文目录改到左栏，用 CSS 隐藏 `.VPDoc .aside`。

**Tech Stack:** VitePress 1.6 + Vue 3。密度函数用 Node 内置 `node --test` 测，不新增测试框架。前端其余验收以 `npm run build` + 预览页面为准（仓库约定不引入前端单测框架）。

## Global Constraints

- Spec：`docs/superpowers/specs/2026-08-26-asymmetric-masthead-design.md`。冲突时本 spec 覆盖「首页默认 Hero」。
- URL / 栏目 / 内容模型 / 统计 API 不改。搜索保持关闭。无简介页。
- 字标必须是 HTML：`<span class="vie-v">V</span><span class="vie-ie">ie</span>`，禁止 `::first-letter`。
- Token 原样：paper `#F3F5F7`、ink `#12161C`、signal `#1F4E79`、ember `#C45C26`（仅竖条与焦点）、mist `#D5DCE5`。
- 文案：定位句「写清楚每一个技术决策」；按钮「阅读文章」「查看成果」；空列表「还没有文章」。
- 不做蓝图/原理图/终端皮肤、渐变字、网格纹、噪点滤镜、01/02 装饰编号、kicker。
- Commit 信息：`feat(site):` / `fix(site):` / `docs:` 中文。**禁止** `git commit`（会注入 Co-authored-by）。一律：

```powershell
$git = "E:\Git\Git\cmd\git.exe"
& $git add -- <files>
$TREE = & $git write-tree
$NEW = & $git commit-tree $TREE -p HEAD -m "<message>"
& $git update-ref HEAD $NEW
& $git log -1 --format="%B"
# 输出不得含 Co-authored-by 或 cursoragent
```

---

## File map

| 文件 | 职责 |
|---|---|
| `site/.vitepress/theme/mastheadDensity.ts` | 路径 → 刊头密度 |
| `site/.vitepress/theme/mastheadDensity.test.ts` | Node 测试 |
| `site/.vitepress/theme/components/VieWordmark.vue` | 可复用 Vie 字标 |
| `site/.vitepress/theme/components/Masthead.vue` | 四档刊头 UI + 窄档 TOC |
| `site/.vitepress/theme/Layout.vue` | 注入刊头、字数、埋点、正文页眉 |
| `site/.vitepress/theme/custom.css` | 双栏网格、隐藏 aside、动效、减动效 |
| `site/index.md` | 去掉 `layout: home` 与 hero |
| `site/.vitepress/theme/components/LatestArticles.vue` | 空状态 |
| `site/.vitepress/theme/components/ArticleList.vue` | 空状态 |
| `site/.vitepress/theme/components/SeriesNav.vue` | 对齐刊头分割线 |
| `site/package.json` | `test:theme` 脚本 |
| `DESIGN.md` | 实现验收后按实装更新 |

不改：`articles.data.ts`、`projects.data.ts`、`series.data.ts`、server、deploy、`themeConfig.search`（保持未配置）。

---

### Task 1: 刊头密度函数

**Files:**
- Create: `site/.vitepress/theme/mastheadDensity.ts`
- Create: `site/.vitepress/theme/mastheadDensity.test.ts`
- Modify: `site/package.json`

**Interfaces:**
- Produces: `export type MastheadDensity = 'full' | 'mid' | 'narrow' | 'minimal'`
- Produces: `export function mastheadDensity(path: string, hasDate: boolean): MastheadDensity`

规则（先规范化：去掉末尾 `/`，空则 `'/'`）：

| 条件（自上而下第一条命中） | 返回 |
|---|---|
| `path === '/stats-view'` | `'minimal'` |
| `path === '/'` | `'full'` |
| `hasDate === true` | `'narrow'` |
| `path === '/articles'` 或 `path === '/series'` 或 `path === '/projects'` | `'mid'` |
| `path.startsWith('/articles/')` | `'narrow'` |
| 其他 | `'mid'` |

说明：系列专题页 `/series/<name>` 是列表（mid）。带 `date` 的 Markdown 才是正文（narrow）。`hasDate` 由 Layout 传入 `!!frontmatter.date`。`/articles/` 列表页 normalize 后是 `/articles`，应走 mid 而不是文章页。实现时必须先判断 `p === '/articles'` → mid，再判断 `p.startsWith('/articles/')` → narrow。

- [ ] **Step 1: 写失败测试**

`site/.vitepress/theme/mastheadDensity.test.ts`：

```ts
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mastheadDensity } from './mastheadDensity.ts'

test('home is full', () => {
  assert.equal(mastheadDensity('/', false), 'full')
  assert.equal(mastheadDensity('', false), 'full')
})

test('stats-view is minimal', () => {
  assert.equal(mastheadDensity('/stats-view', false), 'minimal')
  assert.equal(mastheadDensity('/stats-view/', false), 'minimal')
})

test('list routes are mid', () => {
  assert.equal(mastheadDensity('/articles/', false), 'mid')
  assert.equal(mastheadDensity('/series/', false), 'mid')
  assert.equal(mastheadDensity('/series/个人网站开发实录', false), 'mid')
  assert.equal(mastheadDensity('/projects', false), 'mid')
})

test('dated pages are narrow', () => {
  assert.equal(mastheadDensity('/articles/meta/how-this-site-works', true), 'narrow')
})

test('article path without date still narrow', () => {
  assert.equal(mastheadDensity('/articles/meta/how-this-site-works', false), 'narrow')
})
```

在 `site/package.json` 的 `scripts` 中加：

```json
"test:theme": "node --test --experimental-strip-types .vitepress/theme/mastheadDensity.test.ts"
```

- [ ] **Step 2: 跑测试，确认失败**

```powershell
cd E:\VIE\site
npm run test:theme
```

Expected: FAIL，`Cannot find module` 或 `mastheadDensity is not a function`。

- [ ] **Step 3: 最小实现**

`site/.vitepress/theme/mastheadDensity.ts`：

```ts
export type MastheadDensity = 'full' | 'mid' | 'narrow' | 'minimal'

export function normalizePath(path: string): string {
  if (!path || path === '/') return '/'
  return path.replace(/\/+$/, '') || '/'
}

export function mastheadDensity(path: string, hasDate: boolean): MastheadDensity {
  const p = normalizePath(path)
  if (p === '/stats-view') return 'minimal'
  if (p === '/') return 'full'
  if (hasDate) return 'narrow'
  if (p === '/articles' || p === '/series' || p === '/projects') return 'mid'
  if (p.startsWith('/articles/')) return 'narrow'
  return 'mid'
}
```

- [ ] **Step 4: 再跑测试**

```powershell
cd E:\VIE\site
npm run test:theme
```

Expected: 全部 PASS（约 5 tests）。

- [ ] **Step 5: Commit**

```powershell
$git = "E:\Git\Git\cmd\git.exe"
& $git add -- site/.vitepress/theme/mastheadDensity.ts site/.vitepress/theme/mastheadDensity.test.ts site/package.json
$TREE = & $git write-tree
$NEW = & $git commit-tree $TREE -p HEAD -m "feat(site): 刊头密度函数与 Node 测试"
& $git update-ref HEAD $NEW
```

---

### Task 2: Vie 字标组件

**Files:**
- Create: `site/.vitepress/theme/components/VieWordmark.vue`
- Modify: `site/.vitepress/theme/Layout.vue`（顶栏改用组件）
- Modify: `site/.vitepress/theme/custom.css`

**Interfaces:**
- Consumes: 无
- Produces: `VieWordmark` props `{ to?: string; size: 'nav' | 'mast' }`。`to` 有值时渲染 `<a>`，否则 `<span>`。

- [ ] **Step 1: 写组件**

`site/.vitepress/theme/components/VieWordmark.vue`：

```vue
<script setup lang="ts">
defineProps<{
  to?: string
  size: 'nav' | 'mast'
}>()
</script>

<template>
  <a
    v-if="to"
    class="vie-wordmark"
    :class="'vie-wordmark--' + size"
    :href="to"
    aria-label="Vie 首页"
  >
    <span class="vie-v">V</span><span class="vie-ie">ie</span>
  </a>
  <span v-else class="vie-wordmark" :class="'vie-wordmark--' + size" aria-label="Vie">
    <span class="vie-v">V</span><span class="vie-ie">ie</span>
  </span>
</template>
```

`custom.css` 已有 `.vie-wordmark--nav`。追加 mast 尺寸（若尚无）：

```css
.vie-wordmark--mast {
  font-size: clamp(2rem, 4vw, 2.75rem);
}
.vie-wordmark--mast .vie-v {
  font-size: 1.12em;
}
.vie-wordmark--mast .vie-ie {
  font-size: 0.92em;
  font-weight: 600;
}
```

删掉 `.vie-wordmark--hero` 规则（首页不再用默认 Hero 大字）。

- [ ] **Step 2: Layout 顶栏改用组件**

`Layout.vue` 增加 import，把 `#nav-bar-title-before` 换成：

```vue
<template #nav-bar-title-before>
  <VieWordmark to="/" size="nav" />
</template>
```

- [ ] **Step 3: 构建确认**

```powershell
cd E:\VIE\site
npm run build
```

Expected: `build complete`，无 error。`site/.vitepress/dist/index.html` 含 `vie-v` 与 `vie-ie`。

- [ ] **Step 4: Commit**

```powershell
$git = "E:\Git\Git\cmd\git.exe"
& $git add -- site/.vitepress/theme/components/VieWordmark.vue site/.vitepress/theme/Layout.vue site/.vitepress/theme/custom.css
$TREE = & $git write-tree
$NEW = & $git commit-tree $TREE -p HEAD -m "feat(site): 抽出 Vie 字标组件"
& $git update-ref HEAD $NEW
```

---

### Task 3: Masthead 组件 + 双栏壳

**Files:**
- Create: `site/.vitepress/theme/components/Masthead.vue`
- Modify: `site/.vitepress/theme/Layout.vue`
- Modify: `site/.vitepress/theme/custom.css`

**Interfaces:**
- Consumes: `mastheadDensity(path, hasDate)`；`useData().headers`（VitePress `Header[]`：`level`、`title`、`slug`、`children`）
- Produces: 根节点 `aside.vie-masthead`，`data-density` 为四档之一；窄档输出 `nav.vie-toc`

- [ ] **Step 1: 写 Masthead.vue**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import VieWordmark from './VieWordmark.vue'
import { mastheadDensity } from '../mastheadDensity'

const route = useRoute()
const { frontmatter, headers } = useData()

const density = computed(() =>
  mastheadDensity(route.path, Boolean(frontmatter.value.date)),
)

const tagline = '写清楚每一个技术决策'
</script>

<template>
  <aside class="vie-masthead" :data-density="density" aria-label="刊头">
    <VieWordmark v-if="density !== 'narrow'" to="/" size="mast" />
    <VieWordmark v-else to="/" size="nav" />

    <p v-if="density === 'full' || density === 'mid'" class="vie-masthead__tagline">
      {{ tagline }}
    </p>

    <p v-if="density === 'full'" class="vie-masthead__actions">
      <a class="vie-btn vie-btn--brand" href="/articles/">阅读文章</a>
      <a class="vie-btn vie-btn--alt" href="/projects">查看成果</a>
    </p>

    <nav v-if="density === 'narrow' && headers.length" class="vie-toc" aria-label="本页目录">
      <a
        v-for="h in headers"
        :key="h.slug"
        :href="'#' + h.slug"
        :class="'vie-toc__l' + h.level"
      >{{ h.title }}</a>
    </nav>
  </aside>
</template>
```

- [ ] **Step 2: Layout 注入 layout-top，并给壳加 density class**

`Layout.vue` 增加：

```ts
import Masthead from './components/Masthead.vue'
import { mastheadDensity } from './mastheadDensity'
```

`computed` 与现有 vue import 合并。增加：

```ts
const density = computed(() =>
  mastheadDensity(route.path, Boolean(frontmatter.value.date)),
)
```

模板在现有 `<Layout>` 上：

```vue
<Layout :class="'vie-density-' + density">
  <template #layout-top>
    <Masthead />
  </template>
  <!-- 保留 nav-bar-title-before 与 doc-before -->
</Layout>
```

VitePress 的 `Layout` 根节点是否接收 `class`：若 class 落不到 `.Layout` 上，改为在 `watch(density, { immediate: true })` 里给 `document.querySelector('.Layout')` 设 `vie-density-*`（先移除旧的 `vie-density-*`）。优先试 props class；构建后检查 dist HTML。失败则用 DOM class。

- [ ] **Step 3: 双栏 CSS（写入 custom.css，放在 wordmark 规则之后）**

```css
.vie-masthead {
  padding: 1.5rem 1.25rem 2rem 1.4rem;
  position: relative;
}
.vie-masthead::before {
  content: '';
  position: absolute;
  left: 0;
  top: 1.5rem;
  bottom: 1.5rem;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(
    180deg,
    var(--vie-signal) 0%,
    color-mix(in srgb, var(--vie-ember) 45%, var(--vie-signal)) 100%
  );
}
.vie-masthead__tagline {
  margin: 0.85rem 0 0;
  color: var(--vie-ink-soft);
  line-height: 1.55;
  font-size: 0.98rem;
  max-width: 14em;
}
.vie-masthead__actions {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin: 1.25rem 0 0;
}
.vie-btn {
  display: inline-block;
  text-align: center;
  text-decoration: none;
  font-weight: 600;
  border-radius: 8px;
  padding: 0.55rem 1rem;
}
.vie-btn--brand {
  background: var(--vie-signal);
  color: #fff;
}
.vie-btn--alt {
  border: 1px solid var(--vie-mist);
  color: var(--vie-ink);
}
.vie-toc {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 1rem;
}
.vie-toc a {
  color: var(--vie-ink-soft);
  text-decoration: none;
  font-size: 0.88rem;
  line-height: 1.4;
}
.vie-toc a:hover {
  color: var(--vie-signal);
}
.vie-toc__l3 {
  padding-left: 0.75rem;
}

@media (min-width: 960px) {
  .Layout {
    display: grid;
    grid-template-columns: minmax(15rem, 18rem) minmax(0, 1fr);
    grid-template-rows: auto 1fr auto;
  }
  .Layout > .VPNav,
  .Layout > .VPBackdrop {
    grid-column: 1 / -1;
  }
  .vie-masthead {
    grid-column: 1;
    grid-row: 2;
    position: sticky;
    top: var(--vp-nav-height);
    align-self: start;
    min-height: calc(100vh - var(--vp-nav-height));
    border-right: 1px solid var(--vie-mist);
    max-width: 18rem;
  }
  .Layout > .VPContent,
  .Layout > .VPFooter,
  .Layout > .VPLocalNav {
    grid-column: 2;
  }
}

@media (max-width: 959.98px) {
  .vie-masthead {
    border-bottom: 1px solid var(--vie-mist);
    min-height: 0;
  }
  .vie-masthead__actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

.vie-density-narrow .VPDoc .aside {
  display: none !important;
}
```

若 Grid 子元素选择器对不上（VitePress 用 data-v 包裹），在预览里用 DevTools 看 `.Layout` 直接子元素 class，把选择器改成实际节点（常见还有 `.VPSkipLink`）。不要把 sidebar 留在第三列。

- [ ] **Step 4: 构建 + 预览抽查**

```powershell
cd E:\VIE\site
npm run build
npm run preview -- --host 127.0.0.1 --port 5173
```

打开 `http://127.0.0.1:5173/`：桌面应看到左侧刊头（Vie + 定位 + 两按钮）和右侧内容。顶栏无搜索。

- [ ] **Step 5: Commit**

```powershell
$git = "E:\Git\Git\cmd\git.exe"
& $git add -- site/.vitepress/theme/components/Masthead.vue site/.vitepress/theme/Layout.vue site/.vitepress/theme/custom.css
$TREE = & $git write-tree
$NEW = & $git commit-tree $TREE -p HEAD -m "feat(site): 不对称刊头与双栏布局"
& $git update-ref HEAD $NEW
```

---

### Task 4: 去掉默认 Home Hero

**Files:**
- Modify: `site/index.md`

**Interfaces:**
- Consumes: 已注册的 `LatestArticles`、`HomeProjects`
- Produces: 首页为文档布局，右栏只有文章流与精选成果

- [ ] **Step 1: 重写 index.md**

```md
---
title: Vie
titleTemplate: false
aside: false
---

<LatestArticles />

<HomeProjects />
```

禁止 `layout: home`、禁止 `hero:`。

- [ ] **Step 2: 构建并确认无 Hero DOM**

```powershell
cd E:\VIE\site
npm run build
```

Expected: 成功。`site/.vitepress/dist/index.html` **不含** `VPHero`，**含** `vie-masthead` 与「最新文章」。

- [ ] **Step 3: Commit**

```powershell
$git = "E:\Git\Git\cmd\git.exe"
& $git add -- site/index.md
$TREE = & $git write-tree
$NEW = & $git commit-tree $TREE -p HEAD -m "feat(site): 首页改为刊头+文章流，移除默认 Hero"
& $git update-ref HEAD $NEW
```

---

### Task 5: 正文页眉与目录

**Files:**
- Modify: `site/.vitepress/theme/Layout.vue`
- Modify: `site/.vitepress/theme/custom.css`

**Interfaces:**
- Consumes: 现有 `wordCount` / `readingTime`（`Math.max(1, Math.ceil(n / 400))`）
- Produces: `.post-meta` 一行 `日期 · 约 N 分钟 · N 字`；有 `frontmatter.series` 时第二行仅系列名链接 `/series/<encodeURIComponent(name)>`

- [ ] **Step 1: 路由切换时重算字数**

把 `onMounted` 里的字数逻辑抽成 `recount()`，`watch(() => route.path, () => { sendTrack(); recount() })`。`recount` 在 `nextTick` 后查 `.vp-doc`。

```ts
import { nextTick } from 'vue'

function recount() {
  nextTick(() => {
    const el = document.querySelector('.vp-doc')
    if (!el) {
      wordCount.value = 0
      readingTime.value = 0
      return
    }
    const n = (el.textContent ?? '').replace(/\s/g, '').length
    wordCount.value = n
    readingTime.value = Math.max(1, Math.ceil(n / 400))
  })
}
```

`onMounted`：`sendTrack(); recount(); watch(() => route.path, () => { sendTrack(); recount() })`。

- [ ] **Step 2: 改 `#doc-before` 页眉**

```vue
<template #doc-before>
  <div v-if="frontmatter.date" class="post-meta">
    <p>
      <time>{{ frontmatter.date }}</time>
      <span v-if="readingTime"> · 约 {{ readingTime }} 分钟 · {{ wordCount }} 字</span>
    </p>
    <p v-if="frontmatter.series" class="post-meta__series">
      <a :href="'/series/' + encodeURIComponent(frontmatter.series)">{{ frontmatter.series }}</a>
    </p>
  </div>
  <SeriesNav v-if="frontmatter.series" />
</template>
```

`post-meta` 样式：mute 色、无表格边框。`.post-meta p { margin: 0 0 0.35rem; }`

- [ ] **Step 3: 打开一篇正文验收**

预览 `http://127.0.0.1:5173/articles/meta/how-this-site-works`（若 slug 不同，用 `site/articles/` 下实际路径）。

确认：左栏 density=narrow、有本页目录；右侧无 aside；页眉为日期·分钟·字；系列名可点。

- [ ] **Step 4: Commit**

```powershell
$git = "E:\Git\Git\cmd\git.exe"
& $git add -- site/.vitepress/theme/Layout.vue site/.vitepress/theme/custom.css
$TREE = & $git write-tree
$NEW = & $git commit-tree $TREE -p HEAD -m "feat(site): 正文页眉与左栏目录"
& $git update-ref HEAD $NEW
```

---

### Task 6: 空状态与 SeriesNav

**Files:**
- Modify: `site/.vitepress/theme/components/LatestArticles.vue`
- Modify: `site/.vitepress/theme/components/ArticleList.vue`
- Modify: `site/.vitepress/theme/components/SeriesNav.vue`
- Modify: `site/.vitepress/theme/custom.css`

**Interfaces:**
- Consumes: `articles.data` 的 `posts` 数组
- Produces: `posts.length === 0` 时渲染 `<p class="vie-empty">还没有文章</p>`

- [ ] **Step 1: LatestArticles 空状态**

在列表处改为：

```vue
<p v-if="latest.length === 0" class="vie-empty">还没有文章</p>
<ul v-else class="post-list">
```

- [ ] **Step 2: ArticleList 空状态**

Vue 3 不能把 `v-else` 与 `v-for` 写在同一元素。写成：

```vue
<p v-if="grouped.length === 0" class="vie-empty">还没有文章</p>
<template v-else>
  <section v-for="[category, list] in grouped" :key="category" class="article-group">
    ...
  </section>
</template>
```

`.vie-empty { color: var(--vie-mute); }` 写入 custom.css。

- [ ] **Step 3: SeriesNav 去卡片化**

替换 scoped 样式为：

```css
.series-nav {
  border: none;
  border-top: 1px solid var(--vie-mist);
  border-radius: 0;
  padding: 0.75rem 0 0;
  margin: 0 0 1.5rem;
  font-size: 0.9rem;
  color: var(--vie-ink-soft);
}
.series-nav a {
  color: var(--vie-signal);
  text-decoration: none;
}
.series-nav .next {
  float: right;
}
```

- [ ] **Step 4: 构建**

```powershell
cd E:\VIE\site
npm run build
```

Expected: 成功。

- [ ] **Step 5: Commit**

```powershell
$git = "E:\Git\Git\cmd\git.exe"
& $git add -- site/.vitepress/theme/components/LatestArticles.vue site/.vitepress/theme/components/ArticleList.vue site/.vitepress/theme/components/SeriesNav.vue site/.vitepress/theme/custom.css
$TREE = & $git write-tree
$NEW = & $git commit-tree $TREE -p HEAD -m "feat(site): 文章空状态与系列导航对齐刊头"
& $git update-ref HEAD $NEW
```

---

### Task 7: 动效、浏览器表面、验收与 DESIGN.md

**Files:**
- Modify: `site/.vitepress/theme/custom.css`
- Modify: `DESIGN.md`

**Interfaces:**
- Consumes: 已有 `.vie-masthead`、`.VPContent`
- Produces: 一次入场动画；`prefers-reduced-motion: reduce` 关闭全部 animation/transition；滚动条颜色跟 token

- [ ] **Step 1: 入场与减动效、滚动条**

在 custom.css 追加（已有 reduce 块则合并，不要写两套互相打架）：

```css
@media (prefers-reduced-motion: no-preference) {
  .vie-masthead {
    animation: vie-rise 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .VPContent {
    animation: vie-rise 600ms cubic-bezier(0.22, 1, 0.36, 1) 80ms both;
  }
}

@keyframes vie-rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

* {
  scrollbar-color: var(--vie-signal) var(--vie-paper-deep);
}
```

确认文件末尾 **只有一段** `prefers-reduced-motion: reduce`，内容为：

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
```

删掉首页旧 `.VPHero` 入场规则（Hero 已不存在）。列表 **不要** 给 `li` 加相同 `vie-rise`。

- [ ] **Step 2: 全路径构建与手工清单**

```powershell
cd E:\VIE\site
npm run test:theme
npm run build
npm run preview -- --host 127.0.0.1 --port 5173
```

逐项勾：

- `/` 左 full 刊头、右文章流；「阅读文章」→ `/articles/`；「查看成果」→ `/projects`
- `/articles/`、`/series/`、`/projects` 左 mid（无大按钮）
- 一篇正文：左 narrow + TOC；无右侧 outline
- `/stats-view` 左 minimal（仅 Vie）
- 视口宽度小于 960px：刊头在内容上方，无横向溢出
- 顶栏无搜索
- Tab 可见 `:focus-visible`
- 构建产物无 `VPHero`

- [ ] **Step 3: 跑 Impeccable 检测器**

```powershell
cd E:\VIE
node "C:\Users\V\.agents\skills\impeccable\scripts\detect.mjs" --json site/.vitepress/theme/custom.css site/.vitepress/theme/components/Masthead.vue site/.vitepress/theme/Layout.vue site/index.md
```

按输出修明显违规后再进入下一步。不要为检测器去加网格或渐变字。

- [ ] **Step 4: 按实装重写 DESIGN.md**

保留 `<!-- impeccable:design-schema 1 -->`。Direction 改为不对称刊头。Layout 节写明四档密度与 ≥960px 双栏。Motion 节写 `vie-rise` 一次、减动效。删除「VitePress hero」描述。

- [ ] **Step 5: Commit**

```powershell
$git = "E:\Git\Git\cmd\git.exe"
& $git add -- site/.vitepress/theme/custom.css DESIGN.md
$TREE = & $git write-tree
$NEW = & $git commit-tree $TREE -p HEAD -m "feat(site): 刊头动效并按实装更新 DESIGN.md"
& $git update-ref HEAD $NEW
```

---

## Spec coverage

| Spec 节 | 任务 |
|---|---|
| 字标 HTML / token | 2, 3 |
| 四档密度表 | 1, 3 |
| 停用 home Hero | 4 |
| 双栏 + sticky + 960 断点 | 3 |
| 首页文章流 / featured | 已有组件 + 4；空状态 6 |
| 隐藏 `.VPDoc .aside` | 3 |
| 正文页眉日期·分钟·字 | 5 |
| 动效 / reduced-motion | 7 |
| 不改 URL/API/搜索 | 全局约束 |
| 构建与页面验收 | 3–7 |
| DESIGN.md 验收后更新 | 7 |
