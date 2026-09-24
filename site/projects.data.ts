import { projectsSource, type Project } from './projects.source'

declare const data: Project[]
export { data }

export default {
  watch: [],
  load(): Project[] {
    return projectsSource
  },
}
