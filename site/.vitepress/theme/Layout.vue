<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData, useRoute } from 'vitepress'
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import SeriesNav from './components/SeriesNav.vue'
import VieWordmark from './components/VieWordmark.vue'
import { sendTrack } from './track'

const { Layout } = DefaultTheme
const { frontmatter } = useData()
const route = useRoute()

const isHome = computed(() => route.path === '/' || route.path === '/index.html')
const isHub = computed(() => route.path === '/articles/' || route.path === '/projects' || route.path === '/tools' || route.path.startsWith('/tools/'))

const wordCount = ref(0)
const readingTime = ref(0)

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

onMounted(() => {
  sendTrack()
  recount()
  watch(() => route.path, () => {
    sendTrack()
    recount()
  })
})
</script>

<template>
  <div class="vie-app">
    <!--
      VIE visual contract (code-led)
      THESIS: Vie becomes a bright DevNotes-style technical notebook, refusing the old dark terminal canvas.
      OWN-WORLD: warm white app shell, mint green primary actions, soft cyan/blue/orange icon wells, airy cards, rounded 10-14px surfaces, Inter/Noto Sans SC with small mono details.
      STORY: Interviewers land, identify Vie, scan proof through latest articles, projects, tools, and open the route that answers their question.
      FIRST VIEWPORT: sticky rounded nav, left greeting and CTAs, right isometric coding desk, four metric cards just below the hero.
      FORM: user-pinned reference image, rebuilt as a multi-surface portfolio notebook; seed image-reference-20260830.
      FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
    -->
    <Layout :class="['vie-vibe', isHome && 'vie-page-home', isHub && 'vie-page-hub']">
    <template #nav-bar-title-before>
      <VieWordmark to="/" size="nav" />
    </template>

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
    <template #layout-bottom>
      <footer v-if="!isHome && !isHub" class="vie-site-footer">
        <div class="vie-footer-inner">
          <div class="vie-footer-brand">
            <VieWordmark to="/" size="nav" />
            <p>记录技术、分享经验、创造价值</p>
            <small>© 2026 Vie. All rights reserved.</small>
          </div>
          <nav aria-label="底部导航">
            <strong>导航</strong>
            <a href="/">首页</a>
            <a href="/articles/">文章</a>
            <a href="/projects">项目</a>
            <a href="/series/">系列</a>
          </nav>
          <nav aria-label="分类">
            <strong>分类</strong>
            <a href="/articles/">后端开发</a>
            <a href="/articles/">系统设计</a>
            <a href="/articles/">实践篇</a>
            <a href="/articles/">工具分享</a>
          </nav>
          <nav aria-label="联系">
            <strong>联系</strong>
            <a href="https://github.com/creatawork" target="_blank" rel="noopener">GitHub</a>
            <a href="/articles/meta/how-this-site-works">站点说明</a>
          </nav>
        </div>
        <a class="vie-back-top" href="#" aria-label="回到顶部">↑</a>
      </footer>
    </template>
  </Layout>
  </div>
</template>
