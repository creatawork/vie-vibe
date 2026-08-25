<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData, useRoute } from 'vitepress'
import { onMounted, ref, watch } from 'vue'
import SeriesNav from './components/SeriesNav.vue'
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
  <Layout>
    <template #doc-before>
      <div v-if="frontmatter.date" class="post-meta">
        <time>{{ frontmatter.date }}</time>
        <span v-if="readingTime"> · 约 {{ readingTime }} 分钟（{{ wordCount }} 字）</span>
      </div>
      <SeriesNav v-if="frontmatter.series" />
    </template>
  </Layout>
</template>
