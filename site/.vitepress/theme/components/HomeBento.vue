<script setup lang="ts">
import {
  ArrowRight,
  Bot,
  Box,
  Braces,
  ChartNoAxesColumnIncreasing,
  Code2,
  Database,
  Eye,
  FileText,
  Fingerprint,
  FolderKanban,
  KeyRound,
  Search,
  Sparkles,
  Tag,
  Timer,
  Wrench,
} from '@lucide/vue'
import VieWordmark from './VieWordmark.vue'

const metrics = [
  { label: '文章', value: '56', unit: '篇', icon: FileText, tone: 'blue' },
  { label: '项目', value: '12', unit: '个', icon: FolderKanban, tone: 'orange' },
  { label: '工具', value: '3', unit: '个', icon: Wrench, tone: 'green' },
  { label: '标签', value: '28', unit: '个', icon: Tag, tone: 'slate' },
]

const articles = [
  {
    title: 'Spring Boot 3.x 新特性实践指南',
    description: '深入探索 Spring Boot 3.x 带来的变化和新特性，包括性能提升、原生镜像支持等。',
    tags: ['Java'],
    date: '2024-05-20',
    views: '1.2k',
    icon: Sparkles,
    tone: 'spring',
    featured: true,
  },
  {
    title: '高并发下的数据库设计思考',
    description: '在高并发场景下，如何设计合理的数据库结构和索引策略，提升系统性能。',
    tags: ['MySQL'],
    date: '2024-05-18',
    views: '892',
    icon: Database,
    tone: 'database',
  },
  {
    title: '从零搭建一个 AI 对话系统',
    description: '基于大语言模型，搭建属于自己的 AI 对话系统，支持多轮对话和知识库。',
    tags: ['AI', 'Python'],
    date: '2024-05-15',
    views: '1.5k',
    icon: Bot,
    tone: 'ai',
  },
]

const projects = [
  {
    name: 'API Fox',
    description: '高效的 API 管理和调试工具，支持接口文档生成、调试、Mock 等功能',
    tags: ['Go', 'Gin', 'Vue3'],
    views: '256',
    icon: Code2,
    tone: 'fox',
  },
  {
    name: 'ChatAI',
    description: '基于大语言模型的 AI 对话系统，支持多模型切换和自定义知识库',
    tags: ['Python', 'FastAPI', 'React'],
    views: '189',
    icon: Bot,
    tone: 'chat',
  },
  {
    name: 'TinyCache',
    description: '轻量级分布式缓存组件，支持多种缓存策略和数据模式',
    tags: ['Java', 'Redis', 'Spring'],
    views: '156',
    icon: Box,
    tone: 'cache',
  },
]

const utilities = [
  { name: 'JSON 工作台', description: '校验、格式化和压缩 JSON', href: '/tools/json', icon: Braces, tone: 'pink' },
  { name: '时间戳转换', description: '时间戳与日期格式转换', href: '/tools/timestamp', icon: Timer, tone: 'cyan' },
  { name: 'JWT 解析器', description: '解码 Token 并检查 Claims', href: '/tools/jwt', icon: KeyRound, tone: 'blue' },
]
</script>

<template>
  <div class="dn-page">
    <header class="dn-nav">
      <VieWordmark to="/" size="nav" />
      <nav aria-label="首页导航">
        <a class="is-active" href="/">首页</a>
        <a href="/articles/">文章</a>
        <a href="/projects">项目</a>
        <a href="#utilities">工具</a>
        <a href="#about">关于</a>
      </nav>
      <div class="dn-nav-actions">
        <a class="dn-search" href="/articles/" aria-label="搜索文章">
          <Search :size="17" />
          <span>搜索</span>
        </a>
        <a class="dn-avatar" href="https://github.com/creatawork" aria-label="GitHub 主页">V</a>
      </div>
    </header>

    <main>
      <section class="dn-hero" aria-labelledby="dn-title">
        <div class="dn-hero-copy">
          <h1 id="dn-title">你好，我是 <span>vie</span></h1>
          <p class="dn-role">后端开发工程师 / 技术记录者 / 工具创造者</p>
          <p class="dn-intro">热爱技术，喜欢探索和分享。<br>这里记录我的学习心得、开发经验和有趣的技术实践。</p>
          <div class="dn-hero-actions">
            <a class="dn-primary-btn" href="/articles/">阅读文章</a>
            <span aria-hidden="true">+</span>
            <a class="dn-secondary-btn" href="/projects">探索项目</a>
          </div>
        </div>

        <div class="dn-hero-visual" aria-label="编程工作台插画" role="img">
          <div class="dn-visual-glow"></div>
          <div class="dn-float dn-float-ai">AI</div>
          <div class="dn-float dn-float-chart"><ChartNoAxesColumnIncreasing :size="32" /></div>
          <div class="dn-float dn-float-code"><Code2 :size="25" /></div>
          <div class="dn-isometric-desk">
            <div class="dn-screen">
              <div class="dn-screen-dots"><i></i><i></i><i></i></div>
              <span class="code-green">const</span> dev = {<br>
              &nbsp;&nbsp;focus: <span class="code-aqua">'build'</span>,<br>
              &nbsp;&nbsp;status: <span class="code-aqua">'learning'</span><br>
              }
            </div>
            <div class="dn-screen-neck"></div>
            <div class="dn-screen-base"></div>
            <div class="dn-keyboard-lines"><i></i><i></i><i></i><i></i></div>
            <div class="dn-mouse"></div>
            <div class="dn-cup"></div>
            <div class="dn-plant"><i></i><i></i><i></i><b></b></div>
          </div>
        </div>
      </section>

      <section class="dn-metrics" aria-label="站点数据">
        <article v-for="item in metrics" :key="item.label" :class="`tone-${item.tone}`">
          <span class="dn-icon-well"><component :is="item.icon" :size="22" /></span>
          <div><p>{{ item.label }}</p><strong>{{ item.value }}</strong> <small>{{ item.unit }}</small></div>
          <span class="dn-trend">↑</span>
        </article>
      </section>

      <section class="dn-section" aria-labelledby="latest-title">
        <div class="dn-section-head">
          <h2 id="latest-title">最新文章</h2>
          <a href="/articles/">查看全部 <ArrowRight :size="16" /></a>
        </div>
        <div class="dn-article-grid">
          <a v-for="item in articles" :key="item.title" href="/articles/" class="dn-article-card">
            <div :class="`dn-cover tone-${item.tone}`">
              <span v-if="item.featured" class="dn-recommend">推荐</span>
              <component :is="item.icon" :size="56" stroke-width="1.35" />
              <strong v-if="item.tone === 'spring'">Spring Boot 3</strong>
            </div>
            <div class="dn-card-body">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
              <div class="dn-meta">
                <span class="dn-tags"><i v-for="tagName in item.tags" :key="tagName">{{ tagName }}</i></span>
                <time>{{ item.date }}</time>
                <span><Eye :size="13" /> {{ item.views }}</span>
              </div>
            </div>
          </a>
        </div>
      </section>

      <section class="dn-section" aria-labelledby="projects-title">
        <div class="dn-section-head">
          <h2 id="projects-title">精选项目</h2>
          <a href="/projects">查看全部 <ArrowRight :size="16" /></a>
        </div>
        <div class="dn-project-grid">
          <article v-for="project in projects" :key="project.name" class="dn-project-card">
            <span :class="`dn-project-icon tone-${project.tone}`"><component :is="project.icon" :size="32" /></span>
            <div class="dn-project-main">
              <h3>{{ project.name }}</h3>
              <p>{{ project.description }}</p>
              <div class="dn-meta">
                <span class="dn-tags"><i v-for="tagName in project.tags" :key="tagName">{{ tagName }}</i></span>
                <span><Eye :size="13" /> {{ project.views }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="utilities" class="dn-section" aria-labelledby="tools-title">
        <div class="dn-section-head">
          <h2 id="tools-title">实用工具</h2>
          <a href="/tools">查看全部 <ArrowRight :size="16" /></a>
        </div>
        <div class="dn-tool-grid">
          <a v-for="item in utilities" :key="item.name" :href="item.href" :class="`dn-tool tone-${item.tone}`">
            <span><component :is="item.icon" :size="23" /></span>
            <div><h3>{{ item.name }}</h3><p>{{ item.description }}</p></div>
            <strong>使用</strong>
          </a>
        </div>
      </section>

      <aside class="dn-quote">
        <span><Code2 :size="21" /></span>
        <p>技术的深度决定了你能走多远，技术的广度决定了你能看到多大世界。</p>
        <small>—— 持续学习，持续成长</small>
      </aside>
    </main>

    <footer id="about" class="dn-footer">
      <div class="dn-footer-brand">
        <VieWordmark to="/" size="nav" />
        <p>记录技术、分享经验、创造价值</p>
        <small>© 2024 vie. All rights reserved.</small>
      </div>
      <nav aria-label="底部导航"><strong>导航</strong><a href="/">首页</a><a href="/articles/">文章</a><a href="/projects">项目</a><a href="#utilities">工具</a><a href="#about">关于</a></nav>
      <nav aria-label="文章分类"><strong>分类</strong><a href="/articles/">后端开发</a><a href="/articles/">系统设计</a><a href="/articles/">数据库</a><a href="/articles/">AI/机器学习</a><a href="/articles/">工具分享</a></nav>
      <nav aria-label="联系方式"><strong>联系</strong><a href="https://github.com/creatawork"><Code2 :size="15" /> GitHub</a><a href="mailto:hello@vie.dev">邮箱</a><a href="/articles/">微信</a></nav>
      <a class="dn-backtop" href="#" aria-label="回到顶部">↑</a>
    </footer>
  </div>
</template>
