<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { data as posts } from '../../../articles.data'
import VieShell from './VieShell.vue'

const CATEGORY_LABELS: Record<string, string> = {
  backend: '后端开发',
  frontend: '前端',
  devops: '部署运维',
  ai: 'AI 工程',
  meta: '建站',
  notes: '笔记',
}

// Categories ordered by their most recent post, so the chip bar reads
// "what's actively written" from left to right, matching the featured card.
const groups = computed(() => {
  const map = new Map<string, typeof posts>()
  for (const post of posts) {
    map.set(post.category, [...(map.get(post.category) ?? []), post])
  }
  return [...map.entries()]
    .map(([slug, list]) => ({
      slug,
      label: CATEGORY_LABELS[slug] ?? slug,
      count: list.length,
      latest: list[0]?.date ?? '',
    }))
    .sort((a, b) => +new Date(b.latest) - +new Date(a.latest))
})

const active = ref('')

const filtered = computed(() =>
  active.value ? posts.filter((post) => post.category === active.value) : posts,
)

const activeGroup = computed(() => groups.value.find((g) => g.slug === active.value))

// The newest post leads the 全部 view as a full-width feature.
function isFeatured(index: number) {
  return !active.value && index === 0
}

function labelOf(slug: string) {
  return CATEGORY_LABELS[slug] ?? slug
}

// Footer / home category anchors (/articles/#ai) land pre-filtered.
function applyHash() {
  const slug = decodeURIComponent(window.location.hash.slice(1))
  if (groups.value.some((g) => g.slug === slug)) active.value = slug
}

function select(slug: string) {
  active.value = active.value === slug ? '' : slug
  const hash = active.value ? `#${active.value}` : ''
  window.history.replaceState(null, '', `${window.location.pathname}${hash}`)
}

function shortDate(date: string) {
  return date.slice(5, 10)
}

onMounted(() => {
  applyHash()
  window.addEventListener('hashchange', applyHash)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', applyHash)
})
</script>

<template>
  <VieShell path="articles/" hint="read">
    <p v-if="groups.length === 0" class="vie-empty vie-mono">// no posts yet</p>
    <div v-else class="hub-index">
      <div class="hub-toolbar">
        <p class="hub-toolbar__stats vie-mono">共 {{ posts.length }} 篇 · {{ groups.length }} 个分类 · 更新于 {{ shortDate(posts[0].date) }}</p>
        <a class="hub-toolbar__rss vie-mono" href="/feed.xml">RSS 订阅 ↗</a>
      </div>

      <nav class="hub-filter" aria-label="按分类筛选文章">
        <button
          class="hub-chip"
          type="button"
          :aria-pressed="active === ''"
          @click="select('')"
        >
          全部
          <b class="hub-chip__count vie-mono">{{ posts.length }}</b>
        </button>
        <button
          v-for="g in groups"
          :key="g.slug"
          class="hub-chip"
          :class="'tone-' + g.slug"
          type="button"
          :aria-pressed="active === g.slug"
          @click="select(g.slug)"
        >
          <i class="hub-chip__dot" aria-hidden="true"></i>
          {{ g.label }}
          <b class="hub-chip__count vie-mono">{{ g.count }}</b>
        </button>
      </nav>

      <!-- Keyed remount on filter change re-runs the cards' stagger rise. -->
      <div v-if="filtered.length > 0" :key="active || 'all'" class="hub-view">
        <header
          v-if="activeGroup"
          class="hub-cathead"
          :class="'tone-' + activeGroup.slug"
        >
          <i class="hub-cathead__dot" aria-hidden="true"></i>
          <h2 class="hub-cathead__label">{{ activeGroup.label }}</h2>
          <b class="hub-cathead__sub vie-mono">{{ activeGroup.count }} 篇 · 最近 {{ shortDate(activeGroup.latest) }}</b>
        </header>
        <h2 v-else class="hub-sr">全部文章</h2>

        <div class="hub-grid">
          <article
            v-for="(post, i) in filtered"
            :key="post.url"
            class="hub-card"
            :class="['tone-' + post.category, { 'hub-card--featured': isFeatured(i) }]"
            :style="{ '--i': i }"
          >
            <a class="hub-card__link" :href="post.url">
              <div class="hub-card__top">
                <span class="hub-card__cat">{{ labelOf(post.category) }}</span>
                <time class="hub-card__date vie-mono" :datetime="post.date.slice(0, 10)">{{ shortDate(post.date) }}</time>
              </div>
              <h3 class="hub-card__title">{{ post.title }}</h3>
              <p v-if="post.description" class="hub-card__desc">{{ post.description }}</p>
              <p class="hub-card__meta vie-mono">
                <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="hub-card__tag"># {{ tag }}</span>
                <span class="hub-card__len">约 {{ post.readingTime }} 分钟</span>
                <span class="hub-card__arrow" aria-hidden="true">→</span>
              </p>
            </a>
          </article>
        </div>
      </div>
      <p v-else class="vie-empty vie-mono">// 该分类下暂无文章</p>
    </div>
  </VieShell>
</template>
