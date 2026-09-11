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
      const { data } = await registerUser({ ...formData, password2: confirmPassword })
    } catch (err) {
      const fieldErrors = err.response?.data
      const message =
        fieldErrors?.detail ||
        (fieldErrors && Object.values(fieldErrors)[0]?.[0]) ||
        'Registration failed. Try again.'
      setError(message)
    } finally {
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
        <p className="font-mono text-xs text-accent mb-3 tracking-wide">$ devhub auth --register</p>

        <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-subtle">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
            <span className="ml-3 font-mono text-xs text-muted">register.jsx</span>
          </div>

          <div className="p-8">
            <h1 className="font-display text-2xl font-semibold text-fg">Create account</h1>
            <p className="text-sm text-muted mt-1 mb-6">Join DevHub and start shipping.</p>

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
                  required
                  className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  placeholder="Rahul Sharma"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1.5">username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  placeholder="rahul"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1.5">email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1.5">password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1.5">confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="text-sm text-muted mt-6 text-center">
              Already have an account?{' '}
              <a href="/login" className="text-accent hover:underline">Log in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register