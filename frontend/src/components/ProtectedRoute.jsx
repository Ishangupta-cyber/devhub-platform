import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'
import Navbar from './Navbar'

export default function ProtectedRoute({children}) {

  const {loading,isAuthenticated}=useAuth()

    if (loading) return null

    if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <>

    <Navbar/>
    {children}
    </>
  )

    
}
