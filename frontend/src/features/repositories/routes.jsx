import { Route } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute.jsx'
import Repositories from './pages/Repositories.jsx'
import CreateRepository from './pages/CreateRepository.jsx'
import RepositoryDetail from './pages/RepositoryDetail.jsx'

const repositoryRoutes = (
  <>
    <Route path="/repositories" element={<Repositories />} />
    <Route
      path="/repositories/new"
      element={
        <ProtectedRoute>
          <CreateRepository />
        </ProtectedRoute>
      }
    />
    <Route path="/repositories/:id" element={<RepositoryDetail />} />
  </>
)

export default repositoryRoutes
