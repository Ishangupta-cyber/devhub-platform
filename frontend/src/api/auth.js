import apiClient from "./client";

export const loginUser= (email,password) =>{
  return apiClient.post('/auth/login/', { email, password })
}


export const registerUser = (userData) => {
  return apiClient.post('/auth/register/', userData)
}