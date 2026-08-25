<script setup lang="ts">
import { data as posts } from '../../../articles.data'

const latest = posts.slice(0, 5)
</script>

<template>
  <div class="home-section">
    <h2>最新文章</h2>
    <ul class="post-list">
      <li v-for="post in latest" :key="post.url">
        <a :href="post.url">{{ post.title }}</a>
        <span class="meta">{{ post.date }} · 约 {{ post.readingTime }} 分钟</span>
      </li>
    </ul>
    <p><a href="/articles/">全部文章 →</a></p>
  </div>
</template>

<style scoped>
.home-section {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px 3rem;
}
</style>
