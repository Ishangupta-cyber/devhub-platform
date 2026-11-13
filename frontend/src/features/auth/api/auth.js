import axios from "axios";
import apiClient from "../../../api/client";
import { API_URL } from "../../../api/config";

export const loginUser= (email,password) =>{
  return apiClient.post('/auth/login/', { email, password })
}


export const registerUser = (userData) => {
  return apiClient.post('/auth/register/', userData)
}

export const getCurrentUser = () => {
  return apiClient.get('/auth/me/')
}

export const refreshToken=(refreshToken)=>{
  return axios.post(`${API_URL}/auth/refresh/`,{
    refresh:refreshToken
  })
}

export const updateProfile=(data)=>{
  return apiClient.post("/auth/me/",data)
}


export const logoutUser=()=>{
  return apiClient.post("/auth/logout/")
}

export const changePassword=(data)=>{
  return apiClient.post("/auth/change-password/", data)
}