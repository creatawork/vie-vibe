<script setup lang="ts">
import type { ProjectMedia } from '../../../projects.source'

withDefaults(
  defineProps<{
    media: ProjectMedia[]
    variant?: 'flagship' | 'strip'
    eager?: boolean
  }>(),
  { variant: 'strip', eager: false },
)
</script>

<template>
  <div class="vie-media-strip" :class="`is-${variant}`">
    <figure v-for="(m, i) in media" :key="m.src" class="vie-media">
      <a
        class="vie-media__link"
        :href="m.src"
        :aria-label="`查看完整图片：${m.caption}`"
        target="_blank"
        rel="noopener"
      >
        <img
          :src="m.src"
          :alt="m.alt"
          :width="m.width"
          :height="m.height"
          :loading="eager && i === 0 ? 'eager' : 'lazy'"
          :fetchpriority="eager && i === 0 ? 'high' : undefined"
          decoding="async"
        />
      </a>
      <figcaption class="vie-mono">{{ m.caption }}</figcaption>
    </figure>
  </div>
</template>
