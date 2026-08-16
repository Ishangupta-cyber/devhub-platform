import { createContext, useEffect, useState } from "react";
import apiClient from "../api/client";
import { getCurrentUser,logoutUser } from "../api/auth";

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
      const res = await getCurrentUser()
      setUser(res.data)
    } catch (error) {
      console.error("Error fetching current user:", error.response?.data || error.message)
      logout()
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

  const logout = async() => {
    const refreshToken = localStorage.getItem("refreshToken")
    
    try{
      if (refreshToken){
        await logoutUser()
      }
    }
    catch(error){
      console.error("Error logging out:", error.response?.data || error.message)
    }
    finally{
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setAccessToken(null)
    }


  }

  const value = { user, isAuthenticated: !!accessToken, loading, login, logout }
  console.log("AuthContext value:", value) // Debugging line
  return (
    <AuthContext.Provider value={value}> {children} </AuthContext.Provider>
  )
}