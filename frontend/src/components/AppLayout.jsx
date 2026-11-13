import { Suspense } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import PageLoader from './PageLoader'
import { useAuth } from '../hooks/useAuth'
import Navbar from './Navbar'

export default function AppLayout() {
  const { loading, isAuthenticated } = useAuth()

  if (loading) return <PageLoader fullScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </div>
  )
}
