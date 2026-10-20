<script setup lang="ts">
import { computed } from 'vue'
import { data as projects } from '../../../projects.data'
import ProjectSpotlight from './ProjectSpotlight.vue'
import ProjectMediaStrip from './ProjectMediaStrip.vue'
import { logAnchorId } from './logAnchor'

const flagship = computed(() => projects.find((p) => p.featured) ?? projects[0])
const others = computed(() => projects.filter((p) => p !== flagship.value))
const latest = computed(() => flagship.value?.log?.[0])
const updatedAt = computed(() => projects.map((p) => p.updatedAt).sort().at(-1))
</script>

<template>
  <div class="vie-page vie-projects">
    <header class="vie-projects-heading">
      <div>
        <h1>项目</h1>
        <p>从想法到实现，记录产品，也记录每一次迭代。</p>
      </div>
      <p class="vie-projects-heading__meta">{{ projects.length }} 个项目<template v-if="updatedAt"><span aria-hidden="true"> · </span>更新于 <time :datetime="updatedAt">{{ updatedAt }}</time></template></p>
    </header>
    <section v-if="flagship" class="vie-flagship">
      <div class="vie-flagship__top">
        <ProjectSpotlight :project="flagship" title-tag="h2" :show-summary="false" show-tech>
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
      <footer v-if="latest" class="vie-flagship__milestone">
        <span class="vie-flagship__milestone-label">最新进展<time :datetime="latest.date">{{ latest.date }}</time></span>
        <a :href="`/projects/${flagship.slug}#${logAnchorId(flagship.log?.length ?? 0, 0)}`">{{ latest.title }}<span aria-hidden="true">↗</span></a>
      </footer>
    </section>
    <p v-else class="vie-empty">项目正在整理中。</p>

    <section v-if="others.length" class="vie-more" aria-labelledby="vie-more-title">
      <h2 id="vie-more-title" class="vie-more__title">更多实践</h2>
      <div class="vie-more__grid">
        <div
          v-for="p in others"
          :key="p.slug ?? p.name"
          class="vie-project-row"
        >
          <ProjectSpotlight :project="p" title-tag="h3" compact show-tech>
            <template #secondary>
              <a v-if="p.github" class="vie-cta vie-cta--ghost" :href="p.github" target="_blank" rel="noopener">GitHub ↗</a>
            </template>
          </ProjectSpotlight>
          <aside v-if="p.slug && p.log?.length" class="vie-project-row__journal" aria-label="项目动态">
            <p>最近的开发记录 <span>{{ p.log.length }} 篇</span></p>
            <a v-for="(entry, index) in p.log.slice(0, 2)" :key="entry.date + entry.title" :href="`/projects/${p.slug}#${logAnchorId(p.log.length, index)}`">
              <time :datetime="entry.date">{{ entry.date }}</time>
              <span>{{ entry.title }}</span>
              <span aria-hidden="true">↗</span>
            </a>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>
