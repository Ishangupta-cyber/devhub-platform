import { Route } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

const authRoutes = (
  <>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </>
)

export default authRoutes
