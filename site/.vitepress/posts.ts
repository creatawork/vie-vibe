import type { ContentData } from 'vitepress'

export interface Post {
  title: string
  url: string
  date: string
  description: string
  tags: string[]
  series?: string
  category: string
  wordCount: number
  readingTime: number
}

export interface SeriesGroup {
  name: string
  posts: Post[]
}

export function groupBySeries(posts: Post[]): SeriesGroup[] {
  const map = new Map<string, Post[]>()
  for (const p of posts) {
    if (!p.series) continue
    map.set(p.series, [...(map.get(p.series) ?? []), p])
  }
  return [...map.entries()].map(([name, posts]) => ({ name, posts }))
}

export function toPost(p: ContentData): Post | null {
  const fm = p.frontmatter
  if (!fm.title || !fm.date || fm.draft) return null
  const body = (p.src ?? '').replace(/^---[\s\S]*?---/, '')
  const wordCount = body.replace(/\s/g, '').length
  return {
    title: fm.title,
    url: p.url.replace(/\.html$/, ''),
    date: fm.date,
    description: fm.description ?? '',
    tags: fm.tags ?? [],
    series: fm.series,
    category: p.url.split('/')[2] ?? 'misc',
    wordCount,
    readingTime: Math.max(1, Math.ceil(wordCount / 400)),
  }
}
