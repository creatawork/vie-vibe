<script setup lang="ts">
import { CheckCircle2, Clock3, RotateCcw, Search } from '@lucide/vue'
import { computed, ref } from 'vue'
import CopyButton from './CopyButton.vue'
import { formatTimestamp, parseTimestamp, supportedTimeZones, type TimestampMode, type TimeOutput } from '../../tools/timestamp'

const input = ref('')
const mode = ref<TimestampMode>('auto')
const timeZone = ref('Asia/Shanghai')
const error = ref('')
const result = ref<TimeOutput[]>([])
const sourceKind = ref('')
const timeZones = computed(() => supportedTimeZones().filter((zone) => /^(UTC|Asia\/|Europe\/|America\/)/.test(zone)).slice(0, 80))

function convert() {
  error.value = ''
  result.value = []
  try {
    const parsed = parseTimestamp(input.value, mode.value)
    sourceKind.value = parsed.sourceKind
    result.value = formatTimestamp(parsed.date, timeZone.value)
  } catch (reason) {
    sourceKind.value = ''
    error.value = reason instanceof Error ? reason.message : '无法识别这个时间'
  }
}

function useNow() {
  input.value = String(Math.floor(Date.now() / 1000))
  mode.value = 'seconds'
  convert()
}
</script>

<template>
  <section class="tool-workbench tool-time-workbench" aria-label="时间戳转换器">
    <article class="tool-panel tool-time-input-panel">
      <header class="tool-panel-head"><div><span class="tool-panel-label">INPUT</span><strong>输入时间</strong></div><button type="button" class="tool-text-button" @click="useNow"><Clock3 :size="15" /> 使用当前时间</button></header>
      <label class="tool-field-label" for="timestamp-input">时间戳或 ISO 8601</label>
      <input id="timestamp-input" v-model="input" class="tool-text-input" placeholder="例如 1725004800 或 2026-08-30T12:00:00+08:00" @keydown.enter="convert">
      <div class="tool-segmented" role="group" aria-label="时间戳单位">
        <button v-for="item in [['auto', '自动识别'], ['seconds', 'Unix 秒'], ['milliseconds', 'Unix 毫秒']] as const" :key="item[0]" type="button" :class="{ 'is-active': mode === item[0] }" @click="mode = item[0]">{{ item[1] }}</button>
      </div>
      <label class="tool-field-label" for="timezone-select">显示时区</label>
      <div class="tool-select-wrap"><Search :size="15" /><select id="timezone-select" v-model="timeZone"><option v-for="zone in timeZones" :key="zone" :value="zone">{{ zone }}</option></select></div>
      <p class="tool-field-note">自动识别仅接受 10 位秒或 13 位毫秒，避免单位猜错。</p>
      <button type="button" class="tool-primary-button tool-wide-button" @click="convert"><RotateCcw :size="16" /> 转换时间</button>
      <p v-if="error" class="tool-diagnostic" role="alert">{{ error }}</p>
    </article>

    <article class="tool-panel tool-result-panel">
      <header class="tool-panel-head"><div><span class="tool-panel-label">OUTPUT</span><strong>转换结果</strong></div><span v-if="sourceKind" class="tool-valid"><CheckCircle2 :size="14" /> {{ sourceKind }}</span></header>
      <div v-if="result.length" class="tool-result-list">
        <div v-for="item in result" :key="item.label" class="tool-result-row"><span>{{ item.label }}</span><code>{{ item.value }}</code><CopyButton :value="item.value" :label="`复制${item.label}`" /></div>
      </div>
      <div v-else class="tool-empty-state"><Clock3 :size="28" /><strong>输入一个时间开始转换</strong><span>结果会同时展示秒、毫秒、ISO 和本地时间。</span></div>
    </article>
  </section>
</template>
