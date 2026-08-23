import apiClient from "../../../api/client";


export const listProjects = (repoId)=> apiClient.get(`/repositories/${repoId}/projects/`)
export const createProject = (repoId,data) => apiClient.post(`/repositories/${repoId}/projects/`,data)


export const listColumns=(projectId)=>apiClient.get(`/projects/${projectId}/columns/`)


export const createColumn = (projectId, data) => apiClient.post(`/projects/${projectId}/columns/`, data)
export const updateColumn = (projectId, columnId, data) => apiClient.patch(`/projects/${projectId}/columns/${columnId}/`, data)
export const deleteColumn = (projectId, columnId) => apiClient.delete(`/projects/${projectId}/columns/${columnId}/`)

export const listCards = (columnId) => apiClient.get(`/projects/columns/${columnId}/cards/`)
export const createCard=(columnId,data)=>apiClient.post(`/projects/columns/${columnId}/cards/`,data)

export const moveCard = (currentColumnId, cardId, data) => apiClient.patch(`/projects/columns/${currentColumnId}/cards/${cardId}/`, data)
