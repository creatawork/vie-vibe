<script setup lang="ts">
import type { Post } from '../../../.vitepress/posts'

defineProps<{ name: string; posts: Post[] }>()
</script>

<template>
  <h1>{{ name }}</h1>
  <ol class="post-list">
    <li v-for="post in posts" :key="post.url">
      <a :href="post.url">{{ post.title }}</a>
      <span class="meta">{{ post.date }} · 约 {{ post.readingTime }} 分钟</span>
      <p v-if="post.description">{{ post.description }}</p>
    </li>
  </ol>
</template>
