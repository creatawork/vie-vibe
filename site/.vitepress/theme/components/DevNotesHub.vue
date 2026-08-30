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
  Image,
  KeyRound,
  LayoutGrid,
  List,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
} from '@lucide/vue'

type HubKind = 'articles' | 'projects' | 'tools'

const props = defineProps<{ kind: HubKind }>()

const navItems = [
  { label: '首页', href: '/' },
  { label: '文章', href: '/articles/' },
  { label: '项目', href: '/projects' },
  { label: '工具', href: '/tools' },
  { label: '标签', href: '/articles/#tags' },
  { label: '关于', href: '/#about' },
]

const articleItems = [
  { title: 'Spring Boot 3.x 新特性实践指南', description: '深入探索 Spring Boot 3.x 带来的变化和新特性，包括性能提升、原生镜像支持等。', date: '2024-05-20', views: '1.2k', comments: '28', tags: ['Java', 'Spring Boot'], icon: Sparkles, tone: 'spring' },
  { title: '高并发下的数据库设计思考', description: '在高并发场景下，如何设计合理的数据库结构和索引策略，提升系统性能。', date: '2024-05-18', views: '892', comments: '16', tags: ['MySQL', '数据库设计'], icon: Database, tone: 'database' },
  { title: '从零搭建一个 AI 对话系统', description: '基于大语言模型，搭建属于自己的 AI 对话系统，支持多轮对话和知识库。', date: '2024-05-15', views: '1.5k', comments: '32', tags: ['AI', '大模型', 'Python'], icon: Bot, tone: 'ai' },
  { title: 'Redis 缓存穿透、击穿、雪崩问题及解决方案', description: '深入分析缓存三大问题的底层原理和解决方案，帮助你构建稳定的缓存系统。', date: '2024-05-10', views: '786', comments: '12', tags: ['Redis', '缓存', '高并发'], icon: Box, tone: 'redis' },
  { title: '使用 GitHub Actions 自动化部署', description: '通过 GitHub Actions 实现自动化构建、测试和部署，提升开发效率。', date: '2024-05-05', views: '642', comments: '8', tags: ['CI/CD', 'DevOps', 'GitHub'], icon: Settings2, tone: 'actions' },
  { title: 'Java 21 新特性概览', description: '全面了解 Java 21 的新特性和改进，帮助你快速掌握重要版本能力。', date: '2024-04-28', views: '1.1k', comments: '20', tags: ['Java', 'JDK'], icon: Settings2, tone: 'java' },
]

const projectItems = [
  { name: 'Spring Boot 3.x  静态开发框架', description: '基于 Spring Boot 3.x 构建的开发框架，集成常用组件和工具，提升开发效率。', tags: ['Java', 'Spring Boot', 'Maven'], views: '1.2k', comments: '256', icon: Sparkles, tone: 'spring', featured: true },
  { name: 'AI 对话系统', description: '基于大语言模型构建的智能对话系统，支持多轮对话、知识库和模型切换。', tags: ['Python', 'FastAPI', 'Vue.js'], views: '856', comments: '128', icon: Bot, tone: 'chat' },
  { name: 'DevOps 部署平台', description: '基于 Docker 和 K8s 的一站式应用部署平台，支持 CI/CD 和可视化管理。', tags: ['Go', 'Kubernetes', 'Docker'], views: '642', comments: '96', icon: Box, tone: 'devops' },
  { name: 'API Fox', description: '高效的 API 接口调试工具，支持接口文档生成、Mock 等功能。', tags: ['Vue.js', 'TypeScript', 'Electron'], views: '512', comments: '78', icon: Code2, tone: 'fox' },
  { name: 'TinyCache', description: '轻量级分布式缓存组件，支持多种缓存策略和数据模式。', tags: ['Java', 'Redis', 'Spring'], views: '388', comments: '64', icon: Box, tone: 'cache' },
  { name: '数据可视化大屏', description: '基于 Vue3 和 ECharts 的数据可视化大屏模板，开箱即用。', tags: ['Vue.js', 'ECharts', 'TypeScript'], views: '286', comments: '42', icon: ChartNoAxesColumnIncreasing, tone: 'dashboard' },
]

const toolItems = [
  { name: 'JSON 格式化', description: '美化、校验和压缩 JSON 数据，支持语法高亮。', users: '1.2k', icon: Braces, tone: 'pink' },
  { name: '时间戳转换', description: '时间戳与日期格式互相转换，支持多种时间格式。', users: '856', icon: Timer, tone: 'cyan' },
  { name: 'UUID 生成器', description: '生成各种格式的 UUID，支持自定义数量和版本。', users: '642', icon: Fingerprint, tone: 'blue' },
  { name: '密码生成器', description: '生成安全的随机密码，支持自定义长度和字符类型。', users: '538', icon: KeyRound, tone: 'orange' },
  { name: 'Base64 编解码', description: 'Base64 编码和解码工具，支持文本和文件。', users: '412', icon: Code2, tone: 'teal' },
  { name: '文本差异对比', description: '对比两段文本的差异，支持高亮显示和导出。', users: '298', icon: FileText, tone: 'violet' },
  { name: '二维码生成器', description: '生成自定义二维码，支持多种内容和格式。', users: '256', icon: Image, tone: 'indigo' },
  { name: '图片压缩', description: '在线压缩图片，支持调整质量和尺寸，减少文件大小。', users: '196', icon: Image, tone: 'green' },
]

const pageData = {
  articles: { title: '全部文章', count: '共 56 篇文章', search: '搜索文章...', sideTitle: '内容', sideItems: [['全部文章', '56'], ['后端开发', '23'], ['系统设计', '12'], ['数据库', '8'], ['AI/机器学习', '7'], ['工具分享', '6']] },
  projects: { title: '全部项目', count: '共 12 个项目', search: '搜索项目...', sideTitle: '项目', sideItems: [['全部项目', '12'], ['个人项目', '8'], ['开源项目', '4']] },
  tools: { title: '全部工具', count: '精选实用工具，提升开发效率', search: '搜索工具...', sideTitle: '工具分类', sideItems: [['全部工具', '8'], ['开发效率', '4'], ['格式化转换', '2'], ['生成工具', '2']] },
} as const

const data = pageData[props.kind]
const isArticles = props.kind === 'articles'
const isProjects = props.kind === 'projects'
</script>

<template>
  <div class="dn-hub-page">
    <header class="dn-hub-nav">
      <a href="/" class="dn-hub-logo" aria-label="DevNotes 首页"><span>&lt;/&gt;</span><strong>DevNotes</strong></a>
      <nav aria-label="主导航">
        <a v-for="item in navItems" :key="item.label" :href="item.href" :class="{ 'is-active': (isArticles && item.label === '文章') || (isProjects && item.label === '项目') || (!isArticles && !isProjects && item.label === '工具') }">{{ item.label }}</a>
      </nav>
      <div class="dn-hub-actions">
        <a class="dn-hub-search" :href="'#' + props.kind + '-search'" :aria-label="data.search"><Search :size="15" /><span>{{ data.search }}</span></a>
        <a class="dn-hub-avatar" href="https://github.com/creatawork" aria-label="GitHub 主页">V</a>
      </div>
    </header>

    <div class="dn-hub-body">
      <aside class="dn-hub-sidebar">
        <section>
          <h2>{{ data.sideTitle }}</h2>
          <a v-for="(item, index) in data.sideItems" :key="item[0]" href="#" :class="{ 'is-selected': index === 0 }"><span>{{ item[0] }}</span><b>{{ item[1] }}</b></a>
        </section>

        <section v-if="isArticles" class="dn-hub-sidebar-section">
          <h2>标签云</h2>
          <div class="dn-hub-tag-cloud"><a href="#">Java <b>32</b></a><a href="#">Spring <b>28</b></a><a href="#">Docker <b>13</b></a><a href="#">Redis <b>12</b></a><a href="#">设计模式 <b>10</b></a><a href="#">AI <b>8</b></a><a href="#">更多标签 <b>›</b></a></div>
        </section>
        <section v-if="isArticles" class="dn-hub-progress">
          <h2>学习进度</h2><div class="dn-progress-row"><span>本月目标</span><b>写作 8 / 12 篇文章</b></div><div class="dn-progress-bar"><i></i></div><small>66%</small>
        </section>
        <section v-if="isProjects" class="dn-hub-sidebar-section">
          <h2>技术栈</h2><div class="dn-hub-side-list"><span>Java <b>6</b></span><span>Spring Boot <b>6</b></span><span>Python <b>4</b></span><span>Vue.js <b>3</b></span><span>Docker <b>4</b></span><span>更多技术栈 <b>›</b></span></div>
        </section>
        <section v-if="!isArticles && !isProjects" class="dn-hub-sidebar-section dn-hub-feature-box">
          <ShieldCheck :size="25" /><strong>好用工具</strong><p>让开发更高效</p><a href="#utilities">提交工具</a>
        </section>
        <section v-if="!isArticles && !isProjects" class="dn-hub-sidebar-section">
          <h2>最近使用</h2><div class="dn-hub-side-list dn-hub-recent"><span><Braces :size="14" /> JSON 格式化 <small>2 分钟前</small></span><span><Timer :size="14" /> 时间戳转换 <small>1 小时前</small></span><span><Fingerprint :size="14" /> UUID 生成器 <small>昨天</small></span></div>
        </section>
        <section v-if="!isArticles && !isProjects" class="dn-hub-login-box">
          <Star :size="21" /><strong>收藏工具</strong><p>登录后收藏你常用的工具，方便下次使用</p><a href="/articles/">登录 / 注册</a>
        </section>
        <section v-if="isArticles" class="dn-hub-sidebar-note">
          <Code2 :size="42" /><strong>写作即沉淀，思考即成长</strong><p>记录、分享、进度</p><a href="/articles/">开始写作</a>
        </section>
      </aside>

      <main class="dn-hub-main">
        <div class="dn-hub-titlebar"><div><h1>{{ data.title }}</h1><p>{{ data.count }}</p></div><div class="dn-hub-viewtools"><button type="button">最新发布 <span>⌄</span></button><button type="button" aria-label="网格视图"><LayoutGrid :size="16" /></button><button type="button" aria-label="列表视图"><List :size="16" /></button></div></div>

        <section v-if="isArticles" class="dn-article-list" aria-label="文章列表">
          <article v-for="item in articleItems" :key="item.title" class="dn-hub-article">
            <a href="/articles/" :class="'dn-hub-thumb tone-' + item.tone"><component :is="item.icon" :size="48" /><strong v-if="item.tone === 'spring'">Spring Boot 3</strong></a>
            <div class="dn-hub-article-copy"><a href="/articles/"><h2>{{ item.title }}</h2></a><p>{{ item.description }}</p><div class="dn-hub-meta"><span class="dn-hub-tags"><i v-for="tagName in item.tags" :key="tagName">{{ tagName }}</i></span><time>{{ item.date }}</time><span><Eye :size="12" /> {{ item.views }}</span><span>◌ {{ item.comments }}</span></div></div>
          </article>
        </section>

        <section v-else-if="isProjects" class="dn-project-grid-page" aria-label="项目列表">
          <article v-for="item in projectItems" :key="item.name" class="dn-hub-project-card">
            <span v-if="item.featured" class="dn-project-badge">推荐</span><div :class="'dn-project-visual tone-' + item.tone"><component :is="item.icon" :size="52" /></div><div class="dn-project-card-content"><h2>{{ item.name }}</h2><p>{{ item.description }}</p><div class="dn-hub-meta"><span class="dn-hub-tags"><i v-for="tagName in item.tags" :key="tagName">{{ tagName }}</i></span><span><Eye :size="12" /> {{ item.views }}</span><span>◌ {{ item.comments }}</span><small>更新于 {{ item.featured ? '3 天前' : '1 个月前' }}</small></div></div>
          </article>
        </section>

        <section v-else class="dn-tools-grid-page" aria-label="工具列表">
          <a v-for="item in toolItems" :key="item.name" href="/articles/" class="dn-hub-tool-card"><span :class="'dn-tool-visual tone-' + item.tone"><component :is="item.icon" :size="25" /></span><div><h2>{{ item.name }}</h2><p>{{ item.description }}</p></div><div class="dn-hub-meta"><span>♡ {{ item.users }} 人使用</span><strong>使用工具 <ArrowRight :size="13" /></strong></div></a>
        </section>

        <nav class="dn-hub-pagination" aria-label="分页"><a class="is-current" href="#">1</a><a href="#">2</a><a href="#">3</a><a href="#">4</a><a href="#">5</a><span>...</span><a href="#">12</a><a href="#">下一页 <ArrowRight :size="13" /></a></nav>
      </main>
    </div>

    <footer class="dn-hub-footer"><div><a href="/" class="dn-hub-logo"><span>&lt;/&gt;</span><strong>DevNotes</strong></a><p>记录技术、分享经验、创造价值</p><small>© 2024 vie. All rights reserved.</small></div><nav><strong>导航</strong><a href="/">首页</a><a href="/articles/">文章</a><a href="/projects">项目</a><a href="/tools">工具</a><a href="/articles/#tags">标签</a></nav><nav><strong>资源</strong><a href="https://github.com/creatawork">GitHub</a><a href="/articles/">掘金</a><a href="/articles/">站点说明</a><a href="/articles/">知识库</a></nav><nav><strong>友情链接</strong><a href="/articles/">Spring 官网</a><a href="/articles/">Vue.js</a><a href="/articles/">Docker</a><a href="/articles/">更多...</a></nav><div class="dn-hub-footer-art"><Database :size="40" /><Box :size="34" /></div></footer>
  </div>
</template>
