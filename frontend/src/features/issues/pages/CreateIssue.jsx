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
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-md mx-auto bg-[#12162A] border border-[#242B45] rounded-xl p-8">
        <h1 className="font-display text-2xl text-[#E4E7F2] mb-6">New issue</h1>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-[#3A1B23] border border-[#5C2430] text-[#F4A9B5] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#8B90A8] mb-1.5">title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2.5 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5]"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-[#8B90A8] mb-1.5">description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2.5 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7C6FF5] hover:bg-[#6C5FE0] disabled:opacity-50 text-white text-sm font-medium rounded-md py-2.5"
          >
            {loading ? 'Creating…' : 'Create issue'}
          </button>
        </form>
      </div>
    </div>
  )
}
