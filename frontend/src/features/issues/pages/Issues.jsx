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


   if (loading) return <div className="min-h-screen bg-[#0B0F1A]" />
    return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl text-[#E4E7F2]">Issues</h1>
          <Link to={`/repositories/${repoId}/issues/new`} className="bg-[#7C6FF5] hover:bg-[#6C5FE0] text-white text-sm font-medium rounded-md px-4 py-2">
            New issue
          </Link>
        </div>

        <div className="space-y-2">
          {issues.length === 0 && (
            <p className="text-sm text-[#8B90A8]">No issues yet.</p>
          )}
          {issues.map((issue) => (
            <Link
              key={issue.id}
              to={`/repositories/${repoId}/issues/${issue.id}`}
              className="flex items-center justify-between bg-[#12162A] border border-[#242B45] rounded-md px-4 py-3 hover:border-[#7C6FF5] transition-colors"
            >
              <div>
                <p className="text-sm text-[#E4E7F2] font-medium">{issue.title}</p>
                <p className="text-xs text-[#8B90A8] mt-1">by @{issue.created_by}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-md font-mono ${
                  issue.status === 'open'
                    ? 'bg-[#1B3A2A] text-[#A9F4C0]'
                    : 'bg-[#3A1B23] text-[#F4A9B5]'
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
