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
    <div className="p-6">
      <div className="max-w-md mx-auto bg-surface border border-border rounded-xl p-8">
        <h1 className="font-display text-2xl text-fg mb-6">Edit Profile</h1>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-danger-bg border border-danger-border text-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted mb-1.5">full name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted mb-1.5">bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium rounded-md py-2.5"
          >
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
