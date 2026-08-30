<script setup lang="ts">
import { Braces, CheckCircle2, Clipboard, Download, Minimize2, Trash2, WandSparkles } from '@lucide/vue'
import { computed, ref } from 'vue'
import CopyButton from './CopyButton.vue'
import { formatJson, jsonStats, minifyJson, validateJson, type JsonDiagnostic } from '../../tools/json'

const initial = '{\n  "name": "Vie",\n  "stack": ["VitePress", "Vue 3"],\n  "published": true\n}'
const source = ref(initial)
const output = ref('')
const diagnostic = ref<JsonDiagnostic | null>(null)
const mode = ref<'format' | 'minify'>('format')
const notice = ref('')

const inputStats = computed(() => jsonStats(source.value))
const outputStats = computed(() => output.value ? jsonStats(output.value) : null)

function run(nextMode: 'format' | 'minify' = mode.value) {
  mode.value = nextMode
  diagnostic.value = validateJson(source.value)
  notice.value = ''
  if (diagnostic.value) {
    output.value = ''
    return
  }
  try {
    output.value = nextMode === 'format' ? formatJson(source.value).output : minifyJson(source.value).output
    notice.value = nextMode === 'format' ? 'JSON 已格式化' : 'JSON 已压缩'
  } catch (error) {
    diagnostic.value = { message: error instanceof Error ? error.message : '处理失败', line: 1, column: 1 }
    output.value = ''
  }
}

function clear() {
  source.value = ''
  output.value = ''
  diagnostic.value = null
  notice.value = ''
}

async function paste() {
  try {
    source.value = await navigator.clipboard.readText()
    run()
  } catch {
    notice.value = '无法读取剪贴板，请直接粘贴到输入区'
  }
}

function download() {
  if (!output.value) return
  const url = URL.createObjectURL(new Blob([output.value], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'formatted.json'
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="tool-workbench" aria-label="JSON 工作台">
    <div class="tool-panels tool-panels-json">
      <article class="tool-panel">
        <header class="tool-panel-head">
          <div><span class="tool-panel-label">INPUT</span><strong>粘贴 JSON</strong></div>
          <div class="tool-panel-actions"><button type="button" class="tool-text-button" @click="paste"><Clipboard :size="15" /> 粘贴</button><button type="button" class="tool-icon-button" title="清空" aria-label="清空输入" @click="clear"><Trash2 :size="16" /></button></div>
        </header>
        <textarea v-model="source" class="tool-code-input" spellcheck="false" aria-label="JSON 输入" placeholder="在这里粘贴 JSON..." @input="diagnostic = null; notice = ''"></textarea>
        <footer class="tool-panel-foot"><span>{{ inputStats.characters }} 字符 · {{ inputStats.bytes }} B · {{ inputStats.lines }} 行</span><span v-if="diagnostic" class="tool-error"><span class="tool-status-dot is-error"></span> 第 {{ diagnostic.line }} 行，第 {{ diagnostic.column }} 列</span><span v-else-if="source" class="tool-valid"><CheckCircle2 :size="14" /> JSON 有效</span></footer>
        <p v-if="diagnostic" class="tool-diagnostic" role="alert">{{ diagnostic.message }}。修改后重新处理。</p>
      </article>

      <article class="tool-panel">
        <header class="tool-panel-head">
          <div><span class="tool-panel-label">OUTPUT</span><strong>{{ mode === 'format' ? '格式化结果' : '压缩结果' }}</strong></div>
          <div class="tool-panel-actions"><CopyButton v-if="output" :value="output" label="复制结果" /><button type="button" class="tool-icon-button" title="下载 JSON" aria-label="下载 JSON" :disabled="!output" @click="download"><Download :size="16" /></button></div>
        </header>
        <pre class="tool-code-output" :aria-label="output ? 'JSON 输出' : 'JSON 输出为空'"><code>{{ output || '处理结果会显示在这里' }}</code></pre>
        <footer class="tool-panel-foot"><span v-if="outputStats">{{ outputStats.characters }} 字符 · {{ outputStats.bytes }} B · {{ outputStats.lines }} 行</span><span v-else>等待处理</span><span v-if="notice" class="tool-valid" aria-live="polite"><CheckCircle2 :size="14" /> {{ notice }}</span></footer>
      </article>
    </div>
    <div class="tool-action-row">
      <button type="button" class="tool-primary-button" @click="run('format')"><WandSparkles :size="16" /> 格式化</button>
      <button type="button" class="tool-secondary-button" @click="run('minify')"><Minimize2 :size="16" /> 压缩</button>
      <span class="tool-action-hint">严格 JSON · 最大 1 MB</span>
    </div>
  </section>
</template>
