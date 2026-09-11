import { Route } from 'react-router-dom'
import Profile from './pages/Profile.jsx'
import FollowList from './pages/FollowList.jsx'
import EditProfile from './pages/EditProfile.jsx'
import ChangePassword from './pages/ChangePassword.jsx'

const profileRoutes = (
  <>
    <Route path="/profile/:username" element={<Profile />} />
    <Route path="/profile/:username/followers" element={<FollowList type="followers" />} />
    <Route path="/profile/:username/following" element={<FollowList type="following" />} />
    <Route path="/edit-profile" element={<EditProfile />} />
    <Route path="/change-password" element={<ChangePassword />} />
  </>
)

export default profileRoutes
