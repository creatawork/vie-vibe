<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '../../../projects.source'
import ProjectStatus from './ProjectStatus.vue'

const props = withDefaults(
  defineProps<{
    project: Project
    titleTag?: 'h2' | 'h3'
    compact?: boolean
    showSummary?: boolean
    showTech?: boolean
  }>(),
  { titleTag: 'h2', compact: false, showSummary: true, showTech: false },
)

const detailHref = computed(() =>
  props.project.slug ? `/projects/${props.project.slug}` : '/projects',
)
</script>

<template>
  <article class="vie-spotlight" :class="{ 'vie-spotlight--compact': compact }">
    <component :is="titleTag" class="vie-spotlight__name">{{ project.name }}</component>
    <ProjectStatus :status="project.status" />
    <p class="vie-spotlight__prop">{{ project.proposition }}</p>
    <p v-if="showSummary" class="vie-spotlight__summary">{{ project.description }}</p>
    <ul v-if="showTech" class="vie-project-tech" aria-label="技术栈">
      <li v-for="tag in project.tags.slice(0, compact ? 4 : 5)" :key="tag">{{ tag }}</li>
    </ul>
    <slot />
    <div class="vie-spotlight__actions">
      <a
        class="vie-cta vie-cta--primary"
        :href="detailHref"
        :aria-label="`查看 ${project.name} 项目案例`"
      >查看项目案例</a>
      <a
        v-if="project.demo"
        class="vie-cta vie-cta--ghost"
        :href="project.demo"
        :aria-label="`访问 ${project.name} 线上环境（新窗口打开）`"
        target="_blank"
        rel="noopener noreferrer"
      >线上体验 ↗</a>
      <slot name="secondary" />
    </div>
  </article>
</template>
