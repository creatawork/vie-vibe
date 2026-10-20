<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { data as projects } from '../../../projects.data'
import type { LogEntryType } from '../../../projects.source'
import ProjectStatus from './ProjectStatus.vue'
import ProjectMediaStrip from './ProjectMediaStrip.vue'
import ProjectCapabilityList from './ProjectCapabilityList.vue'
import ProjectMilestoneList from './ProjectMilestoneList.vue'
import ProjectToc from './ProjectToc.vue'

const props = defineProps<{ slug: string }>()

const project = computed(() => projects.find((p) => p.slug === props.slug))
const entries = computed(() => project.value?.log ?? [])
const logFilter = ref<LogEntryType | 'all'>('all')
watch(() => props.slug, () => { logFilter.value = 'all' })
const nextProject = computed(() => projects.find((p) => p.slug && p.slug !== props.slug))

const tocSections: { id: string; label: string }[] = [
  { id: 'overview', label: '项目概览' },
  { id: 'experience', label: '产品体验' },
  { id: 'capabilities', label: '核心能力' },
  { id: 'architecture', label: '系统实现' },
  { id: 'validation', label: '验证与结果' },
  { id: 'devlog', label: '开发日志' },
]
</script>

<template>
  <div class="vie-page vie-project-page">
    <p v-if="!project" class="vie-empty">未找到这个项目。<a href="/projects">返回项目列表</a></p>
    <div v-else class="vie-project-layout">
      <ProjectToc :sections="tocSections" :entries="entries" :filter="logFilter" @select-log="logFilter = 'all'" />
      <article class="vie-project-detail">
        <nav class="vie-detail-crumb" aria-label="面包屑">
          <a href="/projects">← 全部项目</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{{ project.name }}</span>
        </nav>

        <header class="vie-detail-hero">
          <div class="vie-detail-title">
            <h1>{{ project.name }}</h1>
          </div>
          <p class="vie-detail-desc">{{ project.proposition }}</p>
          <div class="vie-detail-meta">
            <ProjectStatus :status="project.status" />
            <span>更新于 <time :datetime="project.updatedAt">{{ project.updatedAt }}</time></span>
            <a href="#devlog">{{ entries.length }} 篇开发记录 ↓</a>
          </div>
          <div class="vie-detail-actions">
            <a class="vie-cta vie-cta--primary" href="#experience">查看产品体验</a>
            <a
              v-if="project.github"
              class="vie-cta vie-cta--ghost"
              :href="project.github"
              target="_blank"
              rel="noopener"
            >GitHub 仓库 ↗</a>
          </div>
        </header>

        <section
          v-if="project.media?.length"
          class="vie-detail-section vie-detail-section--flush"
          aria-label="产品界面"
        >
          <ProjectMediaStrip :media="project.media" variant="strip" eager />
        </section>

        <section id="overview" class="vie-detail-section">
          <h2>项目概览</h2>
          <p class="vie-detail-summary">{{ project.description }}</p>
          <dl v-if="project.overview?.length" class="vie-facts">
            <div v-for="fact in project.overview" :key="fact.term">
              <dt>{{ fact.term }}</dt>
              <dd>{{ fact.text }}</dd>
            </div>
          </dl>
          <p v-else class="vie-empty">项目概览正在整理中。</p>
        </section>

        <section id="experience" class="vie-detail-section">
          <h2>产品体验</h2>
          <div v-if="project.flows?.length" class="vie-flows">
            <div v-for="flow in project.flows" :key="flow.title">
              <h3>{{ flow.title }}</h3>
              <ol role="list">
                <li v-for="step in flow.steps" :key="step">{{ step }}</li>
              </ol>
            </div>
          </div>
          <p v-else class="vie-empty">产品体验正在整理中。</p>
        </section>

        <section id="capabilities" class="vie-detail-section">
          <h2>核心能力</h2>
          <ProjectCapabilityList
            v-if="project.capabilities?.length"
            :capabilities="project.capabilities"
            show-images
          />
          <p v-else class="vie-empty">能力清单正在整理中。</p>
        </section>

        <section id="architecture" class="vie-detail-section">
          <h2>系统实现</h2>
          <p v-if="project.architecture" class="vie-detail-arch">{{ project.architecture }}</p>
          <p v-else class="vie-empty">系统实现正在整理中。</p>
          <div class="vie-chip-row">
            <span v-for="t in project.tags" :key="t" class="vie-chip vie-chip--accent">{{ t }}</span>
          </div>
        </section>

        <section id="validation" class="vie-detail-section">
          <h2>验证与结果</h2>
          <ul v-if="project.validation?.length" class="vie-validation">
            <li v-for="item in project.validation" :key="item">{{ item }}</li>
          </ul>
          <p v-else class="vie-empty">验证记录正在整理中。</p>
        </section>

        <section id="devlog" class="vie-detail-section vie-devlog">
          <div class="vie-devlog-heading">
            <h2>开发日志</h2>
            <p>每一步推进，都有迹可循。</p>
          </div>
          <ProjectMilestoneList v-if="entries.length" v-model:filter="logFilter" :entries="entries" />
          <p v-else class="vie-empty">开发继续，记录待补。</p>
        </section>
        <footer class="vie-project-end">
          <a href="/projects">← 返回项目列表</a>
          <a v-if="nextProject" :href="`/projects/${nextProject.slug}`">继续探索 <strong>{{ nextProject.name }}</strong><span aria-hidden="true">↗</span></a>
        </footer>
      </article>
    </div>
  </div>
</template>
