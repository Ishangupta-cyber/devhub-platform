import apiClient from "../../../api/client";


export const createComment=(issueId,data)=> apiClient.post(`/issues/${issueId}/comments/`,data)
export const listComments=(issueId)=> apiClient.get(`/issues/${issueId}/comments/`)
export const updateComment=(issueId,id,data)=> apiClient.patch(`/issues/${issueId}/comments/${id}/`,data)
export const getComment=(issueId,id)=> apiClient.get(`/issues/${issueId}/comments/${id}/`)
export const deleteComment=(issueId,id)=>apiClient.delete(`/issues/${issueId}/comments/${id}/`)