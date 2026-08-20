import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { getIssue, updateIssue } from '../api/issues'
import { getRepository } from '../../repositories/api/repositories'
import CommentSection from '../../comments/components/CommentSection'

export default function IssueDetail() {
  const [error,setError]=useState("")
  const [loading,setLoading]=useState(true)
  const {repoId,issueId}=useParams()
  const [issue,setIssue]=useState(null)
  const [repo,setRepo]=useState(null)
  const {user}=useAuth()

  useEffect(()=>{
    setLoading(true)
    
      Promise.all([getIssue(repoId,issueId),getRepository(repoId)])
      .then(([issueRes,repoRes])=>{
        setIssue(issueRes.data)
        setRepo(repoRes.data)
      })
      .catch(()=>setIssue(null))
      .finally(()=>setLoading(false))
    
  },[repoId,issueId])

  const isRepoOwner = user?.username === repo?.owner

    const handleClose = async () => {
    setError('')
    try {
      const { data } = await updateIssue(repoId, issueId, { status: 'closed' })
      setIssue(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to close issue.')
    }
  }


 if (loading) return <div className="min-h-screen bg-[#0B0F1A]" />
  if (!issue) return <div className="min-h-screen bg-[#0B0F1A] text-[#E4E7F2] text-center pt-20">Issue not found.</div>

    return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-2xl mx-auto bg-[#12162A] border border-[#242B45] rounded-xl p-8">
        <Link to={`/repositories/${repoId}/issues`} className="text-xs text-[#8B90A8] hover:text-[#E4E7F2]">
          ← back to issues
        </Link>

        {error && (
          <div className="mt-4 px-3 py-2 rounded-md bg-[#3A1B23] border border-[#5C2430] text-[#F4A9B5] text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <h1 className="font-display text-2xl text-[#E4E7F2]">{issue.title}</h1>
          <span
            className={`text-xs px-2 py-1 rounded-md font-mono ${
              issue.status === 'open' ? 'bg-[#1B3A2A] text-[#A9F4C0]' : 'bg-[#3A1B23] text-[#F4A9B5]'
            }`}
          >
            {issue.status}
          </span>
        </div>

        <p className="text-sm text-[#8B90A8] mt-2">by @{issue.created_by}</p>
        <p className="text-sm text-[#E4E7F2] mt-4">{issue.description}</p>

        {isRepoOwner && issue.status === 'open' && (
          <button
            onClick={handleClose}
            className="mt-6 text-sm text-[#F4A9B5] hover:underline"
          >
            Close issue
          </button>
        )}

        <CommentSection issueId={issueId} isRepoOwner={isRepoOwner} currentUsername={user?.username}  />

      </div>
    </div>
  )
}
