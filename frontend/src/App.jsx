import React from 'react' 
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Home from './pages/Home.jsx'
import { useAuth } from './hooks/useAuth.js'
import { AuthProvider } from './context/AuthContext.jsx'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Profile from './pages/Profile.jsx'
import FollowList from './pages/FollowList.jsx'
import EditProfile from './pages/EditProfile.jsx'
import ChangePassword from './pages/ChangePassword.jsx'

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
      <Route path='/profile/:username' element={<Profile/>} />
      <Route
      path="/profile/:username/followers"
      element={
        <ProtectedRoute>
          <FollowList type="followers" />
        </ProtectedRoute>
      }
      />
      <Route
      path="/profile/:username/following"
      element={
        <ProtectedRoute>
          <FollowList type="following"/>
        </ProtectedRoute>
      }
      />
      <Route path="/edit-profile/"
      element={
        <ProtectedRoute>
          <EditProfile/>
        </ProtectedRoute>
      }
      />
      <Route
      path="/change-password"
      element={
        <ProtectedRoute>
          <ChangePassword/>
        </ProtectedRoute>
      }
      />

      
      </Routes>
    </AuthProvider>
  )
}

export default App