<script setup lang="ts">
import { AlertTriangle, CheckCircle2, Clipboard, Clock3, ShieldAlert } from '@lucide/vue'
import { computed, ref } from 'vue'
import CopyButton from './CopyButton.vue'
import { parseJwt, type JwtResult } from '../../tools/jwt'

const token = ref('')
const result = ref<JwtResult | null>(null)
const error = ref('')
const activePart = ref<'header' | 'payload'>('payload')
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

function onTabKeydown(event: KeyboardEvent) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const nextPart = event.key === 'Home' ? 'header' : event.key === 'End' ? 'payload' : activePart.value === 'header' ? 'payload' : 'header'
  activePart.value = nextPart
  const tab = event.currentTarget as HTMLButtonElement
  tab.parentElement?.querySelector<HTMLButtonElement>(`#jwt-tab-${nextPart}`)?.focus()
}
</script>

<template>
  <section class="tool-workbench tool-jwt-workbench" aria-label="JWT 解析器">
    <article class="tool-panel tool-jwt-input-panel">
      <header class="tool-panel-head"><div><span class="tool-panel-label">TOKEN</span><strong>粘贴 JWT</strong></div></header>
      <textarea v-model="token" class="tool-code-input tool-token-input" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="JWT 输入" :aria-invalid="!!error" :aria-describedby="error ? 'jwt-error jwt-note' : 'jwt-note'" placeholder="在这里粘贴要解析的 JWT" @input="result = null; error = ''" @keydown.ctrl.enter.prevent="decode" @keydown.meta.enter.prevent="decode"></textarea>
      <div class="tool-jwt-segments" aria-hidden="true"><span>Header</span><i>.</i><span>Payload</span><i>.</i><span>Signature</span></div>
      <button type="button" class="tool-primary-button tool-wide-button" @click="decode"><ShieldAlert :size="16" /> 解析 Token</button>
      <p v-if="error" id="jwt-error" class="tool-diagnostic" role="alert">{{ error }}</p>
      <p id="jwt-note" class="tool-field-note">按 Ctrl / ⌘ + Enter 解析。解析只在本地进行，服务端仍需验证签名。</p>
    </article>

    <article class="tool-panel tool-jwt-result-panel">
      <header class="tool-panel-head"><div><span class="tool-panel-label">DECODED</span><strong>解析结果</strong></div><span v-if="result" :class="['tool-state-badge', `is-${result.algorithmState}`]">{{ result.algorithm || '未知算法' }}</span></header>
      <span class="tool-sr-only" role="status">{{ result ? 'JWT 已解析，可查看 Header、Payload 和时间 Claims' : '' }}</span>
      <template v-if="result">
        <div :class="['tool-security-note', `is-${result.algorithmState}`]"><AlertTriangle v-if="result.algorithmState !== 'ok'" :size="16" /><CheckCircle2 v-else :size="16" /><span>{{ result.algorithmMessage }}</span></div>
        <div class="tool-tabs" role="tablist" aria-label="JWT 片段"><button v-for="part in ['header', 'payload'] as const" :id="`jwt-tab-${part}`" :key="part" type="button" role="tab" :aria-selected="activePart === part" aria-controls="jwt-json-panel" :tabindex="activePart === part ? 0 : -1" :class="{ 'is-active': activePart === part }" @click="activePart = part" @keydown="onTabKeydown">{{ part === 'header' ? 'Header' : 'Payload' }}</button></div>
        <div id="jwt-json-panel" class="tool-json-block" role="tabpanel" :aria-labelledby="`jwt-tab-${activePart}`"><div class="tool-json-block-head"><span>{{ activePart }}.json</span><CopyButton :value="currentJson" label="复制 JSON" /></div><pre tabindex="0" :aria-label="`${activePart} JSON`"><code>{{ currentJson }}</code></pre></div>
        <section v-if="result.timeStatuses.length" class="tool-claims" aria-labelledby="claims-title"><h2 id="claims-title"><Clock3 :size="15" /> 标准 Claims</h2><div v-for="status in result.timeStatuses" :key="status.claim" class="tool-claim-row"><span>{{ status.label }} <small>{{ status.claim }}</small></span><span><code>{{ status.formatted }}</code><b :class="`is-${status.state}`">{{ status.message }}</b></span></div></section>
        <p class="tool-signature-note">Signature 片段：{{ result.signatureLength }} 个字符，仅作结构展示。</p>
      </template>
      <div v-else class="tool-empty-state"><Clipboard :size="28" /><strong>解析结果会显示在这里</strong><span>Header、Payload 和时间 Claims 会分开呈现。</span></div>
    </article>
  </section>
</template>
