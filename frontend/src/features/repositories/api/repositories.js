import apiClient from '../../../api/client'

export const listRepositories = (params) => {
  return apiClient.get('/repositories/', { params })
}

export const getRepository = (id) => {
  return apiClient.get(`/repositories/${id}/`)
}

export const createRepository = (data) => {
  return apiClient.post('/repositories/', data)
}

export const updateRepository = (id, data) => {
  return apiClient.patch(`/repositories/${id}/`, data)
}

export const deleteRepository = (id) => {
  return apiClient.delete(`/repositories/${id}/`)
}