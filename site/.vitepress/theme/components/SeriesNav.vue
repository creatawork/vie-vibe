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
    prev: idx > 0 ? group.posts[idx - 1] : null,
    next: idx < group.posts.length - 1 ? group.posts[idx + 1] : null,
  }
})
</script>

<template>
  <div v-if="nav" class="series-nav">
    <p>
      本文属于系列
      <a :href="`/series/${encodeURIComponent(nav.name)}`">《{{ nav.name }}》</a>
    </p>
    <p>
      <a v-if="nav.prev" :href="nav.prev.url">← {{ nav.prev.title }}</a>
      <a v-if="nav.next" :href="nav.next.url" class="next">{{ nav.next.title }} →</a>
    </p>
  </div>
</template>

<style scoped>
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
</style>