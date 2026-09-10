import React from 'react'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import authRoutes from './features/auth/routes.jsx'
import profileRoutes from './features/profile/routes.jsx'
import repositoryRoutes from './features/repositories/routes.jsx'
import issueRoutes from './features/issues/routes.jsx'
import pullRequestRoutes from './features/pullRequests/routes.jsx'
import ProjectRoutes from './features/projects/routes.jsx'
import activityRoutes from './features/activity/routes.jsx'
import organizationRoutes from './features/organizations/routes.jsx'
import wikiRoutes from './features/wiki/routes.jsx'
import notificationRoutes from './features/notifications/routes.jsx'
import searchRoutes from './features/search/routes.jsx'

const App = () => {
  return (
    <Routes>
      {authRoutes}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      {profileRoutes}
      {repositoryRoutes}
      {issueRoutes}
      {pullRequestRoutes}
      {ProjectRoutes}
      {activityRoutes}
      {organizationRoutes}
      {wikiRoutes}
      {notificationRoutes}
      {searchRoutes}
    </Routes>
  )
}

export default App
