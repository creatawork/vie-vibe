<script setup lang="ts">
import { data as projects } from '../../../projects.data'

const featured = projects.filter((p) => p.featured).slice(0, 3)
</script>

<template>
  <section v-if="featured.length" class="home-section home-projects" aria-labelledby="projects-heading">
    <div class="section-head">
      <h2 id="projects-heading">精选成果</h2>
      <a class="home-more" href="/projects">全部成果 →</a>
    </div>
    <div class="project-grid">
      <article v-for="p in featured" :key="p.name" class="project-card">
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
  </section>
</template>
