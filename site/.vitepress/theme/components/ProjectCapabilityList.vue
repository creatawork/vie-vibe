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
      <img
        v-if="showImages && c.image"
        :src="c.image"
        alt=""
        loading="lazy"
        decoding="async"
      />
      <div class="vie-capability__body">
        <h3>{{ c.title }}</h3>
        <p>{{ c.description }}</p>
      </div>
    </li>
  </ul>
</template>
