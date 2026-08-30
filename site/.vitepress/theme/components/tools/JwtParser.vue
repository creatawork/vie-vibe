<script setup lang="ts">
import { AlertTriangle, CheckCircle2, Clipboard, Clock3, FileKey2, ShieldAlert } from '@lucide/vue'
import { computed, ref } from 'vue'
import CopyButton from './CopyButton.vue'
import { createSampleJwt, parseJwt, type JwtResult } from '../../tools/jwt'

const token = ref('')
const result = ref<JwtResult | null>(null)
const error = ref('')
const activePart = ref<'header' | 'payload'>('payload')
const sample = createSampleJwt()
const currentJson = computed(() => result.value ? JSON.stringify(result.value[activePart.value], null, 2) : '')

function decode() {
  error.value = ''
  result.value = null
  try {
    result.value = parseJwt(token.value)
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : '无法解析这个 JWT'
  }
}

function loadSample() {
  token.value = sample
  decode()
}
</script>

<template>
  <section class="tool-workbench tool-jwt-workbench" aria-label="JWT 解析器">
    <article class="tool-panel tool-jwt-input-panel">
      <header class="tool-panel-head"><div><span class="tool-panel-label">TOKEN</span><strong>粘贴 JWT</strong></div><button type="button" class="tool-text-button" @click="loadSample"><FileKey2 :size="15" /> 加载示例</button></header>
      <textarea v-model="token" class="tool-code-input tool-token-input" spellcheck="false" aria-label="JWT 输入" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." @input="result = null; error = ''"></textarea>
      <div class="tool-jwt-segments" aria-hidden="true"><span>Header</span><i>.</i><span>Payload</span><i>.</i><span>Signature</span></div>
      <button type="button" class="tool-primary-button tool-wide-button" @click="decode"><ShieldAlert :size="16" /> 解析 Token</button>
      <p v-if="error" class="tool-diagnostic" role="alert">{{ error }}</p>
      <p class="tool-field-note">解析只在本地进行。能解码不代表签名有效，服务端仍需重新验证。</p>
    </article>

    <article class="tool-panel tool-jwt-result-panel">
      <header class="tool-panel-head"><div><span class="tool-panel-label">DECODED</span><strong>解析结果</strong></div><span v-if="result" :class="['tool-state-badge', `is-${result.algorithmState}`]">{{ result.algorithm || '未知算法' }}</span></header>
      <template v-if="result">
        <div :class="['tool-security-note', `is-${result.algorithmState}`]"><AlertTriangle v-if="result.algorithmState !== 'ok'" :size="16" /><CheckCircle2 v-else :size="16" /><span>{{ result.algorithmMessage }}</span></div>
        <div class="tool-tabs" role="tablist" aria-label="JWT 片段"><button type="button" role="tab" :aria-selected="activePart === 'header'" :class="{ 'is-active': activePart === 'header' }" @click="activePart = 'header'">Header</button><button type="button" role="tab" :aria-selected="activePart === 'payload'" :class="{ 'is-active': activePart === 'payload' }" @click="activePart = 'payload'">Payload</button></div>
        <div class="tool-json-block"><div class="tool-json-block-head"><span>{{ activePart }}.json</span><CopyButton :value="currentJson" label="复制 JSON" /></div><pre><code>{{ currentJson }}</code></pre></div>
        <section v-if="result.timeStatuses.length" class="tool-claims" aria-labelledby="claims-title"><h2 id="claims-title"><Clock3 :size="15" /> 标准 Claims</h2><div v-for="status in result.timeStatuses" :key="status.claim" class="tool-claim-row"><span>{{ status.label }} <small>{{ status.claim }}</small></span><span><code>{{ status.formatted }}</code><b :class="`is-${status.state}`">{{ status.message }}</b></span></div></section>
        <p class="tool-signature-note">Signature 片段：{{ result.signatureLength }} 个字符，仅作结构展示。</p>
      </template>
      <div v-else class="tool-empty-state"><Clipboard :size="28" /><strong>解析结果会显示在这里</strong><span>Header、Payload 和时间 Claims 会分开呈现。</span></div>
    </article>
  </section>
</template>
