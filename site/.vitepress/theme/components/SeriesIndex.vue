<script setup lang="ts">
import { data as groups } from '../../../series.data'
import VieShell from './VieShell.vue'

function totalMinutes(posts: typeof groups[number]['posts']) {
  return posts.reduce((total, post) => total + post.readingTime, 0)
}

function latestDate(posts: typeof groups[number]['posts']) {
  return posts.map((post) => post.date.slice(0, 10)).sort().at(-1) ?? ''
}
</script>

<template>
  <VieShell path="series/" hint="collections">
    <p v-if="groups.length === 0" class="vie-empty">还没有系列文章，先到 <a href="/articles/">文章列表</a> 看看。</p>
    <section v-else class="series-index" aria-labelledby="series-index-title">
      <header class="series-index__header">
        <h2 id="series-index-title">按专题，连续阅读</h2>
        <p>{{ groups.length }} 个系列，从问题出发，走到实现。</p>
      </header>
      <ul class="series-collections">
        <li v-for="g in groups" :key="g.name">
          <a class="series-collection" :href="`/series/${encodeURIComponent(g.name)}`">
            <div class="series-collection__meta">
              <span>{{ g.posts.length }} 篇文章 · 约 {{ totalMinutes(g.posts) }} 分钟</span>
              <span aria-hidden="true">↗</span>
            </div>
            <h3>{{ g.name }}</h3>
            <p class="series-collection__desc">{{ g.posts[0]?.description || '沿着每一篇的实现顺序，了解这个主题的完整上下文。' }}</p>
            <div class="series-collection__footer">
              <span>更新于 <time :datetime="latestDate(g.posts)">{{ latestDate(g.posts) }}</time></span>
              <span class="series-collection__action">阅读系列 <span aria-hidden="true">→</span></span>
            </div>
          </a>
        </li>
      </ul>
    </section>
  </VieShell>
</template>
