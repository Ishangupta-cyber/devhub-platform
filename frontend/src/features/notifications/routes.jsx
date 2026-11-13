import { lazy } from "react"
import { Route } from 'react-router-dom'
const Notifications = lazy(() => import("./pages/Notifications.jsx"))
const notificationRoutes = <Route path="/notifications" element={<Notifications />} />

export default notificationRoutes
