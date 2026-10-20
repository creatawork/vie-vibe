# Design System — Vie

<!-- impeccable:design-schema 1 -->

## Direction

An editorial engineering portfolio: large, direct type introduces the author’s
point of view; actual project interfaces provide the visual evidence; articles
explain the decisions behind the work. The current UI is light. Older dark
terminal and illustrated desktop directions have been superseded.

The homepage follows **Type and nothing else**, seed `1637983323`, adapted to
the existing Vie identity and real content. Its opening statement is
“写清楚每一个技术决策”. It continues with project evidence, recent writing,
browser tools, and a forest-green closing field. The existing global navigation
is retained so every content area remains reachable.

## Tokens

| Role | Value |
|---|---|
| Ground | `#F5F7F4` |
| Content surface | `#FFFFFF` |
| Primary ink | `#1A2923` |
| Secondary ink | `#53635B` |
| Action green | `#0B6547` |
| Soft green | `#E3EFE7` |
| Footer field | `#133D30` |
| Keyboard focus | `#1D5FD0` |

Shared tokens and final navigation styles live in `visual-polish.css`, imported
after the base component styles. Content-specific refinements follow in
`content-polish.css`. Quiet surfaces use tone changes; the shared shadow tokens
are `none`. Floating mobile navigation keeps an overlay shadow.

## Typography

- Titles and body: Noto Sans SC, then system UI fonts. No new font dependency.
- Code, structured tool output, and input: JetBrains Mono, then system monospace.
- Metadata: the body face with tabular numerals.
- Home display: two authored lines, fluid 38–104px; the first line stays intact
  at phone widths. Section headings are 25–38px.
- Main reading text: 16–17px with generous line height. Long code and tables
  scroll inside their own region; long URLs and identifiers wrap where needed.

## Navigation and layout

- One shared sticky navigation: 首页、文章、项目、工具、系列. Active routes
  receive `aria-current`. Search expands in place within the navigation. GitHub has an
  explicit label. On phones the menu closes after navigation, outside click,
  or Escape; Escape returns focus to the trigger.
- Local search includes article titles and descriptions from frontmatter,
  matching the visible Layout heading. Section results show their parent article
  and title-only results link to the real `#post-title` anchor.
- Navigation search reuses the VitePress full-text index, loaded on demand.
  The field grows leftward from its existing position; live suggestions remain
  attached below it, with recent articles, safe text highlighting, and one hit
  per article. There is no modal, backdrop, or page scroll lock. Ctrl/Cmd+K or
  `/` opens search; arrows select, Enter follows the result, and Escape restores
  the trigger. Phone layouts retain the V mark and fit the suggestions within
  the viewport. IME composition and stale asynchronous results are handled.
- Main home and navigation align on a 1240px canvas with 32px outer gutters,
  reduced to 20px on phones. Homepage sections have distinct compositions:
  statement / project with screenshot gallery / article rows / split tools /
  green footer.
- Site content counts come from the actual articles, projects, and tool
  registry. Reading times and word counts share the build-time article source;
  both article and series loaders include Markdown source.
- Articles: combined title/summary/tag search and category filtering; category
  hashes remain linkable. Visible results and empty-state recovery are clear.
  Article bodies keep their white reading panel and dark syntax-highlighted code.
- Series: whole-card entries, reading-order directory, one H1, and accessible
  previous/next article controls.
- Projects: actual images with captions, thumbnails, previous/next controls,
  image count, and original-image links. Every gallery instance has unique IDs.
  Project details retain sticky desktop TOC, collapsible phone TOC, filtered
  milestones, and per-entry deep links. Filtered-out entries are restored before
  a TOC jump.
- Tools: browser-only JSON, timestamp, and JWT processing; stacked workbenches on
  phones, 16px mobile inputs, clear error/output states, keyboard shortcuts, and
  visible clipboard-failure feedback. Timezone options load after mount while
  keeping the SSR first render deterministic.

## Motion and accessibility

Motion uses small transforms and control feedback. Homepage text stays visible
throughout entrance animations, including when frame delivery is throttled.
`prefers-reduced-motion` removes animation, transitions, and smooth scrolling.
Interactive controls retain visible keyboard focus. Meaningful screenshots have
alt text; decorative icons are hidden from assistive technology.

## Imagery provenance

All homepage imagery is existing project evidence under `site/public/images/projects/`:
the 2026-10-17 visitor and creator interfaces and the 2026-10-16 photo-effects
comparison. They remain captioned as local examples. No stock imagery, fabricated
customer proof, generated product screenshots, or sample project data was added.

## History

- 2026-08–09: Bento and illustrated technical notebook explorations.
- 2026-09-24: project case studies, timeline, TOC, and on-demand Mermaid.
- 2026-09-30: Erpilot project and series introduced.
- 2026-10-05: article reading panel and category-filtered index.
- 2026-10-20: coordinated home, navigation, article/series, project, and tools
  display pass; reading-time data consistency and mobile interaction fixes.
