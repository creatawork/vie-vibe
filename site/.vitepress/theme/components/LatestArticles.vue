<script setup lang="ts">
import { data as posts } from '../../../articles.data'

const latest = posts.slice(0, 5)
</script>

<template>
  <section class="home-section" aria-labelledby="latest-heading">
    <div class="section-head">
      <h2 id="latest-heading">最新文章</h2>
      <a class="home-more" href="/articles/">全部文章 →</a>
    </div>
    <p v-if="latest.length === 0" class="vie-empty">还没有文章</p>
    <ul v-else class="post-list">
      <li v-for="post in latest" :key="post.url">
        <a :href="post.url">{{ post.title }}</a>
        <span class="meta">{{ post.date }} · 约 {{ post.readingTime }} 分钟</span>
      </li>
    </ul>
  </section>
</template>
