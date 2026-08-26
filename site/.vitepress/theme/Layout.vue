<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData, useRoute } from 'vitepress'
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import Masthead from './components/Masthead.vue'
import SeriesNav from './components/SeriesNav.vue'
import VieWordmark from './components/VieWordmark.vue'
import { mastheadDensity } from './mastheadDensity'
import { sendTrack } from './track'

const { Layout } = DefaultTheme
const { frontmatter } = useData()
const route = useRoute()

const density = computed(() =>
  mastheadDensity(route.path, Boolean(frontmatter.value.date)),
)

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
  <!--
    Vie visual contract
    THESIS: Real website first; personality from Vie wordmark (V / ie) and cool paper.
    OWN-WORLD: paper #F3F5F7 · ink #12161C · signal #1F4E79 · ember #C45C26 · Sora + Noto Sans SC
    STORY: Land → read Vie thesis → open articles or projects.
    FIRST VIEWPORT: nav · oversized Vie · line · two CTAs · lists below.
    FORM: web-native cold journal; seed e10150f3
    FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
  -->
  <Layout :class="'vie-density-' + density">
    <template #layout-top>
      <Masthead />
    </template>

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
  </Layout>
</template>