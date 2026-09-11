import React, { useState } from 'react'
import { changePassword } from '../../auth/api/auth'

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
    <div className="p-6">
      <div className="max-w-md mx-auto bg-surface border border-border rounded-xl p-8">
        <h1 className="font-display text-2xl text-fg mb-6">Change Password</h1>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-danger-bg border border-danger-border text-danger text-sm">
            {error}
          </div>
        )}
        {success}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted mb-1.5">current password</label>
            <input
              type="password"
              name="old_password"
              value={formData.old_password}
              onChange={handleChange}
              required
              className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted mb-1.5">new password</label>
            <input
              type="password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              required
              className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted mb-1.5">confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium rounded-md py-2.5"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
   )
}
