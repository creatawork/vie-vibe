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
- **Hub pages:** `ArticleList`, `Projects`, `ProjectDetail`, `SeriesIndex`, `SeriesPage`, `StatsView` use `VieShell` + `vie-panel` / `vie-tile` / `vie-feed`. `ArticleList` (2026-10-05, 2nd pass) is a category-filtered index: the hub escapes VPDoc's 784px reading column (`:has(.hub-index)` → 1240px canvas), a toolbar carries stats + RSS, and a sticky tone-dotted chip bar (全部 + per-category counts, `aria-pressed`) filters a 2-column card grid (`min-width: 0` against the `vie-page-body` grid; newest post spans full width with a tone wash under 全部; filtered views get a slim tone cathead). `/articles/#<slug>` hashes from the footer/home category anchors land pre-filtered via `hashchange`; chips `history.replaceState` the hash. Tone stays off the resting cards — it appears on hover (border/title/arrow) and the featured card only.
- **Tools:** `/tools` is a focused tool index; `/tools/json`, `/tools/timestamp`, and `/tools/jwt` use a shared `ToolShell` with browser-only processing, explicit error states, and responsive workbenches.
- **Articles (2026-10-05):** frontmatter-dated pages get `.vie-page-post` — a white reading panel card (880px column, rounded 20px) on the site canvas; post head = category chip (`articles/<category>/` folder) + series chip, display title, `description` lede, mono meta with tag chips; compact series strip (part x/y + prev/next); dark IDE code surfaces (built-in shiki dark palette via `--shiki-dark`); bottom outline TOC; closing V mark after `VPDocFooter`. Styles in `article.css`, scoped so hubs/projects keep their look.
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
- Article reading redesign, 2026-10-05: reading panel card + restructured post head (category/series chips, description lede, tag chips), compact series strip, dark code blocks on the bright page, softened scrollbar, footer `align-content: start` fix, `scroll-padding-top` for sticky-nav anchor jumps, closing end-mark; new `article.css`, `Layout.vue` post slots.
- Articles hub redesign, 2026-10-05: color-keyed notebook index — per-category tone as rail dots + row spines, card list replaced by hairline rows in one panel (title/date head, clamped description, mono meta with tone-colored category), sticky Chinese-label rail with counts + RSS note, mobile collapses to a pill row; `ArticleList.vue` rewritten, dead `vie-list-*` / `vie-category-*` styles removed. Same day, layout pass: the rail was dropped because the whole page sat in VPDoc's 784px column; the hub now takes the 1240px canvas with a category bento grid (tone head panels, recency-ordered, auto-fill 460px columns) and a full-width stats/RSS toolbar.
- Articles hub 2nd pass, 2026-10-05: bento replaced by a filter-driven index after feedback (categories should be navigation, page should read modern) — sticky chip filter bar (tone dot + label + mono count, active = ink pill, hash-synced with footer/home category anchors), unified 2-col card grid with the newest post as a full-width tone-washed feature card, slim tone cathead on filtered views, cards quiet at rest with tone surfacing on hover; `min-width: 0` fixes for the `vie-page-body` grid so mobile shrinks instead of overflowing (chips scroll horizontally); JS `<Transition>` swap dropped in favor of keyed remount + staggered `vie-rise` (frame-throttled environments could stall out-in transitions).
