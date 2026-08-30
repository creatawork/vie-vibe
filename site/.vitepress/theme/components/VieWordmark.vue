<script setup lang="ts">
defineProps<{
  to?: string
  size: 'nav' | 'mast' | 'display'
}>()
</script>

<template>
  <a
    v-if="to"
    class="vie-wordmark"
    :class="'vie-wordmark--' + size"
    :href="to"
    aria-label="Vie 首页"
  >
    <span class="vie-mark-bracket">&lt;</span><span class="vie-v">V</span><span class="vie-ie">ie</span><span class="vie-mark-slash">/&gt;</span>
  </a>
  <span v-else class="vie-wordmark" :class="'vie-wordmark--' + size" aria-label="Vie">
    <span class="vie-mark-bracket">&lt;</span><span class="vie-v">V</span><span class="vie-ie">ie</span><span class="vie-mark-slash">/&gt;</span>
  </span>
</template>
