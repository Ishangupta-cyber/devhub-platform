import { createContext, useEffect, useState } from "react";
import apiClient from "../api/client";

export const AuthContext=createContext(null)


export function AuthProvider({children}){
  const [user,setUser]=useState()
  const [accessToken,setAccessToken]=useState(()=>localStorage.getItem('accessToken'))
  const [loading,setLoading]=useState(true)

  const fetchUser=async()=>{
    if(!accessToken){
      setUser(null)
      setLoading(false)
      return 
    }
    try {
      const res = await apiClient.get("auth/me")
      console.log("Fetched user data:", res.data) // Debugging line
      setUser(res.data)
    } catch (error) {
      // interceptor will handle the error and redirect to login
    }
    finally{
      setLoading(false)
    }
  }
  
  useEffect(()=>{
    fetchUser()
  },[accessToken])

  const login = (tokens) => {
    localStorage.setItem('accessToken', tokens.access)
    localStorage.setItem('refreshToken', tokens.refresh)
    setAccessToken(tokens.access)
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setAccessToken(null)
  }

  const value = { user, isAuthenticated: !!accessToken, loading, login, logout }
  console.log("AuthContext value:", value) // Debugging line
  return (
    <AuthContext.Provider value={value}> {children} </AuthContext.Provider>
  )
}