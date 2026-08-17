import apiClient from "../../../api/client"



export const listIssues=(repoId)=>{
  return apiClient.get(`/repositories/${repoId}/issues/`)
}

export const getIssue = (repoId, issueId) => {
  return apiClient.get(`/repositories/${repoId}/issues/${issueId}/`)
}

export const createIssue = (repoId, data) => {
  return apiClient.post(`/repositories/${repoId}/issues/`, data)
}

export const updateIssue = (repoId, issueId, data) => {
  return apiClient.patch(`/repositories/${repoId}/issues/${issueId}/`, data)
}