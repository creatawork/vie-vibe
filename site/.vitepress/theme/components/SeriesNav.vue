<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as groups } from '../../../series.data'

const { page, frontmatter } = useData()

const nav = computed(() => {
  const name = frontmatter.value.series
  if (!name) return null
  const group = groups.find((g) => g.name === name)
  if (!group) return null
  const current = '/' + page.value.relativePath.replace(/\.md$/, '')
  const idx = group.posts.findIndex((p) => p.url === current)
  if (idx === -1) return null
  return {
    name,
    index: idx + 1,
    total: group.posts.length,
    prev: idx > 0 ? group.posts[idx - 1] : null,
    next: idx < group.posts.length - 1 ? group.posts[idx + 1] : null,
  }
})
</script>

<template>
  <nav v-if="nav" class="vie-series-nav" :aria-label="`${nav.name} 系列导航`">
    <p class="vie-series-nav__meta">
      <span>第 {{ nav.index }} / {{ nav.total }} 篇</span>
      <a :href="`/series/${encodeURIComponent(nav.name)}`">{{ nav.name }}</a>
    </p>
    <div v-if="nav.prev || nav.next" class="vie-series-nav__links">
      <a
        v-if="nav.prev"
        class="vie-series-nav__link"
        :href="nav.prev.url"
        rel="prev"
      >
        <span class="vie-series-nav__direction">← 上一篇</span>
        <strong>{{ nav.prev.title }}</strong>
      </a>
      <a
        v-if="nav.next"
        class="vie-series-nav__link vie-series-nav__link--next"
        :href="nav.next.url"
        rel="next"
      >
        <span class="vie-series-nav__direction">下一篇 →</span>
        <strong>{{ nav.next.title }}</strong>
      </a>
    </div>
  </nav>
</template>
