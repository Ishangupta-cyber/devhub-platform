import apiClient from "../../../api/client";

export const listWikiPages=(repoId)=>apiClient.get(`/repositories/${repoId}/wiki/`)
export const getWikiPage=(slug,repoId)=>apiClient.get(`/repositories/${repoId}/wiki/${slug}/`)
export const createWikiPage=(repoId,data)=>apiClient.post(`/repositories/${repoId}/wiki/`,data)
export const updateWikiPage=(repoId,slug,data)=>apiClient.patch(`/repositories/${repoId}/wiki/${slug}/`,data)
export const deleteWikiPage=(repoId,slug)=>apiClient.delete(`/repositories/${repoId}/wiki/${slug}/`)
