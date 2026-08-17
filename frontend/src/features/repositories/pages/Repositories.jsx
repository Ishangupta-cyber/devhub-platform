import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listRepositories } from '../api/repositories'

export default function Repositories() {
  const [repos,setRepos]=useState([])
  const [loading,setLoading]=useState(true)

  const fetchRepos=async()=>{
    setLoading(true)
    try {
      const res=await listRepositories()
      console.log(res)
      const data = Array.isArray(res.data) ? res.data : res.data.results
      console.log(data)
      setRepos(data)
      
    } catch (error) {
      console.log(error.response)
    }
    finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchRepos()
  },[])

 if (loading) return <div className="min-h-screen bg-[#0B0F1A]" />
    return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl text-[#E4E7F2]">Repositories</h1>
          <Link to="/repositories/new" className="bg-[#7C6FF5] hover:bg-[#6C5FE0] text-white text-sm font-medium rounded-md px-4 py-2">
            New repository
          </Link>
        </div>

        <div className="space-y-2">
          {repos.length === 0 && (
            <p className="text-sm text-[#8B90A8]">No repositories yet.</p>
          )}
          {repos.map((repo) => (
            <Link
              key={repo.id}
              to={`/repositories/${repo.id}`}
              className="block bg-[#12162A] border border-[#242B45] rounded-md px-4 py-3 hover:border-[#7C6FF5] transition-colors"
            >
              <p className="text-sm text-[#E4E7F2] font-medium font-mono">{repo.name}</p>
              <p className="text-xs text-[#8B90A8] mt-1">{repo.description}</p>
              <p className="text-xs text-[#8B90A8] mt-1">@{repo.owner}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )

}
