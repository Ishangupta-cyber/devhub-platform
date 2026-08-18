import axios from "axios"
import {refreshToken} from "../features/auth/api/auth"

const apiClient=axios.create({
  baseURL:import.meta.env.VITE_API_URL,
  headers:{
    'Content-Type':'application/json'
  }
})

apiClient.interceptors.request.use((config)=>{
  const token = localStorage.getItem("accessToken")
  if(token){
    config.headers.Authorization=`Bearer ${token}`
  }
  return config
})


apiClient.interceptors.response.use((response)=>response,
async (error)=>{
  const originalRequest=error.config

  if (error.response?.status===401 && !originalRequest._retry){
    originalRequest._retry=true

    const storedRefreshToken=localStorage.getItem("refreshToken")
    if (!storedRefreshToken){
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      window.location.href="/login"
      return Promise.reject(error)

    }

    try{
      const response= await refreshToken(storedRefreshToken)
      localStorage.setItem("accessToken",response.data.access)
      originalRequest.headers.Authorization=`Bearer ${response.data.access}`
      return apiClient(originalRequest)
    }
    catch(err){
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      window.location.href="/login"
      return Promise.reject(err)
    }
  }


  return Promise.reject(error)
})

export default apiClient