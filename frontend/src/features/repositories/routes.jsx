import { lazy } from "react"
import { Route } from 'react-router-dom'
const Repositories = lazy(() => import("./pages/Repositories.jsx"))
const CreateRepository = lazy(() => import("./pages/CreateRepository.jsx"))
const repositoryRoutes = (
  <>
    <Route path="/repositories" element={<Repositories />} />
    <Route path="/repositories/new" element={<CreateRepository />} />
  </>
)

export default repositoryRoutes
