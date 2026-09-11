import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listRepositories } from '../api/repositories'

export default function Repositories() {
  const [repos,setRepos]=useState([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState("")

  const fetchRepos=async()=>{
    setLoading(true)
    setError("")
    try {
      const res=await listRepositories()
      const data = Array.isArray(res.data) ? res.data : res.data.results
      setRepos(data)
      
    } catch {
      setError('Failed to load repositories.')
    }
    finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchRepos()
  },[])

 if (loading) return <div className="p-6" />
    return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl text-fg">Repositories</h1>
          <Link to="/repositories/new" className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2">
            New repository
          </Link>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-danger-bg border border-danger-border text-danger text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          {repos.length === 0 && !error && (
            <p className="text-sm text-muted">No repositories yet.</p>
          )}
          {repos.map((repo) => (
            <Link
              key={repo.id}
              to={`/repositories/${repo.id}`}
              className="block bg-surface border border-border rounded-md px-4 py-3 hover:border-accent transition-colors"
            >
              <p className="text-sm text-fg font-medium font-mono">{repo.name}</p>
              <p className="text-xs text-muted mt-1">{repo.description}</p>
              <p className="text-xs text-muted mt-1">@{repo.owner}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )

}
