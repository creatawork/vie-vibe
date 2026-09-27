<script setup lang="ts">
import {
  ArrowRight,
  Braces,
  ChartNoAxesColumnIncreasing,
  Code2,
  Database,
  FileText,
  FolderKanban,
  KeyRound,
  Server,
  Tag,
  Timer,
  Wrench,
} from '@lucide/vue'
import { computed } from 'vue'
import { data as posts } from '../../../articles.data'
import { data as projects } from '../../../projects.data'
import ProjectSpotlight from './ProjectSpotlight.vue'
import VieWordmark from './VieWordmark.vue'

const utilities = [
  { name: 'JSON 工作台', description: '校验、格式化和压缩 JSON', href: '/tools/json', icon: Braces, tone: 'pink' },
  { name: '时间戳转换', description: '时间戳与日期格式转换', href: '/tools/timestamp', icon: Timer, tone: 'cyan' },
  { name: 'JWT 解析器', description: '解码 Token 并检查 Claims', href: '/tools/jwt', icon: KeyRound, tone: 'blue' },
]

const metrics = computed(() => [
  { label: '文章', value: String(posts.length), unit: '篇', icon: FileText, tone: 'blue' },
  { label: '项目', value: String(projects.length), unit: '个', icon: FolderKanban, tone: 'orange' },
  { label: '工具', value: String(utilities.length), unit: '个', icon: Wrench, tone: 'green' },
  { label: '标签', value: String(new Set(posts.flatMap((p) => p.tags)).size), unit: '个', icon: Tag, tone: 'slate' },
])

const categoryArt: Record<string, { icon: any; tone: string }> = {
  backend: { icon: Database, tone: 'backend' },
  frontend: { icon: Code2, tone: 'frontend' },
  devops: { icon: Server, tone: 'devops' },
  meta: { icon: Braces, tone: 'meta' },
  notes: { icon: FileText, tone: 'notes' },
}

const latestPosts = computed(() =>
  posts.slice(0, 3).map((p) => ({
    title: p.title,
    description: p.description,
    tags: p.tags,
    date: p.date.slice(0, 10),
    url: p.url,
    readingTime: p.readingTime,
    ...(categoryArt[p.category] ?? { icon: FileText, tone: 'notes' }),
  })),
)

const featuredProject = computed(() => projects.find((p) => p.featured))
</script>

<template>
  <div class="dn-page">
    <main>
      <section class="dn-hero" aria-labelledby="dn-title">
        <div class="dn-hero-copy">
          <h1 id="dn-title">你好，我是 <span>Vie</span></h1>
          <p class="dn-role">写清楚每一个技术决策</p>
          <p class="dn-intro">热爱技术，喜欢探索和分享。<br>这里记录我的学习心得、开发经验和有趣的技术实践。</p>
          <div class="dn-hero-actions">
            <a class="dn-primary-btn" href="/articles/">阅读文章</a>
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
        </article>
      </section>

      <section class="dn-section" aria-labelledby="latest-title">
        <div class="dn-section-head">
          <h2 id="latest-title">最新文章</h2>
          <a href="/articles/">查看全部 <ArrowRight :size="16" /></a>
        </div>
        <div class="dn-article-grid">
          <a v-for="(item, i) in latestPosts" :key="item.url" :href="item.url" class="dn-article-card">
            <div :class="`dn-cover tone-${item.tone}`">
              <span v-if="i === 0" class="dn-recommend">最新</span>
              <component :is="item.icon" :size="56" stroke-width="1.35" />
            </div>
            <div class="dn-card-body">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
              <div class="dn-meta">
                <span class="dn-tags"><i v-for="tagName in item.tags.slice(0, 2)" :key="tagName">{{ tagName }}</i></span>
                <time>{{ item.date }}</time>
                <span class="vie-mono">约 {{ item.readingTime }} 分钟</span>
              </div>
            </div>
          </a>
        </div>
      </section>

      <section class="dn-section" aria-labelledby="projects-title">
        <div class="dn-section-head">
          <h2 id="projects-title">当前项目</h2>
          <a href="/projects">查看全部项目 <ArrowRight :size="16" /></a>
        </div>
        <div v-if="featuredProject" class="dn-project-feature">
          <ProjectSpotlight :project="featuredProject" title-tag="h3" compact>
            <template #secondary>
              <a class="dn-secondary-btn" href="/projects">项目页</a>
            </template>
          </ProjectSpotlight>
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
        <small>© 2026 Vie. All rights reserved.</small>
      </div>
      <nav aria-label="底部导航"><strong>导航</strong><a href="/">首页</a><a href="/articles/">文章</a><a href="/projects">项目</a><a href="#utilities">工具</a><a href="#about">关于</a></nav>
      <nav aria-label="文章分类"><strong>分类</strong><a href="/articles/#backend">后端开发</a><a href="/articles/#frontend">前端</a><a href="/articles/#devops">部署运维</a><a href="/articles/#meta">建站</a><a href="/articles/#notes">笔记</a></nav>
      <nav aria-label="联系方式"><strong>联系</strong><a href="https://github.com/creatawork"><Code2 :size="15" /> GitHub</a><a href="mailto:hello@vie.dev">邮箱</a></nav>
      <a class="dn-backtop" href="#" aria-label="回到顶部">↑</a>
    </footer>
  </div>
</template>
