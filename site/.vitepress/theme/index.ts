import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import ArticleList from './components/ArticleList.vue'
import LatestArticles from './components/LatestArticles.vue'
import Projects from './components/Projects.vue'
import SeriesIndex from './components/SeriesIndex.vue'
import SeriesPage from './components/SeriesPage.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('ArticleList', ArticleList)
    app.component('LatestArticles', LatestArticles)
    app.component('Projects', Projects)
    app.component('SeriesIndex', SeriesIndex)
    app.component('SeriesPage', SeriesPage)
  },
}
