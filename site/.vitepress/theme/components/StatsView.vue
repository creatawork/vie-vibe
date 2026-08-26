<script setup lang="ts">
import { computed, ref } from 'vue'
import VieShell from './VieShell.vue'

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
  Math.max(1, ...(data.value?.trend.map((d) => d.pv) ?? [1])))
</script>

<template>
  <VieShell path="stats-view" hint="private">
    <section v-if="!data" class="vie-panel vie-panel--gate">
      <div class="vie-tile-tab vie-mono">auth/required</div>
      <p class="vie-code-comment vie-mono">// 输入口令查看统计数据</p>
      <div class="vie-gate-form">
        <input
          v-model="key"
          type="password"
          class="vie-gate-input vie-mono"
          placeholder="key"
          @keyup.enter="load"
        />
        <button type="button" class="vie-run-btn" :disabled="loading" @click="load">
          <span class="vie-mono">→</span>
          {{ loading ? 'loading…' : 'unlock' }}
        </button>
      </div>
      <p v-if="error" class="vie-gate-error vie-mono">{{ error }}</p>
    </section>

    <template v-else>
      <div class="vie-stats-cards">
        <div class="vie-tile vie-stats-card">
          <span class="vie-badge vie-mono">total</span>
          <b class="vie-stats-num">{{ data.totalPv }}</b>
          <span class="vie-mono vie-stats-label">PV</span>
        </div>
        <div class="vie-tile vie-stats-card">
          <span class="vie-badge vie-mono">users</span>
          <b class="vie-stats-num">{{ data.totalUv }}</b>
          <span class="vie-mono vie-stats-label">累计 UV</span>
        </div>
        <div class="vie-tile vie-stats-card">
          <span class="vie-badge vie-mono">today</span>
          <b class="vie-stats-num">{{ data.todayPv }}</b>
          <span class="vie-mono vie-stats-label">今日 PV</span>
        </div>
        <div class="vie-tile vie-stats-card">
          <span class="vie-badge vie-mono">today</span>
          <b class="vie-stats-num">{{ data.todayUv }}</b>
          <span class="vie-mono vie-stats-label">今日 UV</span>
        </div>
      </div>

      <section class="vie-panel">
        <div class="vie-tile-tab vie-mono">metrics/trend_30d</div>
        <div class="vie-trend" role="img" aria-label="近 30 天 PV 趋势">
          <div
            v-for="d in data.trend"
            :key="d.date"
            class="vie-trend-bar"
            :title="`${d.date}：PV ${d.pv} / UV ${d.uv}`"
            :style="{ height: (d.pv / maxPv * 100) + '%' }"
          />
        </div>
      </section>

      <section class="vie-panel">
        <div class="vie-tile-tab vie-mono">metrics/top_pages</div>
        <div class="vie-table-wrap">
          <table class="vie-table vie-mono">
            <thead>
              <tr><th>path</th><th>pv</th></tr>
            </thead>
            <tbody>
              <tr v-for="p in data.topPages" :key="p.path">
                <td>{{ p.path }}</td>
                <td>{{ p.pv }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="vie-panel">
        <div class="vie-tile-tab vie-mono">metrics/sources</div>
        <div class="vie-table-wrap">
          <table class="vie-table vie-mono">
            <thead>
              <tr><th>source</th><th>pv</th></tr>
            </thead>
            <tbody>
              <tr v-for="s in data.sources" :key="s.source">
                <td>{{ s.source }}</td>
                <td>{{ s.pv }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </VieShell>
</template>
