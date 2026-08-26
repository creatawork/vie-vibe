<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from '../../../articles.data'
import { data as projects } from '../../../projects.data'
import { data as seriesGroups } from '../../../series.data'

const tree = computed(() => {
  const cats = [...new Set(posts.map((p) => p.category))].sort()
  return cats.map((c) => {
    const n = posts.filter((p) => p.category === c).length
    return { name: c, count: n }
  })
})

const stack = ['VitePress', 'Vue 3', 'SpringBoot', 'Docker', 'TS']
</script>

<template>
  <div class="vie-ambient" aria-hidden="true">
    <aside class="vie-ambient__rail vie-ambient__left vie-mono">
      <p class="vie-ambient__label">~/vie-vibe</p>
      <p>├── <span class="vie-syntax-fn">articles/</span></p>
      <p v-for="t in tree" :key="t.name">
        │&nbsp;&nbsp;├── {{ t.name }}/ <span class="vie-ambient__dim">({{ t.count }})</span>
      </p>
      <p>├── <span class="vie-syntax-fn">projects/</span> <span class="vie-ambient__dim">({{ projects.length }})</span></p>
      <p>├── <span class="vie-syntax-fn">series/</span> <span class="vie-ambient__dim">({{ seriesGroups.length }})</span></p>
      <p>└── <span class="vie-syntax-comment">README</span></p>
    </aside>
    <aside class="vie-ambient__rail vie-ambient__right vie-mono">
      <p class="vie-ambient__label">// stack</p>
      <p v-for="s in stack" :key="s"><span class="vie-syntax-kw">use</span> {{ s }}</p>
      <p class="vie-ambient__spacer" />
      <p class="vie-ambient__label">// vibe</p>
      <p><span class="vie-syntax-str">"full-stack"</span></p>
      <p><span class="vie-syntax-str">"vibe-coding"</span></p>
    </aside>
  </div>
</template>
