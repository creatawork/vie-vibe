<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  path: string
  hint?: string
}>()

const title = computed(() => {
  if (props.path.startsWith('articles')) return '文章'
  if (props.path.startsWith('projects')) return '项目'
  if (props.path.startsWith('series/')) return props.path === 'series/' ? '系列' : '系列文章'
  if (props.path.startsWith('stats')) return '访问统计'
  return props.path
})

const subtitle = computed(() => {
  if (props.path.startsWith('articles')) return '记录成长系统，分享开发经验'
  if (props.path.startsWith('projects')) return '把想法落地成可验证的作品'
  if (props.path.startsWith('series')) return '按主题串起完整的技术决策链'
  if (props.path.startsWith('stats')) return '站点数据的私有观察台'
  return props.hint ?? 'Vie 技术笔记'
})
</script>

<template>
  <header class="vie-page-header">
    <div class="vie-page-crumb vie-mono" aria-hidden="true">
      <span>&lt; VieNotes /&gt;</span>
      <span>{{ path }}</span>
    </div>
    <h1>{{ title }}</h1>
    <p>{{ subtitle }}</p>
  </header>
</template>
