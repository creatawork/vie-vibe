<script setup lang="ts">
import { ArrowLeft, Braces, KeyRound, Timer, ShieldCheck } from '@lucide/vue'
import { tools, type ToolId } from '../../../../tools.registry'

defineProps<{
  active?: ToolId
  title: string
  description: string
  eyebrow?: string
}>()
</script>

<template>
  <div class="tool-page">
    <header class="tool-topbar">
      <a class="tool-back" href="/tools"><ArrowLeft :size="16" /> 工具</a>
      <nav class="tool-switcher" aria-label="工具导航">
        <a v-for="tool in tools" :key="tool.id" :href="tool.href" :class="{ 'is-active': active === tool.id }">
          <Braces v-if="tool.icon === 'braces'" :size="15" />
          <Timer v-else-if="tool.icon === 'timer'" :size="15" />
          <KeyRound v-else :size="15" />
          {{ tool.shortName }}
        </a>
      </nav>
      <span class="tool-local"><ShieldCheck :size="14" /> 仅在浏览器处理</span>
    </header>

    <main class="tool-main">
      <header class="tool-heading">
        <p v-if="eyebrow" class="tool-eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </header>
      <slot />
    </main>
  </div>
</template>
