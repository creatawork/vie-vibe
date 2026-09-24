<script setup lang="ts">
import { computed } from 'vue'
import { Flag, GitBranch, Sparkles, Wrench } from '@lucide/vue'
import { data as projects } from '../../../projects.data'
import VieShell from './VieShell.vue'

const props = defineProps<{ slug: string }>()

const typeIcon = {
  milestone: Flag,
  feature: Sparkles,
  fix: Wrench,
  decision: GitBranch,
} as const

const statusLabel = { building: '开发中', live: '已上线' } as const

const project = computed(() => projects.find((p) => p.slug === props.slug))
const entries = computed(() => project.value?.log ?? [])
</script>

<template>
  <VieShell path="projects/" hint="log">
    <p v-if="!project" class="vie-empty vie-mono">// project not found</p>
    <div v-else class="vie-project-detail">
      <p class="vie-detail-crumb vie-mono">
        <a href="/projects">projects/</a>
        <span aria-hidden="true">/</span>
        <span>{{ project.slug }}</span>
      </p>
      <div class="vie-detail-title">
        <h2>{{ project.name }}</h2>
        <span class="vie-badge">{{ statusLabel[project.status] }}</span>
      </div>
      <p class="vie-detail-desc">{{ project.description }}</p>
      <div class="vie-chip-row">
        <span v-for="t in project.tags" :key="t" class="vie-chip vie-chip--accent">{{ t }}</span>
      </div>
      <div v-if="project.github || project.demo" class="vie-link-row vie-mono">
        <a v-if="project.github" :href="project.github" target="_blank" rel="noopener">gh</a>
        <a v-if="project.demo" :href="project.demo" target="_blank" rel="noopener">demo</a>
      </div>

      <section class="vie-timeline" aria-label="开发日志">
        <ol v-if="entries.length" class="vie-timeline-list" role="list">
          <li
            v-for="(e, i) in entries"
            :key="e.date + '-' + i"
            class="vie-timeline-item"
          >
            <span class="vie-timeline-node" aria-hidden="true">
              <component :is="typeIcon[e.type]" :size="14" />
            </span>
            <div class="vie-timeline-card">
              <div class="vie-timeline-meta">
                <time :datetime="e.date" class="vie-mono">{{ e.date }}</time>
                <span class="vie-ln vie-mono" aria-hidden="true">{{
                  String(entries.length - i).padStart(2, '0')
                }}</span>
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
        <p v-else class="vie-empty vie-mono">// log empty — 开发继续，记录待补</p>
      </section>
    </div>
  </VieShell>
</template>
