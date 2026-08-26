<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData, useRoute } from 'vitepress'
import { onMounted, ref, watch } from 'vue'
import SeriesNav from './components/SeriesNav.vue'
import VieWordmark from './components/VieWordmark.vue'
import { sendTrack } from './track'

const { Layout } = DefaultTheme
const { frontmatter } = useData()
const route = useRoute()

const wordCount = ref(0)
const readingTime = ref(0)

onMounted(() => {
  sendTrack()
  watch(() => route.path, () => sendTrack())

  const el = document.querySelector('.vp-doc')
  if (!el) return
  const n = (el.textContent ?? '').replace(/\s/g, '').length
  wordCount.value = n
  readingTime.value = Math.max(1, Math.ceil(n / 400))
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
  <Layout>
        <template #nav-bar-title-before>
      <VieWordmark to="/" size="nav" />
    </template>

    <template #doc-before>
      <div v-if="frontmatter.date" class="post-meta">
        <time>{{ frontmatter.date }}</time>
        <span v-if="readingTime"> · 约 {{ readingTime }} 分钟（{{ wordCount }} 字）</span>
      </div>
      <SeriesNav v-if="frontmatter.series" />
    </template>
  </Layout>
</template>
