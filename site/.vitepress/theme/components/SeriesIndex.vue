<script setup lang="ts">
import { data as groups } from '../../../series.data'
import VieShell from './VieShell.vue'
</script>

<template>
  <VieShell path="series/" hint="collections">
    <p v-if="groups.length === 0" class="vie-empty vie-mono">// no series yet</p>
    <section v-else class="vie-panel">
      <div class="vie-tile-tab vie-mono">series/index</div>
      <h2 class="vie-feed-label vie-mono">collections[]</h2>
      <ul class="vie-feed">
        <li v-for="(g, i) in groups" :key="g.name">
          <span class="vie-ln vie-mono">{{ String(i + 1).padStart(2, '0') }}</span>
          <a :href="`/series/${encodeURIComponent(g.name)}`">{{ g.name }}</a>
          <span class="vie-feed-meta vie-mono">{{ g.posts.length }} posts</span>
        </li>
      </ul>
    </section>
  </VieShell>
</template>
