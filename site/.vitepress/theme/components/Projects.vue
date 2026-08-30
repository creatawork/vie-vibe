<script setup lang="ts">
import { data as projects } from '../../../projects.data'
import VieShell from './VieShell.vue'
</script>

<template>
  <VieShell path="projects/" hint="ship">
    <div class="vie-project-grid">
      <article
        v-for="(p, i) in projects"
        :key="p.name"
        class="vie-project-tile"
      >
        <span class="vie-badge">{{ p.featured ? 'featured' : `p${i + 1}` }}</span>
        <img
          v-if="p.image"
          :src="p.image"
          :alt="p.name"
          class="vie-project-img"
          loading="lazy"
          decoding="async"
        />
        <h2>{{ p.name }}</h2>
        <p>{{ p.description }}</p>
        <ul v-if="p.decisions?.length" class="vie-feed vie-decisions">
          <li v-for="(d, j) in p.decisions" :key="j">
            <span class="vie-ln vie-mono">{{ String(j + 1).padStart(2, '0') }}</span>
            <a v-if="d.href" :href="d.href">{{ d.text }}</a>
            <span v-else>{{ d.text }}</span>
          </li>
        </ul>
        <div class="vie-chip-row">
          <span v-for="t in p.tags" :key="t" class="vie-chip vie-chip--accent">{{ t }}</span>
        </div>
        <div class="vie-link-row vie-mono">
          <a v-if="p.github" :href="p.github" target="_blank" rel="noopener">gh</a>
          <a v-if="p.demo" :href="p.demo" target="_blank" rel="noopener">demo</a>
        </div>
      </article>
    </div>
  </VieShell>
</template>
