import { Route } from 'react-router-dom'
import ProjectsList from './pages/ProjectList.jsx'
import ProjectBoard from './pages/ProjectBoard.jsx'

// relative to /repositories/:repoId (see RepoLayout)
const projectRoutes = (
  <>
    <Route path="projects" element={<ProjectsList />} />
    <Route path="projects/:projectId" element={<ProjectBoard />} />
  </>
)

export default projectRoutes
