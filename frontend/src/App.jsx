import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import authRoutes from './features/auth/routes.jsx'
import profileRoutes from './features/profile/routes.jsx'
import repositoryRoutes from './features/repositories/routes.jsx'
import issueRoutes from './features/issues/routes.jsx'
import pullRequestRoutes from './features/pullRequests/routes.jsx'
import ProjectRoutes from './features/projects/routes.jsx'

const App = () => {
  return (
    <AuthProvider>
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
      </Routes>
    </AuthProvider>
  )
}

export default App
