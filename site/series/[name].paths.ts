import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { toPost, groupBySeries, type Post } from '../.vitepress/posts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(__dirname, '..')

function collectMarkdownFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(fullPath))
    } else if (entry.name.endsWith('.md') && entry.name !== 'index.md') {
      files.push(fullPath)
    }
  }
  return files
}

function loadPosts(): Post[] {
  const articlesDir = path.join(srcDir, 'articles')
  return collectMarkdownFiles(articlesDir)
    .map((file) => {
      const src = fs.readFileSync(file, 'utf-8')
      const url =
        '/' +
        path
          .relative(srcDir, file)
          .replace(/\\/g, '/')
          .replace(/\.md$/, '')
      const frontmatterMatch = src.match(/^---\r?\n([\s\S]*?)\r?\n---/)
      const frontmatter: Record<string, unknown> = {}
      if (frontmatterMatch) {
        for (const line of frontmatterMatch[1].split('\n')) {
          const trimmed = line.replace(/\r$/, '').trim()
          if (!trimmed) continue
          const m = trimmed.match(/^(\w+):\s*(.+)$/)
          if (m) {
            const [, key, raw] = m
            if (raw.startsWith('[')) {
              frontmatter[key] = raw
                .slice(1, -1)
                .split(',')
                .map((s) => s.trim())
            } else {
              frontmatter[key] = raw.trim()
            }
          }
        }
      }
      return toPost({ src, frontmatter, url })
    })
    .filter((p): p is Post => p !== null)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
}

export default {
  async paths() {
    const posts = loadPosts()
    return groupBySeries(posts).map((g) => ({
      params: { name: g.name, posts: g.posts },
    }))
  },
}
