<script setup lang="ts">
import { data as posts } from '../../../articles.data'
import { data as projects } from '../../../projects.data'
import { data as seriesGroups } from '../../../series.data'

const SERIES_NAME = '个人网站开发实录'
const POSITIONING = '应届 · 全栈 · 文章是决策日志，成果是上线证明'

const latest = posts.slice(0, 6)
const lead = projects.find((p) => p.featured) ?? projects[0]
const series = seriesGroups.find((g) => g.name === SERIES_NAME)
const overview = posts.find((p) => p.url.includes('how-this-site-works'))
const heroPost = latest[0]
const morePosts = latest.slice(1, 6)

const stack = ['VitePress', 'Vue 3', 'SpringBoot', 'Docker', 'GitHub Actions', 'TypeScript']
</script>

<template>
  <div class="vie-bento-home">
    <div class="vie-status-bar" aria-hidden="true">
      <span class="vie-status-dot" />
      <span>vie-vibe.cn</span>
      <span class="vie-status-sep">·</span>
      <span class="vie-mono">{{ posts.length }} posts</span>
      <span class="vie-status-sep">·</span>
      <span class="vie-mono">{{ projects.length }} projects</span>
      <span class="vie-status-sep">·</span>
      <span class="vie-mono vie-syntax-fn">vibe-coding</span>
    </div>

    <div class="vie-bento-grid">
      <section class="vie-tile vie-tile--thesis" aria-labelledby="home-thesis">
        <div class="vie-tile-tab vie-mono">src/index.tsx</div>
        <p class="vie-code-comment">// 全栈开发 · 技术实现细节与思路</p>
        <h1 id="home-thesis" class="vie-tile-title">
          <span class="vie-syntax-kw">const</span>
          <span class="vie-syntax-fn"> thesis</span>
          <span class="vie-syntax-op"> = </span>
          <span class="vie-syntax-str">"写清楚每一个技术决策"</span>
          <span class="vie-cursor" aria-hidden="true" />
        </h1>
        <p class="vie-code-comment vie-mono">// {{ POSITIONING }}</p>
        <div class="vie-stack-chips" aria-label="技术栈">
          <span v-for="s in stack" :key="s" class="vie-chip">{{ s }}</span>
        </div>
        <div class="vie-tile-actions">
          <a class="vie-run-btn" href="/articles/">
            <span class="vie-mono" aria-hidden="true">→</span>
            阅读文章
          </a>
          <a class="vie-ghost-btn vie-mono" href="/projects">open projects/</a>
          <a class="vie-ghost-btn vie-mono" href="/series/">ls series/</a>
        </div>
      </section>

      <article v-if="lead" class="vie-tile vie-tile--ship">
        <div class="vie-tile-tab vie-mono">projects/featured</div>
        <span class="vie-badge vie-mono">ship</span>
        <h2>{{ lead.name }}</h2>
        <p>{{ lead.description }}</p>
        <div class="vie-chip-row">
          <span v-for="t in lead.tags" :key="t" class="vie-chip vie-chip--accent">{{ t }}</span>
        </div>
        <div class="vie-link-row vie-mono">
          <a v-if="lead.github" :href="lead.github" target="_blank" rel="noopener">gh</a>
          <a v-if="lead.demo" :href="lead.demo" target="_blank" rel="noopener">demo</a>
        </div>
      </article>

      <section class="vie-tile vie-tile--metrics" aria-label="站点规模">
        <div class="vie-tile-tab vie-mono">metrics/</div>
        <div class="vie-metrics-grid">
          <div class="vie-metric">
            <b>{{ posts.length }}</b>
            <span class="vie-mono">posts</span>
          </div>
          <div class="vie-metric">
            <b>{{ seriesGroups.length }}</b>
            <span class="vie-mono">series</span>
          </div>
          <div class="vie-metric">
            <b>{{ projects.length }}</b>
            <span class="vie-mono">ships</span>
          </div>
          <div class="vie-metric">
            <b class="vie-syntax-fn">live</b>
            <span class="vie-mono">status</span>
          </div>
        </div>
      </section>

      <a
        v-if="heroPost"
        class="vie-tile vie-tile--post"
        :href="heroPost.url"
      >
        <div class="vie-tile-tab vie-mono">articles/latest.md</div>
        <span class="vie-badge vie-mono vie-badge--post">{{ heroPost.category }}</span>
        <h2>{{ heroPost.title }}</h2>
        <p class="vie-mono vie-tile-meta">
          {{ heroPost.date.slice(0, 10) }} · ~{{ heroPost.readingTime }}min
        </p>
      </a>

      <section class="vie-tile vie-tile--feed" aria-labelledby="recent-feed">
        <div class="vie-tile-tab vie-mono">articles/recent</div>
        <h2 id="recent-feed" class="vie-feed-label vie-mono">recent[]</h2>
        <ul class="vie-feed">
          <li v-for="(p, i) in morePosts" :key="p.url">
            <span class="vie-ln vie-mono">{{ String(i + 1).padStart(2, '0') }}</span>
            <a :href="p.url">{{ p.title }}</a>
            <span class="vie-feed-desc">{{ p.description }}</span>
            <span class="vie-feed-meta vie-mono">{{ p.category }} · {{ p.date.slice(0, 10) }}</span>
          </li>
        </ul>
        <a class="vie-more vie-mono" href="/articles/">ls articles/ →</a>
      </section>

      <a
        v-if="series"
        class="vie-tile vie-tile--ship vie-tile--ship-sm"
        :href="'/series/' + encodeURIComponent(series.name)"
      >
        <div class="vie-tile-tab vie-mono">series/log</div>
        <span class="vie-badge vie-mono">series</span>
        <h2>{{ series.name }}</h2>
        <p class="vie-mono vie-tile-meta">{{ series.posts.length }} posts</p>
      </a>

      <a
        v-if="overview"
        class="vie-tile vie-tile--ship vie-tile--ship-sm"
        :href="overview.url"
      >
        <div class="vie-tile-tab vie-mono">articles/meta</div>
        <span class="vie-badge vie-mono">read</span>
        <h2>{{ overview.title }}</h2>
        <p class="vie-mono vie-tile-meta">{{ overview.description }}</p>
      </a>

      <section class="vie-tile vie-tile--terminal" aria-label="站点说明">
        <div class="vie-tile-tab vie-mono">~</div>
        <pre class="vie-mono vie-terminal"><code><span class="vie-syntax-fn">$</span> vie whoami
<span class="vie-syntax-str">full-stack builder</span>
<span class="vie-syntax-comment">// posts = decision logs</span>
<span class="vie-syntax-comment">// projects = shipped proof</span>
<span class="vie-syntax-kw">export</span> <span class="vie-syntax-op">{</span> <span class="vie-syntax-fn">read</span>, <span class="vie-syntax-fn">ship</span> <span class="vie-syntax-op">}</span></code></pre>
      </section>
    </div>
  </div>
</template>
