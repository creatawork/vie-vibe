<script setup lang="ts">
import { Menu, Search, X } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import VieWordmark from './VieWordmark.vue'

const route = useRoute()
const menuOpen = ref(false)

const navItems = [
  { label: '首页', href: '/' },
  { label: '文章', href: '/articles/' },
  { label: '项目', href: '/projects' },
  { label: '工具', href: '/tools' },
  { label: '关于', href: '/#about' },
]

const activeLabel = computed(() => {
  const path = route.path
  if (path === '/' || path === '/index.html') return '首页'
  if (path.startsWith('/articles')) return '文章'
  if (path.startsWith('/projects')) return '项目'
  if (path.startsWith('/tools')) return '工具'
  return ''
})

function isActive(label: string) {
  return activeLabel.value === label
}

function openSearch() {
  const searchButton = document.querySelector<HTMLButtonElement>('.DocSearch-Button')
  if (searchButton) {
    searchButton.click()
    return
  }
  window.location.href = '/articles/'
}

function closeMenu() {
  menuOpen.value = false
}

watch(() => route.path, closeMenu)
</script>

<template>
  <header class="vie-global-nav">
    <div class="vie-global-nav__inner">
      <VieWordmark to="/" size="nav" />

      <nav class="vie-global-nav__links" aria-label="主导航">
        <a
          v-for="item in navItems"
          :key="item.label"
          :href="item.href"
          :class="{ 'is-active': isActive(item.label) }"
          :aria-current="isActive(item.label) ? 'page' : undefined"
        >{{ item.label }}</a>
      </nav>

      <div class="vie-global-nav__actions">
        <button class="vie-global-nav__search" type="button" aria-label="搜索文章" @click="openSearch">
          <Search :size="17" aria-hidden="true" />
          <span>搜索</span>
        </button>
        <a class="vie-global-nav__github" href="https://github.com/creatawork" target="_blank" rel="noopener" aria-label="GitHub 主页">
          <span>V</span>
        </a>
        <button
          class="vie-global-nav__menu"
          type="button"
          :aria-expanded="menuOpen"
          aria-controls="vie-mobile-nav"
          :aria-label="menuOpen ? '关闭导航菜单' : '打开导航菜单'"
          @click="menuOpen = !menuOpen"
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
