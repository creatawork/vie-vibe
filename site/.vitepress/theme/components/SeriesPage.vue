<script setup lang="ts">
import type { Post } from '../../../.vitepress/posts'
import VieShell from './VieShell.vue'

defineProps<{ name: string; posts: Post[] }>()
</script>

<template>
  <VieShell :path="`series/${name}`" hint="ordered">
    <section class="vie-panel">
      <h1 class="vie-series-title">{{ name }}</h1>
      <p class="vie-code-comment">{{ posts.length }} 篇文章，按实现顺序串起完整上下文。</p>
      <ol class="vie-feed vie-feed--ordered">
        <li v-for="(post, i) in posts" :key="post.url">
          <span class="vie-ln vie-mono">{{ String(i + 1).padStart(2, '0') }}</span>
          <a :href="post.url">{{ post.title }}</a>
          <span v-if="post.description" class="vie-feed-desc">{{ post.description }}</span>
          <span class="vie-feed-meta vie-mono">
            {{ post.date.slice(0, 10) }} · ~{{ post.readingTime }}min
          </span>
        </li>
      </ol>
    </section>
  </VieShell>
</template>
