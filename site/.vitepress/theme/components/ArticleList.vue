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
  <section v-for="[category, list] in grouped" :key="category">
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
