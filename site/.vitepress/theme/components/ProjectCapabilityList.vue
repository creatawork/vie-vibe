<script setup lang="ts">
import type { ProjectCapability } from '../../../projects.source'

withDefaults(
  defineProps<{
    capabilities: ProjectCapability[]
    showImages?: boolean
    variant?: 'compact' | 'full'
  }>(),
  { showImages: false, variant: 'compact' },
)
</script>

<template>
  <ul
    class="vie-capabilities"
    :class="[`is-${variant}`, { 'has-media': showImages }]"
  >
    <li v-for="c in capabilities" :key="c.title" class="vie-capability">
      <a v-if="showImages && c.image" class="vie-capability__media" :href="c.image" target="_blank" rel="noopener" :aria-label="'查看' + c.title + '的完整截图'">
        <img :src="c.image" :alt="c.title + '的产品截图'" loading="lazy" decoding="async" />
      </a>
      <div class="vie-capability__body">
        <h3>{{ c.title }}</h3>
        <p>{{ c.description }}</p>
      </div>
    </li>
  </ul>
</template>
