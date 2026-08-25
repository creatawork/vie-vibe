import { createContentLoader } from 'vitepress'
import { toPost, groupBySeries, type SeriesGroup } from './.vitepress/posts'

declare const data: SeriesGroup[]
export { data }

export default createContentLoader('articles/**/*.md', {
  transform(raw): SeriesGroup[] {
    const posts = raw
      .map(toPost)
      .filter((p): p is NonNullable<ReturnType<typeof toPost>> => p !== null)
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    return groupBySeries(posts)
  },
})
