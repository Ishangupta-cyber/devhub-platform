import { Route } from 'react-router-dom'
import ProtectedRoute from '../../components/ProtectedRoute.jsx'
import Profile from './pages/Profile.jsx'
import FollowList from './pages/FollowList.jsx'
import EditProfile from './pages/EditProfile.jsx'
import ChangePassword from './pages/ChangePassword.jsx'

const profileRoutes = (
  <>
    <Route path="/profile/:username" element={<Profile />} />
    <Route
      path="/profile/:username/followers"
      element={
        <ProtectedRoute>
          <FollowList type="followers" />
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile/:username/following"
      element={
        <ProtectedRoute>
          <FollowList type="following" />
        </ProtectedRoute>
      }
    />
    <Route
      path="/edit-profile/"
      element={
        <ProtectedRoute>
          <EditProfile />
        </ProtectedRoute>
      }
    />
    <Route
      path="/change-password"
      element={
        <ProtectedRoute>
          <ChangePassword />
        </ProtectedRoute>
      }
    />
  </>
)

export default profileRoutes
