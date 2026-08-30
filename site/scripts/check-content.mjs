import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FORBIDDEN = ['正文占位', '样本', '静态模拟']
const POSITIONING = '后端开发工程师 / 技术记录者 / 工具创造者'

const errors = []

function walkMd(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkMd(full, acc)
    else if (entry.name.endsWith('.md')) acc.push(full)
  }
  return acc
}

function hasForbidden(text) {
  return FORBIDDEN.filter((w) => text.includes(w))
}

const articlesDir = path.join(siteRoot, 'articles')
for (const file of walkMd(articlesDir)) {
  const rel = path.relative(siteRoot, file).replaceAll('\\', '/')
  if (rel === 'articles/index.md') continue
  const raw = fs.readFileSync(file, 'utf8')
  const { data, content } = matter(raw)
  const title = typeof data.title === 'string' ? data.title.trim() : ''
  const date = data.date
  const description = typeof data.description === 'string' ? data.description.trim() : ''
  if (!title) errors.push(`${rel}: missing title`)
  if (!date) errors.push(`${rel}: missing date`)
  if (description.replace(/\s/g, '').length < 12) {
    errors.push(`${rel}: description too short`)
  }
  const bodyChars = content.replace(/\s/g, '').length
  if (bodyChars < 400) errors.push(`${rel}: body ${bodyChars} < 400`)
  for (const w of hasForbidden(description + '\n' + content)) {
    errors.push(`${rel}: forbidden "${w}"`)
  }
}

const projectsSrc = fs.readFileSync(path.join(siteRoot, 'projects.data.ts'), 'utf8')
const vieNames = projectsSrc.match(/name: 'Vie'/g) || []
if (vieNames.length !== 1) {
  errors.push(`projects.data.ts: expected exactly one name: 'Vie', got ${vieNames.length}`)
}
if (!projectsSrc.includes('featured: true')) {
  errors.push(`projects.data.ts: missing featured: true`)
}
const hrefs = projectsSrc.match(/href: '\/articles\//g) || []
if (hrefs.length < 3) {
  errors.push(`projects.data.ts: expected >= 3 decision hrefs, got ${hrefs.length}`)
}

const home = fs.readFileSync(
  path.join(siteRoot, '.vitepress/theme/components/HomeBento.vue'),
  'utf8',
)
if (!home.includes(POSITIONING)) {
  errors.push('HomeBento.vue: missing positioning line')
}

const config = fs.readFileSync(path.join(siteRoot, '.vitepress/config.mts'), 'utf8')
if (!config.includes("provider: 'local'")) {
  errors.push("config.mts: missing search provider: 'local'")
}

const seo = fs.readFileSync(path.join(siteRoot, '.vitepress/seo.ts'), 'utf8')
if (!seo.includes("rel: 'alternate'")) errors.push('seo.ts: missing RSS alternate')
if (!seo.includes('og:description')) errors.push('seo.ts: missing og:description')

if (errors.length) {
  console.error('check-content failed:\n' + errors.map((e) => ` - ${e}`).join('\n'))
  process.exit(1)
}
console.log('check-content ok')
