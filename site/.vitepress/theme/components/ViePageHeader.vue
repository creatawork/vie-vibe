<script setup lang="ts">
defineProps<{
  path: string
  hint?: string
}>()
</script>

<template>
  <div class="vie-page-bar" aria-hidden="true">
    <span class="vie-status-dot" />
    <span class="vie-mono">{{ path }}</span>
    <span v-if="hint" class="vie-page-bar__sep">·</span>
    <span v-if="hint" class="vie-mono vie-syntax-fn">{{ hint }}</span>
  </div>
</template>
