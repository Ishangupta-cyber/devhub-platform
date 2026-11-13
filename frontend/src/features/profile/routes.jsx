import { lazy } from "react"
import { Route } from 'react-router-dom'
const Profile = lazy(() => import("./pages/Profile.jsx"))
const FollowList = lazy(() => import("./pages/FollowList.jsx"))
const EditProfile = lazy(() => import("./pages/EditProfile.jsx"))
const ChangePassword = lazy(() => import("./pages/ChangePassword.jsx"))
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
