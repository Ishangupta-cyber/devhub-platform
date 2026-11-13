import { lazy } from "react"
import { Route } from 'react-router-dom'
const Login = lazy(() => import("./pages/Login.jsx"))
const Register = lazy(() => import("./pages/Register.jsx"))
const authRoutes = (
  <>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </>
)

export default authRoutes
