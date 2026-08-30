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
  <nav v-if="nav" class="vie-series-nav" aria-label="系列导航">
    <p class="vie-series-nav__meta vie-mono">
      part {{ nav.index }} of {{ nav.total }} ·
      <a :href="`/series/${encodeURIComponent(nav.name)}`">{{ nav.name }}</a>
    </p>
    <div class="vie-series-nav__links">
      <a
        v-if="nav.prev"
        class="vie-series-nav__link"
        :href="nav.prev.url"
      >
        <span class="vie-mono vie-syntax-fn">←</span>
        {{ nav.prev.title }}
      </a>
      <span v-else class="vie-series-nav__ghost vie-mono">← start</span>
      <a
        v-if="nav.next"
        class="vie-series-nav__link vie-series-nav__link--next"
        :href="nav.next.url"
      >
        {{ nav.next.title }}
        <span class="vie-mono vie-syntax-fn">→</span>
      </a>
      <span v-else class="vie-series-nav__ghost vie-mono">end →</span>
    </div>
  </nav>
</template>
