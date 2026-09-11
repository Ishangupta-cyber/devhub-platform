import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { createPullRequest as createPullRequestApi } from "../api/pullRequests"

export default function CreatePullRequest() {

    const [error,setError]=useState(null)
    const [loading,setLoading]=useState(false)
    const [formData,setFormData]=useState({title:"",description:""})
    const {repoId}=useParams()
    const navigate=useNavigate()
    

    const handleChange=(e)=>{
      setFormData({...formData,[e.target.name]:e.target.value})
    }

    const handleSubmit=async(e)=>{
      e.preventDefault()
      setError("")
      setLoading(true)
      try {
       const {data}= await createPullRequestApi(repoId,formData)
        navigate(`/repositories/${repoId}/pull-requests/${data.id}`)
      } catch (error) {
        setError(error.response?.data?.detail || "Failed to create pull request")
      }
      finally{
        setLoading(false)
      }
    }

    return (
    <div className="p-6">
      <div className="max-w-md mx-auto bg-surface border border-border rounded-xl p-8">
        <h1 className="font-display text-2xl text-fg mb-6">New pull request</h1>
        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-danger-bg border border-danger-border text-danger text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted mb-1.5">title</label>
            <input
              type="text" name="title" value={formData.title} onChange={handleChange} required
              className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted mb-1.5">description</label>
            <textarea
              name="description" value={formData.description} onChange={handleChange} rows={4}
              className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm outline-none focus:border-accent"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium rounded-md py-2.5">
            {loading ? 'Creating…' : 'Create pull request'}
          </button>
        </form>
      </div>
    </div>
  )
}
