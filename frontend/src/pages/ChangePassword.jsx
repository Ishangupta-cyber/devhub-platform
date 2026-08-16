import React, { useState } from 'react'
import { changePassword } from '../api/auth'

export default function ChangePassword() {
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState(null)
  const [formData,setFormData]=useState({old_password:'',new_password:''})
  const [confirmPassword,setConfirmPassword]=useState(null)
  const [success,setSuccess]=useState(false)

  const handleChange=(e)=>{
    setFormData({...formData,[e.target.name]:e.target.value})
  }

  const handleSubmit=async(e)=>{
    e.preventDefault()
    setSuccess(false)
     if (formData.new_password!==confirmPassword){
        setError("NEw Password dont Match")
        return
      }
    setLoading(true)
    try{
      const {data}=await changePassword(formData)
      setSuccess(data.message)
      setFormData({old_password:'',new_password:''})
      setConfirmPassword("")
    }
    catch(err){
       setError(err.response?.data?.error || 'Failed to change password.')
    }
    finally{
      setLoading(false)
    }
  }



   return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-md mx-auto bg-[#12162A] border border-[#242B45] rounded-xl p-8">
        <h1 className="font-display text-2xl text-[#E4E7F2] mb-6">Change Password</h1>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-[#3A1B23] border border-[#5C2430] text-[#F4A9B5] text-sm">
            {error}
          </div>
        )}
        {success}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#8B90A8] mb-1.5">current password</label>
            <input
              type="password"
              name="old_password"
              value={formData.old_password}
              onChange={handleChange}
              required
              className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2.5 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5]"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-[#8B90A8] mb-1.5">new password</label>
            <input
              type="password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              required
              className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2.5 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5]"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-[#8B90A8] mb-1.5">confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2.5 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7C6FF5] hover:bg-[#6C5FE0] disabled:opacity-50 text-white text-sm font-medium rounded-md py-2.5"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
   )
}
