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
    try{
      setLoading(true)
      const fetchProjects=async()=>{
      const[proRes,repoRes]=await Promise.all([listProjects(repoId),getRepository(repoId)])
        const data=Array.isArray(proRes?.data)?proRes.data:proRes.data.results
        setProjects(proRes)
        setRepo(repoRes)
    }
    }
    finally{
      setLoading(false)
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
  
  if (loading) return <div className="min-h-screen bg-[#0B0F1A]" />

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-2xl text-[#E4E7F2] mb-6">Projects</h1>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-[#3A1B23] border border-[#5C2430] text-[#F4A9B5] text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2 mb-6">
          {projects.length === 0 && <p className="text-sm text-[#8B90A8]">No boards yet.</p>}
          {projects.map((project) => (
            <Link
            to={`/repositories/${repoId}/projects/${project.id}`}
              key={project.id}  
              state={{ project }}
              className="bg-[#12162A] border border-[#242B45] rounded-md px-4 py-3"
            >
              <p className="text-sm text-[#E4E7F2] font-medium">{project.name}</p>
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
              className="flex-1 bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5]"
            />
            <button
              type="submit"
              disabled={creating}
              className="bg-[#7C6FF5] hover:bg-[#6C5FE0] disabled:opacity-50 text-white text-sm font-medium rounded-md px-4 py-2"
            >
              {creating ? 'Creating…' : 'New board'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
