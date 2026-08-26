<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData, useRoute } from 'vitepress'
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import SeriesNav from './components/SeriesNav.vue'
import VieWordmark from './components/VieWordmark.vue'
import VieAmbient from './components/VieAmbient.vue'
import { sendTrack } from './track'

const { Layout } = DefaultTheme
const { frontmatter } = useData()
const route = useRoute()

const isHome = computed(() => route.path === '/' || route.path === '/index.html')

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
    <VieAmbient />
    <Layout :class="['vie-vibe', isHome && 'vie-page-home']">
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
  </div>
</template>
