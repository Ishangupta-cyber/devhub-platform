import React, { useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { createProject, listProjects } from '../api/projects'

export default function ProjectList() {


  const [loading,setLoading]=useState(true)
  const [error,setError]=useState("")
  const [projects,setProjects]=useState([])
  const {repoId}=useParams()
  const {canManage}=useOutletContext()
  const [creating,setCreating]=useState(false)
  const [name,setName]=useState("")

  useEffect(()=>{
    const fetchProjects=async()=>{
      setLoading(true)
      try{
        const proRes=await listProjects(repoId)
        const data=Array.isArray(proRes?.data)?proRes.data:proRes.data.results
        setProjects(data)
      }
      finally{
        setLoading(false)
      }
    }
    fetchProjects()
  },[repoId])

  const handleCreate=async(e)=>{
    e.preventDefault()
    if (!name.trim()) return 
    setError("")
    setCreating(true)
    try{
      const {data}=await createProject(repoId,{name})
      setProjects([...projects,data])
      setName('')
    }
    catch(err){
      const resData = err.response?.data
      const firstKey = resData && Object.keys(resData)[0]
      setError(firstKey ? (Array.isArray(resData[firstKey]) ? resData[firstKey][0] : resData[firstKey]) : 'Failed to create board.')
    }
    finally{
      setCreating(false)
    }

  }
  
  if (loading) return <div className="p-6" />

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-danger-bg border border-danger-border text-danger text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2 mb-6">
          {projects.length === 0 && <p className="text-sm text-muted">No boards yet.</p>}
          {projects.map((project) => (
            <Link
            to={`/repositories/${repoId}/projects/${project.id}`}
              key={project.id}  
              state={{ project }}
              className="block bg-surface border border-border rounded-md px-4 py-3 hover:border-accent transition-colors"
            >
              <p className="text-sm text-fg font-medium">{project.name}</p>
            </Link>
          ))}
        </div>

        {canManage && (
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New board name (e.g. Sprint 1)"
              className="flex-1 bg-subtle border border-border rounded-md px-3 py-2 text-fg text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={creating}
              className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium rounded-md px-4 py-2"
            >
              {creating ? 'Creating…' : 'New board'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
