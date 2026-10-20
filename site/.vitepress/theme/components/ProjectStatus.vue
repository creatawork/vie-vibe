<script setup lang="ts">
import { projectStatusLabel, type ProjectStatus } from '../../../projects.source'

defineProps<{ status: ProjectStatus }>()
</script>

<template>
  <span class="vie-badge" :class="'is-' + status">{{ projectStatusLabel[status] }}</span>
</template>
