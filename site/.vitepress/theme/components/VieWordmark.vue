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
    <span class="vie-wordmark-mark" aria-hidden="true"><span class="vie-wordmark-mark-letter">V</span></span><span class="vie-wordmark-name">ie</span>
  </a>
  <span v-else class="vie-wordmark" :class="'vie-wordmark--' + size" aria-label="Vie">
    <span class="vie-wordmark-mark" aria-hidden="true"><span class="vie-wordmark-mark-letter">V</span></span><span class="vie-wordmark-name">ie</span>
  </span>
</template>
