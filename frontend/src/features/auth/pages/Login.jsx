import React from 'react'
import { useState } from 'react'
import { loginUser } from '../api/auth'
import { useAuth } from '../../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

function Login() {

  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const [loading,setLoading]=useState(false)
  const[error,setError]=useState("")
  const {login}=useAuth()
  const navigate=useNavigate()

  const handleSubmit=async(e)=>{
    
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { data } = await loginUser(email, password)
      login({access:data.access,refresh:data.refresh})
      setLoading(false)
      navigate("/")
    } 
    catch (err) {
      if (!err.response) {
    setError('Cannot reach server. Check your connection or CORS settings.')
      }
     else {
    setError(err.response.data?.detail || 'Login failed. Check your credentials.')
  }
  setLoading(false)
}
  }

 return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6 relative overflow-hidden">

      <div
        className="absolute inset-0 opacity-[0.25]"
        style={{ backgroundImage: 'radial-gradient(#8A90A3 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <div className="relative w-full max-w-md">
        <p className="font-mono text-xs text-accent mb-3 tracking-wide">$ devhub auth --login</p>

        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">

          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-subtle">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
            <span className="ml-3 font-mono text-xs text-muted">login.jsx</span>
          </div>

          <div className="p-8">
            <h1 className="font-display text-2xl font-semibold text-fg">Welcome back</h1>
            <p className="text-sm text-muted mt-1 mb-6">Log in to continue building on DevHub.</p>

            {error && (
              <div className="mb-4 px-3 py-2 rounded-md bg-danger-bg border border-danger-border text-danger text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-muted mb-1.5">email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1.5">password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md py-2.5 transition-colors mt-2"
              >
                {loading ? 'Logging in…' : 'Log in'}
              </button>
            </form>

            <p className="text-sm text-muted mt-6 text-center">
              Don't have an account?{' '}
              <a href="/register" className="text-accent hover:underline">Sign up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login