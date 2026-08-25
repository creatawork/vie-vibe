<script setup lang="ts">
import { data as groups } from '../../../series.data'
</script>

<template>
  <ul class="post-list">
    <li v-for="g in groups" :key="g.name">
      <a :href="`/series/${encodeURIComponent(g.name)}`">{{ g.name }}</a>
      <span class="meta">共 {{ g.posts.length }} 篇</span>
    </li>
  </ul>
</template>
