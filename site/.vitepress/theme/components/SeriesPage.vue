<script setup lang="ts">
import { computed } from 'vue'
import type { Post } from '../../../.vitepress/posts'
import VieShell from './VieShell.vue'

const props = defineProps<{ name: string; posts: Post[] }>()
const totalMinutes = computed(() => props.posts.reduce((total, post) => total + post.readingTime, 0))
</script>

<template>
  <VieShell :path="`series/${name}`" hint="ordered">
    <section class="series-detail" aria-labelledby="series-detail-title">
      <a class="series-detail__back" href="/series/"><span aria-hidden="true">←</span> 所有系列</a>
      <header class="series-detail__header">
        <h2 id="series-detail-title">{{ name }}</h2>
        <p>{{ posts.length }} 篇文章 · 约 {{ totalMinutes }} 分钟，按实现顺序串起完整上下文。</p>
      </header>
      <ol class="series-chapters" role="list" aria-label="按顺序阅读系列文章">
        <li v-for="(post, i) in posts" :key="post.url">
          <a class="series-chapter" :href="post.url">
            <span class="series-chapter__number" aria-hidden="true">{{ i + 1 }}</span>
            <div class="series-chapter__body">
              <h3>{{ post.title }}</h3>
              <p v-if="post.description" class="series-chapter__desc">{{ post.description }}</p>
              <p class="series-chapter__meta"><time :datetime="post.date.slice(0, 10)">{{ post.date.slice(0, 10) }}</time><span>约 {{ post.readingTime }} 分钟</span></p>
            </div>
            <span class="series-chapter__arrow" aria-hidden="true">→</span>
          </a>
        </li>
      </ol>
    </section>
  </VieShell>
</template>
