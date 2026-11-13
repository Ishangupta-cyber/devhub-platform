import { lazy } from "react"
import { Route } from 'react-router-dom'
const ProjectsList = lazy(() => import("./pages/ProjectList.jsx"))
const ProjectBoard = lazy(() => import("./pages/ProjectBoard.jsx"))
// relative to /repositories/:repoId (see RepoLayout)
const projectRoutes = (
  <>
    <Route path="projects" element={<ProjectsList />} />
    <Route path="projects/:projectId" element={<ProjectBoard />} />
  </>
)

export default projectRoutes
