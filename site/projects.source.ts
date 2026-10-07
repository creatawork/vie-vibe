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
    name: 'VIE Gallery',
    slug: 'vie-gallery',
    status: 'validated-iterating',
    description:
      '个人相册产品：admin + viewer 双端。原图保存、相册整理、2D/3D 空间展示、受控链接分享。',
    proposition: '把私人影像整理成可长期保存、自然浏览、受控分享的个人空间。',
    updatedAt: '2026-10-07',
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
    overview: [
      {
        term: '问题',
        text: '私人照片散落在聊天记录和网盘里，长期保存、整理和分享都受制于人。',
      },
      {
        term: '对象',
        text: '管理相册的内容创作者，以及通过受控链接访问的受邀访客。',
      },
      {
        term: '范围',
        text: 'admin 管理端 + viewer 浏览端，双端产品。',
      },
    ],
    flows: [
      {
        title: '管理流程',
        steps: [
          '上传照片，原图直接入库保存',
          '在展厅工作台配置氛围、封面与排序',
          '发布展厅，进入访客可见状态',
          '生成带访问模式与有效期的受控分享链接',
        ],
      },
      {
        title: '浏览流程',
        steps: [
          '打开受控链接进入展厅',
          '在经典网格与 3D 空间之间自由切换',
          '通过系统分享或复制链接转发给朋友',
        ],
      },
    ],
    architecture:
      '前端使用 Vue 3 与 Three.js 构建 admin 工作台与 viewer 的 3D 空间浏览；后端由 Spring Boot 与 MyBatis-Plus 提供服务；Docker 承担本机部署与自动化门禁。',
    validation: [
      '2026-09-12：双端达到 V1 Ready，验收通过。',
      'M7.5 综合回归在本机 Docker + 自动化门禁下通过。',
    ],
    log: [
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
      '会请示的 ERP 智能体：agent 应用开发求职作品集项目。运行在 mini-ERP（商品 / 库存 / 订单）上，FastMCP 工具层 + 分级人工审批（HITL）+ 全程评测驱动。',
    proposition:
      '只读操作自动执行，低风险操作批量确认，资金相关操作单笔审批——动账动货的事，必须请示东家。',
    updatedAt: '2026-09-30',
    tags: ['Python 3.12', 'FastAPI', 'FastMCP', 'LangGraph', 'React'],
    featured: false,
    github: 'https://github.com/creatawork/Erpilot',
    capabilities: [
      {
        title: '手写 agent loop',
        description:
          '流式事件模型 + 工具循环 + 防护（max_steps / 超时 / 错误回填）+ 上下文压缩，不依赖框架，44 项单测覆盖。',
      },
      {
        title: '并行工具调用',
        description:
          '同一轮多个工具并发执行：完成序转发、调用序回填，前端时间线靠 call_id 精确配对。',
      },
      {
        title: '可回放 trace',
        description:
          'JSONL 六类记录逐行落盘，异常也留痕；erpilot replay 把 trace 还原成可读对话。',
      },
      {
        title: '三条入口一个协议',
        description:
          'CLI（rich 渲染）、FastAPI SSE、React 流式页挂同一条事件流，前后端类型镜像同步维护。',
      },
    ],
    overview: [
      {
        term: '问题',
        text: '大模型 API 只会“发消息、收消息”，业务系统要的是可控执行：工具调用、人工审批、可评测、可回放。',
      },
      {
        term: '对象',
        text: 'agent 应用开发岗位的求职作品集；演示场景是 mini-ERP（商品 / 库存 / 订单）的掌柜助手。',
      },
      {
        term: '范围',
        text: '单主管 agent + 15~20 个 MCP 工具、分级 HITL 审批、评测体系、React 前端；多 agent 与 RAG 延后决策。',
      },
    ],
    flows: [
      {
        title: '对话流程',
        steps: [
          '用一句业务问题提问（订单 / 库存 / 报价）',
          'agent 拆解为多步工具调用，文本流式输出',
          '工具时间线逐个点亮，并行动作如实呈现',
          '答复收口，展示 token 与成本',
        ],
      },
      {
        title: '过程回放',
        steps: [
          '每次运行 trace 自动落盘 traces/*.jsonl',
          '上游故障与异常一并留痕（run_error）',
          'erpilot replay 把 trace 还原成可读对话',
        ],
      },
    ],
    architecture:
      'Python 3.12 承载全部 agent 逻辑：agent_core 手写事件驱动的 agent loop（M6 起以 LangGraph 重构编排），FastMCP 把 ERP 能力暴露为工具，FastAPI + SSE 对接前端；React + TypeScript 提供流式对话、工具时间线与审批卡片；评测 runner 独立成包，PostgreSQL + pgvector 与 Langfuse 按里程碑接入。',
    validation: [
      '2026-09-29：M1 第 1–3 周真实链路验收通过——单工具任务 2 步收口，多步任务 3 步完成（第 2 轮模型自发并行调用两工具），成本约 ¥0.0003。',
      '44 项单元测试走传输层 mock，不消耗 token；ruff / pytest / tsc + vite build 进 CI 门禁。',
      'trace 覆盖成功与异常路径：上游端点故障（APIError / 502 upstream_error）均被 run_error 完整留痕。',
    ],
    log: [
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
