import { useState } from 'react'
import { registerUser } from '../api/auth'

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    full_name: '',
    password: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { data } = await registerUser(formData)
      console.log('Registered:', data)
    } catch (err) {
      const message = err.response?.data?.detail || 'Registration failed. Try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{ backgroundImage: 'radial-gradient(#3A4166 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <div className="relative w-full max-w-md">
        <p className="font-mono text-xs text-[#7C6FF5] mb-3 tracking-wide">$ devhub auth --register</p>

        <div className="bg-[#12162A] border border-[#242B45] rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#242B45] bg-[#0F1424]">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
            <span className="ml-3 font-mono text-xs text-[#8B90A8]">register.jsx</span>
          </div>

          <div className="p-8">
            <h1 className="font-display text-2xl font-semibold text-[#E4E7F2]">Create account</h1>
            <p className="text-sm text-[#8B90A8] mt-1 mb-6">Join DevHub and start shipping.</p>

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
                  required
                  className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2.5 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5] focus:ring-1 focus:ring-[#7C6FF5] transition-colors"
                  placeholder="Rahul Sharma"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8B90A8] mb-1.5">username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2.5 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5] focus:ring-1 focus:ring-[#7C6FF5] transition-colors"
                  placeholder="rahul"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8B90A8] mb-1.5">email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2.5 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5] focus:ring-1 focus:ring-[#7C6FF5] transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8B90A8] mb-1.5">password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2.5 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5] focus:ring-1 focus:ring-[#7C6FF5] transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8B90A8] mb-1.5">confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2.5 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5] focus:ring-1 focus:ring-[#7C6FF5] transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#7C6FF5] hover:bg-[#6C5FE0] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md py-2.5 transition-colors mt-2"
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="text-sm text-[#8B90A8] mt-6 text-center">
              Already have an account?{' '}
              <a href="/login" className="text-[#7C6FF5] hover:underline">Log in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register