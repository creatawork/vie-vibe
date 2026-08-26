<script setup lang="ts">
import { onContentUpdated } from 'vitepress'
import { computed, shallowRef } from 'vue'
import { useData, useRoute } from 'vitepress'
import { getHeaders, type MenuItem } from 'vitepress/dist/client/theme-default/composables/outline.js'
import VieWordmark from './VieWordmark.vue'
import { mastheadDensity } from '../mastheadDensity'

const route = useRoute()
const { frontmatter, theme } = useData()

const density = computed(() =>
  mastheadDensity(route.path, Boolean(frontmatter.value.date)),
)

type TocHeader = { slug: string; title: string; level: number }

const tocHeaders = shallowRef<TocHeader[]>([])

function flattenHeaders(items: MenuItem[]): TocHeader[] {
  const out: TocHeader[] = []
  for (const item of items) {
    out.push({
      slug: item.link.replace(/^#/, ''),
      title: item.title,
      level: item.level,
    })
    if (item.children?.length) {
      out.push(...flattenHeaders(item.children))
    }
  }
  return out
}

function refreshToc() {
  if (density.value !== 'narrow') {
    tocHeaders.value = []
    return
  }
  const outline = frontmatter.value.outline ?? theme.value.outline
  tocHeaders.value = flattenHeaders(getHeaders(outline))
}

onContentUpdated(refreshToc)

const tagline = '写清楚每一个技术决策'
</script>

<template>
  <aside class="vie-masthead" :data-density="density" aria-label="刊头">
    <VieWordmark v-if="density !== 'narrow'" to="/" size="mast" />
    <VieWordmark v-else to="/" size="nav" />

    <p v-if="density === 'full' || density === 'mid'" class="vie-masthead__tagline">
      {{ tagline }}
    </p>

    <p v-if="density === 'full'" class="vie-masthead__actions">
      <a class="vie-btn vie-btn--brand" href="/articles/">阅读文章</a>
      <a class="vie-btn vie-btn--alt" href="/projects">查看成果</a>
    </p>

    <nav v-if="density === 'narrow' && tocHeaders.length" class="vie-toc" aria-label="本页目录">
      <a
        v-for="h in tocHeaders"
        :key="h.slug"
        :href="'#' + h.slug"
        :class="'vie-toc__l' + h.level"
      >{{ h.title }}</a>
    </nav>
  </aside>
</template>