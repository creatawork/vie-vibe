import type { Post } from '../../posts'

export interface SearchHit {
  id: string
  title: string
  titles: string[]
}

export interface SearchSuggestion {
  href: string
  title: string
  section: string
  description: string
}

function pagePath(href: string) {
  return href.split('#')[0].replace(/\.html$/, '')
}

export function recentSuggestions(posts: Post[], limit = 3): SearchSuggestion[] {
  return posts.slice(0, limit).map((post) => ({
    href: post.url,
    title: post.title,
    section: '',
    description: post.description,
  }))
}

export function searchSuggestions(hits: SearchHit[], posts: Post[], query: string, limit = 6): SearchSuggestion[] {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return recentSuggestions(posts)
  const byPath = new Map(posts.map((post) => [post.url, post]))
  const seen = new Set<string>()
  const suggestions: SearchSuggestion[] = []

  function append(hit: SearchHit, post = byPath.get(pagePath(hit.id))) {
    const path = pagePath(hit.id)
    if (seen.has(path) || !path.startsWith('/') || path.startsWith('//')) return
    seen.add(path)
    const title = post?.title ?? hit.titles[0] ?? hit.title
    suggestions.push({
      href: hit.id,
      title,
      section: hit.title === title ? '' : hit.title,
      description: post?.description ?? hit.titles.slice(1).join(' · '),
    })
  }

  // Literal metadata matches also support Chinese substrings that the full-text
  // tokenizer may not split into independent words.
  const matchingPosts = posts.filter((post) => {
    const text = [post.title, post.description, ...post.tags].join(' ').toLocaleLowerCase()
    return terms.every((term) => text.includes(term))
  }).sort((a, b) => {
    const rank = (post: Post) => terms.filter((term) => post.title.toLocaleLowerCase().includes(term)).length
    return rank(b) - rank(a)
  })

  for (const post of matchingPosts) {
    const hit = hits.find((item) => pagePath(item.id) === post.url)
    append(hit ?? { id: post.url, title: post.title, titles: [] }, post)
  }
  for (const hit of hits) append(hit)
  return suggestions.slice(0, limit)
}

export function highlightParts(text: string, query: string): { text: string; highlighted: boolean }[] {
  const terms = [...new Set(query.trim().split(/\s+/).filter(Boolean))]
    .sort((a, b) => b.length - a.length)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  if (!terms.length) return [{ text, highlighted: false }]
  return text.split(new RegExp(`(${terms.join('|')})`, 'giu'))
    .map((part, index) => ({ text: part, highlighted: index % 2 === 1 }))
    .filter((part) => part.text.length > 0)
}
