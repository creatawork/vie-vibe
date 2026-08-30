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

const allPosts = computed(() => posts)
</script>

<template>
  <VieShell path="articles/" hint="read">
    <p v-if="grouped.length === 0" class="vie-empty vie-mono">// no posts yet</p>
    <div v-else class="vie-article-index">
      <aside class="vie-category-panel">
        <a
          v-for="[category, list] in grouped"
          :key="category"
          :href="`#${category}`"
          class="vie-category-item"
        >
          <span>{{ category }}</span>
          <b>{{ list.length }}</b>
        </a>
      </aside>

      <section class="vie-article-stack" aria-label="文章列表">
        <article
          v-for="(post, i) in allPosts"
          :id="post.category"
          :key="post.url"
          class="vie-list-card"
        >
          <a class="vie-list-thumb" :class="'tone-' + post.category" :href="post.url">
            <strong>{{ post.category }}</strong>
          </a>
          <div class="vie-list-card__body">
            <a :href="post.url">
              <h2>{{ post.title }}</h2>
            </a>
            <p>{{ post.description }}</p>
            <div class="vie-card-meta">
              <span v-for="tag in post.tags.slice(0, 2)" :key="tag">{{ tag }}</span>
              <time>{{ post.date.slice(0, 10) }}</time>
              <small>~{{ post.readingTime }}min</small>
            </div>
          </div>
          <span class="vie-list-eye vie-mono" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
        </article>
      </section>
    </div>
  </VieShell>
</template>
