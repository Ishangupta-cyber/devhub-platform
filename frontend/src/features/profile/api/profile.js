import apiClient from "../../../api/client"



export const getProfile=(username)=>{
  return apiClient.get(`/profiles/${username}/`)
}

export const followUser=(username)=>{
  return apiClient.post(`/profiles/${username}/follow/`)
}

export const unfollowUser=(username)=>{
  return apiClient.post(`/profiles/${username}/unfollow/`)
}

export const getFollowers=(username)=>{
  return apiClient.get(`/profiles/${username}/followers/`)
}

export const getFollwing=(username)=>{
  return apiClient.get(`/profiles/${username}/following/`)
}

