import localSearchIndex from '@localSearchIndex'
import MiniSearch from 'minisearch'
import type { SearchHit } from './results'

let loaders = localSearchIndex
const indexes = new Map<string, Promise<MiniSearch>>()

if (import.meta.hot) {
  import.meta.hot.accept('/@localSearchIndex', (module) => {
    if (module) {
      loaders = module.default
      indexes.clear()
    }
  })
}

export async function searchLocalIndex(query: string, locale: string): Promise<SearchHit[]> {
  if (!indexes.has(locale)) {
    const pending = (async () => {
      const data = await loaders[locale]?.()
      if (!data?.default) throw new Error('Search index unavailable')
      return MiniSearch.loadJSON(data.default, {
        fields: ['title', 'titles', 'text'],
        storeFields: ['title', 'titles'],
        searchOptions: { fuzzy: 0.2, prefix: true, boost: { title: 4, text: 2, titles: 1 } },
      })
    })()
    indexes.set(locale, pending)
    pending.catch(() => indexes.delete(locale))
  }
  const index = await indexes.get(locale)!
  return index.search(query).slice(0, 40) as unknown as SearchHit[]
}
