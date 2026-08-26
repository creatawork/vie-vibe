# Design System — VIE

<!-- impeccable:design-schema 1 -->

## Direction

**Asymmetric masthead** personal tech site: left column carries Vie wordmark and context; right column is reading surface. Personality from the HTML wordmark (`<span class="vie-v">V</span><span class="vie-ie">ie</span>`), cool paper, ink navy, and Sora — not VitePress default hero or costume themes.

Four masthead densities (`full`, `mid`, `narrow`, `minimal`) driven by route and front matter via `mastheadDensity()`.

## Palette

| Token | Hex | Role |
|---|---|---|
| paper | `#F3F5F7` | Page ground (cool, not cream) |
| paper-deep | `#E8ECF1` | Soft surfaces / scrollbar track |
| mist | `#D5DCE5` | Dividers |
| ink | `#12161C` | Primary text |
| ink-soft | `#3A4250` | Secondary text |
| mute | `#5C6672` | Meta / captions |
| signal | `#1F4E79` | Brand / links / primary CTA / scrollbar thumb |
| ember | `#C45C26` | Sparse accent (masthead bar, focus reserve) |

Dark mode mirrors the same roles on near-black paper.

## Typography

- **Display:** Sora (masthead wordmark, section heads, doc headings)
- **Body:** Noto Sans SC + system UI
- Loaded via Google Fonts with `display=swap` and preconnect

## Layout

- **Shell:** CSS Grid on `.Layout` from **960px** — sticky left `aside.vie-masthead`, main content in `.VPContent` column; nav spans full width. Below 960px masthead stacks above content.
- **Densities:**
  - `full` — home: large Vie, tagline「写清楚每一个技术决策」, CTAs「阅读文章」「查看成果」
  - `mid` — list hubs (`/articles/`, `/series/`, `/projects`): wordmark + tagline, no hero buttons
  - `narrow` — dated articles: compact wordmark + in-masthead TOC; default doc aside hidden
  - `minimal` — `/stats-view`: wordmark only
- **Home:** document page with `<LatestArticles />` and `<HomeProjects />` (no `layout: home`).
- Lists use hairline rules; project tiles only where links need a container.

## Motion

- One entry **`vie-rise`** (600ms) on `.vie-masthead` and `.VPContent` (80ms delay on content) when `prefers-reduced-motion: no-preference`.
- No per-list-item rise; no hero stagger.
- `prefers-reduced-motion: reduce` disables all animation, transition, and smooth scroll.

## Browser chrome

- Scrollbars use `scrollbar-color: signal / paper-deep` (Firefox).

## Provenance

- Direction comps (rejected costumes): `.impeccable/mocks/decision/safer-*.png`, assets `vie-safer-*.png`
- Web-native north star: `C:\Users\V\.cursor\projects\e-VIE\assets\vie-web-cold-journal.png` (reference only; build uses CSS atmosphere, not stock hero photo)
