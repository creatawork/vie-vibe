import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export const SITE_URL = 'https://vie-vibe.cn'

export default withMermaid(
  defineConfig({
  title: 'Vie',
  titleTemplate: ':title | Vie',
  description: '技术实现细节与思路',
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    [
      'link',
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;600;700&family=Syne:wght@500;600;700&display=swap',
      },
    ],
  ],
  vite: {
    optimizeDeps: {
      include: ['@braintree/sanitize-url', 'dayjs'],
    },
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
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/creatawork' }],
    outline: { label: '本页目录' },
    lastUpdated: { text: '最后更新' },
    docFooter: { prev: '上一篇', next: '下一篇' },
  },
  mermaid: {},
  async transformHead({ pageData }) {
    const { headTagsForPage } = await import('./seo')
    return headTagsForPage(pageData, SITE_URL)
  },
  async buildEnd(siteConfig) {
    const { generateSitemap, generateFeed } = await import('./seo')
    await generateSitemap(siteConfig)
    await generateFeed(siteConfig)
  },
  })
)
