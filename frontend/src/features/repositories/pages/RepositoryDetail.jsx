import { useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { deleteRepository, updateRepository } from '../api/repositories'

export default function RepositoryDetail() {
  const { repoId } = useParams()
  const navigate = useNavigate()
  const { repo, canManage, onRepoChange } = useOutletContext()

  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: repo.name,
    description: repo.description || '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const { data } = await updateRepository(repoId, formData)
      onRepoChange(data)
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Update failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${repo.name}? This cannot be undone.`)) return
    try {
      await deleteRepository(repoId)
      navigate('/repositories')
    } catch (err) {
      setError(err.response?.data?.detail || 'Delete failed.')
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-danger-bg border border-danger-border text-danger text-sm">
            {error}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleUpdate} className="bg-surface border border-border rounded-lg p-6 max-w-xl space-y-4">
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5">name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm font-mono outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5">description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full bg-subtle border border-border rounded-md px-3 py-2.5 text-fg text-sm outline-none focus:border-accent"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium rounded-md px-4 py-2"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({ name: repo.name, description: repo.description || '' })
                  setEditing(false)
                }}
                className="border border-border bg-surface hover:bg-subtle text-fg text-sm font-medium rounded-md px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Detail label="Owner" value={`@${repo.owner}`} />
            <Detail label="Organization" value={repo.organization?.name || 'Personal'} />
            <Detail label="Created" value={new Date(repo.created_at).toLocaleDateString()} />
          </div>
        )}

        {!editing && canManage && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setEditing(true)}
              className="border border-border bg-surface hover:bg-subtle text-fg text-sm font-medium rounded-md px-4 py-2 transition-colors"
            >
              Edit repository
            </button>
            <button
              onClick={handleDelete}
              className="text-danger hover:bg-danger-bg text-sm font-medium rounded-md px-4 py-2 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div className="bg-surface border border-border rounded-lg px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm text-fg mt-0.5 truncate">{value}</p>
    </div>
  )
}
