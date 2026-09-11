import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from './Navbar'

export default function AppLayout() {
  const { loading, isAuthenticated } = useAuth()

  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <Outlet />
    </div>
  )
}
