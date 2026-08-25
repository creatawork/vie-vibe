<script setup lang="ts">
import { data as projects } from '../../../projects.data'
</script>

<template>
  <div class="project-grid">
    <div v-for="p in projects" :key="p.name" class="project-card">
      <img v-if="p.image" :src="p.image" :alt="p.name" />
      <h3>{{ p.name }}</h3>
      <p>{{ p.description }}</p>
      <p class="tags">
        <span v-for="t in p.tags" :key="t" class="tag">{{ t }}</span>
      </p>
      <p class="links">
        <a v-if="p.github" :href="p.github" target="_blank" rel="noopener">GitHub</a>
        <a v-if="p.demo" :href="p.demo" target="_blank" rel="noopener">在线 Demo</a>
      </p>
    </div>
  </div>
</template>

<style scoped>
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
  margin-top: 1.5rem;
}
.project-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.25rem;
}
.project-card img {
  width: 100%;
  border-radius: 4px;
}
.tag {
  display: inline-block;
  background: var(--vp-c-bg-soft);
  border-radius: 4px;
  padding: 0.1rem 0.5rem;
  margin: 0 0.4rem 0.4rem 0;
  font-size: 0.8rem;
}
.links a {
  margin-right: 1rem;
}
</style>
