export interface ProjectDecision {
  text: string
  href?: string
}

export type ProjectStatus = 'building' | 'live'
export type LogEntryType = 'feature' | 'fix' | 'milestone' | 'decision'

export interface ProjectLogEntry {
  date: string
  title: string
  detail?: string
  type: LogEntryType
  tech: string[]
  article?: string
  link?: string
  image?: string
}

export interface Project {
  name: string
  slug?: string
  status: ProjectStatus
  description: string
  image?: string
  tags: string[]
  github?: string
  demo?: string
  featured: boolean
  decisions?: ProjectDecision[]
  log?: ProjectLogEntry[]
}

export const projectsSource: Project[] = [
  {
    name: 'Vie',
    status: 'live',
    description:
      'VitePress 静态站 + 同域 SpringBoot 统计 + Caddy / GitHub Actions 发布。',
    image: '/images/vie-home.png',
    tags: ['VitePress', 'Vue 3', 'SpringBoot', 'Docker', 'GitHub Actions'],
    github: 'https://github.com/creatawork/vie-vibe',
    demo: 'https://vie-vibe.cn',
    featured: true,
    decisions: [
      {
        text: '静态站 SSG，而不是 SSR',
        href: '/articles/meta/how-this-site-works',
      },
      {
        text: '统计自建，IP 只存日盐哈希',
        href: '/articles/backend/springboot-stats-api',
      },
      {
        text: 'CI 拆 site 与 server 两个 job，静态目录原子切换',
        href: '/articles/devops/github-actions-deploy',
      },
      {
        text: '首页用 Bento，不用 VitePress 默认 Hero',
        href: '/articles/frontend/vitepress-theme',
      },
    ],
  },
  {
    name: 'VIE Gallery',
    slug: 'vie-gallery',
    status: 'building',
    description:
      '个人相册产品：admin + viewer 双端。原图保存、相册整理、2D/3D 空间展示、受控链接分享。',
    tags: ['Vue 3', 'Three.js', 'Spring Boot', 'MyBatis-Plus', 'Docker'],
    featured: false,
    log: [
      {
        date: '2026-09-12',
        title: 'V1 签收：个人相册 V1 Ready 验收通过',
        detail:
          '双端（admin 工作台 / viewer）达到 V1 Ready：原图保存、相册管理、2D/3D 展示、受控链接分享、上传任务中心、配置版本化与资源变体通过真实环境验收；M7.5 综合回归在本机 Docker + 自动化门禁下通过。',
        type: 'milestone',
        tech: ['Vue 3', 'Three.js', 'Spring Boot', 'MyBatis-Plus', 'Docker'],
      },
    ],
  },
]
