<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from '../../../articles.data'
import VieShell from './VieShell.vue'

const grouped = computed(() => {
  const map = new Map<string, typeof posts>()
  for (const post of posts) {
    map.set(post.category, [...(map.get(post.category) ?? []), post])
  }
  return [...map.entries()]
})
</script>

<template>
  <VieShell path="articles/" hint="read">
    <p v-if="grouped.length === 0" class="vie-empty vie-mono">// no posts yet</p>
    <section
      v-for="[category, list] in grouped"
      :key="category"
      class="vie-panel"
    >
      <div class="vie-tile-tab vie-mono">articles/{{ category }}/</div>
      <ul class="vie-feed">
        <li v-for="(post, i) in list" :key="post.url">
          <span class="vie-ln vie-mono">{{ String(i + 1).padStart(2, '0') }}</span>
          <a :href="post.url">{{ post.title }}</a>
          <span v-if="post.description" class="vie-feed-desc">{{ post.description }}</span>
          <span class="vie-feed-meta vie-mono">
            {{ post.date.slice(0, 10) }} · ~{{ post.readingTime }}min
          </span>
        </li>
      </ul>
    </section>
  </VieShell>
</template>
