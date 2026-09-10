import apiClient from "../../../api/client"




export const search=(q,type)=>{
  const params={q}
  if (type) params.type=type
  return apiClient.get('/search/',{params})
}