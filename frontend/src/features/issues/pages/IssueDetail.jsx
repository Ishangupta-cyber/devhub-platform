import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { getIssue, updateIssue } from '../api/issues'
import { getRepository } from '../../repositories/api/repositories'
import CommentSection from '../../comments/components/CommentSection'
import useCanManageRepo from '../../../hooks/useCanManageRepo'

export default function IssueDetail() {
  const [error,setError]=useState("")
  const [loading,setLoading]=useState(true)
  const {repoId,issueId}=useParams()
  const [issue,setIssue]=useState(null)
  const [repo,setRepo]=useState(null)
  const {user}=useAuth()
  const {canManage,checking}=useCanManageRepo(repo)

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


    const handleClose = async () => {
    setError('')
    try {
      const { data } = await updateIssue(repoId, issueId, { status: 'closed' })
      setIssue(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to close issue.')
    }
  }


 if (loading) return <div className="p-6" />
  if (!issue) return <div className="p-6 text-fg text-center pt-20">Issue not found.</div>

    return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto bg-surface border border-border rounded-xl p-8">
        <Link to={`/repositories/${repoId}/issues`} className="text-xs text-muted hover:text-fg">
          ← back to issues
        </Link>

        {error && (
          <div className="mt-4 px-3 py-2 rounded-md bg-danger-bg border border-danger-border text-danger text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <h1 className="font-display text-2xl text-fg">{issue.title}</h1>
          <span
            className={`text-xs px-2 py-1 rounded-md font-mono ${
              issue.status === 'open' ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'
            }`}
          >
            {issue.status}
          </span>
        </div>

        <p className="text-sm text-muted mt-2">by @{issue.created_by}</p>
        <p className="text-sm text-fg mt-4">{issue.description}</p>

        {!checking && canManage && issue.status === 'open' && (
          <button
            onClick={handleClose}
            className="mt-6 text-sm text-danger hover:underline"
          >
            Close issue
          </button>
        )}

        <CommentSection issueId={issueId} isRepoOwner={canManage} currentUsername={user?.username}  />

      </div>
    </div>
  )
}
