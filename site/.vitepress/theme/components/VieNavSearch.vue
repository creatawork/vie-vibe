<script setup lang="ts">
import { ArrowUpRight, Search, X } from '@lucide/vue'
import { useData, useRoute, useRouter } from 'vitepress'
import { computed, nextTick, onMounted, onUnmounted, ref, useId, watch } from 'vue'
import { data as posts } from '../../../articles.data'
import { highlightParts, recentSuggestions, searchSuggestions, type SearchHit, type SearchSuggestion } from '../search/results'

const open = defineModel<boolean>('open', { default: false })
const { localeIndex } = useData()
const route = useRoute()
const router = useRouter()
const root = ref<HTMLElement>()
const input = ref<HTMLInputElement>()
const trigger = ref<HTMLButtonElement>()
const query = ref('')
const composing = ref(false)
const loading = ref(false)
const unavailable = ref(false)
const results = ref<SearchSuggestion[]>(recentSuggestions(posts))
const active = ref(-1)
const id = useId()
const listId = `${id}-nav-search-results`
const hasQuery = computed(() => Boolean(query.value.trim()))
const activeId = computed(() => active.value >= 0 && results.value[active.value] ? `${id}-result-${active.value}` : undefined)
let timer: ReturnType<typeof setTimeout> | undefined
let revision = 0

function cancelSearch() {
  clearTimeout(timer)
  revision++
  loading.value = false
}

function updateResults() {
  cancelSearch()
  unavailable.value = false
  active.value = -1
  if (!open.value || composing.value) return
  const text = query.value.trim()
  if (!text) {
    results.value = recentSuggestions(posts)
    return
  }
  results.value = []
  loading.value = true
  const current = revision
  timer = setTimeout(async () => {
    let hits: SearchHit[] = []
    let failed = false
    try {
      const { searchLocalIndex } = await import('../search/localSearch')
      hits = await searchLocalIndex(text, localeIndex.value)
    } catch {
      failed = true
    }
    if (current !== revision || !open.value) return
    results.value = searchSuggestions(hits, posts, text)
    unavailable.value = failed
    loading.value = false
    active.value = results.value.length ? 0 : -1
  }, 120)
}

async function openSearch() {
  open.value = true
  await nextTick()
  input.value?.focus()
}

function closeSearch(restoreFocus = false) {
  open.value = false
  if (restoreFocus) nextTick(() => trigger.value?.focus())
}

watch(open, (value) => {
  if (value) {
    updateResults()
    nextTick(() => input.value?.focus())
  } else {
    cancelSearch()
    query.value = ''
    composing.value = false
    unavailable.value = false
  }
})
watch([query, composing], updateResults)
watch(() => route.path, () => closeSearch())

function onInputKeydown(event: KeyboardEvent) {
  if (event.isComposing || composing.value) return
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    if (!results.value.length) return
    active.value = event.key === 'ArrowDown'
      ? (active.value + 1) % results.value.length
      : (active.value <= 0 ? results.value.length : active.value) - 1
    nextTick(() => document.getElementById(activeId.value ?? '')?.scrollIntoView({ block: 'nearest' }))
  } else if (event.key === 'Enter') {
    event.preventDefault()
    const result = results.value[active.value >= 0 ? active.value : 0]
    if (result) {
      router.go(result.href)
      closeSearch()
    }
  }
}

function onGlobalKeydown(event: KeyboardEvent) {
  if (event.isComposing) return
  const target = event.target as HTMLElement | null
  const editing = target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName ?? '')
  if (((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') || (event.key === '/' && !editing && !event.ctrlKey && !event.metaKey && !event.altKey)) {
    // Capture before the hidden VitePress navigation's modal shortcut.
    event.preventDefault()
    event.stopImmediatePropagation()
    openSearch()
  } else if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    event.stopImmediatePropagation()
    closeSearch(true)
  }
}

function onOutsidePointer(event: PointerEvent) {
  if (open.value && event.target instanceof Node && !root.value?.contains(event.target)) closeSearch()
}

function onFocusOut(event: FocusEvent) {
  // Replacing the focused trigger with the input emits a blur with no next
  // target. Only close when focus actually moves to another control.
  if (event.relatedTarget && open.value && !root.value?.contains(event.relatedTarget as Node)) closeSearch()
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown, true)
  document.addEventListener('pointerdown', onOutsidePointer)
})
onUnmounted(() => {
  cancelSearch()
  window.removeEventListener('keydown', onGlobalKeydown, true)
  document.removeEventListener('pointerdown', onOutsidePointer)
})

defineExpose({ openSearch })
</script>

<template>
  <div ref="root" class="vie-nav-search" :class="{ 'is-open': open }" @focusout="onFocusOut">
    <div class="vie-nav-search__field">
      <button v-if="!open" ref="trigger" class="vie-nav-search__trigger" type="button" aria-label="搜索文章" aria-keyshortcuts="Control+K Meta+K /" :aria-expanded="false" :aria-controls="listId" @click="openSearch">
        <Search :size="17" aria-hidden="true" /><span>搜索</span><kbd aria-hidden="true">Ctrl K</kbd>
      </button>
      <template v-else>
        <Search class="vie-nav-search__icon" :size="18" aria-hidden="true" />
        <input ref="input" v-model="query" type="search" role="combobox" aria-label="搜索文章" placeholder="搜索文章…" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="160" aria-autocomplete="list" :aria-expanded="true" :aria-controls="listId" :aria-activedescendant="activeId" @keydown="onInputKeydown" @compositionstart="composing = true" @compositionend="composing = false" />
        <button class="vie-nav-search__close" type="button" aria-label="收起搜索" @click="closeSearch(true)"><X :size="17" aria-hidden="true" /></button>
      </template>
    </div>
    <Transition name="nav-search">
      <div v-if="open" class="vie-nav-search__panel">
        <div class="vie-nav-search__head"><span>{{ hasQuery ? '搜索结果' : '最近文章' }}</span><span v-if="hasQuery" role="status" aria-live="polite">{{ loading ? '查找中…' : `${results.length} 篇文章` }}</span></div>
        <ul :id="listId" class="vie-nav-search__results" role="listbox" aria-label="文章搜索结果" :aria-busy="loading">
          <li v-for="(result, index) in results" :key="result.href" role="presentation">
            <a :id="`${id}-result-${index}`" :href="result.href" role="option" :aria-selected="active === index" :class="{ 'is-active': active === index }" tabindex="-1" @pointermove="active = index" @click="closeSearch()">
              <div class="vie-nav-search__title"><span><template v-for="(part, i) in highlightParts(result.title, query)" :key="i"><mark v-if="part.highlighted">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></span><ArrowUpRight :size="17" aria-hidden="true" /></div>
              <p v-if="result.section" class="vie-nav-search__section">{{ result.section }}</p>
              <p v-else-if="result.description" class="vie-nav-search__description">{{ result.description }}</p>
            </a>
          </li>
        </ul>
        <p v-if="hasQuery && !loading && !results.length" class="vie-nav-search__empty">{{ unavailable ? '暂时无法搜索全文，请稍后重试。' : '没有找到相关文章，试试其他关键词。' }}</p>
        <div class="vie-nav-search__foot"><span>↑ ↓ 选择 · Enter 打开 · Esc 收起</span><a href="/articles/" @click="closeSearch()">全部文章 <ArrowUpRight :size="14" aria-hidden="true" /></a></div>
      </div>
    </Transition>
  </div>
</template>
