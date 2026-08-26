export interface ProjectDecision {
  text: string
  href?: string
}

export interface Project {
  name: string
  description: string
  image?: string
  tags: string[]
  github?: string
  demo?: string
  featured: boolean
  decisions?: ProjectDecision[]
}

const projectsSource: Project[] = [
  {
    name: 'Vie',
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
]

declare const data: Project[]
export { data }

export default {
  watch: [],
  load(): Project[] {
    return projectsSource
  },
}
