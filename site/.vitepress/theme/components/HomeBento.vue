<script setup lang="ts">
import { ArrowRight, ArrowUpRight } from '@lucide/vue'
import { computed } from 'vue'
import { data as posts } from '../../../articles.data'
import { data as projects } from '../../../projects.data'
import { tools } from '../../../tools.registry'
import ProjectMediaStrip from './ProjectMediaStrip.vue'

const categoryLabels: Record<string, string> = {
  backend: '后端开发', frontend: '前端', devops: '部署运维',
  ai: 'AI 工程', meta: '建站', notes: '笔记',
}
const latestPosts = computed(() => posts.slice(0, 3))
const featuredProject = computed(() => projects.find((p) => p.featured) ?? projects[0])
const otherProjects = computed(() => projects.filter((p) => p !== featuredProject.value))
const projectHref = computed(() => featuredProject.value?.slug ? `/projects/${featuredProject.value.slug}` : '/projects')
const projectOverview = computed(() => featuredProject.value?.capabilities?.find((item) => item.title === '发布、分享与工作区协作'))
</script>

<template>
  <div class="dn-page">
    <div class="dn-home-content">
      <section class="dn-hero" aria-labelledby="dn-title">
        <div class="dn-hero-copy">
          <h1 id="dn-title" aria-label="写清楚每一个技术决策"><span>写清楚每一个</span><span>技术决策</span></h1>
          <div class="dn-hero-intro">
            <p>我是 Vie，全栈开发者。</p>
            <p>把项目做出来，把实现讲清楚。<br>在这里，记录产品实践与每一次工程取舍。</p>
          </div>
          <div class="dn-hero-actions">
            <a class="dn-primary-btn" href="/projects">查看项目 <ArrowUpRight :size="19" aria-hidden="true" /></a>
            <a class="dn-text-link" href="/articles/">阅读文章 <ArrowRight :size="18" aria-hidden="true" /></a>
          </div>
        </div>
        <div v-if="featuredProject?.media?.length" class="dn-hero-media" data-ui>
          <ProjectMediaStrip :media="featuredProject.media" variant="flagship" eager />
          <a class="dn-hero-project" :href="projectHref"><span>{{ featuredProject.name }}<small>从一组照片，到一场属于你的展览。</small></span><ArrowUpRight :size="22" aria-hidden="true" /></a>
        </div>
        <div class="dn-hero-foot">
          <dl class="dn-counts" aria-label="站点内容">
            <div><dt>技术文章</dt><dd>{{ posts.length }} <span>篇</span></dd></div>
            <div><dt>实践项目</dt><dd>{{ projects.length }} <span>个</span></dd></div>
            <div><dt>开发工具</dt><dd>{{ tools.length }} <span>个</span></dd></div>
          </dl>
          <a class="dn-text-link" href="#selected-work">从项目开始了解 <ArrowRight :size="16" aria-hidden="true" /></a>
        </div>
      </section>

      <section v-if="featuredProject" id="selected-work" class="dn-work dn-section" aria-labelledby="projects-title">
        <div class="dn-section-head">
          <h2 id="projects-title">在真实项目中实践</h2>
          <a class="dn-text-link" href="/projects">全部项目 <ArrowRight :size="18" aria-hidden="true" /></a>
        </div>
        <div class="dn-work-layout">
          <div class="dn-work-copy">
            <a :href="projectHref" class="dn-project-title"><h3>{{ featuredProject.name }}</h3><ArrowUpRight :size="25" aria-hidden="true" /></a>
            <p class="dn-project-prop">{{ featuredProject.proposition }}</p>
            <p class="dn-project-summary">{{ featuredProject.description }}</p>
            <p class="dn-project-tech">{{ featuredProject.tags.slice(0, 4).join(' / ') }}</p>
            <div class="dn-project-links">
              <a class="dn-text-link" :href="projectHref">查看实现与迭代 <ArrowRight :size="18" aria-hidden="true" /></a>
              <a v-if="featuredProject.demo" class="dn-text-link" :href="featuredProject.demo" :aria-label="`访问 ${featuredProject.name} 线上环境（新窗口打开）`" target="_blank" rel="noopener noreferrer">线上体验 <ArrowUpRight :size="18" aria-hidden="true" /></a>
            </div>
            <div v-for="project in otherProjects" :key="project.name" class="dn-other-project">
              <a :href="`/projects/${project.slug}`"><span>{{ project.name }}</span><ArrowUpRight :size="18" aria-hidden="true" /></a>
              <p>{{ project.proposition }}</p>
            </div>
          </div>
          <figure v-if="projectOverview?.image || featuredProject.image" class="dn-project-evidence">
            <a :href="projectHref" class="dn-project-image"><img :src="projectOverview?.image || featuredProject.image" :alt="projectOverview ? '阳光明媚创作者的空间概览，展示相册封面、作品整理与发布状态' : featuredProject.name + ' 项目界面'" width="1270" height="882" loading="lazy" decoding="async" /></a>
            <figcaption>创作者空间 · 从整理作品到发布分享（本地示例）</figcaption>
          </figure>
        </div>
      </section>

      <section class="dn-writing dn-section" aria-labelledby="latest-title">
        <div class="dn-section-head">
          <div><h2 id="latest-title">最近写下的思考</h2><p>从问题出发，留下可追溯的实现过程。</p></div>
          <a class="dn-text-link" href="/articles/">全部文章 <ArrowRight :size="18" aria-hidden="true" /></a>
        </div>
        <div v-if="latestPosts.length" class="dn-post-list">
          <a v-for="item in latestPosts" :key="item.url" :href="item.url" class="dn-post">
            <div class="dn-post-meta"><time :datetime="item.date.slice(0, 10)">{{ item.date.slice(0, 10) }}</time><span>{{ categoryLabels[item.category] ?? item.category }} · {{ item.readingTime }} 分钟</span></div>
            <div class="dn-post-copy"><h3>{{ item.title }}</h3><p>{{ item.description }}</p></div>
            <ArrowUpRight :size="23" aria-hidden="true" />
          </a>
        </div>
        <p v-else class="vie-empty">暂无已发布文章。</p>
        <a class="dn-series-link" href="/series/"><span>想沿着一个主题读下去？<strong>浏览系列文章</strong></span><ArrowRight :size="20" aria-hidden="true" /></a>
      </section>

      <section id="utilities" class="dn-utilities dn-section" aria-labelledby="tools-title">
        <div class="dn-tools-intro"><h2 id="tools-title">顺手的开发工具</h2><p>处理开发中的小问题。<br>数据在浏览器内完成处理。</p><a class="dn-text-link" href="/tools">打开工具箱 <ArrowRight :size="18" aria-hidden="true" /></a></div>
        <div class="dn-tool-list">
          <a v-for="tool in tools" :key="tool.href" :href="tool.href" class="dn-tool"><div><h3>{{ tool.name }}</h3><p>{{ tool.description }}</p></div><ArrowUpRight :size="22" aria-hidden="true" /></a>
        </div>
      </section>
    </div>

  </div>
</template>
