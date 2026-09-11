import { Route } from 'react-router-dom'
import Repositories from './pages/Repositories.jsx'
import CreateRepository from './pages/CreateRepository.jsx'
import RepositoryDetail from './pages/RepositoryDetail.jsx'

const repositoryRoutes = (
  <>
    <Route path="/repositories" element={<Repositories />} />
    <Route path="/repositories/new" element={<CreateRepository />} />
    <Route path="/repositories/:id" element={<RepositoryDetail />} />
  </>
)

export default repositoryRoutes
