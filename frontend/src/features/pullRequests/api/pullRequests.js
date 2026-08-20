import apiClient from "../../../api/client";



export const listPullRequests = (repoId) => apiClient.get(`/repositories/${repoId}/pull-requests/`)
export const createPullRequest = (repoId,data) => apiClient.post(`/repositories/${repoId}/pull-requests/`,data)
export const getPullRequest = (repoId,id) => apiClient.get(`/repositories/${repoId}/pull-requests/${id}/`)
export const updatePullRequest = (repoId,id,data) => apiClient.patch(`/repositories/${repoId}/pull-requests/${id}/`,data)