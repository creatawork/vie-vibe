import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { Feed } from 'feed'
import type { HeadConfig } from 'vitepress'
import { SITE_URL } from './config.mts'

interface HeadPageData {
  relativePath: string
  title: string
  description: string
  frontmatter: Record<string, unknown>
}

export function pageUrl(relativePath: string, siteUrl: string): string {
  const path = relativePath
    .replace(/\\/g, '/')
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, '')
    .replace(/\/$/, '')
  return path ? `${siteUrl}/${path}` : siteUrl
}

export function headTagsForPage(pageData: HeadPageData, siteUrl: string): HeadConfig[] {
  const fmDesc = pageData.frontmatter.description
  const description =
    (typeof fmDesc === 'string' && fmDesc) ||
    pageData.description ||
    '技术实现细节与思路'
  const url = pageUrl(pageData.relativePath, siteUrl)
  const rel = pageData.relativePath.replace(/\\/g, '/')
  const isArticle = rel.startsWith('articles/') && !rel.endsWith('index.md')
  const image = `${siteUrl}/images/vie-home.png`
  return [
    [
      'link',
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        href: `${siteUrl}/feed.xml`,
        title: 'Vie RSS',
      },
    ],
    ['meta', { property: 'og:site_name', content: 'Vie' }],
    ['meta', { property: 'og:title', content: pageData.title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: url }],
    ['meta', { property: 'og:type', content: isArticle ? 'article' : 'website' }],
    ['meta', { property: 'og:image', content: image }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: pageData.title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: image }],
  ]
}

interface SiteConfig {
  outDir: string
  srcDir: string
  pages: string[]
}

export async function generateSitemap(siteConfig: SiteConfig) {
  const urls = siteConfig.pages
    .filter((p) => !p.includes('[') && p !== '404.md')
    .map((p) => p.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, ''))
    .map((p) => `${SITE_URL}/${p}`)
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`
  await fs.promises.writeFile(path.join(siteConfig.outDir, 'sitemap.xml'), xml)
}

export async function generateFeed(siteConfig: SiteConfig) {
  const articlesDir = path.join(siteConfig.srcDir, 'articles')
  const files = (
    await fs.promises.readdir(articlesDir, { recursive: true })
  ).filter((f): f is string => typeof f === 'string' && f.endsWith('.md'))

  const feed = new Feed({
    title: 'Vie',
    description: '技术实现细节与思路',
    id: SITE_URL,
    link: SITE_URL,
    language: 'zh-CN',
    feedLinks: { rss2: `${SITE_URL}/feed.xml` },
    copyright: '',
  })

  const items: { title: string; url: string; description: string; date: Date }[] = []
  for (const file of files) {
    const raw = await fs.promises.readFile(path.join(articlesDir, file), 'utf8')
    const { data: fm } = matter(raw)
    if (!fm.title || !fm.date || fm.draft) continue
    const slug = file.replace(/\\/g, '/').replace(/\.md$/, '')
    items.push({
      title: fm.title,
      url: `${SITE_URL}/articles/${slug}`,
      description: fm.description ?? '',
      date: new Date(fm.date),
    })
  }
  items.sort((a, b) => +b.date - +a.date)
  for (const item of items.slice(0, 20)) {
    feed.addItem({
      title: item.title,
      id: item.url,
      link: item.url,
      description: item.description,
      date: item.date,
    })
  }
  await fs.promises.writeFile(path.join(siteConfig.outDir, 'feed.xml'), feed.rss2())
}
