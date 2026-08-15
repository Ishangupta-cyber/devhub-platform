import { createContext, useEffect, useState } from "react";
import apiClient from "../api/client";

export const AuthContext=createContext(null)


export function AuthProvider({children}){
  const [user,setUser]=useState()
  const [accessToken,setAccessToken]=useState(()=>localStorage.getItem('accessToken'))
  const [loading,setLoading]=useState(true)

  useEffect(()=>{

    if(!accessToken) {
      setUser(null)
      setLoading(false)
      return
    }
    apiClient.get("/auth/me",{
      headers:{Authorization:`Bearer ${accessToken}`}
    }).then((res)=>{
      setUser(res.data)
    }).catch(()=>{
      setAccessToken(null)
      localStorage.removeItem('accessToken')

    })
    .finally(()=>setLoading(false))

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

  return (
    <AuthContext.Provider value={value}> {children} </AuthContext.Provider>
  )
}