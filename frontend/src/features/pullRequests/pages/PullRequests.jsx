import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { listPullRequests } from '../api/pullRequests'

export default function PullRequests() {

  const STATUS_COLORS = {
  draft: 'bg-[#2A2A3A] text-[#B8B8D0]',
  review: 'bg-[#3A2E1B] text-[#F4C97A]',
  approved: 'bg-[#1B3A2A] text-[#A9F4C0]',
  merged: 'bg-[#1B2A3A] text-[#7AB8F4]',
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
    },repoId)

    if (loading) return <div className="min-h-screen bg-[#0B0F1A]" />


    return (
      
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      
        {error && (
              <div className="mt-4 px-3 py-2 rounded-md bg-[#3A1B23] border border-[#5C2430] text-[#F4A9B5] text-sm">
                {error}
              </div>
        )}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl text-[#E4E7F2]">Pull Requests</h1>
          <Link to={`/repositories/${repoId}/pull-requests/new`} className="bg-[#7C6FF5] hover:bg-[#6C5FE0] text-white text-sm font-medium rounded-md px-4 py-2">
            New pull request
          </Link>
        </div>

        <div className="space-y-2">
          {prs.length === 0 && <p className="text-sm text-[#8B90A8]">No pull requests yet.</p>}
          {prs.map((pr) => (
            <Link
              key={pr.id}
              to={`/repositories/${repoId}/pull-requests/${pr.id}`}
              className="flex items-center justify-between bg-[#12162A] border border-[#242B45] rounded-md px-4 py-3 hover:border-[#7C6FF5] transition-colors"
            >
              <div>
                <p className="text-sm text-[#E4E7F2] font-medium">{pr.title}</p>
                <p className="text-xs text-[#8B90A8] mt-1">by @{pr.created_by}</p>
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
