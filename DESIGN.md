# Design System — VIE

<!-- impeccable:design-schema 1 -->

## Direction

**Vibe Bento** personal tech site: dark dot-grid canvas, Bento home tiles with file-tab chrome and syntax-colored thesis. Personality from Vie wordmark, JetBrains Mono meta, and IDE-adjacent rhythm — not a full terminal costume.

Articles render on a dark **reading panel** (`vie-surface`) over the dot-grid chrome.

## Palette

| Token | Hex | Role |
|---|---|---|
| paper | `#09090B` | Site ground (dot grid) |
| paper-deep | `#14141A` | Tile surfaces |
| mist | `#2E2E3A` | Borders |
| ink | `#ECECF1` | Primary text on dark |
| ink-soft | `#9CA3AF` | Secondary on dark |
| mute | `#6B7280` | Meta / comments |
| signal | `#7DD3FC` | Strings / links |
| fn | `#4ADE80` | Functions / primary CTA / Vie V |
| kw | `#C084FC` | Keywords / tags |
| ember | `#F472B6` | Operators / accents |
| read-panel | `#F4F4F6` | Article body surface |

## Typography

- **Display:** Syne (tile titles, section heads)
- **Body:** Noto Sans SC + system UI
- **Mono:** JetBrains Mono (nav, meta, tabs, terminal block, wordmark)
- Loaded via Google Fonts with `display=swap`

## Layout

- **Shell:** single column; no asymmetric masthead. Top nav + `VieShell` page chrome on list/hub pages.
- **Home:** `<HomeBento />` — hero (greeting, PRODUCT.md positioning line 写清楚每一个技术决策, isometric desk art), real metrics, the three latest real posts from `articles.data` (category-toned covers, reading time, no view counts), featured project via `ProjectSpotlight`, three tool links, quote, home footer with real category anchors. Metrics and 当前项目 read real site data (`articles.data` / `projects.data`).
- **Project pages (2026-09-24):** `/projects` is a single-project flagship dossier (`Projects.vue` + `ProjectSpotlight` / `ProjectMediaStrip` / `ProjectCapabilityList`); `/projects/vie-gallery` is a case-study page (`ProjectDetail.vue` + `ProjectMilestoneList` timeline + sticky left TOC rail `ProjectToc` with scrollspy, ≥1101px), H1 = project name. The site itself is no longer listed as a project. (2026-09-30) `Projects.vue` gains an 其他项目 row under the flagship for non-featured projects; `ProjectDetail` sections render per-project data (`overview` / `flows` / `architecture` / `validation` in `projects.source.ts`) instead of hardcoded copy.
- **Project tokens:** `--vie-green-action` `#0B6B4B` (text links / buttons, WCAG AA on white) and `--vie-focus` `#1D5FD0` (unified `:focus-visible` ring) extend the light `--vie-*` palette; project component CSS lives in `project-flagship.css` + `project-log.css`.
- **Hub pages:** `ArticleList`, `Projects`, `ProjectDetail`, `SeriesIndex`, `SeriesPage`, `StatsView` use `VieShell` + `vie-panel` / `vie-tile` / `vie-feed`.
- **Tools:** `/tools` is a focused tool index; `/tools/json`, `/tools/timestamp`, and `/tools/jwt` use a shared `ToolShell` with browser-only processing, explicit error states, and responsive workbenches.
- **Articles:** dark `vie-surface` reading panel; `SeriesNav` as vibe tile footer; VP right aside TOC restored.
- **Mermaid:** fenced `mermaid` blocks render as build-time placeholders and hydrate on demand (`theme/mermaid.ts`); pages without a block never load the diagram runtime.

## Motion

- `vie-rise` on content and staggered tiles when `prefers-reduced-motion: no-preference`.
- Blinking cursor on home thesis only; disabled under reduced motion.
- `prefers-reduced-motion: reduce` disables animation, transition, smooth scroll.

## Browser chrome

- Scrollbar thumb: signal on paper-deep.
- `::selection`: signal tint.

## Provenance

- Vibe Bento + vibe-coding theme, 2026-08-26.
- Project experience redesign (flagship dossier + case-study detail, on-demand Mermaid, hydration fix), 2026-09-24.
- Frontend experience polish, 2026-09-27: real home articles replace seeded fakes, article pages gain H1 + formatted dates, hub/tool UI links reset against `.vp-doc a` underline, Mermaid themed to the site palette (base theme), nav wordmark legibility (decorations hidden below mast size), tightened hub top spacing, series-nav ghost copy removed, unique category anchors.
- Erpilot project mount + first series article, 2026-09-30: `ai` category tone (Bot icon, indigo tint on covers/thumbs), footer category anchors gain AI 工程, `/projects` 其他项目 card row, per-project `ProjectDetail` data, Erpilot case page `/projects/erpilot` and article `/articles/ai/handwritten-agent-loop` (series Erpilot 开发实录).
