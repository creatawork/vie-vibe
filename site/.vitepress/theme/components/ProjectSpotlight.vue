<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '../../../projects.source'
import ProjectStatus from './ProjectStatus.vue'

const props = withDefaults(
  defineProps<{
    project: Project
    titleTag?: 'h2' | 'h3'
    compact?: boolean
  }>(),
  { titleTag: 'h2', compact: false },
)

const detailHref = computed(() =>
  props.project.slug ? `/projects/${props.project.slug}` : '/projects',
)
</script>

<template>
  <article class="vie-spotlight" :class="{ 'vie-spotlight--compact': compact }">
    <ProjectStatus :status="project.status" />
    <component :is="titleTag" class="vie-spotlight__name">{{ project.name }}</component>
    <p class="vie-spotlight__prop">{{ project.proposition }}</p>
    <p class="vie-spotlight__summary">{{ project.description }}</p>
    <slot />
    <div class="vie-spotlight__actions">
      <a
        class="vie-cta vie-cta--primary"
        :href="detailHref"
        :aria-label="`查看 ${project.name} 项目案例`"
      >查看项目案例</a>
      <slot name="secondary" />
    </div>
  </article>
</template>
