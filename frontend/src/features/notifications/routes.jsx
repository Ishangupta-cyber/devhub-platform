import { Route } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute.jsx'
import Notifications from './pages/Notifications.jsx'

const notificationRoutes = (
  <>
    <Route
      path="/notifications"
      element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      }
    />
  </>
)

export default notificationRoutes
