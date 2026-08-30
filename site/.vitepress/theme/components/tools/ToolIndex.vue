<script setup lang="ts">
import { ArrowRight, Braces, KeyRound, Timer } from '@lucide/vue'
import { tools } from '../../../../tools.registry'
</script>

<template>
  <div class="tool-page tool-index-page">
    <header class="tool-index-head">
      <div>
        <p class="tool-eyebrow">Vie / tools</p>
        <h1>开发工具</h1>
        <p>把重复的检查和转换留在浏览器里完成。</p>
      </div>
      <span class="tool-local"><span class="tool-status-dot"></span> 本地处理 · 不上传内容</span>
    </header>

    <section class="tool-index-grid" aria-label="工具列表">
      <a v-for="tool in tools" :key="tool.id" :href="tool.href" class="tool-index-card">
        <span :class="`tool-index-icon tone-${tool.tone}`">
          <Braces v-if="tool.icon === 'braces'" :size="27" />
          <Timer v-else-if="tool.icon === 'timer'" :size="27" />
          <KeyRound v-else :size="27" />
        </span>
        <span class="tool-index-copy">
          <strong>{{ tool.name }}</strong>
          <span>{{ tool.description }}</span>
          <small>{{ tool.category }} <ArrowRight :size="14" /></small>
        </span>
      </a>
    </section>

    <footer class="tool-index-foot">
      <span>工具内容不会写入 URL、localStorage 或统计请求。</span>
      <a href="/articles/meta/how-this-site-works">了解本站实现 <ArrowRight :size="14" /></a>
    </footer>
  </div>
</template>
