<script setup lang="ts">
import { data as posts } from '../../../articles.data'
import { data as projects } from '../../../projects.data'
import { data as seriesGroups } from '../../../series.data'
import VieWordmark from './VieWordmark.vue'

const SERIES_NAME = '个人网站开发实录'
const POSITIONING = '应届 · 全栈 · 文章是决策日志，成果是上线证明'

const latest = posts.slice(0, 6)
const lead = projects.find((p) => p.featured) ?? projects[0]
const series = seriesGroups.find((g) => g.name === SERIES_NAME)
const overview = posts.find((p) => p.url.includes('how-this-site-works'))
const heroPost = latest[0]
const morePosts = latest.slice(1, 6)
const leadDecisions = lead?.decisions?.slice(0, 3) ?? []
</script>

<template>
  <div class="vie-bento-home">
    <header class="vie-home-hero">
      <VieWordmark size="display" />
      <p class="vie-home-meta vie-mono" aria-hidden="true">
        <span class="vie-status-dot" />
        vie-vibe.cn
        <span class="vie-status-sep">·</span>
        {{ posts.length }} posts
        <span class="vie-status-sep">·</span>
        <span class="vie-syntax-fn">live</span>
      </p>
      <p class="vie-home-tagline vie-code-comment vie-mono">// 全栈开发 · 技术实现细节与思路</p>
      <h1 id="home-thesis" class="vie-home-thesis vie-mono">
        <span class="vie-syntax-kw">const</span>
        <span class="vie-syntax-fn"> thesis</span>
        <span class="vie-syntax-op"> = </span>
        <span class="vie-syntax-str">"写清楚每一个技术决策"</span>
        <span class="vie-cursor" aria-hidden="true" />
      </h1>
      <p class="vie-home-positioning vie-code-comment vie-mono">// {{ POSITIONING }}</p>
      <div class="vie-home-actions">
        <a class="vie-run-btn" href="/articles/">
          <span class="vie-mono" aria-hidden="true">→</span>
          阅读文章
        </a>
        <a class="vie-ghost-btn" href="/projects">查看成果</a>
      </div>
    </header>

    <div class="vie-home-grid">
      <section class="vie-home-card vie-home-articles" aria-labelledby="home-articles">
        <div class="vie-home-card__header">
          <h2 id="home-articles" class="vie-home-card__title vie-mono">articles/recent</h2>
          <a class="vie-home-card__action vie-mono" href="/articles/">全部 →</a>
        </div>
        <div class="vie-home-card__body">
          <a v-if="heroPost" class="vie-home-featured" :href="heroPost.url">
            <span class="vie-home-featured__badge vie-mono">{{ heroPost.category }}</span>
            <h3>{{ heroPost.title }}</h3>
            <p v-if="heroPost.description" class="vie-home-featured__desc">{{ heroPost.description }}</p>
            <p class="vie-home-featured__meta vie-mono">
              {{ heroPost.date.slice(0, 10) }} · ~{{ heroPost.readingTime }}min
            </p>
          </a>
          <ul v-if="morePosts.length" class="vie-home-list">
            <li v-for="(p, i) in morePosts" :key="p.url">
              <span class="vie-ln vie-mono">{{ String(i + 1).padStart(2, '0') }}</span>
              <a :href="p.url">{{ p.title }}</a>
              <span v-if="p.description" class="desc">{{ p.description }}</span>
              <span class="meta">{{ p.category }} · {{ p.date.slice(0, 10) }}</span>
            </li>
          </ul>
        </div>
      </section>

      <aside class="vie-home-rail">
        <article v-if="lead" class="vie-home-card vie-home-proof">
          <div class="vie-home-card__header">
            <h2 class="vie-home-card__title vie-mono">projects/featured</h2>
            <span class="vie-home-proof__badge vie-mono">ship</span>
          </div>
          <img
            v-if="lead.image"
            :src="lead.image"
            :alt="lead.name"
            class="vie-home-proof__media"
            loading="lazy"
            decoding="async"
          />
          <div class="vie-home-card__body">
            <h3 class="vie-home-proof__name">{{ lead.name }}</h3>
            <p class="vie-home-proof__desc">{{ lead.description }}</p>
            <div class="vie-chip-row">
              <span v-for="t in lead.tags.slice(0, 4)" :key="t" class="vie-chip vie-chip--accent">{{ t }}</span>
            </div>
            <ul v-if="leadDecisions.length" class="vie-home-decisions">
              <li v-for="(d, j) in leadDecisions" :key="j">
                <a v-if="d.href" :href="d.href">{{ d.text }}</a>
                <span v-else>{{ d.text }}</span>
              </li>
            </ul>
            <div class="vie-link-row vie-mono">
              <a v-if="lead.github" :href="lead.github" target="_blank" rel="noopener">GitHub</a>
              <a v-if="lead.demo" :href="lead.demo" target="_blank" rel="noopener">Demo</a>
              <a href="/projects">详情</a>
            </div>
          </div>
        </article>

        <a
          v-if="series"
          class="vie-home-link"
          :href="'/series/' + encodeURIComponent(series.name)"
        >
          <div>
            <p class="vie-home-link__label vie-mono">series</p>
            <p class="vie-home-link__title">{{ series.name }}</p>
            <p class="vie-home-link__meta">{{ series.posts.length }} 篇连载</p>
          </div>
          <span class="vie-home-link__arrow vie-mono" aria-hidden="true">→</span>
        </a>

        <a v-if="overview" class="vie-home-link" :href="overview.url">
          <div>
            <p class="vie-home-link__label vie-mono">read</p>
            <p class="vie-home-link__title">{{ overview.title }}</p>
            <p v-if="overview.description" class="vie-home-link__meta">{{ overview.description }}</p>
          </div>
          <span class="vie-home-link__arrow vie-mono" aria-hidden="true">→</span>
        </a>

        <div class="vie-home-stats" aria-label="站点规模">
          <div class="vie-home-stat">
            <b>{{ posts.length }}</b>
            <span class="vie-mono">posts</span>
          </div>
          <div class="vie-home-stat">
            <b>{{ seriesGroups.length }}</b>
            <span class="vie-mono">series</span>
          </div>
          <div class="vie-home-stat">
            <b>{{ projects.length }}</b>
            <span class="vie-mono">ships</span>
          </div>
          <div class="vie-home-stat">
            <b class="vie-syntax-fn">live</b>
            <span class="vie-mono">status</span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
