<script setup lang="ts">
import { Check, Copy } from '@lucide/vue'
import { ref } from 'vue'

const props = defineProps<{ value: string; label?: string }>()
const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  try {
    await navigator.clipboard.writeText(props.value)
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => { copied.value = false }, 1800)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <button type="button" class="tool-icon-button" :aria-label="copied ? '已复制' : (label ?? '复制')" :title="copied ? '已复制' : (label ?? '复制')" @click="copy">
    <Check v-if="copied" :size="16" />
    <Copy v-else :size="16" />
  </button>
</template>
