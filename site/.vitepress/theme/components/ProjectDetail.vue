<script setup lang="ts">
import { computed } from 'vue'
import { data as projects } from '../../../projects.data'
import ProjectStatus from './ProjectStatus.vue'
import ProjectMediaStrip from './ProjectMediaStrip.vue'
import ProjectCapabilityList from './ProjectCapabilityList.vue'
import ProjectMilestoneList from './ProjectMilestoneList.vue'

const props = defineProps<{ slug: string }>()

const project = computed(() => projects.find((p) => p.slug === props.slug))
const entries = computed(() => project.value?.log ?? [])
</script>

<template>
  <div class="vie-page">
    <p v-if="!project" class="vie-empty vie-mono">// project not found</p>
    <article v-else class="vie-project-detail">
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
          <a class="vie-cta vie-cta--ghost" href="#devlog">跳到开发日志</a>
        </div>
      </header>

      <section class="vie-detail-section vie-detail-section--flush" aria-label="产品界面">
        <ProjectMediaStrip :media="project.media ?? []" variant="strip" eager />
      </section>

      <section id="overview" class="vie-detail-section">
        <h2>项目概览</h2>
        <dl class="vie-facts">
          <div>
            <dt>问题</dt>
            <dd>私人照片散落在聊天记录和网盘里，长期保存、整理和分享都受制于人。</dd>
          </div>
          <div>
            <dt>对象</dt>
            <dd>管理相册的内容创作者，以及通过受控链接访问的受邀访客。</dd>
          </div>
          <div>
            <dt>范围</dt>
            <dd>admin 管理端 + viewer 浏览端，双端产品。</dd>
          </div>
        </dl>
      </section>

      <section id="experience" class="vie-detail-section">
        <h2>产品体验</h2>
        <div class="vie-flows">
          <div>
            <h3>管理流程</h3>
            <ol role="list">
              <li>上传照片，原图直接入库保存</li>
              <li>在展厅工作台配置氛围、封面与排序</li>
              <li>发布展厅，进入访客可见状态</li>
              <li>生成带访问模式与有效期的受控分享链接</li>
            </ol>
          </div>
          <div>
            <h3>浏览流程</h3>
            <ol role="list">
              <li>打开受控链接进入展厅</li>
              <li>在经典网格与 3D 空间之间自由切换</li>
              <li>通过系统分享或复制链接转发给朋友</li>
            </ol>
          </div>
        </div>
      </section>

      <section id="capabilities" class="vie-detail-section">
        <h2>核心能力</h2>
        <ProjectCapabilityList
          v-if="project.capabilities?.length"
          :capabilities="project.capabilities"
          show-images
        />
      </section>

      <section id="architecture" class="vie-detail-section">
        <h2>系统实现</h2>
        <p class="vie-detail-arch">
          前端使用 Vue 3 与 Three.js 构建 admin 工作台与 viewer 的 3D 空间浏览；
          后端由 Spring Boot 与 MyBatis-Plus 提供服务；Docker 承担本机部署与自动化门禁。
        </p>
        <div class="vie-chip-row">
          <span v-for="t in project.tags" :key="t" class="vie-chip vie-chip--accent">{{ t }}</span>
        </div>
      </section>

      <section id="validation" class="vie-detail-section">
        <h2>验证与结果</h2>
        <ul class="vie-validation">
          <li>2026-09-12：双端达到 V1 Ready，验收通过。</li>
          <li>M7.5 综合回归在本机 Docker + 自动化门禁下通过。</li>
        </ul>
      </section>

      <section id="devlog" class="vie-detail-section">
        <h2>开发日志</h2>
        <ProjectMilestoneList v-if="entries.length" :entries="entries" />
        <p v-else class="vie-empty vie-mono">// log empty — 开发继续，记录待补</p>
      </section>
    </article>
  </div>
</template>
