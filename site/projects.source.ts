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
    updatedAt: '2026-09-29',
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
        date: '2026-09-29',
        title: '品牌站模板体系全链路落地',
        detail:
          '5 套品牌站模板在渲染端、后端与 admin 工作区全链路打通；修复 demo 图片在 /site/ 部署路径下的 404（补齐 base 前缀）与暗房区块标题样式。',
        type: 'feature',
        tech: ['Vue 3', 'Spring Boot'],
      },
      {
        date: '2026-09-27',
        title: 'viewer 氛围渲染升级与 admin 图库工作区增强',
        detail:
          'viewer 新增萤火虫/流星粒子、星迹拖尾与开场电影运镜及光照时段配置，配置中心支持下发相机自转与主题点缀色并实时预览，移除冗余的空间背景主题配置；admin 图库工作台支持拖拽排序、上传进度与原图查看；修复生产形态下预览 iframe 端口丢失导致握手失败。',
        type: 'feature',
        tech: ['Three.js', 'Vue 3'],
      },
      {
        date: '2026-09-24',
        title: '分享支持微信 / QQ 传播',
        detail:
          '分享链接支持微信扫码与 QQ 一键分享，修复微信/QQ 分享卡片与访客端转发引导；清理赛博朋克残留外壳样式与未引用遗留组件；compose 传入本地安全密钥环境变量修复 API 启动。',
        type: 'feature',
        tech: ['Vue 3', 'Docker'],
      },
      {
        date: '2026-09-23',
        title: '短链生成与 token 轮换，部署迁移冲突修复',
        detail:
          '分享链接支持短链生成与历史链接 token 轮换，短链公开路由放行与配置容错；定位并解决 V14/V15 Flyway 迁移冲突，API 健康检查失败可诊断。',
        type: 'fix',
        tech: ['Spring Boot', 'Docker'],
      },
      {
        date: '2026-09-22',
        title: '短链接功能实现与 admin 动效打磨',
        detail:
          'API 实现分享短链接，修复海报预签名 URL 超出 OSS 7 天上限与 CJK 字体缺失；admin 批量卡片倾斜逻辑简化、界面视觉与交互动效增强；部署链路补齐 raw_token 迁移与 API 健康诊断。',
        type: 'feature',
        tech: ['Spring Boot', 'Vue 3', 'Docker'],
      },
      {
        date: '2026-09-21',
        title: '分享海报生成全链路完成（WP-12.1）',
        detail:
          'admin 新增海报生成入口，API 完成海报生成：取真实照片 URL、跨平台字体与详细错误处理；OSS 预签名 URL 设置 Content-Type / Content-Disposition 支持浏览器直览，上传超时放宽至 120s，部署切换 SSL nginx 并消除周期性 502。',
        type: 'feature',
        tech: ['Spring Boot', 'Vue 3', 'Docker'],
      },
      {
        date: '2026-09-20',
        title: '生产存储切换阿里云 OSS 并加密 API 数据',
        detail:
          '生产环境接入阿里云 OSS 对象存储与安全环境变量，API 实现数据加密，预签名 URL 修复双重签名并显式指定 GET；沉淀部署排障指南与一键 502 修复脚本；回退未完成的 URL 存储特性。',
        type: 'feature',
        tech: ['Spring Boot', '阿里云 OSS', 'Docker'],
      },
      {
        date: '2026-09-18',
        title: '生产部署链路落地：Docker 化与 CI/CD',
        detail:
          '新增部署配置、CI/CD workflow 与生产环境模板；修复 Maven 多模块镜像构建、MinIO 镜像源、容器卷路径与 admin/viewer 静态资源代理规则。',
        type: 'feature',
        tech: ['Docker', 'Spring Boot'],
      },
      {
        date: '2026-09-17',
        title: 'Week 1 交付：viewer 渲染增强（WP-10）',
        detail:
          '动态光照、照片过渡动画、粒子性能优化与 Bloom / Fog 艺术调校（WP-10.1~10.4）完成，Week 1 以 demo 模式实测验收收尾；配置面板按反馈重构并加入点击涟漪，修复全屏预览 iframe 未铺满与无效纹理配置。',
        type: 'milestone',
        tech: ['Three.js', 'Vue 3'],
      },
      {
        date: '2026-09-16',
        title: '修复分享链接主机栏与用户菜单点击失效',
        detail: 'viewer 分享链接主机栏与用户菜单恢复可点击。',
        type: 'fix',
        tech: ['Vue 3'],
      },
      {
        date: '2026-09-15',
        title: 'admin 请求超时与创建弹窗交互加固',
        detail: 'gallery-admin 加固请求超时处理与创建弹窗交互。',
        type: 'fix',
        tech: ['Vue 3'],
      },
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
