export interface Project {
  name: string
  description: string
  image?: string
  tags: string[]
  github?: string
  demo?: string
  featured: boolean
}

const projectsSource: Project[] = [
  {
    name: '个人网站',
    description: 'VitePress + SpringBoot 搭建的个人技术站，含访问量统计与自动发布流水线。',
    tags: ['VitePress', 'SpringBoot', 'Docker', 'GitHub Actions'],
    github: 'https://github.com/creatawork/vie-vibe',
    demo: 'https://vie-vibe.cn',
    featured: true,
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
