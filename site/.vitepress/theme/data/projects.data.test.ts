import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  projectsSource,
  projectStatusLabel,
  type Project,
  type ProjectStatus,
} from '../../../projects.source'

const siteRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
)

const projects: Project[] = projectsSource
const statuses = Object.keys(projectStatusLabel) as ProjectStatus[]

describe('projects data', () => {
  it('is non-empty and vie-gallery is the featured flagship', () => {
    expect(projects.length).toBeGreaterThan(0)
    const slugs = projects.filter((p) => p.slug).map((p) => p.slug as string)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(slugs).toContain('vie-gallery')
    const featured = projects.filter((p) => p.featured)
    expect(featured.length).toBe(1)
    expect(featured[0]?.slug).toBe('vie-gallery')
  })

  it('does not list the site itself as a project', () => {
    const siteProjects = projects.filter(
      (p) => p.name === 'Vie' || p.slug === 'vie' || p.demo === 'https://vie-vibe.cn',
    )
    expect(siteProjects.map((p) => p.name)).toEqual([])
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

  it('shared presentation fields are well-formed', () => {
    for (const p of projects) {
      expect(statuses, p.name).toContain(p.status)
      expect(projectStatusLabel[p.status].length > 0, p.name).toBe(true)
      expect(p.proposition.trim().length > 0, p.name).toBe(true)
      expect(/^\d{4}-\d{2}-\d{2}$/.test(p.updatedAt), `${p.name}: updatedAt`).toBe(
        true,
      )
      for (const c of p.capabilities ?? []) {
        expect(c.title.trim().length > 0, p.name).toBe(true)
        expect(c.description.trim().length > 0, `${p.name}: ${c.title}`).toBe(true)
        if (c.image) {
          expect(
            fs.existsSync(path.join(siteRoot, 'public', c.image)),
            `${p.name}: missing capability image ${c.image}`,
          ).toBe(true)
        }
      }
      for (const m of p.media ?? []) {
        expect(m.src.startsWith('/'), `${p.name}: media src`).toBe(true)
        expect(
          fs.existsSync(path.join(siteRoot, 'public', m.src)),
          `${p.name}: missing media ${m.src}`,
        ).toBe(true)
        expect(m.alt.trim().length > 0, `${p.name}: media alt`).toBe(true)
        expect(m.caption.trim().length > 0, `${p.name}: media caption`).toBe(true)
        expect(m.width > 0 && m.height > 0, `${p.name}: media size`).toBe(true)
      }
    }
  })

  it('log entries are well-formed and newest-first (same-day entries allowed)', () => {
    for (const p of projects) {
      expect(statuses, p.name).toContain(p.status)
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
            `${p.name}: ${prevDate} must not be older than ${e.date}`,
          ).toBeGreaterThanOrEqual(+new Date(e.date))
        }
        prevDate = e.date
      }
    }
  })

  it('detail fields are well-formed', () => {
    for (const p of projects) {
      for (const f of p.overview ?? []) {
        expect(f.term.trim().length > 0, p.name).toBe(true)
        expect(f.text.trim().length > 0, `${p.name}: fact ${f.term}`).toBe(true)
      }
      for (const flow of p.flows ?? []) {
        expect(flow.title.trim().length > 0, p.name).toBe(true)
        expect(flow.steps.length > 0, `${p.name}: flow ${flow.title}`).toBe(true)
        for (const s of flow.steps) {
          expect(s.trim().length > 0, `${p.name}: flow ${flow.title}`).toBe(true)
        }
      }
      if (p.architecture !== undefined) {
        expect(p.architecture.trim().length > 0, p.name).toBe(true)
      }
      for (const v of p.validation ?? []) {
        expect(v.trim().length > 0, p.name).toBe(true)
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
