import { useEffect, useState } from "react"
import { Link, useOutletContext, useParams } from "react-router-dom"
import { getPullRequest, updatePullRequest } from "../api/pullRequests"

const VALID_TRANSITIONS = {
  draft: ['review'],
  review: ['approved', 'draft'],
  approved: ['merged'],
  merged: [],
}

const TRANSITION_LABELS = {
  review: 'Move to Review',
  approved: 'Approve',
  merged: 'Merge',
  draft: 'Move back to Draft',
}

export default function PullRequestDetail() {

  const [error,setError]=useState("")
  const {repoId,id}=useParams()
  const [updating,setUpdating]=useState(false)
  const [pr,setPr]=useState(null)
  const {canManage}=useOutletContext()
  const [loading,setLoading]=useState(true)
  
  useEffect(()=>{
    setLoading(true)
    setError("")
    const fetchpr=async()=>{
      try{
        const PrRes=await getPullRequest(repoId,id)
        setPr(PrRes.data)
      }
      catch(err){
        setPr(null)
        setError(err.response?.data?.non_field_errors?.[0] || 'Something went Wrong.')
      }
      finally{
        setLoading(false)
      }
    }
    fetchpr()
  },[repoId,id])

  const handleTransition = async(newStatus)=>{
    setError("")
    setUpdating(true)
    try{
      const {data}=await updatePullRequest(repoId,id,{status:newStatus})
      setPr(data)
    }
    catch(err){
      setError(err.response?.data?.non_field_errors?.[0] || 'Failed to update status.')
    }
    finally{
      setUpdating(false)
    }

  }


  if (loading) return <div className="p-6" />
  if (!pr) return <div className="p-6 text-fg text-center pt-20">Pull request not found.</div>

  const availableActions = VALID_TRANSITIONS[pr.status] || []


    return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto bg-surface border border-border rounded-xl p-8">
        <Link to={`/repositories/${repoId}/pull-requests`} className="text-xs text-muted hover:text-fg">
          ← back to pull requests
        </Link>

        {error && (
          <div className="mt-4 px-3 py-2 rounded-md bg-danger-bg border border-danger-border text-danger text-sm">{error}</div>
        )}

        <h1 className="font-display text-2xl text-fg mt-4">{pr.title}</h1>
        <p className="text-sm text-muted mt-2">by @{pr.created_by}</p>
        <p className="text-sm text-fg mt-4">{pr.description}</p>

        <div className="mt-6 flex items-center gap-3">
          <span className="text-xs px-2 py-1 rounded-md font-mono bg-subtle border border-border text-fg">
            {pr.status}
          </span>

          {canManage && availableActions?.map((nextStatus) => (
            <button
              key={nextStatus}
              onClick={() => handleTransition(nextStatus)}
              disabled={updating}
              className="text-sm text-accent hover:underline disabled:opacity-50"
            >
              {TRANSITION_LABELS[nextStatus]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
