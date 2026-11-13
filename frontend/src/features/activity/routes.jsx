import { lazy } from "react"
import { Route } from 'react-router-dom'
const ActivityFeed = lazy(() => import("./pages/ActivityFeed.jsx"))
const activityRoutes = <Route path="/activity" element={<ActivityFeed />} />

export default activityRoutes
