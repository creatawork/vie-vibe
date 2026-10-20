<script setup lang="ts">
import { AlertCircle, Check, Copy } from '@lucide/vue'
import { computed, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{ value: string; label?: string }>()
const copied = ref(false)
const failed = ref(false)
const copying = ref(false)
const feedback = computed(() => failed.value ? '复制失败，请手动选择内容后复制' : copied.value ? '已复制' : '')
let timer: ReturnType<typeof setTimeout> | undefined

onBeforeUnmount(() => clearTimeout(timer))

async function copy() {
  copied.value = false
  failed.value = false
  copying.value = true
  clearTimeout(timer)
  try {
    await navigator.clipboard.writeText(props.value)
    copied.value = true
  } catch {
    failed.value = true
  } finally {
    copying.value = false
    timer = setTimeout(() => { copied.value = false; failed.value = false }, 4000)
  }
}
</script>

<template>
  <span class="tool-copy-control">
    <button type="button" :class="['tool-icon-button', { 'tool-copy-error': failed }]" :disabled="!value || copying" :aria-label="feedback || (label ?? '复制')" :title="feedback || (label ?? '复制')" @click="copy">
      <Check v-if="copied" :size="16" aria-hidden="true" />
      <AlertCircle v-else-if="failed" :size="16" aria-hidden="true" />
      <Copy v-else :size="16" aria-hidden="true" />
      <span v-if="failed">复制失败</span>
    </button>
    <span class="tool-sr-only" role="status">{{ feedback }}</span>
  </span>
</template>
