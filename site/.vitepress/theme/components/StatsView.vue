<script setup lang="ts">
import { computed, ref } from 'vue'

interface DayPoint { date: string; pv: number; uv: number }
interface PathCount { path: string; pv: number }
interface SourceCount { source: string; pv: number }
interface Summary {
  totalPv: number; totalUv: number; todayPv: number; todayUv: number
  trend: DayPoint[]; topPages: PathCount[]; sources: SourceCount[]
}

const key = ref('')
const data = ref<Summary | null>(null)
const error = ref('')
const loading = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`/api/stats/summary?key=${encodeURIComponent(key.value)}`)
    if (!res.ok) throw new Error(res.status === 401 ? '口令错误' : `请求失败（${res.status}）`)
    data.value = await res.json()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '请求失败'
  } finally {
    loading.value = false
  }
}

const maxPv = computed(() =>
  Math.max(1, ...(data.value?.trend.map(d => d.pv) ?? [1])))
</script>

<template>
  <div v-if="!data" class="stats-gate">
    <p>输入口令查看统计数据：</p>
    <input v-model="key" type="password" placeholder="口令" @keyup.enter="load" />
    <button type="button" :disabled="loading" @click="load">查看</button>
    <p v-if="error" class="error">{{ error }}</p>
  </div>

  <div v-else>
    <div class="cards">
      <div class="card"><b>{{ data.totalPv }}</b><span>总 PV</span></div>
      <div class="card"><b>{{ data.totalUv }}</b><span>累计 UV（人次）</span></div>
      <div class="card"><b>{{ data.todayPv }}</b><span>今日 PV</span></div>
      <div class="card"><b>{{ data.todayUv }}</b><span>今日 UV</span></div>
    </div>

    <h3>近 30 天趋势</h3>
    <div class="trend">
      <div v-for="d in data.trend" :key="d.date" class="bar"
           :title="`${d.date}：PV ${d.pv} / UV ${d.uv}`"
           :style="{ height: (d.pv / maxPv * 120) + 'px' }"></div>
    </div>

    <h3>页面排行</h3>
    <table>
      <tr v-for="p in data.topPages" :key="p.path">
        <td>{{ p.path }}</td><td>{{ p.pv }}</td>
      </tr>
    </table>

    <h3>来源分布</h3>
    <table>
      <tr v-for="s in data.sources" :key="s.source">
        <td>{{ s.source }}</td><td>{{ s.pv }}</td>
      </tr>
    </table>
  </div>
</template>

<style scoped>
.cards { display: flex; gap: 1rem; flex-wrap: wrap; margin: 1rem 0; }
.card {
  border: 1px solid var(--vp-c-divider); border-radius: 8px;
  padding: 1rem 1.5rem; text-align: center;
}
.card b { display: block; font-size: 1.6rem; }
.card span { color: var(--vp-c-text-2); font-size: 0.85rem; }
.trend { display: flex; align-items: flex-end; gap: 2px; height: 120px; margin: 1rem 0; }
.bar { flex: 1; background: var(--vp-c-brand-1); min-height: 2px; border-radius: 2px 2px 0 0; }
table { width: 100%; border-collapse: collapse; }
td { padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--vp-c-divider); }
.error { color: var(--vp-c-danger-1); }
input { padding: 0.4rem 0.6rem; margin-right: 0.5rem; }
button { padding: 0.4rem 1rem; }
</style>
