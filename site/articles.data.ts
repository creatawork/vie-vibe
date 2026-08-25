import { createContentLoader } from 'vitepress'
import { toPost, type Post } from './.vitepress/posts'

declare const data: Post[]
export { data }

export default createContentLoader('articles/**/*.md', {
  transform(raw): Post[] {
    return raw
      .map(toPost)
      .filter((p): p is Post => p !== null)
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  },
})
