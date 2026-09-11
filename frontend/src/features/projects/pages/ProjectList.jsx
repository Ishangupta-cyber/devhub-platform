import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Link, useParams } from 'react-router-dom'
import { createProject, listProjects } from '../api/projects'
import { getRepository } from '../../repositories/api/repositories'

export default function ProjectList() {


  const [loading,setLoading]=useState(true)
  const [error,setError]=useState("")
  const [projects,setProjects]=useState([])
  const {user}=useAuth()
  const {repoId}=useParams()
  const [creating,setCreating]=useState(false)
  const [name,setName]=useState("")
  const [repo,setRepo]=useState(null)

  useEffect(()=>{
    const fetchProjects=async()=>{
      setLoading(true)
      try{
        const[proRes,repoRes]=await Promise.all([listProjects(repoId),getRepository(repoId)])
        const data=Array.isArray(proRes?.data)?proRes.data:proRes.data.results
        setProjects(data)
        setRepo(repoRes.data)
      }
      finally{
        setLoading(false)
      }
    }
    fetchProjects()
  },[repoId])

  const isRepoOwner=repo?.owner===user?.username

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
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-2xl text-fg mb-6">Projects</h1>

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

        {isRepoOwner && (
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
