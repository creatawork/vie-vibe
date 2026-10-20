# Gallery 项目内容与效果图同步

更新日期：2026-10-20；项目进度截至 2026-10-17。

## 事实来源

来源仓库 `F:\VIE\vie-gallery`，本地 HEAD 与只读查询的 GitHub main 均为
`997dc18954e2d8497e9010abe5b02aadfbf4c218`。本批只更新 vie-vibe，未修改或推送 Gallery 仓库。

- 当前品牌为“阳光明媚”，仓库名、内部包名与本站项目路径继续使用 vie-gallery。
- 10 月 16 日：16 种照片处理、10 种观看编排、翻页画册、空间穿行、配置与预览统一。
  依据 `docs/photo-effects-redesign-2026-10-16.md` 及对应提交。
- 10 月 16 日：品牌、账户入口与 CSRF 修复；受邀工作区列表和工作区切换。
  依据 `42526ad`、`ce3cf77`、`ee74f78` 与当前 README。
- 10 月 17 日：控件遮挡、逐张欣赏、移动预览折叠、单相册概览与标题回退。
  依据 `997dc18` 和 `.taste-skill/optimization-2026-10-17/changes.md`。
- 最新已保存的验收记录为 170 项单测、23 项 Admin 和 20 项 Viewer 浏览器用例通过；
  分别核对 `unit-tests.txt`、`admin-e2e.txt` 和 `viewer-e2e.txt`。

本站明确区分本地示例 / 模拟 API 的验收与公网部署、外部存储、邮件及实体低端设备验收。
本批没有重跑 Gallery 后端或整套浏览器回归，没有将历史记录写成本次新增测试结果。

## 图片来源与处理

使用项目已有示例照片及实际界面截图，没有生成、补画或替换截图内的作品和控件。
三个 JPG 截图无损转为 WebP，逐像素比较解码后的 RGB 完全一致；尺寸与完整构图保持原样。
16 种处理对照图直接复制原 WebP。总大小 965,770 字节。

| 新图片 | 来源（相对 Gallery 仓库） | 尺寸 |
| --- | --- | --- |
| `vie-gallery-20261017-viewer.webp` | `.taste-skill/optimization-2026-10-17/viewer-desktop-photo-first.jpg` | 1101 × 892 |
| `vie-gallery-20261017-workspace.webp` | `.taste-skill/optimization-2026-10-17/workspace-desktop.jpg` | 1270 × 714 |
| `vie-gallery-20261017-overview.webp` | `.taste-skill/optimization-2026-10-17/overview-desktop.jpg` | 1270 × 881 |
| `vie-gallery-20261016-photo-effects.webp` | `.cache/photo-effects/comparison.webp` | 1400 × 1152 |

新图片位于 `site/public/images/projects/`。项目总览、详情、核心能力与分享元数据均使用新图片；
旧图片 URL 保留以兼容历史链接。展示区图片可在新标签页打开原尺寸文件，并有可见键盘焦点。

输出 SHA-256，顺序对应上表：

```text
4b92f3d7e713cd5402a737897d9f7988f21aa58c12db22087717efbfef06edcf
dc53ac3ddbef10e52a3c16b33de2ff45f095a6b166f7b47d6e6feb893788320c
804e23f6a92580b6a14180b401b5b068c5dc5ab54e8d1abc54dc5b9f9964fcbf
3b5aaea82f0990125d26f5cc00badb3aa3b0f698a520fb4a55cc3ef7b6d722ab
```

## 本次验证

- 内容检查通过；既有数据及系列测试 11 项通过；最终 VitePress 构建通过。
- 内容与图片组件的 skill 源码扫描为 0 FAIL / 0 WARN。
- `inspect.mjs` 尝试启动 Chrome 时提前退出，未取得自动设计检查结果。
  改用应用内浏览器检查项目总览及详情，1440 / 768 / 390px 均无横向溢出；图片加载、比例、
  原尺寸链接和键盘焦点已核对，不将替代检查称作 inspector 通过。
- Git 差异检查、图片路径检查通过；Erpilot 数据保持不变。

## ROUND 1

Seen in one second: 先看到阳光明媚的完整主作品，再看到照片整理和实际渲染对照。

Idea (one sentence): 用当前产品自身的界面与同图效果对照说明“从照片到展览”。

Live thing: 展示图可用鼠标或键盘打开原尺寸文件。

Layout words by section: hero=existing-split / media=full-frame / capability=existing-grid / devlog=timeline。

Scores: design 6.5 · usability 8 · creativity 6.5 · content 8 → arithmetic 7.1，按既有细线、
卡片与等宽标签的 house-style 上限记录为 6.5。此处只复核内容和图片更新，未抽取新方向或 seed。

Caps applied: 现有站点设计约定沿用；自动 inspector 未完成，不宣称全页风格门禁通过。

Top three problems (most visible first), each with the screenshot it shows in and the fix:

1. 项目总览的小幅效果对照不能逐字阅读：提供原尺寸入口，详情页同时展示完整图。
2. 旧图与新品牌、最新界面不一致：四张实际图片和项目元数据一并更新。
3. 本地示例容易被误认为线上实拍：图片说明与验证范围均明确标注本地示例。
