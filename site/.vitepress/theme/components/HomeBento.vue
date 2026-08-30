<script setup lang="ts">
import { data as posts } from '../../../articles.data'
import { data as projects } from '../../../projects.data'
import { data as seriesGroups } from '../../../series.data'
import VieWordmark from './VieWordmark.vue'

const latest = posts.slice(0, 6)
const featuredPosts = latest.slice(0, 3)
const featuredProjects = projects.slice(0, 3)
const tagCount = new Set(posts.flatMap((p) => p.tags)).size

const tools = [
  { name: 'JSON 格式化', desc: '美化和验证常见 JSON 数据', tone: 'pink' },
  { name: '时间戳转换', desc: '时间戳与日期格式转换', tone: 'cyan' },
  { name: 'UUID 生成器', desc: '生成不同格式的 UUID', tone: 'blue' },
  { name: '密钥生成器', desc: '生成安全的随机密钥', tone: 'orange' },
]

const metrics = [
  { label: '文章', value: posts.length, unit: '篇', tone: 'blue' },
  { label: '项目', value: projects.length, unit: '个', tone: 'orange' },
  { label: '系列', value: seriesGroups.length, unit: '组', tone: 'green' },
  { label: '标签', value: tagCount, unit: '个', tone: 'slate' },
]
</script>

<template>
  <div class="vie-bento-home">
    <section class="vie-hero">
      <div class="vie-hero__copy">
        <VieWordmark size="display" />
        <h1>你好，我是 <span>Vie</span></h1>
        <p class="vie-hero__role">后端开发工程师 / 技术记录者 / 工具创造者</p>
        <p class="vie-home-positioning">应届 · 全栈 · 文章是决策日志，成果是上线证明</p>
        <p class="vie-hero__intro">
          热爱技术，喜欢探索和分享。这里记录我的学习心得、开发经验和有趣的技术实践。
        </p>
        <div class="vie-home-actions">
          <a class="vie-run-btn" href="/articles/">阅读文章</a>
          <a class="vie-ghost-btn" href="/projects">探索项目</a>
        </div>
      </div>

      <div class="vie-hero-art" aria-hidden="true">
        <div class="vie-orbit vie-orbit--ai">AI</div>
        <div class="vie-orbit vie-orbit--chart">
          <i></i><i></i><i></i>
        </div>
        <div class="vie-desk">
          <div class="vie-monitor">
            <div class="vie-monitor__bar"></div>
            <p><span>const</span> site = 'Vie'</p>
            <p><span>ship</span>('/articles')</p>
            <p><span>track</span>('/api')</p>
          </div>
          <div class="vie-stand"></div>
          <div class="vie-keyboard"></div>
          <div class="vie-mouse"></div>
          <div class="vie-plant"><i></i><i></i><i></i></div>
        </div>
      </div>
    </section>

    <section class="vie-metric-grid" aria-label="站点规模">
      <article v-for="m in metrics" :key="m.label" class="vie-metric-card" :class="'is-' + m.tone">
        <span class="vie-metric-icon" aria-hidden="true"></span>
        <p>{{ m.label }}</p>
        <strong>{{ m.value }}</strong>
        <small>{{ m.unit }}</small>
      </article>
    </section>

    <section class="vie-section" aria-labelledby="home-articles">
      <div class="vie-section-head">
        <h2 id="home-articles">最新文章</h2>
        <a href="/articles/">查看全部 →</a>
      </div>
      <div class="vie-article-cards">
        <a
          v-for="(post, i) in featuredPosts"
          :key="post.url"
          class="vie-article-card"
          :class="{ 'is-featured': i === 0 }"
          :href="post.url"
        >
          <div class="vie-article-cover" :class="'tone-' + post.category">
            <span v-if="i === 0" class="vie-pin">推荐</span>
            <strong>{{ post.category }}</strong>
          </div>
          <div class="vie-article-card__body">
            <h3>{{ post.title }}</h3>
            <p>{{ post.description }}</p>
            <div class="vie-card-meta">
              <span>{{ post.tags[0] ?? post.category }}</span>
              <time>{{ post.date.slice(0, 10) }}</time>
            </div>
          </div>
        </a>
      </div>
    </section>

    <section class="vie-section" aria-labelledby="home-projects">
      <div class="vie-section-head">
        <h2 id="home-projects">精选项目</h2>
        <a href="/projects">查看全部 →</a>
      </div>
      <div class="vie-project-strip">
        <article
          v-for="project in featuredProjects"
          :key="project.name"
          class="vie-mini-project"
        >
          <div class="vie-project-mark" aria-hidden="true">{{ project.name.slice(0, 2) }}</div>
          <div class="vie-mini-project__main">
            <h3>{{ project.name }}</h3>
            <p>{{ project.description }}</p>
            <div class="vie-chip-row">
              <span v-for="t in project.tags.slice(0, 3)" :key="t" class="vie-chip">{{ t }}</span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="vie-section" aria-labelledby="home-tools">
      <div class="vie-section-head">
        <h2 id="home-tools">实用工具</h2>
        <a href="/series/">查看系列 →</a>
      </div>
      <div class="vie-tool-grid">
        <article v-for="tool in tools" :key="tool.name" class="vie-tool-card" :class="'is-' + tool.tone">
          <span class="vie-tool-icon" aria-hidden="true"></span>
          <h3>{{ tool.name }}</h3>
          <p>{{ tool.desc }}</p>
          <a href="/articles/">使用</a>
        </article>
      </div>
    </section>

    <aside class="vie-quote">
      <span aria-hidden="true">&lt;/&gt;</span>
      <p>技术的深度决定了你能走多远，技术的广度决定了你能看到多大世界。</p>
      <small>持续学习，持续成长</small>
    </aside>
  </div>
</template>
