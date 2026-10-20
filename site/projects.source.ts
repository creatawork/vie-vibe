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

export interface ProjectFact {
  term: string
  text: string
}

export interface ProjectFlow {
  title: string
  steps: string[]
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
  overview?: ProjectFact[]
  flows?: ProjectFlow[]
  architecture?: string
  validation?: string[]
}

export const projectStatusLabel = {
  building: '开发中',
  live: '已上线',
  'validated-iterating': 'V1 已验收 · 持续迭代',
  paused: '已暂停',
} as const satisfies Record<ProjectStatus, string>

export const projectsSource: Project[] = [
  {
    name: '阳光明媚',
    slug: 'vie-gallery',
    status: 'validated-iterating',
    description:
      '阳光明媚是一款面向个人与创作者的在线相册。保留原始照片，搭配 16 种画面风格与 10 种观看编排，将作品整理成展览，支持版本管理、访问保护与工作区协作。',
    proposition: '从一组照片，到一场属于你的展览：整理作品、选择风格，再邀请访客进入。',
    updatedAt: '2026-10-20',
    image: '/images/projects/vie-gallery-20261017-viewer.webp',
    tags: ['Vue 3', 'Three.js', 'GLSL', 'Spring Boot', 'MyBatis-Plus', 'Docker'],
    featured: true,
    github: 'https://github.com/creatawork/vie-gallery',
    demo: 'https://gallery.vie-vibe.cn/app/',
    capabilities: [
      {
        title: '原图保存与作品整理',
        description: '原始照片独立保存，画面效果不改动原图。在工作区上传照片、拖拽排序、选择封面和编辑标题，逐步整理出完整的作品集。',
        image: '/images/projects/vie-gallery-20261017-workspace.webp',
      },
      {
        title: '16 种照片风格',
        description: '为照片选择胶片、银盐、水纹、丝绸、全息等风格，自由调整效果强度。强度归零即可还原原片，也可减少动态效果，保留静态色彩。',
        image: '/images/projects/vie-gallery-20261016-photo-effects.webp',
      },
      {
        title: '空间编排与逐张欣赏',
        description: '在螺旋、环幕、波浪、翻页画册与空间穿行等 10 种编排中欣赏作品。切换视图时保留浏览进度，支持高清大图、平面展览和手机浏览。',
        image: '/images/projects/vie-gallery-20261017-viewer.webp',
      },
      {
        title: '发布、分享与工作区协作',
        description: '先预览草稿，再发布给访客；历史版本可恢复后重新编辑。分享时可设置访问密码、链接有效期与下载权限，也可加入受邀工作区协作管理作品。',
        image: '/images/projects/vie-gallery-20261017-overview.webp',
      },
    ],
    media: [
      {
        src: '/images/projects/vie-gallery-20261017-viewer.webp',
        alt: '阳光明媚访客端以完整海岸照片为中心，底部提供逐张导航及螺旋、环幕、波浪、翻页、穿行入口',
        caption: '访客端 · 逐张欣赏与空间编排',
        width: 1101,
        height: 892,
      },
      {
        src: '/images/projects/vie-gallery-20261017-workspace.webp',
        alt: '阳光明媚创作者工作区，显示山海之间示例相册、照片整理与发布分享面板',
        caption: '创作者工作区 · 整理作品、设计展览、发布分享',
        width: 1270,
        height: 714,
      },
      {
        src: '/images/projects/vie-gallery-20261016-photo-effects.webp',
        alt: '同一张海岸照片在固定构图下的十六种实际渲染结果，包括胶片、水波、银盐、美术纸和冰晶处理',
        caption: '16 种照片风格 · 同一作品的画面效果对照',
        width: 1400,
        height: 1152,
      },
    ],
    overview: [
      {
        term: '出发点',
        text: '让保存下来的照片成为可以欣赏与分享的作品。将照片整理、画面风格和展览编排放在同一个创作流程中。',
      },
      {
        term: '适合谁',
        text: '记录生活的个人用户、整理摄影作品的创作者，以及共同管理相册的协作成员。访客通过分享链接即可进入展览。',
      },
      {
        term: '体验',
        text: '从上传原图、整理作品到选择风格与编排，预览满意后再发布。访客可以逐张欣赏、切换观看方式，并按分享设置查看或下载作品。',
      },
    ],
    flows: [
      {
        title: '创作与发布',
        steps: [
          '选择工作区，上传原图，调整作品顺序、标题与封面',
          '选择照片风格、空间编排与展览氛围，实时预览效果',
          '保存草稿，确认展览内容后发布给访客',
          '设置分享密码、有效期与下载权限；需要修改时可恢复历史版本',
        ],
      },
      {
        title: '进入展览',
        steps: [
          '打开分享链接，按展览设置输入访问密码',
          '通过拖拽、滚轮、方向键或导航按钮逐张欣赏',
          '切换空间编排、翻页画册或平面展览，点击作品查看高清大图',
          '使用系统分享或复制链接，也可减少动态效果，手动控制浏览节奏',
        ],
      },
    ],
    architecture:
      'Vue 3 + TypeScript 构建创作者工作区与访客端，Three.js 实现空间编排，GLSL 在保留原图的基础上渲染照片风格。两端共享预设与配置规则，让编辑预览与发布效果保持一致。Spring Boot + MyBatis-Plus 负责照片上传、版本管理、分享访问与成员权限，Docker 管理运行环境。',
    validation: [
      '2026-09-12：双端达到 V1 Ready，验收通过。',
      '2026-10-16：照片风格与配置更新通过 167 项单元测试、34 项创作者端与 19 项访客端浏览器用例，以及 5 项 Java 配置校验测试；类型检查与双端构建通过。',
      '2026-10-17：170 项单元测试、23 项创作者端与 20 项访客端浏览器用例通过，覆盖多尺寸布局、长标题、移动预览折叠与发布失败恢复。',
      '16 种照片风格使用同一作品进行画面对照与像素差异检查，确认强度归零还原原片；纹理管理、加载重试、低画质回退与减少动态效果均有专项回归。',
    ],
    log: [
      {
        date: '2026-10-17',
        title: '优化观展导航与手机编辑，让作品成为焦点',
        detail: '将作品标题、计数、翻页与风格切换整合到底部导航，修复平板上的控件遮挡。手机编辑支持收起实时预览，相册概览突出封面，作品整理减少重复操作；以文件名命名的公开作品改用作品序号展示。',
        type: 'feature',
        tech: ['Vue 3', 'Three.js'],
        link: 'https://github.com/creatawork/vie-gallery/commit/997dc18954e2d8497e9010abe5b02aadfbf4c218',
      },
      {
        date: '2026-10-16',
        title: '支持个人与受邀工作区切换',
        detail: '创作者可以查看并切换个人或受邀工作区，在当前标签页保留选择。服务端按成员角色校验每次操作，成员被移除后刷新即可返回默认工作区。',
        type: 'feature',
        tech: ['Vue 3', 'Spring Boot', 'MyBatis-Plus'],
        link: 'https://github.com/creatawork/vie-gallery/commit/ee74f785d8c2839a15fbb7f7e2e0c25f5a0311f1',
      },
      {
        date: '2026-10-16',
        title: '统一品牌与账户体验',
        detail: '统一“阳光明媚”的名称、图标与页面交互，调整密码长度规则与账户入口，并修复注册时 CSRF Token 过期的问题。',
        type: 'fix',
        tech: ['Vue 3', 'Spring Boot'],
        link: 'https://github.com/creatawork/vie-gallery/commit/42526ad',
      },
      {
        date: '2026-10-16',
        title: '新增 16 种照片风格与 10 种观看编排',
        detail: '新增丝绸、全息、胶片、水波、银盐与纸张等照片风格，以及翻页画册、空间穿行等观看方式。风格、编排、氛围和版本设置共用配置规则，预设卡展示实际渲染效果，支持强度归零、静态呈色与减少动态效果。',
        type: 'feature',
        tech: ['Three.js', 'GLSL', 'Vue 3', 'TypeScript'],
        link: 'https://github.com/creatawork/vie-gallery/blob/997dc18954e2d8497e9010abe5b02aadfbf4c218/docs/photo-effects-redesign-2026-10-16.md',
      },
      {
        date: '2026-10-15',
        title: '观展体验重塑：精选画廊空间导航与全流程打磨',
        detail:
          '精选画廊重塑：螺旋/环绕/波浪视图聚焦大图、共享导航与响应式相机取景，保留 reduced-motion 与平面画廊回退，风格选择与发布统一；创建到观展全流程视觉系统统一（登录、创作工作区、配置、发布、访客端），强制发布就绪与访问密码边界；修复空间舞台更新、嵌入动效与自适应纹理质量，120 项单测与多端浏览器验收通过。',
        type: 'feature',
        tech: ['Vue 3', 'Three.js'],
      },
      {
        date: '2026-10-14',
        title: '照片剧场播放器、配置版本管理与预览提速（10.08–10.12）',
        detail:
          'viewer 新增照片剧场：6 种访客布局与 4 种照片构图、差异化转场与 31 秒可控回放，离场恢复原相机与布局；发布配置版本管理全链路落地（原子仓储、版本元数据迁移、历史管理与恢复到草稿，编辑延迟优化）；修复场景背景渐进加载与预览草稿同步，预览冷启动与 admin 加载提速。',
        type: 'feature',
        tech: ['Vue 3', 'Three.js'],
      },
      {
        date: '2026-10-07',
        title: '推荐场景开箱即用与首次发布引导',
        detail:
          '新增推荐场景预设：未配置的画廊由 admin 自动种入、viewer 免服务端配置兜底渲染，开箱即用；发布链路新增草稿/发布状态标识与一键发布，并以就绪横幅引导新用户完成首次发布，氛围选项卡改为场景卡优先、细调收进高级区；8 张场景背景图替换为写实风格素材，修复预览重载与启动状态稳定性。',
        type: 'feature',
        tech: ['Vue 3', 'Three.js'],
      },
      {
        date: '2026-10-06',
        title: '场景背景分层加载、启动提速与投影修复',
        detail:
          'viewer 场景背景支持半分辨率变体与缩略图分层加载，素材带版本参数防旧缓存，舞台画廊与实时预览启动提速；修复全景投影与旋转恢复、旧版背景 schema 兼容、背景请求竞态与纹理释放、admin 配置侧板还原，并补背景旋转 e2e 验收；移除品牌站特性（admin 视图与后端配置一并下线）。',
        type: 'feature',
        tech: ['Three.js', 'Vue 3'],
      },
      {
        date: '2026-10-05',
        title: 'viewer 内置 8 套场景背景，配置面板支持预览选用',
        detail:
          'viewer 预置极简空间、森林之梦、星空夜曲等 8 套全景场景背景图与配套预设，配置栏与 3D 球幕渲染共用；admin 配置中心场景面板支持背景预览与选用，并补充场景面板 e2e 验证。',
        type: 'feature',
        tech: ['Three.js', 'Vue 3'],
      },
      {
        date: '2026-09-30',
        title: '查看器新增照片墙视图，照片标题搜索与筛选安全优化',
        detail:
          'viewer 新增照片墙浏览视图，灯箱弹窗与查看器引擎、布局插件同步重构；admin 图库工作台支持照片标题搜索与状态筛选并做安全优化；两端补充 e2e 验证。',
        type: 'feature',
        tech: ['Vue 3', 'Three.js'],
      },
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
  {
    name: 'Erpilot',
    slug: 'erpilot',
    status: 'building',
    description:
      '运行在 mini-ERP 上的业务智能体：FastMCP 查询与写工具、LangGraph 持久化审批、版本化订单草稿、政策证据与只读补货建议，配套可复核的真实模型评测和本地演示。',
    proposition:
      '查询交给工具，订单与库存变更先固定草稿和业务预览，再请人确认；执行后以业务记录核对结果。',
    updatedAt: '2026-10-20',
    tags: ['Python 3.12', 'FastAPI', 'FastMCP', 'LangGraph', 'SQLite', 'PostgreSQL', 'React'],
    featured: false,
    github: 'https://github.com/creatawork/Erpilot',
    capabilities: [
      {
        title: '固定版本的订单审批',
        description:
          '多商品草稿逐版保存，批准绑定指定版本；提交前复核价格与库存，条件变化需重新确认。取消订单和库存调整先展示业务预览。',
      },
      {
        title: '持久化中断与写入对账',
        description:
          'LangGraph interrupt 保存待审批参数，API 用 PostgreSQL checkpoint 恢复；稳定 mutation token 与业务变更同事务记账，结果不明时先查提交事实。',
      },
      {
        title: '政策证据与明确缺口',
        description:
          '检索核对政策范围、版本与原文哈希；模型逐问选证，程序渲染原文和缺口。最新两模型均为 11/13，严格质量门槛仍未达成。',
      },
      {
        title: '多轮任务与可选上下文视图',
        description:
          '从持久化草稿恢复任务，按版本与行号修改并校验 SKU；候选视图保留用户原话与任务摘要，超估算预算时停止，尚未切换为默认策略。',
      },
      {
        title: '只读补货建议',
        description:
          '按销量、库存、采购周期和覆盖天数计算建议，说明零销量、下架与异常数据的限制；不执行采购或库存调整。',
      },
      {
        title: '评测与可复现演示',
        description:
          '报告分别保存调用尝试、执行结果、业务状态与原币种计量；gate 检查质量，strict 检查可比性。无密钥本地演示与真实模型验收分开记录。',
      },
    ],
    overview: [
      {
        term: '问题',
        text: '大模型 API 只会“发消息、收消息”，业务系统要的是可控执行：工具调用、人工审批、可评测、可回放。',
      },
      {
        term: '对象',
        text: 'Agent 应用与后端工程求职作品；演示场景是 mini-ERP 的订单、库存、政策查询与补货分析。',
      },
      {
        term: '范围',
        text: '本机可信单用户、单 API 进程。已提供无密钥演示、源码交付和七篇开发实录；尚未部署，身份认证、租户隔离与多 worker 执行权需要独立设计。',
      },
    ],
    flows: [
      {
        title: '草稿到建单',
        steps: [
          '查询商品与报价，保存多商品订单草稿，暂不扣库存',
          '按当前版本和商品行修改，保留旧版快照',
          '提交指定版本，核对客户、金额与库存影响后批准或拒绝',
          '批准后重新校验业务条件，以幂等记录核对建单结果',
        ],
      },
      {
        title: '查政策与看补货',
        steps: [
          '政策检索返回原文、版本、生效信息和引用标识',
          '逐问展示证据或明确缺口，不补写没有依据的政策',
          '补货建议列出统计窗口、采购周期与假设，不触发采购',
        ],
      },
      {
        title: '恢复与复核',
        steps: [
          '历史会话找回持久化任务，多份草稿先澄清目标',
          '页面断连后读取 checkpoint 状态，恢复待审批操作',
          '本地 JSONL 保存过程，评测核对工具、答复与数据库变化',
        ],
      },
    ],
    architecture:
      'Python 3.12 + LangGraph 承载模型、工具和审批节点，FastMCP 对接 ERP 领域层；ERP 业务数据与 API RunStore 使用 SQLite，PostgreSQL 仅保存 API graph checkpoint。FastAPI SSE 连接 React + TypeScript 工作台，CLI 与评测显式使用内存 saver。政策检索与原文渲染独立适配，本地 JSONL 保留 trace，Langfuse 双写可选；结构化上下文视图仍需显式启用。',
    validation: [
      '2026-10-19：B4 指代最终专项，两模型各 3/3 场景、7/7 轮；B6 补货专项，两模型各 7/7，gate 与 strict 分别通过。固定批次结果不合成为通用成功率。',
      '政策结构化答复专项：GLM 与 DeepSeek 均完整执行 13 例、严格通过 11 例；结束协议和背景条件拆分仍有失败，可比性通过不等于质量门槛通过。',
      '冻结检索集 36 问，dev 12 / test 24；当前向量策略 test Recall@3 为 96.9%，语料外空返回 87.5%。RRF 未全面超过现有策略，未替换默认检索。该结果不代表模型回答成功率。',
      '连续任务候选：DeepSeek 3/3 场景、17/17 轮通过；GLM 1/3 场景，执行 7/17 轮、其中 5 轮通过，客户全称缩写失败保留。未执行轮不计通过，候选保持可选。',
      '2026-10-19 工程记录：后端离线 1062 passed / 21 skipped / 47 deselected，其后交付包两项测试另行通过；前端 84 项、TypeScript / Vite 构建与三项浏览器离线断言通过。离线演示不计作真实模型成绩。',
      '历史恢复证据：2026-10-08 硬退出进程测试 19 项通过；R01–R06 为进程测试，R07–R10 为当时组件覆盖，未扩写成后续全部业务路径已重验。ADR-0010 仍待评审。',
    ],
    log: [
      {
        date: '2026-10-20',
        title: '开发实录第 7 篇：多轮状态与上下文实验',
        detail: '发布固定历史快照与真实连续任务对照，区分字段保留、模型用对信息与业务保护参数；保留两模型未共同通过的结果，候选策略不切默认。',
        type: 'milestone',
        tech: ['Python', 'LangGraph', '上下文工程'],
        article: '/articles/ai/context-and-multi-turn-state',
      },
      {
        date: '2026-10-20',
        title: '开发实录第 6 篇：政策 RAG 的检索与回答',
        detail: '分别说明 36 问冻结检索对照与 13 例结构化答复，介绍本轮引用绑定、程序原文渲染和安全降级；两模型 11/13 的严格失败如实保留。',
        type: 'milestone',
        tech: ['Python', 'RAG', '评测'],
        article: '/articles/ai/rag-evidence-and-answers',
      },
      {
        date: '2026-10-20',
        title: '开发实录第 5 篇：从工具名到业务状态的评测',
        detail: '发布工具执行证据、禁止调用、数据库状态、评分器修正、质量门槛与原币种计量的复盘，不把定点重跑拼成一次全量成功率。',
        type: 'milestone',
        tech: ['Python', '评测'],
        article: '/articles/ai/agent-evaluation',
      },
      {
        date: '2026-10-20',
        title: '开发实录第 4 篇：幂等与崩溃对账',
        detail: '说明稳定 token、业务变更与结果同事务记账、SQLite 写锁及原 token 对账；附临时库复现脚本，并明确历史硬退出矩阵的验证范围。',
        type: 'milestone',
        tech: ['Python', 'SQLite', 'LangGraph'],
        article: '/articles/ai/idempotency-and-recovery',
      },
      {
        date: '2026-10-20',
        title: '开发实录第 3 篇：LangGraph 中断与固定版本审批',
        detail: '从进程内审批门讲到持久化 interrupt，核对 pending、规范化参数、期限与草稿版本，说明 PostgreSQL checkpoint 和业务 SQLite 的分工。',
        type: 'milestone',
        tech: ['LangGraph', 'PostgreSQL', 'HITL'],
        article: '/articles/ai/langgraph-approval',
      },
      {
        date: '2026-10-20',
        title: '开发实录第 2 篇：MCP 工具契约与错误恢复',
        detail: '承接首篇预告，发布 ERP 查询接入、工具描述、错误 hint、摘要与聚合返回及桥接限制；六篇新文均附可校验的随文源码与报告快照。',
        type: 'milestone',
        tech: ['Python', 'FastMCP'],
        article: '/articles/ai/mcp-server-tool-contracts',
      },
      {
        date: '2026-10-19',
        title: '连续业务上下文验证与作品交付',
        detail: '三场景共计划 17 轮，真实模型经 LangGraph → MCP → 临时 SQLite 连续执行。候选 DeepSeek 全部通过，GLM 客户全称缩写等失败保留；110 请求均有 usage，两个币种独立审计。完成统一投递材料与可校验源码、字幕录屏交付，本阶段仍未部署。',
        type: 'milestone',
        tech: ['LangGraph', 'FastMCP', 'SQLite', '评测'],
        article: '/articles/ai/context-and-multi-turn-state',
      },
      {
        date: '2026-10-19',
        title: '政策检索对照与结构化回答验收',
        detail: '36 问冻结检索集完成向量、BM25、RRF 对照，保留现有向量默认值；compose_policy_answer 绑定本轮原文、版本与哈希，程序渲染回答。两模型完整十三例均为严格 11/13，质量 gate 未通过，结束协议与条件拆分继续待办。',
        type: 'feature',
        tech: ['Python', 'RAG', '评测'],
        article: '/articles/ai/rag-evidence-and-answers',
      },
      {
        date: '2026-10-19',
        title: 'B4 指代与 B6 补货完成最终专项验收',
        detail: 'B4 最终指代专项两模型各 3/3 场景、7/7 轮，B6 最终补货专项两模型各 7/7，均通过质量门槛和同源码可比性检查；旧失败、未知 usage 与冻结预算独立保留。',
        type: 'milestone',
        tech: ['Python', 'FastMCP', '评测'],
      },
      {
        date: '2026-10-17',
        title: '只读补货与无密钥演示落地，强化草稿指代',
        detail: '补货工具按销量、库存、采购周期与覆盖天数给出建议，不执行采购或调库存；加入临时库、脚本模型的十个本地演示场景和浏览器入口。草稿修改强化版本、行号与 expected_sku 校验，评测补充危险工具请求和逐轮业务状态。',
        type: 'feature',
        tech: ['Python', 'FastMCP', 'React', '评测'],
      },
      {
        date: '2026-10-15',
        title: 'M4 写审批链与崩溃恢复收口，政策 RAG 接入并通过真实验收',
        detail:
          '汇总 2026-10-05～10-09 批次（44 项提交、29 项实质）：M4 写操作+HITL 落地挂起式审批事件协议与三端审批交互，LangGraph HITL 完成 PostgreSQL 持久化，凭 mutation token 对账与 durable cursor 重放补齐崩溃恢复，恢复矩阵 R01–R06 在隔离库全通过；新增 packages/rag 政策检索引擎并经 search_policy 只读工具接入 loop，政策检索通过真实链路验收，多供应商 provider 配置（zhipu/deepseek/qwen）同步落地；评测体系扩至 35 条固定基线（scorer v2.4、注入对抗用例、版本化趋势与报告完整性修复），离线单测峰值 152 项全绿。',
        type: 'milestone',
        tech: ['Python', 'LangGraph', 'PostgreSQL', 'FastMCP', 'React'],
      },
      {
        date: '2026-09-30',
        title: 'M1 收口：本地 trace + 三条入口 + 首篇文章发布',
        detail:
          'trace 六类记录逐行落盘（run_start / step_start / step_end / tool_call / run_end / run_error），异常留痕后原样抛出；typer + rich CLI 支持 chat 与 replay；FastAPI SSE 链路与 React 流式页（fetch + ReadableStream 手解 SSE）打通，前后端协议镜像同步；ADR-0002 手写 loop 优先、ADR-0003 本地 JSONL trace 先行。测试增至 44 项。首篇系列文章《手写 Agent Loop》在 Vie 发布，并沉淀撰写规则：禁虚构经历与数据、客观口吻、代码片段与仓库逐行 diff。',
        type: 'milestone',
        tech: ['Python', 'FastAPI', 'React'],
        article: '/articles/ai/handwritten-agent-loop',
      },
      {
        date: '2026-09-29',
        title: 'M1 第 3 周：并行工具调用 + 错误回填策略 v1 + 上下文压缩',
        detail:
          '同一轮多个 tool_calls 用 asyncio.as_completed 并发执行（完成序转发、调用序回填）；工具报错回填为结构化 JSON，瞬态错误按重试策略自动重试、确定性错误立即回填让模型改道；上下文压缩 v1：超长截断 + 整轮丢弃，裁剪边界不落在工具交换中间。3 步真实链路验收通过，第 2 轮模型自发并行调用两工具（≈¥0.0003）。',
        type: 'feature',
        tech: ['Python', 'asyncio'],
      },
      {
        date: '2026-09-29',
        title: 'M1 第 2 周：工具调用循环 + 防护 + 结构化输出',
        detail:
          'Tool 协议：Pydantic 参数模型自动生成 OpenAI tools schema（递归剥 title）；AgentLoop 主循环：schema 注入 → 解析 tool_calls → 校验 → 执行 → 回填 → 再生成；max_steps 防死循环 + 单工具超时；结构化输出走提示词注入 schema + Pydantic 强校验。单工具任务 2 步真实链路验收通过。',
        type: 'feature',
        tech: ['Python', 'Pydantic'],
      },
      {
        date: '2026-09-29',
        title: 'M1 第 1 周：LLM client 流式 + usage / 成本计量',
        detail:
          'AsyncOpenAI 流式补全，事件模型保证恰好以一个终止事件结束；GLM-5.3 Flash 价目表成本估算；传输层 mock（httpx2.MockTransport）11 项单测不烧真实 token。',
        type: 'feature',
        tech: ['Python', 'OpenAI SDK'],
      },
      {
        date: '2026-09-29',
        title: '项目启动：uv workspace 脚手架与选型定案',
        detail:
          '四包骨架（agent_core / mcp_erp / erp_store / evals）+ CI 就绪；ADR-0001 定技术栈：Python 3.12 + FastAPI + FastMCP + PostgreSQL + LiteLLM（GLM-5.3 Flash）+ React，对齐行业真实 agent 栈。',
        type: 'milestone',
        tech: ['uv', 'FastAPI', 'PostgreSQL'],
      },
    ],
  },
]
