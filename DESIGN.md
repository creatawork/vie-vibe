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
- **Home:** `<HomeBento />` — status bar, thesis tile, ship tile, latest post, feed, terminal snippet.
- **Hub pages:** `ArticleList`, `Projects`, `SeriesIndex`, `SeriesPage`, `StatsView` use `VieShell` + `vie-panel` / `vie-tile` / `vie-feed`.
- **Articles:** dark `vie-surface` reading panel; `SeriesNav` as vibe tile footer; VP right aside TOC restored.

## Motion

- `vie-rise` on content and staggered tiles when `prefers-reduced-motion: no-preference`.
- Blinking cursor on home thesis only; disabled under reduced motion.
- `prefers-reduced-motion: reduce` disables animation, transition, smooth scroll.

## Browser chrome

- Scrollbar thumb: signal on paper-deep.
- `::selection`: signal tint.

## Provenance

- Vibe Bento + vibe-coding theme, 2026-08-26.
