import { Route } from 'react-router-dom'
import Repositories from './pages/Repositories.jsx'
import CreateRepository from './pages/CreateRepository.jsx'

const repositoryRoutes = (
  <>
    <Route path="/repositories" element={<Repositories />} />
    <Route path="/repositories/new" element={<CreateRepository />} />
  </>
)

export default repositoryRoutes
