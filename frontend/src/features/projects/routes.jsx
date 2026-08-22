import { Route } from 'react-router-dom'
import ProjectsList from './pages/ProjectsList.jsx'
import ProjectBoard from './pages/ProjectBoard.jsx'

const projectRoutes = (
  <>
    <Route path="/repositories/:repoId/projects" element={<ProjectsList />} />
    <Route path="/repositories/:repoId/projects/:projectId" element={<ProjectBoard />} />
  </>
)

export default projectRoutes