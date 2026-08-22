import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { deleteRepository, getRepository, updateRepository } from '../api/repositories'

export default function RepositoryDetail() {
  const [error,setError]=useState("")
  const {id}=useParams()
  const navigate=useNavigate()
  const [repo,setRepo]=useState(null)
  const [loading,setLoading]=useState(true)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const {user}=useAuth()
   const [editing, setEditing] = useState(false)


  useEffect(()=>{
    const getRepo=async()=>{
      try{
        setLoading(true)
      const res=await getRepository(id)
      setRepo(res?.data)
      setFormData({ name: res.data.name, description: res.data.description })
      }
      catch(err){
        setRepo(null)
      }
      finally{
        setLoading(false)
      }
    }

    getRepo()

  },[id])
  
  const isOwner=user?.username===repo?.owner

  const handleChange=(e)=>{
      setFormData({...formData,[e.target.name]:e.target.value})
  }

  const handleUpdate=async(e)=>{
    e.preventDefault()
    setError("")
    try{
        const { data } = await updateRepository(id, formData)
      setRepo(data)
      setEditing(false)
    }
    catch(err){
      setError(err.response?.data?.detail || 'Update failed.')
    }
  }

    const handleDelete=async()=>{
       if (!window.confirm('Delete this repository? This cannot be undone.')) return
    await deleteRepository(id)
    navigate('/repositories')
    }

   if (loading) return <div className="min-h-screen bg-[#0B0F1A]" />
  if (!repo) return <div className="min-h-screen bg-[#0B0F1A] text-[#E4E7F2] text-center pt-20">Repository not found.</div>

 return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-2xl mx-auto bg-[#12162A] border border-[#242B45] rounded-xl p-8">
        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-[#3A1B23] border border-[#5C2430] text-[#F4A9B5] text-sm">
            {error}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2.5 text-[#E4E7F2] text-sm font-mono outline-none focus:border-[#7C6FF5]"
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2.5 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5]"
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-[#7C6FF5] hover:bg-[#6C5FE0] text-white text-sm font-medium rounded-md px-4 py-2">
                Save
              </button>
              <button type="button" onClick={() => setEditing(false)} className="text-sm text-[#8B90A8]">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="font-display text-2xl text-[#E4E7F2]">{repo.name}</h1>
            <p className="text-sm text-[#8B90A8] mt-2">{repo.description}</p>
            <p className="text-xs text-[#8B90A8] mt-2">@{repo.owner}</p>

            {isOwner && (
              <div className="flex gap-3 mt-4">
                <button onClick={() => setEditing(true)} className="text-sm text-[#7C6FF5] hover:underline">
                  Edit
                </button>
                <button onClick={handleDelete} className="text-sm text-[#F4A9B5] hover:underline">
                  Delete
                </button>
              </div>
            )}

            <Link to={`/repositories/${id}/issues`} className="block mt-6 text-sm text-[#7C6FF5] hover:underline">
              View issues →
            </Link>
            <Link to={`/repositories/${id}/pull-requests`} className="block mt-2 text-sm text-[#7C6FF5] hover:underline">
              View pull requests →
            </Link>
            <Link to={`/repositories/${id}/projects`} className="block mt-2 text-sm text-[#7C6FF5] hover:underline">
              View projects →
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
