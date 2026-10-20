<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'
import VieWordmark from './VieWordmark.vue'
</script>

<template>
  <footer class="vie-fresh-footer">
    <div class="vie-fresh-footer__inner">
      <div class="vie-fresh-footer__intro">
        <VieWordmark to="/" size="nav" />
        <p>让实现，经得起追问。</p>
        <span>全栈开发 · 技术实现细节与思路</span>
      </div>
      <nav class="vie-fresh-footer__links" aria-label="底部导航">
        <a href="/articles/">阅读文章</a>
        <a href="/projects">项目实践</a>
        <a href="/tools">开发工具</a>
        <a href="/series/">系列文章</a>
      </nav>
      <div class="vie-fresh-footer__bottom">
        <small>© {{ new Date().getFullYear() }} Vie</small>
        <div><a href="https://github.com/creatawork" target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight :size="15" aria-hidden="true" /></a><a href="/feed.xml">RSS 订阅</a><a href="/articles/meta/how-this-site-works">站点说明</a><a href="#" aria-label="回到顶部">回到顶部 ↑</a></div>
      </div>
    </div>
  </footer>
</template>
