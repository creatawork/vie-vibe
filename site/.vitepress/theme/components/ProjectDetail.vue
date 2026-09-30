<script setup lang="ts">
import { computed } from 'vue'
import { data as projects } from '../../../projects.data'
import ProjectStatus from './ProjectStatus.vue'
import ProjectMediaStrip from './ProjectMediaStrip.vue'
import ProjectCapabilityList from './ProjectCapabilityList.vue'
import ProjectMilestoneList from './ProjectMilestoneList.vue'
import ProjectToc from './ProjectToc.vue'

const props = defineProps<{ slug: string }>()

const project = computed(() => projects.find((p) => p.slug === props.slug))
const entries = computed(() => project.value?.log ?? [])

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
  <div class="vie-page">
    <p v-if="!project" class="vie-empty vie-mono">// project not found</p>
    <div v-else class="vie-project-layout">
      <ProjectToc :sections="tocSections" :entries="entries" />
      <article class="vie-project-detail">
        <nav class="vie-detail-crumb vie-mono" aria-label="面包屑">
          <a href="/projects">项目</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{{ project.name }}</span>
        </nav>

        <header class="vie-detail-hero">
          <div class="vie-detail-title">
            <h1>{{ project.name }}</h1>
            <ProjectStatus :status="project.status" />
          </div>
          <p class="vie-detail-desc">{{ project.proposition }}</p>
          <p class="vie-detail-summary">{{ project.description }}</p>
          <div class="vie-detail-actions">
            <a class="vie-cta vie-cta--primary" href="#experience">查看产品体验</a>
            <a
              v-if="project.github"
              class="vie-cta vie-cta--ghost"
              :href="project.github"
              target="_blank"
              rel="noopener"
            >GitHub 仓库</a>
            <a class="vie-cta vie-cta--ghost" href="#devlog">跳到开发日志</a>
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
          <dl v-if="project.overview?.length" class="vie-facts">
            <div v-for="fact in project.overview" :key="fact.term">
              <dt>{{ fact.term }}</dt>
              <dd>{{ fact.text }}</dd>
            </div>
          </dl>
          <p v-else class="vie-empty vie-mono">// 概览待补</p>
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
          <p v-else class="vie-empty vie-mono">// 产品体验待补</p>
        </section>

        <section id="capabilities" class="vie-detail-section">
          <h2>核心能力</h2>
          <ProjectCapabilityList
            v-if="project.capabilities?.length"
            :capabilities="project.capabilities"
            show-images
          />
          <p v-else class="vie-empty vie-mono">// 能力清单待补</p>
        </section>

        <section id="architecture" class="vie-detail-section">
          <h2>系统实现</h2>
          <p v-if="project.architecture" class="vie-detail-arch">{{ project.architecture }}</p>
          <p v-else class="vie-empty vie-mono">// 架构说明待补</p>
          <div class="vie-chip-row">
            <span v-for="t in project.tags" :key="t" class="vie-chip vie-chip--accent">{{ t }}</span>
          </div>
        </section>

        <section id="validation" class="vie-detail-section">
          <h2>验证与结果</h2>
          <ul v-if="project.validation?.length" class="vie-validation">
            <li v-for="item in project.validation" :key="item">{{ item }}</li>
          </ul>
          <p v-else class="vie-empty vie-mono">// 验证记录待补</p>
        </section>

        <section id="devlog" class="vie-detail-section">
          <h2>开发日志</h2>
          <ProjectMilestoneList v-if="entries.length" :entries="entries" />
          <p v-else class="vie-empty vie-mono">// log empty — 开发继续，记录待补</p>
        </section>
      </article>
    </div>
  </div>
</template>
