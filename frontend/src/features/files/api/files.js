import apiClient from "../../../api/client";

export const getFileTree = (repoId) => apiClient.get(`/repositories/${repoId}/tree/`)
export const getFileNode = (repoId, nodeId) => apiClient.get(`/repositories/${repoId}/files/${nodeId}/`)
export const createFileNode = (repoId, data) => apiClient.post(`/repositories/${repoId}/tree/`, data)
export const updateFileNode = (repoId, nodeId, data) => apiClient.patch(`/repositories/${repoId}/files/${nodeId}/`, data)
export const deleteFileNode = (repoId, nodeId) => apiClient.delete(`/repositories/${repoId}/files/${nodeId}/`)