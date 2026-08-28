import apiClient from '../../../api/client'

export const getFeed = () => apiClient.get('/activity/feed/')