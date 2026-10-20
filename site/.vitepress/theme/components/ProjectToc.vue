<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { LogEntryType, ProjectLogEntry } from '../../../projects.source'
import { logAnchorId } from './logAnchor'

interface TocSection {
  id: string
  label: string
}

const props = defineProps<{
  sections: TocSection[]
  entries: ProjectLogEntry[]
  filter?: LogEntryType | 'all'
}>()
defineEmits<{ 'select-log': [] }>()

const entryItems = computed(() =>
  props.entries.map((e, i) => ({
    id: logAnchorId(props.entries.length, i),
    date: e.date.slice(5).replace('-', '/'),
    label: e.title,
  })),
)

const spyItems = computed(() => [
  ...props.sections.map((s) => s.id),
  ...entryItems.value.map((e) => e.id),
])

const activeId = ref(spyItems.value[0] ?? '')
const activeSectionLabel = computed(() =>
  props.sections.find((section) => section.id === activeId.value)?.label ??
  (activeId.value.startsWith('log-') ? '开发日志' : '项目概览'),
)

let rafId = 0

const measure = () => {
  rafId = 0
  const ids = spyItems.value.filter((id) => document.getElementById(id)?.getClientRects().length)
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
    if (el && el.getBoundingClientRect().top <= 160) current = id
  }
  activeId.value = current || ids[0]
}

const queueMeasure = () => {
  if (!rafId) rafId = requestAnimationFrame(measure)
}

watch(() => props.filter, () => nextTick(queueMeasure))

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
    <details class="vie-toc-mobile">
      <summary>本页目录 <span>{{ activeSectionLabel }}</span></summary>
      <ul class="vie-toc-list" role="list">
        <li v-for="s in sections" :key="s.id">
          <a
            :href="'#' + s.id"
            class="vie-toc-link"
            :class="{ 'is-active': sectionState(s.id) !== '' }"
            :aria-current="sectionState(s.id) === 'active' ? 'location' : undefined"
            @click="s.id === 'devlog' && $emit('select-log')"
          >{{ s.label }}</a>
        </li>
      </ul>
    </details>
    <div class="vie-toc-desktop">
      <p class="vie-detail-toc__label">本页内容</p>
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
            @click="s.id === 'devlog' && $emit('select-log')"
          >{{ s.label }}</a>
        </li>
      </ul>
      <details v-if="entryItems.length" class="vie-toc-journal">
        <summary>日志索引 <span>{{ entryItems.length }} 篇</span></summary>
        <ul class="vie-toc-sub" role="list">
          <li v-for="e in entryItems" :key="e.id">
            <a
              :href="'#' + e.id"
              class="vie-toc-entry"
              :class="{ 'is-active': activeId === e.id }"
              :aria-current="activeId === e.id ? 'location' : undefined"
              :title="e.label"
              @click="$emit('select-log')"
            >
              <span class="vie-toc-entry__date">{{ e.date }}</span>
              <span class="vie-toc-entry__title">{{ e.label }}</span>
            </a>
          </li>
        </ul>
      </details>
    </div>
  </nav>
</template>
