<script setup lang="ts">
import { data as projects } from '../../../projects.data'
</script>

<template>
  <div class="project-grid">
    <article v-for="p in projects" :key="p.name" class="project-card">
      <img v-if="p.image" :src="p.image" :alt="p.name" loading="lazy" decoding="async" />
      <h3>{{ p.name }}</h3>
      <p>{{ p.description }}</p>
      <p class="tags">
        <span v-for="t in p.tags" :key="t" class="tag">{{ t }}</span>
      </p>
      <p class="links">
        <a v-if="p.github" :href="p.github" target="_blank" rel="noopener">GitHub</a>
        <a v-if="p.demo" :href="p.demo" target="_blank" rel="noopener">在线 Demo</a>
      </p>
    </article>
  </div>
</template>
