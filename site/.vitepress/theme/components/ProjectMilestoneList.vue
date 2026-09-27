<script setup lang="ts">
import { Flag, GitBranch, Sparkles, Wrench } from '@lucide/vue'
import type { ProjectLogEntry } from '../../../projects.source'
import { logAnchorId, logNo } from './logAnchor'

defineProps<{ entries: ProjectLogEntry[] }>()

const typeIcon = {
  milestone: Flag,
  feature: Sparkles,
  fix: Wrench,
  decision: GitBranch,
} as const
</script>

<template>
  <ol class="vie-timeline-list" role="list">
    <li
      v-for="(e, i) in entries"
      :id="logAnchorId(entries.length, i)"
      :key="e.date + '-' + i"
      class="vie-timeline-item"
    >
      <span class="vie-timeline-node" aria-hidden="true">
        <component :is="typeIcon[e.type]" :size="14" />
      </span>
      <div class="vie-timeline-card">
        <div class="vie-timeline-meta">
          <time :datetime="e.date" class="vie-mono">{{ e.date }}</time>
          <span class="vie-ln vie-mono" aria-hidden="true">{{ logNo(entries.length, i) }}</span>
        </div>
        <h3>{{ e.title }}</h3>
        <p v-if="e.detail" class="vie-timeline-desc">{{ e.detail }}</p>
        <img
          v-if="e.image"
          :src="e.image"
          alt=""
          class="vie-timeline-img"
          loading="lazy"
          decoding="async"
        />
        <div class="vie-chip-row">
          <span v-for="t in e.tech" :key="t" class="vie-chip">{{ t }}</span>
        </div>
        <p v-if="e.article || e.link" class="vie-timeline-links vie-mono">
          <a v-if="e.article" :href="e.article">深度文章 →</a>
          <a v-if="e.link" :href="e.link" target="_blank" rel="noopener">来源 →</a>
        </p>
      </div>
    </li>
  </ol>
</template>
