import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRepository } from '../api/repositories'
import { useAuth } from '../../../hooks/useAuth'
import { listMembers, listOrganizations } from '../../organizations/api/organisations'

export default function CreateRepository() {

  const [error,setError]=useState("")
  const [loading,setLoading]=useState(false)
  const [formData,setFormData]=useState({name:"",description:""})
  const navigate=useNavigate()
  const {user}=useAuth()
  const [organizationId,setOrganizationId]=useState("")
  const [myOrgs,setMyOrgs]=useState([])

  useEffect(()=>{
    const fetchMyOrgs=async()=>{
      if(!user) return
      try {
        const orgsRes=await listOrganizations()
        const allOrgs=Array.isArray(orgsRes.data)? orgsRes.data : orgsRes.data.results
        if(allOrgs.length===0) return 
        const membersResults=await Promise.all(allOrgs.map((org)=>listMembers(org.id)))
        const manageable=allOrgs.filter((org,index)=>{
          const raw=membersResults[index].data
          const members=Array.isArray(raw)?raw:raw.results
          const mine=members.find((m)=>m.username===user.username)
          return !!mine && ["owner","admin"].includes(mine.role)

        })
        setMyOrgs(manageable)
        
      } catch (err) {
        setMyOrgs([])
      }
    }
    fetchMyOrgs()

  },[user?.username])

  const handleChange=(e)=>setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit=async(e)=>{
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload={...formData}
      if(organizationId){
        payload.organization_id=Number(organizationId)

      }
      const {data}=await createRepository(payload)
      navigate(`/repositories/${data.id}`)
      
    } catch (err) {
      const resData = err.response?.data
      const firstKey = resData && Object.keys(resData)[0]
      setError(firstKey ? (Array.isArray(resData[firstKey]) ? resData[firstKey][0] : resData[firstKey]) : 'Failed to create repository.')
    }
    finally{
      setLoading(false)
    }
  }




  
   return (
    <div className="p-6">
      <div className="max-w-md mx-auto bg-surface border border-border rounded-xl p-8">
        <h1 className="font-display text-2xl text-fg mb-6">New repository</h1>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-danger-bg border border-danger-border text-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted mb-1.5">name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm font-mono outline-none focus:border-accent"
              placeholder="my-project"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-muted mb-1.5">description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-muted mb-1.5">owner</label>
            <select
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm outline-none focus:border-accent"
            >
              <option value="">Personal (@{user?.username})</option>
              {myOrgs.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium rounded-md py-2.5"
          >
            {loading ? 'Creating…' : 'Create repository'}
          </button>
        </form>
      </div>
    </div>
  )
}
