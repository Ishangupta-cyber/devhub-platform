import React, { useEffect } from 'react'
import {useState} from "react"
import { useAuth } from '../../../hooks/useAuth'
import { updateProfile } from '../../auth/api/auth'
import { useNavigate } from 'react-router-dom'
 
export default function EditProfile() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData,setFormData]=useState({full_name:'',bio:''})
  const {user }=useAuth()

  useEffect(()=>{
    if (user){
      setFormData({
        full_name:user.full_name || '',
        bio:user.bio || ''
      })
    }

  },[user])

  const handleSubmit = async(e)=>{
    e.preventDefault()
    setLoading(true)
    setError(null)
    try{
      await updateProfile(formData)
      navigate(`/profile/${user.username}`)
      
    } catch (err) {
      setError(err.response?.data? err.response.data : 'Failed to save profile changes.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange=(e)=>{
    const {name,value}=e.target
    setFormData(prevData=>({
      ...prevData,
      [name]:value
    }))
  }



    return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-md mx-auto bg-[#12162A] border border-[#242B45] rounded-xl p-8">
        <h1 className="font-display text-2xl text-[#E4E7F2] mb-6">Edit Profile</h1>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-[#3A1B23] border border-[#5C2430] text-[#F4A9B5] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#8B90A8] mb-1.5">full name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2.5 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5]"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-[#8B90A8] mb-1.5">bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2.5 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7C6FF5] hover:bg-[#6C5FE0] disabled:opacity-50 text-white text-sm font-medium rounded-md py-2.5"
          >
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
