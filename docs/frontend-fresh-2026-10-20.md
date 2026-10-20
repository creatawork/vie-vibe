# 清新主题优化 · 2026-10-20

## 设计和范围

统一为暖白 `#F8FAF7`、薄荷 `#E9F5EE` 与自然绿 `#237556`，保留 Vie 定位句、真实项目、文章内容、URL 和浏览器工具逻辑。

首页把真实产品图库移入首屏，左侧展示定位与行动入口；项目区用创作者空间截图补充证据，接着是文章列表和浅绿工具区。各页面复用 `VieFooter.vue`，文章、项目和工具获得同一收尾。导航、筛选、阅读面板、系列、项目日志和工具工作台共享表面与文字颜色。

手机分类栏自动换行并取消吸顶，避免横向隐藏分类以及多行控件占用阅读区域。图库选中缩略图有真实边框，主图使用 contain 展示完整产品界面。手机输入字号、键盘焦点、错误状态和减少动态效果支持保留。

## 技能与方向

使用 find-skills 检查了 skills.sh，并使用已安装的 design-taste-frontend，无新增技能依赖。仓库 AGENTS.md 中列出的 skills-src 目录不存在。

主题方向最终为 split-stage，seed `1062927142`。最初抽到 contact-sheet，但其至少二十幅图像的条件与本站两个实际项目不符，因此重新选择可用真实界面支撑的 split-stage。保留既有信息架构；分栏用于首屏与项目证据，文章区打破分栏。没有引入图库照片、生成产品图、客户评价或演示数据。

## 验证

- `npm run check:content` 通过。
- `npm run test:data`：4 个文件，18 项通过。
- `npm run test:tools`：3 个文件，9 项通过。
- `npm run build` 通过；现有 Caddy 代码语言回退和超过 500 kB 的 chunk 提示仍存在。
- Vue SFC / CSS 解析通过，`git diff --check` 通过。
- 设计源码 lint：首页、共享页脚及对应样式，0 FAIL / 0 WARN。
- 通过浏览器在 390、768、1440px 检查：首页、文章列表、文章正文、项目列表、项目详情、系列列表、工具首页、JSON、时间戳、JWT。三十个组合均无整页横向溢出，每页一个 H1、一个共享页脚。
- 实际操作：图库上下切换；手机菜单打开与 Escape；文章分类、搜索、空结果恢复；导航搜索“幂等”及 Escape；JSON 格式化与无效输入；JWT 解码；Unix 0 转换得到 `1970-01-01T00:00:00.000Z`。

自动设计 inspector 无法启动独立 Chrome（进程立即退出），未计为通过；使用已连接的真实浏览器完成尺寸、可见页面与操作验收。截图与尺寸记录保存在忽略目录 `.taste-skill/fresh/`，未发布或部署。

## 视觉复核

ROUND 1
Seen in one second: 定位句与真实相册产品的海岸画面。
Idea (one sentence): Vie 的“阳光明媚”访客界面成为技术决策旁边的真实产品证据。
Live thing: 首屏可以切换访客端、创作者端与照片效果对照。
Layout words by section: hero=split / projects=evidence / writing=rows / tools=mint split / footer=shared close。
Scores: design 7.8 · usability 8.2 · creativity 7.0 · content 8.5 → overall 7.8。
Caps applied: inspector 未完成，分数只作为人工视觉判断，不代表自动规则全部通过。
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. 首轮桌面主图裁掉上下产品控件：固定舞台，图片改为 contain。
2. 首轮手机文章分类横向隐藏：改为换行并取消手机吸顶。
3. 首轮图库选中状态缺少可见边界：显式添加边框宽度与选中背景。

ROUND 2
Seen in one second: 暖白背景上的绿色定位与薄荷项目展示区。
Idea (one sentence): 项目实际界面与写作共同解释 Vie 的工程实践。
Live thing: 同一图库可用按钮与键盘选择完整截图。
Layout words by section: hero=split / projects=evidence / writing=rows / tools=mint split / footer=shared close。
Scores: design 7.8 · usability 8.2 · creativity 7.0 · content 8.5 → overall 7.8。
Caps applied: 自动 inspector 启动限制仍在。
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. 390px、768px、1440px 首页复核未发现仍需修正的明显碰撞、截断或隐藏内容。
2. 手机文章、项目和工具页复核未发现整页横向溢出。
3. 共享页脚入口、工具状态与文章正文层级保持可读。
