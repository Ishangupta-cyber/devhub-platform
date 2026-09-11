import apiClient from "../../../api/client";



export const createOrganization = (data)=> apiClient.post("/organizations/",data)

export const listOrganizations = (params)=> apiClient.get("/organizations/", { params })

export const listMembers=(orgId)=> apiClient.get(`/organizations/${orgId}/members/`)

export const addMember=(orgId,data)=> apiClient.post(`/organizations/${orgId}/members/`,data)

