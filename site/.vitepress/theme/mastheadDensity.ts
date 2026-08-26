export type MastheadDensity = 'full' | 'mid' | 'narrow' | 'minimal'

export function normalizePath(path: string): string {
  if (!path || path === '/') return '/'
  return path.replace(/\/+$/, '') || '/'
}

export function mastheadDensity(path: string, hasDate: boolean): MastheadDensity {
  const p = normalizePath(path)
  if (p === '/stats-view') return 'minimal'
  if (p === '/') return 'full'
  if (hasDate) return 'narrow'
  if (p === '/articles' || p === '/series' || p === '/projects') return 'mid'
  if (p.startsWith('/articles/')) return 'narrow'
  return 'mid'
}