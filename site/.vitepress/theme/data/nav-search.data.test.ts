import { describe, expect, it } from 'vitest'
import type { Post } from '../../posts'
import { highlightParts, recentSuggestions, searchSuggestions } from '../search/results'

const posts: Post[] = [
  { title: '工具审批与恢复', url: '/articles/ai/approval', description: '订单写入先审批，再核对业务结果。', tags: ['Agent'], date: '2026-10-20', category: 'ai', wordCount: 800, readingTime: 2 },
  { title: 'DTO 和 Entity 什么时候拆', url: '/articles/backend/dto', description: '接口与持久化模型的边界。', tags: ['Spring'], date: '2026-10-10', category: 'backend', wordCount: 400, readingTime: 1 },
]

describe('navigation search suggestions', () => {
  it('finds Chinese substrings and combined metadata terms without relying on tokenization', () => {
    expect(searchSuggestions([], posts, '审批 Agent').map((result) => result.title)).toEqual(['工具审批与恢复'])
    expect(searchSuggestions([], posts, '持久化')[0].title).toBe('DTO 和 Entity 什么时候拆')
  })

  it('merges section hits into one article while retaining the best matching anchor', () => {
    const results = searchSuggestions([
      { id: '/articles/ai/approval#crash', title: '崩溃之后的恢复', titles: ['工具审批与恢复'] },
      { id: '/articles/ai/approval#retry', title: '重新执行', titles: ['工具审批与恢复'] },
    ], posts, 'crash')
    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({ title: '工具审批与恢复', href: '/articles/ai/approval#crash', section: '崩溃之后的恢复' })
  })

  it('keeps body-only matches and caps the list of distinct pages', () => {
    const hits = Array.from({ length: 12 }, (_, i) => ({ id: `/notes/${i}#body`, title: `Section ${i}`, titles: [`Note ${i}`] }))
    expect(searchSuggestions(hits, posts, 'body')).toHaveLength(6)
    expect(searchSuggestions(hits, posts, 'body')[0].title).toBe('Note 0')
  })

  it('uses recent articles for an empty query and keeps markup as text when highlighting', () => {
    expect(recentSuggestions(posts)[0].href).toBe(posts[0].url)
    expect(searchSuggestions([], posts, '   ')).toEqual(recentSuggestions(posts))
    const text = '<script>C++</script> 与 C++'
    const parts = highlightParts(text, 'C++')
    expect(parts.map((part) => part.text).join('')).toBe(text)
    expect(parts.filter((part) => part.highlighted).map((part) => part.text)).toEqual(['C++', 'C++'])
  })
})
