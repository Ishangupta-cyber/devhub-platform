import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {listIssues} from '../api/issues'

export default function Issues() {
  const [loading,setLoading]=useState(true)
  const{repoId}=useParams()
  const[issues,setIssues]=useState([])

  useEffect(()=>{
    const fetchIssues=async()=>{
      try{
        setLoading(true)
        const res=await listIssues(repoId)
        const data = Array.isArray(res.data) ? res.data : res.data.results
        setIssues(data)
      }
      finally{
        setLoading(false)
      }
    }
    fetchIssues()

  },[repoId])


   if (loading) return <div className="p-6" />
    return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl text-fg">Issues</h1>
          <Link to={`/repositories/${repoId}/issues/new`} className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2">
            New issue
          </Link>
        </div>

        <div className="space-y-2">
          {issues.length === 0 && (
            <p className="text-sm text-muted">No issues yet.</p>
          )}
          {issues.map((issue) => (
            <Link
              key={issue.id}
              to={`/repositories/${repoId}/issues/${issue.id}`}
              className="flex items-center justify-between bg-surface border border-border rounded-md px-4 py-3 hover:border-accent transition-colors"
            >
              <div>
                <p className="text-sm text-fg font-medium">{issue.title}</p>
                <p className="text-xs text-muted mt-1">by @{issue.created_by}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-md font-mono ${
                  issue.status === 'open'
                    ? 'bg-success-bg text-success'
                    : 'bg-danger-bg text-danger'
                }`}
              >
                {issue.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
