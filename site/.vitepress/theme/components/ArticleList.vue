<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from '../../../articles.data'

const grouped = computed(() => {
  const map = new Map<string, typeof posts>()
  for (const post of posts) {
    map.set(post.category, [...(map.get(post.category) ?? []), post])
  }
  return [...map.entries()]
})
</script>

<template>
  <p v-if="grouped.length === 0" class="vie-empty">还没有文章</p>
  <template v-else>
    <section v-for="[category, list] in grouped" :key="category" class="article-group">
      <h2>{{ category }}</h2>
      <ul class="post-list">
        <li v-for="post in list" :key="post.url">
          <a :href="post.url">{{ post.title }}</a>
          <span class="meta">{{ post.date }} · 约 {{ post.readingTime }} 分钟</span>
          <p v-if="post.description">{{ post.description }}</p>
        </li>
      </ul>
    </section>
  </template>
</template>

<style scoped>
.article-group {
  margin-bottom: 2.5rem;
}
.article-group h2 {
  font-family: var(--vie-font-display, inherit);
  font-size: 1.25rem;
  letter-spacing: -0.02em;
  margin: 0 0 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--vie-mist, var(--vp-c-divider));
}
</style>
