<script setup lang="ts">
import { computed } from 'vue'
import { data as projects } from '../../../projects.data'
import VieShell from './VieShell.vue'
import ProjectSpotlight from './ProjectSpotlight.vue'
import ProjectCapabilityList from './ProjectCapabilityList.vue'
import ProjectMediaStrip from './ProjectMediaStrip.vue'

const flagship = computed(() => projects.find((p) => p.featured) ?? projects[0])
const latest = computed(() => flagship.value?.log?.[0])
</script>

<template>
  <VieShell path="projects/" hint="ship">
    <section v-if="flagship" class="vie-flagship">
      <div class="vie-flagship__top">
        <ProjectSpotlight :project="flagship" title-tag="h2">
          <template #secondary>
            <a
              v-if="flagship.slug"
              class="vie-cta vie-cta--ghost"
              :href="`/projects/${flagship.slug}#devlog`"
              :aria-label="`阅读 ${flagship.name} 开发日志`"
            >阅读开发日志</a>
          </template>
        </ProjectSpotlight>
        <div class="vie-flagship__media">
          <ProjectMediaStrip :media="flagship.media ?? []" variant="flagship" eager />
        </div>
      </div>
      <ProjectCapabilityList
        v-if="flagship.capabilities?.length"
        class="vie-flagship__caps"
        :capabilities="flagship.capabilities"
        variant="full"
      />
      <footer v-if="latest" class="vie-flagship__milestone vie-mono">
        <time :datetime="latest.date">{{ latest.date }}</time>
        <span>{{ latest.title }}</span>
        <a :href="`/projects/${flagship.slug}#devlog`">开发日志 →</a>
      </footer>
    </section>
    <p v-else class="vie-empty vie-mono">// no flagship project yet</p>
  </VieShell>
</template>
