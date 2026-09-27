import { defineConfig } from 'vitepress'

export const SITE_URL = 'https://vie-vibe.cn'

export default defineConfig({
  title: 'Vie',
  titleTemplate: ':title | Vie',
  description: '技术实现细节与思路',
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;600;700&display=swap',
      },
    ],
  ],
  markdown: {
    config(md) {
      // Mermaid fences render as an empty placeholder in the static build; the
      // client (theme/mermaid.ts) hydrates them on pages that actually contain
      // one, so project pages never load the diagram runtime.
      const fence = md.renderer.rules.fence
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        if (token && token.info.trim() === 'mermaid') {
          const code = Buffer.from(token.content, 'utf8').toString('base64')
          return `<div class="vie-mermaid" data-code="${code}" role="img" aria-label="图表"></div>`
        }
        return fence
          ? fence(tokens, idx, options, env, self)
          : self.renderToken(tokens, idx, options)
      }
    },
  },
  vite: {
    resolve: {
      alias: {
        dayjs: 'dayjs/',
      },
    },
  },
  themeConfig: {
    siteTitle: false,
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索文章' },
          modal: {
            noResultsText: '没有找到',
            resetButtonTitle: '清除',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
      },
    },
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/articles/' },
      { text: '系列', link: '/series/' },
      { text: '成果', link: '/projects' },
      { text: '工具', link: '/tools' },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/creatawork' }],
    outline: { label: '本页目录' },
    lastUpdated: { text: '最后更新' },
    docFooter: { prev: '上一篇', next: '下一篇' },
  },
  async transformHead({ pageData }) {
    const { headTagsForPage } = await import('./seo')
    return headTagsForPage(pageData, SITE_URL)
  },
  transformHtml(code, id) {
    // VitePress fills VPNavBar's scroll-state classes in a client post-effect,
    // so the static HTML misses the `top` class the browser applies at scroll
    // 0 and every page hydrates with a mismatch. Add it on the server side.
    if (id.endsWith('.html')) {
      return code.replace('<div class="VPNavBar"', '<div class="VPNavBar top"')
    }
  },
  async buildEnd(siteConfig) {
    const { generateSitemap, generateFeed } = await import('./seo')
    await generateSitemap(siteConfig)
    await generateFeed(siteConfig)
  },
})
