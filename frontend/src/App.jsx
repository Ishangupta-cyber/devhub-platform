import React from 'react' 
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Home from './pages/Home.jsx'
import { useAuth } from './hooks/useAuth.js'
import { AuthProvider } from './context/AuthContext.jsx'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'

const App=()=>{
  return(
    <AuthProvider>
      <Routes>
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register/>}  />
        <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      </Routes>
    </AuthProvider>
  )
}

export default App