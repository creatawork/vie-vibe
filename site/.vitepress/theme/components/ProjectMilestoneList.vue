<script setup lang="ts">
import { Flag, GitBranch, Sparkles, Wrench } from '@lucide/vue'
import { computed } from 'vue'
import type { LogEntryType, ProjectLogEntry } from '../../../projects.source'
import { logAnchorId } from './logAnchor'

const props = defineProps<{ entries: ProjectLogEntry[] }>()
const filter = defineModel<LogEntryType | 'all'>('filter', { default: 'all' })

const typeLabel = { milestone: '里程碑', feature: '新功能', fix: '修复', decision: '技术决策' } as const
const filters = computed(() => [
  { value: 'all' as const, label: '全部', count: props.entries.length },
  ...(['feature', 'fix', 'milestone', 'decision'] as const).map((value) => ({
    value, label: typeLabel[value], count: props.entries.filter((e) => e.type === value).length,
  })).filter((item) => item.count > 0),
])
const visibleCount = computed(() => props.entries.filter((e) => filter.value === 'all' || e.type === filter.value).length)

const typeIcon = {
  milestone: Flag,
  feature: Sparkles,
  fix: Wrench,
  decision: GitBranch,
} as const
</script>

<template>
  <div class="vie-log-controls" role="group" aria-label="按日志类型筛选">
    <button
      v-for="item in filters"
      :key="item.value"
      type="button"
      :aria-pressed="filter === item.value"
      @click="filter = item.value"
    >
      {{ item.label }}<span>{{ item.count }}</span>
    </button>
  </div>
  <p class="vie-log-results" role="status" aria-live="polite">共 {{ visibleCount }} 篇记录<span>按时间倒序</span></p>
  <ol class="vie-timeline-list" role="list">
    <li
      v-for="(e, i) in entries"
      v-show="filter === 'all' || filter === e.type"
      :id="logAnchorId(entries.length, i)"
      :key="e.date + '-' + i"
      class="vie-timeline-item"
    >
      <div class="vie-timeline-meta">
        <time :datetime="e.date">{{ e.date }}</time>
        <span class="vie-timeline-type">
          <component :is="typeIcon[e.type]" :size="14" aria-hidden="true" />
          {{ typeLabel[e.type] }}
        </span>
      </div>
      <div class="vie-timeline-card">
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
        <p v-if="e.article || e.link" class="vie-timeline-links">
          <a v-if="e.article" :href="e.article">阅读深度文章 ↗</a>
          <a v-if="e.link" :href="e.link" target="_blank" rel="noopener">查看来源 ↗</a>
        </p>
      </div>
    </li>
  </ol>
</template>
