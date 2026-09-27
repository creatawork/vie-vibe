# 项目体验全面优化与重构方案

日期：2026-09-24  
站点：Vie（`https://vie-vibe.cn`）  
范围：`/projects`、`/projects/vie-gallery`、首页项目入口，以及项目数据、共享布局、SEO、性能与可访问性  
状态：已实施（2026-09-24）；本文件不包含业务代码改动

> 本方案是在现有“项目真数据化 + VIE Gallery 开发日志”实现之上的第二阶段重构。旧文档继续保留为历史记录；若两者冲突，以本方案为准，尤其是删除 Vie 本站项目、单项目版式、首页项目数据统一和详情页信息架构。

## 1. 核心决策

项目页不再采用“项目卡片墙”思路，而改为**单一旗舰产品档案**：

- VIE Gallery 是当前唯一项目，也是 `/projects` 的视觉与内容主角。
- Vie 只作为站点品牌存在，不再作为项目出现在项目数量、项目列表和首页项目区。
- `/projects` 负责建立兴趣和可信度；`/projects/vie-gallery` 负责完整解释产品、体验、实现和验证证据。
- 首页、项目列表和详情页必须读取同一个项目数据源，不再维护三套名称、状态、数量和文案。
- 不使用假项目、空卡槽、Coming soon 卡片、筛选器或归档控件来填补单项目页面。
- 真实产品截图是主要视觉资产，装饰性图形退居次要位置。

统一状态文案：

> **V1 已验收 · 持续迭代**

这比现有“开发中”和“V1 Ready 验收通过”并存更准确，也能同时表达阶段成果和后续演进。

## 2. 当前体验审计

### 2.1 内容与可信度

- 首页显示“项目 12 个”，并展示 API Fox、ChatAI、TinyCache；`/projects` 则展示 Vie 与 VIE Gallery。三处内容互相矛盾。
- Vie 本站被当作项目后，占用了项目页首位和移动端约一整屏空间，真正需要呈现的 VIE Gallery 被推迟。
- 删除 Vie 后若仍保留当前双列卡片网格，只会留下一个半宽卡片，页面会显得未完成。
- VIE Gallery 列表页状态为“开发中”，详情页内容却写明 V1 已通过验收，缺少统一状态语义。

### 2.2 `/projects` 列表页

- 当前桌面端两张卡片被强制等高，但两者内容量差异很大，造成视觉重心不均。
- Vie 卡片包含四条技术决策、五个技术标签和两个外链；Gallery 只有简介、技术标签和“日志”入口，入口强度不对等。
- `gh`、`demo`、`日志` 等缩写不够明确，且部分点击区域小于推荐的 44×44px。
- 页面表达的是“用了什么技术”，没有优先回答“产品为谁解决什么问题、现在做到什么程度”。

### 2.3 VIE Gallery 详情页

- 页面 H1 是“项目”，项目名 VIE Gallery 只是 H2，语义层级错误，也削弱了产品名称的首屏识别。
- 主体只有项目简介、技术标签和一条开发日志，更像稀疏的 changelog，而不是项目案例。
- 缺少用户问题、目标人群、admin/viewer 双端流程、核心能力、设计选择、系统实现和验证结果。
- 当前唯一大图偏向 3D 氛围展示，不能代表管理端、浏览端和受控分享的完整产品体验。
- 站点构建时间“最后更新”与项目进展无直接关系，不应占据项目内容区的重要位置。

### 2.4 响应式与共享布局

- 移动端 `/projects` 首个 Vie 卡片高度约 828px，Gallery 被推到第二屏之后。
- 详情页在 390px 宽度下没有横向溢出，但时间线外层、节点、卡片内边距叠加，正文可用宽度不足。
- 移动端有效项目内容不多，完整站点页脚却占据很长的滚动距离。
- 768px 平板宽度仍沿用偏窄内容布局，没有充分利用可用空间。

### 2.5 可访问性

线上实测发现：

- 当前绿色链接 `rgb(31, 163, 111)` 在白底上的对比度约为 **3.22:1**。
- 状态文字在浅绿底上的对比度约为 **2.79:1**。
- 两者均不满足普通文本 WCAG AA 的 4.5:1 要求。
- 品牌链接使用定制焦点描边，搜索按钮则回退到浏览器默认黑色轮廓，焦点反馈不统一。
- 项目入口缺少稳定、完整的可访问名称；“日志”不足以表达将前往哪个项目、查看什么内容。
- 图片替代文本只重复项目名，无法描述截图所展示的产品状态。

### 2.6 运行时、加载与 SEO

- `/projects` 与详情页均出现 `Hydration completed but contains mismatches` 控制台错误。
- 页面出现 Inter 字体已 preload 但未及时使用的警告。
- `/projects` 实际请求四十余个 Mermaid/图表相关 chunk，尽管页面本身没有图表。
- 页面还预取首页、文章、工具等多个路由资产；移除 Vie 的文章决策链接后应显著减少无关预取。
- `/projects` 的 description 仅为“技术实现细节与思路”，缺少项目页定位。
- `/projects` 没有 canonical，社交分享图沿用首页图。
- Gallery 详情已有专属 OG 标题、描述和图片，但仍缺 canonical 与结构化数据。

## 3. 目标与非目标

### 3.1 目标

1. 让 VIE Gallery 在首屏明确成为唯一、真实、可验证的产品项目。
2. 让用户在 10 秒内理解产品用途、当前状态、核心能力和可深入查看的内容。
3. 统一首页、项目列表和详情页的项目数量、状态、文案、图片和 URL。
4. 将详情页从单条日志升级为完整产品案例，同时保留可持续追加的开发日志。
5. 修复项目相关页面的标题语义、颜色对比度、焦点样式、触控目标和响应式布局。
6. 清理 hydration、无关图表加载、字体 preload 和项目页 SEO 问题。
7. 保持静态站架构，不引入 CMS、后台或不必要的新运行时依赖。

### 3.2 非目标

- 不伪造项目数量、用户量、性能提升比例或业务指标。
- 不新增评论、登录、管理后台、多语言或自动同步 Git 提交的能力。
- 不为只有一个项目的状态添加筛选、排序、分页、标签云或归档导航。
- 不删除 Vie 品牌资产、首页品牌内容、站点说明或技术文章。
- 不删除 `vie-home.png`；它目前仍是首页资产和 SEO 回退图。
- 不回写或篡改历史方案文档中的旧状态，只在本方案中声明覆盖关系。

## 4. 新信息架构

```text
首页 /
└── 当前项目：VIE Gallery（同一数据源）
    ├── 查看项目案例 → /projects/vie-gallery#overview
    └── 查看全部项目 → /projects

项目页 /projects
└── VIE Gallery 旗舰展示
    ├── 查看项目案例 → /projects/vie-gallery
    └── 阅读开发日志 → /projects/vie-gallery#devlog

项目详情 /projects/vie-gallery
├── 产品首屏
├── 产品证据图组
├── 项目概览
├── 产品体验
├── 核心能力
├── 系统实现
├── 验证与结果
└── 开发日志
```

Vie 本站的技术实现内容保留在“站点说明”和相关文章中，不再出现在项目清单中。

## 5. 页面方案

### 5.1 `/projects`：单项目旗舰页

页面任务：让访问者快速判断 VIE Gallery 是什么、做到什么程度、是否值得深入查看。

内容顺序：

1. **页面标题**
   - H1：`项目`
   - 导语：`不追求数量，记录真正做完、跑通并持续迭代的产品。`
2. **旗舰项目主体**
   - 状态：`V1 已验收 · 持续迭代`
   - H2：`VIE Gallery`
   - 价值主张：`把私人影像整理成可长期保存、自然浏览、受控分享的个人空间。`
   - 一段简述：覆盖 admin 工作台、viewer 浏览端、原图保存、相册组织、2D/3D 展示和受控分享。
3. **四项核心能力**
   - 原图留存
   - 相册整理
   - 2D / 3D 浏览
   - 受控分享
4. **明确动作**
   - 主按钮：`查看项目案例`
   - 次按钮：`阅读开发日志`
5. **真实产品画面**
   - 主画面优先展示 viewer 或相册内容，而不是纯氛围图。
   - 辅助画面展示 admin 和 3D 空间。
6. **最新验证节点**
   - `2026-09-12 · V1 Ready 验收通过`
   - 只写已经存在的验收事实，不添加虚构数据。

不显示：项目总数徽章、筛选器、空项目位、Coming soon、纯技术栈主导的卡片头部。

### 5.2 `/projects/vie-gallery`：产品案例页

页面任务：完整解释产品价值、真实体验、实现边界和验证证据。

内容顺序：

1. **面包屑**：`项目 / VIE Gallery`
2. **产品首屏**
   - 唯一 H1：`VIE Gallery`
   - 状态：`V1 已验收 · 持续迭代`
   - 价值主张和一句范围说明
   - 主动作：若存在可公开 demo，则为`打开产品`；否则为`查看产品体验`
   - 次动作：`跳到开发日志`
3. **产品证据图组**
   - Admin：相册和原图管理
   - Viewer：相册浏览和分享访问
   - Spatial：2D/3D 空间展示
4. **项目概览 `#overview`**
   - 问题：私人影像如何长期保存、整理、展示和受控分享
   - 对象：内容管理者与受邀浏览者
   - 范围：admin + viewer 双端
5. **产品体验 `#experience`**
   - 管理流程：上传/保存 → 整理相册 → 配置展示 → 创建分享
   - 浏览流程：打开受控链接 → 浏览相册 → 切换 2D/3D 展示
6. **核心能力 `#capabilities`**
   - 每项采用“能力名称 + 一句价值 + 对应截图/证据”，避免只列功能词。
7. **系统实现 `#architecture`**
   - 技术栈放在产品叙事之后。
   - 用简明架构图或文字关系说明 Vue 3、Three.js、Spring Boot、MyBatis-Plus、Docker 的职责。
8. **验证与结果 `#validation`**
   - V1 Ready 签收
   - M7.5 综合回归
   - 本地 Docker 与自动化门禁通过
   - 不展示未经证实的用户数、节省时间或性能百分比。
9. **开发日志 `#devlog`**
   - 使用语义化 `ol/li`。
   - 每条包含日期、类型、标题、简述、相关技术和可选来源链接。
   - 在移动端移除占宽的装饰轨道，保留日期和类型图标即可。

详情页不再渲染通用 H1“项目”，也不显示与项目无关的站点构建时间。

### 5.3 首页项目区

- 项目计数从 `12` 改为真实值 `1`，并直接由 `projects.source.ts` 推导。
- `精选项目`改为`当前项目`。
- 删除 API Fox、ChatAI、TinyCache 三个占位项目。
- 使用与 `/projects` 相同的 VIE Gallery 名称、状态、描述、图片和详情 URL。
- 首页只展示精简版：项目名、状态、一句价值、主图和`查看项目`动作。
- 不在首页重复完整能力清单和开发日志。

## 6. 视觉方向

### 6.1 设计概念

方向：**克制的技术产品档案**。

它应延续 Vie 的白色/冷灰基础、深色文字、绿色品牌识别和等宽元信息，但不再依赖泛化的圆角卡片。真实产品界面承担视觉辨识度，布局和分隔线负责建立秩序。

页面的标志性元素是**三视图产品证据带**：Admin、Viewer、Spatial 三个真实界面共同证明这是一个完整产品，而不是只有一张 3D 场景图的概念展示。

### 6.2 颜色 token

现有 token 应改为语义化分层，避免直接把品牌绿用于所有文字链接。

| 角色 | 建议值 | 用途 |
|---|---:|---|
| Canvas | `#F6F8FA` | 页面底色、分区底色 |
| Paper | `#FFFFFF` | 内容底色 |
| Ink | `#16202A` | 标题、主要正文 |
| Muted ink | `#526170` | 辅助正文、元信息 |
| Brand emerald | `#1FA36F` | 品牌块、图标、非正文装饰 |
| Action emerald | `#0B6B4B` | 白底链接和按钮文字，需通过 AA |
| Focus blue | `#1D5FD0` | 统一键盘焦点环，与品牌绿明确区分 |
| Line | `#DDE4EA` | 分隔线和边界 |

实现时必须用对比度工具复核最终 token；普通文字至少 4.5:1，大字号至少 3:1。

### 6.3 字体

- 展示/标题：`Inter` + `Noto Sans SC` fallback，600–700。
- 正文：`Noto Sans SC`, system-ui，400–500。
- 元信息：`ui-monospace`, `SFMono-Regular`, `Consolas`, monospace。
- 不按 viewport 宽度连续缩放字号；使用明确断点和固定字号层级。
- 中文正文保持约 60–72 个字符的舒适行长。

建议字号：

| 层级 | 桌面 | 移动 |
|---|---:|---:|
| 详情 H1 | 48/56 | 34/42 |
| 页面 H1 | 36/44 | 30/38 |
| H2 | 28/36 | 24/32 |
| H3 | 18/28 | 17/26 |
| 正文 | 16/28 | 16/28 |
| 元信息 | 12–13/20 | 12–13/20 |

### 6.4 形状、边界与阴影

- 内容区不包成一个大浮动卡片。
- 分区使用全宽 band、留白和 1px 分隔线建立层级。
- 真实截图容器圆角 6–8px。
- 按钮圆角 6px；状态标签可以是紧凑胶囊，但不铺满整行。
- 阴影仅用于需要从页面平面抬起的媒体或浮层，且保持低强度。
- 禁止卡片嵌套卡片。

### 6.5 动效

- 不使用自动轮播、背景粒子或持续动画。
- 图片切换若实现，只允许短距离淡入/位移，时长 160–220ms。
- hover 只改变颜色、边界或轻微位移，不改变元素尺寸。
- `prefers-reduced-motion: reduce` 下关闭非必要过渡。

## 7. 布局线框

### 7.1 项目页桌面端

```text
┌──────────────────────────────────────────────────────────────────────┐
│ 项目                                                                  │
│ 不追求数量，记录真正做完、跑通并持续迭代的产品。                      │
├───────────────────────────────┬──────────────────────────────────────┤
│ V1 已验收 · 持续迭代          │                                      │
│                               │       Viewer 主画面                   │
│ VIE Gallery                   │                                      │
│ 把私人影像整理成……            ├──────────────────┬───────────────────┤
│                               │ Admin 辅助画面   │ Spatial 辅助画面  │
│ 原图留存  相册整理            │                  │                   │
│ 2D/3D 浏览  受控分享          │                  │                   │
│                               │                  │                   │
│ [查看项目案例] [阅读开发日志] │                  │                   │
├───────────────────────────────┴──────────────────┴───────────────────┤
│ 2026-09-12  V1 Ready 验收通过                                        │
└──────────────────────────────────────────────────────────────────────┘
```

- 最大内容宽度：1120–1200px。
- 主区域使用 12 栏网格，文字 5 栏，媒体 7 栏。
- 不做等高项目卡片；高度由内容和媒体比例自然决定。

### 7.2 项目页移动端

```text
项目
不追求数量，记录真正做完、跑通并持续迭代的产品。

V1 已验收 · 持续迭代
VIE Gallery
把私人影像整理成……

[查看项目案例]
[阅读开发日志]

┌──────────────────────┐
│ Viewer 产品主画面    │
└──────────────────────┘
原图留存 / 相册整理 / 2D/3D 浏览 / 受控分享

2026-09-12 · V1 Ready 验收通过
```

在 375×812 视口内，应能看到页面标题、状态、项目名、价值主张、主动作和产品主图的开始部分。

### 7.3 详情页桌面端

```text
项目 / VIE Gallery

VIE Gallery                         V1 已验收 · 持续迭代
把私人影像整理成可长期保存、自然浏览、受控分享的个人空间。
[查看产品体验] [开发日志]

[ Admin ] [ Viewer ] [ Spatial ]  ← 三视图证据带

项目概览                    项目事实
问题 / 对象 / 范围          双端 / 验收日期 / 当前状态

产品体验
管理流程 ───────────────────────────────────────
浏览流程 ───────────────────────────────────────

核心能力
原图留存 | 相册整理 | 2D/3D 展示 | 受控分享

系统实现
验证与结果
开发日志
```

### 7.4 详情页移动端

- 面包屑、H1、状态、价值主张和动作按自然文档流排列。
- 产品事实融入概览，不设置右侧 sticky rail。
- 三视图按 Viewer → Admin → Spatial 顺序纵向展示；不使用自动轮播。
- 开发日志取消左侧长轨道，避免额外嵌套 gutter。

## 8. 组件与数据架构

### 8.1 当前链路

```text
site/projects.md
  → Projects.vue
    → projects.data.ts
      → projects.source.ts

site/projects/vie-gallery.md
  → ProjectDetail.vue
    → projects.data.ts
      → projects.source.ts
```

共享外壳主要位于：

- `site/.vitepress/theme/index.ts`
- `site/.vitepress/theme/Layout.vue`
- `site/.vitepress/theme/components/VieGlobalNav.vue`
- `site/.vitepress/theme/components/VieShell.vue`
- `site/.vitepress/theme/components/ViePageHeader.vue`
- `site/.vitepress/theme/components/VieWordmark.vue`
- `site/.vitepress/theme/custom.css`
- `site/.vitepress/theme/vie-bento.css`
- `site/.vitepress/theme/project-log.css`

首页项目区目前独立存在于 `HomeBento.vue` 和 `home-reference.css`，这是数据不一致的主要来源。

### 8.2 推荐组件边界

```text
Projects.vue                    /projects 页面编排
ProjectDetail.vue               详情页编排与章节
ProjectSpotlight.vue            首页与项目页共享的项目摘要
ProjectStatus.vue               单一状态映射与可访问文本
ProjectMediaStrip.vue           Admin / Viewer / Spatial 图组
ProjectCapabilityList.vue       四项核心能力
ProjectMilestoneList.vue        语义化开发日志
```

约束：

- `ProjectSpotlight` 只承载真正跨首页与项目页复用的摘要结构。
- 项目详情中的长文结构不强行抽象成万能 schema 组件。
- 不建立通用“卡片系统”；优先使用语义明确的项目组件。
- 所有组件使用现有 Vue/VitePress 栈，不新增 UI 框架。

### 8.3 推荐数据模型

继续保留 `projects.source.ts` 作为唯一数据源，但把共享展示信息补齐：

```ts
interface Project {
  slug: string
  name: string
  status: 'validated-iterating' | 'building' | 'live' | 'paused'
  summary: string
  proposition: string
  updatedAt: string
  tags: string[]
  featured: boolean
  capabilities: ProjectCapability[]
  media: ProjectMedia[]
  links?: ProjectLinks
  log: ProjectLogEntry[]
}
```

重要规则：

- 状态 label 由中心映射生成，模板中不手写不同版本文案。
- 首页项目数直接使用 `projects.length`。
- 首页当前项目使用 `featured` 项目，不维护本地假数组。
- `media` 必须包含宽高或稳定 `aspectRatio`，避免布局偏移。
- `alt` 描述截图内容，例如“VIE Gallery 管理端的相册整理界面”，不只写项目名。
- 新项目仍采用显式 `slug` + 显式 Markdown 页面，暂不引入动态路由。

## 9. 删除 Vie 本站项目的完整范围

删除对象是 `projects.source.ts` 中名称为 `Vie` 的项目记录，不是删除 Vie 品牌或站点资产。

必须同步处理：

1. 从 `projects.source.ts` 删除 Vie 项目对象。
2. 将 VIE Gallery 设为唯一且 `featured: true` 的项目。
3. 删除 `check-content.mjs` 中“Vie 恰好一次、featured:true、至少三条 decision”的硬编码断言。
4. 将守卫改为：项目数组非空、slug 唯一、featured 项目恰好一个、所有引用资源存在。
5. 更新项目数据测试，明确断言唯一项目为 `vie-gallery`，或至少断言所有展示面都来自同一数据源。
6. 修复 `vie-bento.css` 中项目网格半宽规则；单项目不能继续占 50% 宽度。
7. 审核 `VieAmbient.vue` 对 `projects.length` 的使用；如果组件仍启用，确保数量 1 是预期行为；若已彻底休眠，单独清理死代码。
8. 首页移除 API Fox、ChatAI、TinyCache 本地假数据并接入项目数据源。
9. 保留 `site/public/images/vie-home.png`，因为它仍被首页和 SEO fallback 使用。
10. 保留站点实现相关文章；必要时从项目入口迁移到“站点说明”或相关文章推荐。
11. 不修改旧方案中的历史记录，只在本文件和产品文档中标记新决策。

## 10. 响应式规范

| 视口 | 规则 |
|---|---|
| `>= 1200px` | 1120–1200px 容器；12 栏；项目摘要 5 栏、媒体 7 栏 |
| `1024–1199px` | 保持双列，缩小栏间距；媒体不得低于可辨识尺寸 |
| `768–1023px` | 项目页可转为 6/6 或上下布局；详情事实区取消侧栏 |
| `< 768px` | 16–20px 页面 gutter；文字和动作先于媒体；不嵌套多层卡片内边距 |
| `320–374px` | 按钮可纵向铺满；标签允许自然换行；不缩小正文字号换空间 |

固定要求：

- 在 320、375、768、1024、1440px 下无横向滚动。
- 图片使用稳定 `aspect-ratio`、`width`/`height` 或等价约束。
- hover、状态标签、图片加载和长标题不得造成布局位移。
- 技术标签是次要信息，移动端可以折行，但不得挤压正文列宽。
- 全局移动端页脚改为“品牌说明全宽 + 导航/分类两列 + 联系信息”，避免单列超长。

## 11. 交互与可访问性规范

1. 详情页唯一 H1 为 `VIE Gallery`，后续章节按 H2/H3 顺序排列。
2. 项目标题、主图和显式 CTA 均提供语义明确的详情链接。
3. 链接名称使用`查看 VIE Gallery 项目案例`、`阅读 VIE Gallery 开发日志`，不使用孤立的`日志`、`gh`、`demo`。
4. 交互目标最小 44×44px；文本链接若不满 44px，高度通过 padding 扩展。
5. `:focus-visible` 使用统一 2px Focus blue 环和 2–3px offset。
6. 状态必须包含文本，不依赖绿色或图标表达。
7. 所有普通文本对比度至少 4.5:1；大字号至少 3:1。
8. 开发日志使用 `ol/li`，日期使用 `<time datetime="YYYY-MM-DD">`。
9. 技术栈可使用语义列表，不把每个标签误做按钮。
10. 图片 alt 描述界面和任务；纯装饰图使用空 alt。
11. 若未来加入灯箱：支持键盘、Escape、焦点锁定、关闭后恢复焦点，并遵守 reduced motion。
12. 自动化检查不得出现 critical/serious 问题；仍需人工键盘和屏幕阅读器抽查。

## 12. 性能与运行时治理

### 12.1 Hydration mismatch

先定位再修复，不通过隐藏警告处理：

- 对比 SSG HTML 与 hydration 后 DOM。
- 优先检查日期本地化、客户端条件分支、随机值、viewport 分支和仅浏览器可用数据。
- 验收标准：项目列表与详情页首次加载控制台零 hydration 错误。

### 12.2 Mermaid 按需加载

项目页不应加载没有使用的图表运行时：

- 检查 `vitepress-plugin-mermaid` 的全局注册方式。
- 将 Mermaid 客户端代码限制到真正包含 Mermaid fence/组件的页面。
- 构建后通过网络瀑布验证 `/projects` 与详情页不再请求图表定义 chunk。
- 不移除文章页实际需要的 Mermaid 能力。

### 12.3 路由预取

- 移除 Vie 决策链接后，项目页不应再预取四篇无关文章。
- 检查 VitePress `shouldPrefetch` 策略，只预取用户高概率访问的项目详情。
- 尊重浏览器 Save-Data 和慢速网络条件。

### 12.4 字体与图片

- 修复或移除未使用的 Inter preload；保留时必须有正确 `as="font"`、类型和 CORS 属性。
- 项目首图提供合适的 AVIF/WebP 与回退格式，使用响应式 `srcset`。
- 首屏主图可 eager + `fetchpriority="high"`；其余图 lazy + `decoding="async"`。
- 所有图片预留尺寸，目标 CLS < 0.1。
- 代表性移动设备冷缓存目标 LCP <= 2.5s；测量结果以实际 trace 为准。

## 13. SEO 与分享

### `/projects`

- Title：`项目 | Vie`
- Description：`记录真正做完、跑通并持续迭代的产品。目前聚焦 VIE Gallery：个人影像的保存、整理、2D/3D 浏览与受控分享。`
- Canonical：`https://vie-vibe.cn/projects`
- OG image：专用 VIE Gallery 项目总览图，不再沿用首页图。

### `/projects/vie-gallery`

- Title：`VIE Gallery | Vie`
- Description 保持产品价值导向，而不是技术栈堆叠。
- Canonical：`https://vie-vibe.cn/projects/vie-gallery`
- OG image：1200×630 的产品证据组合图。
- 可在数据准确时增加 `SoftwareApplication` JSON-LD；至少包含名称、描述、图片、URL 和 Web 平台信息，不填写未知评分、价格或用户量。

## 14. 分阶段实施计划

### Phase 1：建立唯一项目事实源

#### Task 1：删除 Vie 项目并强化数据契约

**涉及文件**

- `site/projects.source.ts`
- `site/scripts/check-content.mjs`
- `site/.vitepress/theme/data/projects.data.test.ts`

**工作**

- 删除 Vie 项目记录。
- 将 Gallery 设为唯一 featured 项目。
- 增加统一状态和共享展示字段。
- 将旧的 Vie 硬编码守卫改为通用项目契约。

**验收**

- 项目数据中不存在名称为 Vie 的记录。
- `projects.length === 1`，唯一 slug 为 `vie-gallery`。
- featured 项目恰好一个。
- 所有 media、文章、外链和页面文件契约通过。

**验证**

```bash
cd E:/VIE/site
npm run check:content
npm run test:data
```

#### Task 2：首页项目数据统一

**涉及文件**

- `site/.vitepress/theme/components/HomeBento.vue`
- `site/.vitepress/theme/home-reference.css`
- 共享项目摘要组件文件

**工作**

- 删除三个占位项目。
- 项目计数从真实数据推导。
- 首页使用 VIE Gallery 共享摘要。

**验收**

- 首页只出现 VIE Gallery。
- 项目数量显示 1。
- 首页与 `/projects` 的名称、状态、摘要和 URL 完全一致。

### Checkpoint A

- `check:content` 和 `test:data` 通过。
- 全仓搜索不再有首页占位项目名。
- 站点仍可构建。

### Phase 2：重建项目列表体验

#### Task 3：建立项目视觉 token 与共享组件

**涉及文件**

- `site/.vitepress/theme/custom.css`
- 项目共享组件 2–3 个
- 项目共享样式文件

**工作**

- 建立 Action emerald、Focus blue、Line 等语义 token。
- 实现状态、能力列表和媒体证据带。
- 所有共享组件支持完整可访问名称和稳定图片比例。

**验收**

- 链接和状态文字达到 WCAG AA。
- 焦点样式统一。
- 组件在无 demo/source 链接时不保留空白。

#### Task 4：重构 `/projects` 为单项目旗舰页

**涉及文件**

- `site/projects.md`
- `site/.vitepress/theme/components/Projects.vue`
- `site/.vitepress/theme/vie-bento.css` 或新的项目页样式文件

**工作**

- 移除双列等高卡片网格。
- 实现 5/7 内容-媒体布局与移动端顺序。
- 增加明确主次动作和最新验证节点。

**验收**

- 1440px 下单项目占据完整内容宽度且不空旷。
- 375×812 下首屏可看到项目主动作和主图开头。
- 页面中无空卡槽、假筛选、Vie 项目内容。

### Checkpoint B

- 桌面 1440、1024 与移动 375、320 截图通过。
- 页面标题、动作和图片均可通过键盘访问。
- 无横向溢出。

### Phase 3：升级项目详情页

#### Task 5：重建详情页语义与内容层级

**涉及文件**

- `site/projects/vie-gallery.md`
- `site/.vitepress/theme/components/ProjectDetail.vue`
- `site/.vitepress/theme/project-log.css`

**工作**

- 将 VIE Gallery 改为唯一 H1。
- 添加概览、产品体验、能力、系统实现、验证和日志分区。
- 将开发日志降为完整案例中的一个章节，而非全部内容。

**验收**

- H1/H2/H3 顺序正确。
- 页面在不依赖技术标签的情况下能解释产品用途。
- 开发日志仍由现有结构化数据驱动。
- 移动端日志不因轨道与嵌套 gutter 变窄。

#### Task 6：补齐真实产品媒体

**涉及文件**

- `site/public/images/projects/*`
- `site/projects.source.ts`
- 项目媒体组件

**工作**

- 准备 admin、viewer、spatial 三类真实截图。
- 输出响应式尺寸与项目专属 OG 图。
- 填写描述性 alt、宽高和加载优先级。

**验收**

- 首屏不再只依赖森林/3D 氛围图解释产品。
- 图片无拉伸、裁切关键内容或布局跳动。
- 所有媒体引用通过数据契约测试。

### Checkpoint C

- `/projects/vie-gallery` 在 320、375、768、1024、1440px 下通过视觉检查。
- 语义树中唯一 H1 为 VIE Gallery。
- 键盘可以访问所有动作，顺序与视觉顺序一致。

### Phase 4：共享布局、SEO 与运行时质量

#### Task 7：优化移动端共享外壳

**涉及文件**

- `site/.vitepress/theme/Layout.vue`
- `site/.vitepress/theme/custom.css`
- 必要的页脚组件文件

**工作**

- 缩短移动端页脚纵向长度。
- 统一项目页面容器和 gutter。
- 清理与项目页冲突的通用标题/更新时间输出。

**验收**

- 项目详情不再显示通用“项目”H1或无意义站点构建时间。
- 390px 下页脚不形成冗长单列。
- 共享改动不破坏文章和工具页面。

#### Task 8：修复 SEO、hydration 与资源加载

**涉及文件**

- `site/.vitepress/seo.ts`
- `site/.vitepress/config.*`
- `site/.vitepress/theme/index.ts`
- Mermaid/字体注册相关文件

**工作**

- 添加 canonical、项目专属 metadata 和可选 JSON-LD。
- 找到并修复 hydration mismatch 根因。
- Mermaid 按需加载，修复字体 preload。
- 调整项目页预取策略。

**验收**

- 项目列表和详情控制台零 error、零 warning。
- 项目路由不请求未使用的 Mermaid 图表 chunk。
- 页面 source 中 metadata 与页面内容一致。
- 冷缓存性能达到 §12 目标或记录可解释的差距。

### Phase 5：文档与最终验证

#### Task 9：同步产品和设计文档

**涉及文件**

- `PRODUCT.md`
- `DESIGN.md`
- 本方案状态字段

**工作**

- 记录项目页从列表网格转为旗舰产品档案。
- 记录 Vie 不再作为项目。
- 更新项目组件和数据源说明。

#### Task 10：全量验收

**命令**

```bash
cd E:/VIE/site
npm run check:content
npm run test:data
npm run test:tools
npm run build
npm run preview
```

**浏览器矩阵**

- 320×800
- 375×812
- 390×844
- 768×900
- 1024×768
- 1440×900

**页面矩阵**

- `/`
- `/projects`
- `/projects/vie-gallery`
- 一篇含 Mermaid 的文章，用于确认按需加载未破坏图表
- `/articles/` 和 `/tools`，用于共享布局回归

## 15. 最终验收标准

### 数据一致性

- [ ] Vie 本站不再作为项目存在。
- [ ] VIE Gallery 是所有展示面的唯一项目。
- [ ] 首页项目数量为 1，且来自真实数据。
- [ ] 状态统一为“V1 已验收 · 持续迭代”。
- [ ] 首页、项目页、详情页使用相同名称、摘要、媒体和 URL。

### 页面体验

- [ ] `/projects` 在单项目状态下看起来是完整的旗舰展示，而不是缺一张卡的网格。
- [ ] 详情页 H1 是 VIE Gallery。
- [ ] 产品价值、体验、能力、实现、验证和日志层级清晰。
- [ ] 管理端、浏览端和 3D 展示均有真实产品证据。
- [ ] 主次 CTA 文案明确，不使用孤立缩写。

### 响应式与可访问性

- [ ] 320、375、768、1024、1440px 无裁切或横向滚动。
- [ ] 375×812 首屏出现标题、状态、价值、主 CTA 和媒体开头。
- [ ] 所有交互目标至少 44×44px。
- [ ] 文本对比度达到 WCAG AA。
- [ ] focus-visible 清晰统一。
- [ ] 自动化无 critical/serious 可访问性问题，并完成人工键盘检查。
- [ ] reduced motion 下无非必要动画。

### 运行质量

- [ ] 项目页面控制台零 error、零 warning。
- [ ] 无 hydration mismatch。
- [ ] 项目页不加载未使用的 Mermaid 图表 chunk。
- [ ] 图片尺寸稳定，CLS < 0.1。
- [ ] 代表性移动端冷缓存 LCP <= 2.5s，或留下基于 trace 的明确优化记录。
- [ ] canonical、OG 和项目描述准确。

### 工程质量

- [ ] `npm run check:content` 通过。
- [ ] `npm run test:data` 通过。
- [ ] `npm run test:tools` 通过。
- [ ] `npm run build` 通过。
- [ ] 共享布局回归页面通过浏览器检查。

## 16. 风险与控制

| 风险 | 影响 | 控制方式 |
|---|---|---|
| 只有一张 3D 图，产品证明不足 | 页面仍像概念展示 | 实现前先准备 admin/viewer/spatial 三类真实截图 |
| 删除 Vie 数据后内容守卫失败 | 构建阻断 | 第一阶段同步修改硬编码断言和数据测试 |
| 首页仍保留本地项目假数据 | 项目数量继续矛盾 | 首页项目区必须消费同一 source，不允许镜像数组 |
| 为单项目过度抽象组件 | 增加维护成本 | 只抽取跨首页/列表复用的摘要、状态、媒体组件 |
| Mermaid 按需加载影响文章 | 文章图表失效 | 加入含 Mermaid 文章的专项回归页面 |
| 共享页脚调整影响全站 | 文章/工具页面回归 | 以共享断点规则实现并纳入页面矩阵 |
| 状态文案以后变化 | 多页面再次不一致 | 状态 code + 中心 label 映射，不在模板手写 |
| 视觉优化引入低对比文本 | WCAG 回归 | token 层先验证，再做自动化与人工复核 |

## 17. 实施优先级

**P0：先解决真实性和结构**

- 删除 Vie 项目记录。
- 首页项目数据统一。
- `/projects` 单项目旗舰布局。
- 详情页 H1 与内容架构。

**P1：补足产品证据和质量**

- 三类真实截图。
- 对比度、焦点、触控目标、移动端日志。
- hydration mismatch、Mermaid 无关加载、字体 preload。

**P2：增强传播与维护**

- 项目专属 OG 图、canonical、结构化数据。
- 产品文档同步。
- 在未来新增第二个真实项目后，再评估是否切换为项目集合布局。

## 18. 预期结果

完成后，项目相关体验应从“两个技术卡片 + 一条开发日志”升级为一套一致的产品叙事：

- 首页准确地告诉访客当前只有一个真实项目。
- `/projects` 用一个完整的旗舰展示建立兴趣。
- 详情页用真实画面、体验流程和验证证据建立可信度。
- 技术栈仍然可见，但不再抢占产品价值之前的位置。
- Vie 站点本身回归品牌和内容载体角色，不再与 VIE Gallery 竞争“项目”身份。
