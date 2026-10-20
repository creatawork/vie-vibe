import { beforeAll, describe, expect, it } from 'vitest'
import { createMarkdownRenderer } from 'vitepress'
import config from '../../config.mts'

const search = config.themeConfig?.search
if (search?.provider !== 'local' || !search.options?._render) throw new Error('Local search renderer is required')
const renderSearch = search.options._render
let md: Awaited<ReturnType<typeof createMarkdownRenderer>>

beforeAll(async () => {
  md = await createMarkdownRenderer(process.cwd(), config.markdown)
})

function render(source: string) {
  return renderSearch(source, { path: '/articles/example.md', relativePath: 'articles/example.md' }, md)
}

describe('article search context', () => {
  it('indexes the article title and description when Markdown begins with a section', async () => {
    const html = await render('---\ntitle: DTO 和 Entity 什么时候拆\ndate: 2026-10-20\ndescription: 接口模型与持久化模型的边界\n---\n## 什么时候可以先不拆\n正文中的 DTO。')
    expect(html).toContain('<h1>DTO 和 Entity 什么时候拆<a href="#post-title">')
    expect(html).toContain('<p>接口模型与持久化模型的边界</p>')
    // VitePress skips empty heading sections, including their parent context.
    expect(html.match(/<\/h1>([\s\S]*?)<h2/)?.[1].trim()).toBeTruthy()
    expect(html).toContain('什么时候可以先不拆')
  })

  it('honors pages explicitly excluded from search', async () => {
    expect(await render('---\ntitle: 私有页\ndate: 2026-10-20\nsearch: false\n---\n## 正文\n不应建立索引。')).toBe('')
  })

  it('keeps normal Markdown headings on pages without article metadata', async () => {
    const html = await render('# 工具说明\n\n浏览器内处理。')
    expect(html.match(/<h1/g)).toHaveLength(1)
    expect(html).not.toContain('#post-title')
  })
})
