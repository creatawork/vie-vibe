import type { ContentData } from 'vitepress'
import { describe, expect, it } from 'vitest'
import { groupBySeries, toPost, type Post } from '../../posts'
import seriesPaths from '../../../series/[name].paths'

function post(url: string, date: string, seriesOrder?: number): Post {
  return {
    url,
    date,
    seriesOrder,
    title: url,
    description: '',
    tags: [],
    category: 'ai',
    wordCount: 400,
    readingTime: 1,
    series: 'Erpilot 开发实录',
  }
}

describe('series reading order', () => {
  it('builds the real Erpilot directory with the same seven-part reading order', async () => {
    const pages = await seriesPaths.paths()
    const page = pages.find((p) => p.params.name === 'Erpilot 开发实录')
    expect(page?.params.posts.map((p) => p.seriesOrder)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(page?.params.posts.every((p) => typeof p.date === 'string')).toBe(true)
  })

  it('keeps same-day releases in part order even when filenames sort differently', () => {
    const posts = [
      post('/agent-evaluation', '2026-10-20', 5),
      post('/context', '2026-10-20', 7),
      post('/mcp', '2026-10-20', 2),
      post('/loop', '2026-09-30', 1),
      post('/rag', '2026-10-20', 6),
      post('/approval', '2026-10-20', 3),
      post('/idempotency', '2026-10-20', 4),
    ]
    const [group] = groupBySeries(posts)
    expect(group?.posts.map((p) => p.seriesOrder)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(posts[0]?.url).toBe('/agent-evaluation')
  })

  it('retains chronological ordering for series without explicit part numbers', () => {
    const [group] = groupBySeries([
      post('/later', '2026-10-20'),
      post('/earlier', '2026-09-30'),
    ])
    expect(group?.posts.map((p) => p.url)).toEqual(['/earlier', '/later'])
  })

  it('reads positive integer part numbers from frontmatter only', () => {
    for (const [value, expected] of [[3, 3], ['3', undefined], [0, undefined], [-1, undefined], [1.5, undefined]] as const) {
      const input = {
        url: '/articles/ai/example.html',
        frontmatter: { title: 'Example', date: '2026-10-20', seriesOrder: value },
        src: '',
      } as ContentData
      expect(toPost(input)?.seriesOrder).toBe(expected)
    }
  })
})
