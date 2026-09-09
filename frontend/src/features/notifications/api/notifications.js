import apiClient from "../../../api/client"






export const listNotiications = ()=> apiClient.get("/notifications/")

export const markAsRead = (id) => apiClient.post(`/notifications/${id}/read/`)