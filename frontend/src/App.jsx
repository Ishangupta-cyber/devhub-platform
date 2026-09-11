import { Route, Routes, Link } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import Home from './pages/Home.jsx'
import authRoutes from './features/auth/routes.jsx'
import profileRoutes from './features/profile/routes.jsx'
import repositoryRoutes from './features/repositories/routes.jsx'
import issueRoutes from './features/issues/routes.jsx'
import pullRequestRoutes from './features/pullRequests/routes.jsx'
import projectRoutes from './features/projects/routes.jsx'
import activityRoutes from './features/activity/routes.jsx'
import organizationRoutes from './features/organizations/routes.jsx'
import wikiRoutes from './features/wiki/routes.jsx'
import notificationRoutes from './features/notifications/routes.jsx'
import searchRoutes from './features/search/routes.jsx'

function NotFound() {
  return (
    <div className="p-6 text-center pt-20">
      <h1 className="font-display text-2xl text-fg">Page not found</h1>
      <p className="text-sm text-muted mt-2">That page doesn't exist or was moved.</p>
      <Link to="/" className="inline-block mt-4 text-sm text-accent hover:underline">
        Back to dashboard
      </Link>
    </div>
  )
}

const App = () => {
  return (
    <Routes>
      {/* public */}
      {authRoutes}

      {/* everything below requires auth and shares the navbar */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        {profileRoutes}
        {repositoryRoutes}
        {issueRoutes}
        {pullRequestRoutes}
        {projectRoutes}
        {activityRoutes}
        {organizationRoutes}
        {wikiRoutes}
        {notificationRoutes}
        {searchRoutes}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
