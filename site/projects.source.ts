export interface ProjectDecision {
  text: string
  href?: string
}

export type ProjectStatus = 'building' | 'live' | 'validated-iterating' | 'paused'
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

export interface ProjectCapability {
  title: string
  description: string
  image?: string
}

export interface ProjectMedia {
  src: string
  alt: string
  caption: string
  width: number
  height: number
}

export interface Project {
  name: string
  slug?: string
  status: ProjectStatus
  description: string
  proposition: string
  updatedAt: string
  image?: string
  tags: string[]
  featured: boolean
  capabilities?: ProjectCapability[]
  media?: ProjectMedia[]
  github?: string
  demo?: string
  decisions?: ProjectDecision[]
  log?: ProjectLogEntry[]
}

export const projectStatusLabel = {
  building: '开发中',
  live: '已上线',
  'validated-iterating': 'V1 已验收 · 持续迭代',
  paused: '已暂停',
} as const satisfies Record<ProjectStatus, string>

export const projectsSource: Project[] = [
  {
    name: 'VIE Gallery',
    slug: 'vie-gallery',
    status: 'validated-iterating',
    description:
      '个人相册产品：admin + viewer 双端。原图保存、相册整理、2D/3D 空间展示、受控链接分享。',
    proposition: '把私人影像整理成可长期保存、自然浏览、受控分享的个人空间。',
    updatedAt: '2026-09-12',
    image: '/images/projects/vie-gallery-viewer.png',
    tags: ['Vue 3', 'Three.js', 'Spring Boot', 'MyBatis-Plus', 'Docker'],
    featured: true,
    capabilities: [
      {
        title: '原图留存',
        description: '上传即保存原图，照片长期留存不受展示压缩影响。',
        image: '/images/projects/vie-gallery-admin-workspace.webp',
      },
      {
        title: '相册整理',
        description: '上传、封面、排序与标题修改在展厅工作台一次完成。',
      },
      {
        title: '2D / 3D 浏览',
        description: '经典网格与 3D 空间两种浏览方式，访客可自由切换。',
        image: '/images/projects/vie-gallery-viewer-3d.webp',
      },
      {
        title: '受控分享',
        description: '分享链接支持访问模式与有效期配置，默认禁止访客下载。',
        image: '/images/projects/vie-gallery-share-config.webp',
      },
    ],
    media: [
      {
        src: '/images/projects/vie-gallery-admin-workspace.webp',
        alt: 'VIE Gallery 管理端的展厅工作台界面，包含照片管理、发布中心与发布流程',
        caption: 'Admin · 展厅工作台',
        width: 1280,
        height: 562,
      },
      {
        src: '/images/projects/vie-gallery-share-config.webp',
        alt: 'VIE Gallery 的展厅分享与交付配置界面，可设置访问模式、下载权限与有效期',
        caption: 'Admin · 受控分享配置',
        width: 1062,
        height: 674,
      },
      {
        src: '/images/projects/vie-gallery-viewer-3d.webp',
        alt: 'VIE Gallery 访客端的 3D 空间浏览界面，照片悬浮在星空场景中',
        caption: 'Viewer · 3D 空间浏览',
        width: 1062,
        height: 674,
      },
    ],
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
