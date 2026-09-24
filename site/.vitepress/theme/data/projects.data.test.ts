import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { projectsSource, type Project } from '../../../projects.source'

const siteRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
)

const projects: Project[] = projectsSource

describe('projects data', () => {
  it('slugs are unique and vie-gallery is registered', () => {
    const slugs = projects.filter((p) => p.slug).map((p) => p.slug as string)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(slugs).toContain('vie-gallery')
  })

  it('every slug has a page file', () => {
    for (const p of projects) {
      if (!p.slug) continue
      expect(
        fs.existsSync(path.join(siteRoot, 'projects', `${p.slug}.md`)),
        `${p.name}: missing site/projects/${p.slug}.md`,
      ).toBe(true)
    }
  })

  it('log entries are well-formed and strictly newest-first', () => {
    for (const p of projects) {
      expect(['building', 'live'], p.name).toContain(p.status)
      let prevDate: string | null = null
      for (const e of p.log ?? []) {
        expect(e.title.trim().length > 0, p.name).toBe(true)
        expect(e.tech.length > 0, e.title).toBe(true)
        expect(['feature', 'fix', 'milestone', 'decision'], e.title).toContain(e.type)
        expect(e.date, e.title).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(Number.isNaN(+new Date(e.date)), e.title).toBe(false)
        if (prevDate) {
          expect(
            +new Date(prevDate),
            `${p.name}: ${prevDate} must be newer than ${e.date}`,
          ).toBeGreaterThan(+new Date(e.date))
        }
        prevDate = e.date
      }
    }
  })

  it('article/link/image references resolve', () => {
    for (const p of projects) {
      for (const e of p.log ?? []) {
        if (e.article) {
          expect(e.article.startsWith('/'), e.title).toBe(true)
          const rel = e.article.replace(/^\//, '')
          const exists =
            fs.existsSync(path.join(siteRoot, `${rel}.md`)) ||
            fs.existsSync(path.join(siteRoot, rel, 'index.md'))
          expect(exists, `${p.name}: broken article link ${e.article}`).toBe(true)
        }
        if (e.link) {
          expect(e.link.startsWith('https://'), e.title).toBe(true)
        }
        if (e.image) {
          expect(
            fs.existsSync(path.join(siteRoot, 'public', e.image)),
            `${p.name}: missing image ${e.image}`,
          ).toBe(true)
        }
      }
      if (p.image) {
        expect(
          fs.existsSync(path.join(siteRoot, 'public', p.image)),
          `${p.name}: missing image ${p.image}`,
        ).toBe(true)
      }
    }
  })
})
