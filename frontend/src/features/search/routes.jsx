import { Route } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute.jsx'
import SearchPage from './pages/SearchPage.jsx'

const searchRoutes = (
  <>
    <Route
      path="/search"
      element={
        <ProtectedRoute>
          <SearchPage />
        </ProtectedRoute>
      }
    />
  </>
)

export default searchRoutes