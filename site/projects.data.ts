export interface Project {
  name: string
  description: string
  image?: string
  tags: string[]
  github?: string
  demo?: string
  featured: boolean
}

/** 静态样本数据 — 后续替换为真实项目 */
const projectsSource: Project[] = [
  {
    name: '个人网站',
    description: 'VitePress + SpringBoot 搭建的个人技术站，含访问量统计与自动发布流水线。',
    tags: ['VitePress', 'SpringBoot', 'Docker', 'GitHub Actions'],
    github: 'https://github.com/creatawork/vie-vibe',
    demo: 'https://vie-vibe.cn',
    featured: true,
  },
  {
    name: '访问统计 API',
    description: 'SpringBoot 埋点接收、按日聚合 PV/UV、Top 页面与来源分布；Docker 部署在站点同域 /api。',
    tags: ['SpringBoot', 'MySQL', 'Docker', 'REST'],
    github: 'https://github.com/creatawork/vie-vibe',
    featured: true,
  },
  {
    name: '系列导航组件',
    description: 'VitePress 主题内系列上下篇、按 frontmatter.series 自动串联，窄屏堆叠导航。',
    tags: ['Vue 3', 'VitePress', 'TypeScript'],
    github: 'https://github.com/creatawork/vie-vibe',
    featured: false,
  },
  {
    name: 'CI 发布流水线',
    description: 'GitHub Actions：构建静态站、rsync 到 VPS、健康检查与失败通知（样本配置）。',
    tags: ['GitHub Actions', 'Caddy', 'rsync'],
    featured: false,
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
