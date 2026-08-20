import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "../../../hooks/useAuth"
import { getRepository } from "../../repositories/api/repositories"
import { updatePullRequest } from "../api/pullRequests"

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

export default function pullRequestDetail() {

  const [error,setError]=useState("")
  const {repoId,id}=useParams()
  const [updating,setUpdating]=useState(false)
  const [pr,setPr]=useState(null)
  const [repo,setRepo]=useState(null)
  const {user}=useAuth()
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    setLoading(true)
    setError("")
    const fetchpr=async()=>{
      try{
        const [RepoRes,PrRes]=await Promise.all([getRepository(repoId),getPullRequest(repoId,id)])
        setPr(PrRes.data)
        setRepo(RepoRes.data)
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

  const isRepoOwner=repo?.owner === user?.username

  const handleTransition = async(newStatus)=>{
    setError("")
    setUpdating(true)
    try{
      const {data}=updatePullRequest(repoId,id,{status:newStatus})
      setPr(data)
    }
    catch(err){
      setError(err.response?.data?.non_field_errors?.[0] || 'Failed to update status.')
    }
    finally{
      setUpdating(false)
    }

  }


  if (loading) return <div className="min-h-screen bg-[#0B0F1A]" />
  if (!pr) return <div className="min-h-screen bg-[#0B0F1A] text-[#E4E7F2] text-center pt-20">Pull request not found.</div>

  const availableActions = VALID_TRANSITIONS[pr.status] || []


    return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-2xl mx-auto bg-[#12162A] border border-[#242B45] rounded-xl p-8">
        <Link to={`/repositories/${repoId}/pull-requests`} className="text-xs text-[#8B90A8] hover:text-[#E4E7F2]">
          ← back to pull requests
        </Link>

        {error && (
          <div className="mt-4 px-3 py-2 rounded-md bg-[#3A1B23] border border-[#5C2430] text-[#F4A9B5] text-sm">{error}</div>
        )}

        <h1 className="font-display text-2xl text-[#E4E7F2] mt-4">{pr.title}</h1>
        <p className="text-sm text-[#8B90A8] mt-2">by @{pr.created_by}</p>
        <p className="text-sm text-[#E4E7F2] mt-4">{pr.description}</p>

        <div className="mt-6 flex items-center gap-3">
          <span className="text-xs px-2 py-1 rounded-md font-mono bg-[#0F1424] border border-[#242B45] text-[#E4E7F2]">
            {pr.status}
          </span>

          {isRepoOwner && availableActions?.map((nextStatus) => (
            <button
              key={nextStatus}
              onClick={() => handleTransition(nextStatus)}
              disabled={updating}
              className="text-sm text-[#7C6FF5] hover:underline disabled:opacity-50"
            >
              {TRANSITION_LABELS[nextStatus]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
