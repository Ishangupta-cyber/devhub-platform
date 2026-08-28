import { Route } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute.jsx'
import ActivityFeed from './pages/ActivityFeed.jsx'

const activityRoutes = (
  <>
    <Route
      path="/activity"
      element={
        <ProtectedRoute>
          <ActivityFeed />
        </ProtectedRoute>
      }
    />
  </>
)

export default activityRoutes