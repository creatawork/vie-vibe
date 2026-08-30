import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import ArticleList from './components/ArticleList.vue'
import HomeBento from './components/HomeBento.vue'
import VieShell from './components/VieShell.vue'
import ViePageHeader from './components/ViePageHeader.vue'
import VieAmbient from './components/VieAmbient.vue'
import Projects from './components/Projects.vue'
import SeriesIndex from './components/SeriesIndex.vue'
import SeriesPage from './components/SeriesPage.vue'
import StatsView from './components/StatsView.vue'
import DevNotesHub from './components/DevNotesHub.vue'
import './custom.css'
import './vie-bento.css'
import './home-reference.css'
import './hub-reference.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('ArticleList', ArticleList)
    app.component('HomeBento', HomeBento)
    app.component('VieShell', VieShell)
    app.component('ViePageHeader', ViePageHeader)
    app.component('VieAmbient', VieAmbient)
    app.component('Projects', Projects)
    app.component('SeriesIndex', SeriesIndex)
    app.component('SeriesPage', SeriesPage)
    app.component('StatsView', StatsView)
    app.component('DevNotesHub', DevNotesHub)
  },
}
