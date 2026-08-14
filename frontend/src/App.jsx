import React from 'react' 
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import { useContext } from 'react'
import { AuthContext } from './context/AuthContext.jsx'

export default function App() {

  const value=useContext(AuthContext)
  console.log(value)

  return (
    <div>
      <Register/>
    </div>
  )
}
