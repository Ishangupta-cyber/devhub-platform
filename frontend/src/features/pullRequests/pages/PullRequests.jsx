import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listPullRequests } from '../api/pullRequests'

export default function PullRequests() {

  const STATUS_COLORS = {
  draft: 'bg-subtle text-muted',
  review: 'bg-warn-bg text-warn',
  approved: 'bg-success-bg text-success',
  merged: 'bg-info-bg text-info',
}
    const {repoId}=useParams()
    const [loading,setLoading]=useState(true)
    const [prs,setPrs]=useState([])
    const [error,setError]=useState(null)

    useEffect(()=>{
      const fetchPrs=async()=>{
      try{
        setLoading(true)
        const res=await listPullRequests(repoId)
        const data=Array.isArray(res.data)?  res.data  :  res.data.results
        setPrs(data)
        
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch comments.')
      }
      finally{
        setLoading(false)
      }
    }
      fetchPrs()
    },[repoId])

    if (loading) return <div className="p-6" />


    return (
      
    <div className="p-6">
      
        {error && (
              <div className="mt-4 px-3 py-2 rounded-md bg-danger-bg border border-danger-border text-danger text-sm">
                {error}
              </div>
        )}
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-end mb-4">
          <Link to={`/repositories/${repoId}/pull-requests/new`} className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2">
            New pull request
          </Link>
        </div>

        <div className="space-y-2">
          {prs.length === 0 && <p className="text-sm text-muted">No pull requests yet.</p>}
          {prs.map((pr) => (
            <Link
              key={pr.id}
              to={`/repositories/${repoId}/pull-requests/${pr.id}`}
              className="flex items-center justify-between bg-surface border border-border rounded-md px-4 py-3 hover:border-accent transition-colors"
            >
              <div>
                <p className="text-sm text-fg font-medium">{pr.title}</p>
                <p className="text-xs text-muted mt-1">by @{pr.created_by}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-md font-mono ${STATUS_COLORS[pr.status]}`}>
                {pr.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
