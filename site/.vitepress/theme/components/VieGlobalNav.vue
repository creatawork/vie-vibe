<script setup lang="ts">
import { ArrowUpRight, Menu, Search, X } from '@lucide/vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import VieWordmark from './VieWordmark.vue'
import VieNavSearch from './VieNavSearch.vue'

const route = useRoute()
const menuOpen = ref(false)
const menuButton = ref<HTMLButtonElement>()
const header = ref<HTMLElement>()
const searchOpen = ref(false)
const navSearch = ref<InstanceType<typeof VieNavSearch>>()

const navItems = [
  { label: '首页', href: '/' },
  { label: '文章', href: '/articles/' },
  { label: '项目', href: '/projects' },
  { label: '工具', href: '/tools' },
  { label: '系列', href: '/series/' },
]

const activeLabel = computed(() => {
  const path = route.path
  if (path === '/' || path === '/index.html') return '首页'
  if (path.startsWith('/articles')) return '文章'
  if (path.startsWith('/projects')) return '项目'
  if (path.startsWith('/tools')) return '工具'
  if (path.startsWith('/series')) return '系列'
  return ''
})

function isActive(label: string) {
  return activeLabel.value === label
}

function openSearch() {
  closeMenu()
  navSearch.value?.openSearch()
}

function closeMenu() {
  menuOpen.value = false
}

watch(() => route.path, closeMenu)
watch(searchOpen, (value) => { if (value) closeMenu() })

function toggleMenu() {
  searchOpen.value = false
  menuOpen.value = !menuOpen.value
}

function onEscape(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !menuOpen.value) return
  closeMenu()
  menuButton.value?.focus()
}

function onOutsideClick(event: PointerEvent) {
  if (menuOpen.value && event.target instanceof Node && !header.value?.contains(event.target)) closeMenu()
}

onMounted(() => {
  document.addEventListener('keydown', onEscape)
  document.addEventListener('pointerdown', onOutsideClick)
})
onUnmounted(() => {
  document.removeEventListener('keydown', onEscape)
  document.removeEventListener('pointerdown', onOutsideClick)
})
</script>

<template>
  <header ref="header" class="vie-global-nav" :class="{ 'is-searching': searchOpen }">
    <div class="vie-global-nav__inner">
      <VieWordmark to="/" size="nav" />

      <nav class="vie-global-nav__links" aria-label="主导航" :aria-hidden="searchOpen || undefined" :inert="searchOpen || undefined">
        <a
          v-for="item in navItems"
          :key="item.label"
          :href="item.href"
          :class="{ 'is-active': isActive(item.label) }"
          :aria-current="isActive(item.label) ? 'page' : undefined"
        >{{ item.label }}</a>
      </nav>

      <div class="vie-global-nav__actions">
        <VieNavSearch ref="navSearch" v-model:open="searchOpen" />
        <a class="vie-global-nav__github" href="https://github.com/creatawork" target="_blank" rel="noopener" aria-label="GitHub 主页">
          <span>GitHub</span><ArrowUpRight :size="16" aria-hidden="true" />
        </a>
        <button
          class="vie-global-nav__menu"
          ref="menuButton"
          type="button"
          :aria-expanded="menuOpen"
          aria-controls="vie-mobile-nav"
          :aria-label="menuOpen ? '关闭导航菜单' : '打开导航菜单'"
          @click="toggleMenu"
        >
          <X v-if="menuOpen" :size="20" aria-hidden="true" />
          <Menu v-else :size="20" aria-hidden="true" />
        </button>
      </div>
    </div>

    <nav v-if="menuOpen" id="vie-mobile-nav" class="vie-global-nav__mobile" aria-label="移动端主导航">
      <a
        v-for="item in navItems"
        :key="item.label"
        :href="item.href"
        :class="{ 'is-active': isActive(item.label) }"
        :aria-current="isActive(item.label) ? 'page' : undefined"
        @click="closeMenu"
      >{{ item.label }}</a>
      <button type="button" @click="openSearch(); closeMenu()"><Search :size="16" aria-hidden="true" /> 搜索文章</button>
    </nav>
  </header>
</template>
