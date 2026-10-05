import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import ArticleList from './components/ArticleList.vue'
import HomeBento from './components/HomeBento.vue'
import VieShell from './components/VieShell.vue'
import ViePageHeader from './components/ViePageHeader.vue'
import Projects from './components/Projects.vue'
import ProjectDetail from './components/ProjectDetail.vue'
import ProjectSpotlight from './components/ProjectSpotlight.vue'
import ProjectStatus from './components/ProjectStatus.vue'
import ProjectMediaStrip from './components/ProjectMediaStrip.vue'
import ProjectCapabilityList from './components/ProjectCapabilityList.vue'
import ProjectMilestoneList from './components/ProjectMilestoneList.vue'
import SeriesIndex from './components/SeriesIndex.vue'
import SeriesPage from './components/SeriesPage.vue'
import StatsView from './components/StatsView.vue'
import ToolIndex from './components/tools/ToolIndex.vue'
import ToolShell from './components/tools/ToolShell.vue'
import JsonWorkbench from './components/tools/JsonWorkbench.vue'
import TimestampConverter from './components/tools/TimestampConverter.vue'
import JwtParser from './components/tools/JwtParser.vue'
import './custom.css'
import './article.css'
import './vie-bento.css'
import './home-reference.css'
import './tools.css'
import './project-log.css'
import './project-flagship.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('ArticleList', ArticleList)
    app.component('HomeBento', HomeBento)
    app.component('VieShell', VieShell)
    app.component('ViePageHeader', ViePageHeader)
    app.component('Projects', Projects)
    app.component('ProjectDetail', ProjectDetail)
    app.component('ProjectSpotlight', ProjectSpotlight)
    app.component('ProjectStatus', ProjectStatus)
    app.component('ProjectMediaStrip', ProjectMediaStrip)
    app.component('ProjectCapabilityList', ProjectCapabilityList)
    app.component('ProjectMilestoneList', ProjectMilestoneList)
    app.component('SeriesIndex', SeriesIndex)
    app.component('SeriesPage', SeriesPage)
    app.component('StatsView', StatsView)
    app.component('ToolIndex', ToolIndex)
    app.component('ToolShell', ToolShell)
    app.component('JsonWorkbench', JsonWorkbench)
    app.component('TimestampConverter', TimestampConverter)
    app.component('JwtParser', JwtParser)
  },
}
