import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createIssue } from '../api/issues'

export default function CreateIssue() {

  const [error,setError]=useState("")
  const {repoId}=useParams()
  const [formData,setFormData]=useState({title:"",description:""})
  const [loading,setLoading]=useState(false)
  const navigate=useNavigate()

  const handleChange=(e)=>{
    setFormData({...formData,[e.target.name]:e.target.value})
  }

  const handleSubmit=async(e)=>{
    e.preventDefault()
    setLoading(true)
    setError("")
    try{
      const {data}=await createIssue(repoId,formData)
      navigate(`/repositories/${repoId}/issues/${data.id}`)
    }
    catch (err) {
      const resData = err.response?.data
      if (resData) {
        const firstKey = Object.keys(resData)[0]
        const firstMsg = Array.isArray(resData[firstKey]) ? resData[firstKey][0] : resData[firstKey]
        setError(firstMsg)
      } else {
        setError('Failed to create issue.')
      }
    }
    finally{
      setLoading(false)
    }
  }
 
  return (
    <div className="p-6">
      <div className="max-w-md mx-auto bg-surface border border-border rounded-xl p-8">
        <h1 className="font-display text-2xl text-fg mb-6">New issue</h1>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-danger-bg border border-danger-border text-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted mb-1.5">title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted mb-1.5">description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium rounded-md py-2.5"
          >
            {loading ? 'Creating…' : 'Create issue'}
          </button>
        </form>
      </div>
    </div>
  )
}
