<script setup lang="ts">
import ViePageHeader from './ViePageHeader.vue'

defineProps<{
  path: string
  hint?: string
}>()
</script>

<template>
  <div class="vie-page">
    <ViePageHeader :path="path" :hint="hint" />
    <div class="vie-page-body">
      <slot />
    </div>
  </div>
</template>
