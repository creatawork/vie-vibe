<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { ProjectLogEntry } from '../../../projects.source'
import { logAnchorId, logNo } from './logAnchor'

interface TocSection {
  id: string
  label: string
}

const props = defineProps<{
  sections: TocSection[]
  entries: ProjectLogEntry[]
}>()

const entryItems = computed(() =>
  props.entries.map((e, i) => ({
    id: logAnchorId(props.entries.length, i),
    no: logNo(props.entries.length, i),
    label: e.title,
  })),
)

const spyItems = computed(() => [
  ...props.sections.map((s) => s.id),
  ...entryItems.value.map((e) => e.id),
])

const activeId = ref(spyItems.value[0] ?? '')

let rafId = 0

const measure = () => {
  rafId = 0
  const ids = spyItems.value
  if (!ids.length) return
  // A section owns the highlight while its heading sits near the viewport
  // top. The page tail (last log entry + footer) is too short to ever reach
  // that band, so hand the highlight to the last anchor at max scroll.
  const doc = document.documentElement
  if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) {
    activeId.value = ids[ids.length - 1] ?? ids[0]
    return
  }
  let current = ''
  for (const id of ids) {
    const el = document.getElementById(id)
    if (el && el.getBoundingClientRect().top <= 128) current = id
  }
  activeId.value = current || ids[0]
}

const queueMeasure = () => {
  if (!rafId) rafId = requestAnimationFrame(measure)
}

onMounted(() => {
  measure()
  window.addEventListener('scroll', queueMeasure, { passive: true })
  window.addEventListener('resize', queueMeasure, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', queueMeasure)
  window.removeEventListener('resize', queueMeasure)
  if (rafId) cancelAnimationFrame(rafId)
})

const sectionState = (id: string): '' | 'active' | 'parent' => {
  if (activeId.value === id) return 'active'
  if (id === 'devlog' && activeId.value.startsWith('log-')) return 'parent'
  return ''
}
</script>

<template>
  <nav class="vie-detail-toc" aria-label="本页目录">
    <p class="vie-detail-toc__label vie-mono" aria-hidden="true">// 目录</p>
    <ul class="vie-toc-list" role="list">
      <li v-for="s in sections" :key="s.id">
        <a
          :href="'#' + s.id"
          class="vie-toc-link"
          :class="{
            'is-active': sectionState(s.id) === 'active',
            'is-parent': sectionState(s.id) === 'parent',
          }"
          :aria-current="sectionState(s.id) === 'active' ? 'location' : undefined"
        >{{ s.label }}</a>
        <ul v-if="s.id === 'devlog' && entryItems.length" class="vie-toc-sub" role="list">
          <li v-for="e in entryItems" :key="e.id">
            <a
              :href="'#' + e.id"
              class="vie-toc-entry"
              :class="{ 'is-active': activeId === e.id }"
              :aria-current="activeId === e.id ? 'location' : undefined"
              :title="e.label"
            >
              <span class="vie-toc-entry__no vie-mono">{{ e.no }}</span>
              <span class="vie-toc-entry__title">{{ e.label }}</span>
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>
