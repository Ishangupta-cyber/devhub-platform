import React, { useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { createWikiPage, listWikiPages } from '../api/wiki'

export default function WikiPages() {
  const [error,setError]=useState("")
  const {repoId}=useParams()
  const [loading,setLoading]=useState(true)
  const [pages,setPages]=useState([])
  const {canManage}=useOutletContext()

  const [formData,setFormData]=useState({title:"",content:""})
  const [creating,setCreating]=useState(false)
  const [showForm,setShowForm]=useState(false)

  useEffect(()=>{
    const fetchData=async()=>{
      setLoading(true)
      try {
        const pagesRes=await listWikiPages(repoId)
        const pagesData=Array.isArray(pagesRes.data)?pagesRes.data:pagesRes.data.results
        setPages(pagesData)
        
      } catch (error) {
         setError('Failed to load wiki.')
      }
      finally{
        setLoading(false)
      }
    }
    fetchData()
  },[repoId])

  const handleChange=(e)=> setFormData({...formData,[e.target.name]:e.target.value})

  const handleCreate=async(e)=>{
    e.preventDefault()
    if (!formData.title.trim()) return
    setError('')
    setCreating(true)
    try {
      const {data}=await createWikiPage(repoId,formData)
      setPages([...pages,data].sort((a,b)=>a.title.localeCompare(b.title)))
      setFormData({ title: '', content: '' })
      setShowForm(false)
      
    } catch (err) {
        const resData = err.response?.data
      const firstKey = resData && Object.keys(resData)[0]
      setError(firstKey ? (Array.isArray(resData[firstKey]) ? resData[firstKey][0] : resData[firstKey]) : 'Failed to create page.')
    }
    finally{
      setCreating(false)
    }
  }


  if (loading) return <div className="p-6" />
   return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-end mb-4">
          {canManage && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md px-4 py-2"
            >
              New page
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-danger-bg border border-danger-border text-danger text-sm">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className="mb-6 bg-surface border border-border rounded-md p-4 space-y-3">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Page title"
              required
              className="w-full bg-subtle border border-border rounded-md px-3 py-2 text-fg text-sm outline-none focus:border-accent"
            />
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="## Markdown content..."
              rows={8}
              className="w-full bg-subtle border border-border rounded-md px-3 py-2 text-fg text-sm font-mono outline-none focus:border-accent"
            />
            <div className="flex gap-3">
              <button type="submit" disabled={creating} className="text-sm text-accent hover:underline disabled:opacity-50">
                {creating ? 'Creating…' : 'Create page'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-muted hover:underline">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {pages.length === 0 && <p className="text-sm text-muted">No wiki pages yet.</p>}
          {pages.map((page) => (
            <Link
              key={page.id}
              to={`/repositories/${repoId}/wiki/${page.slug}`}
              className="block bg-surface border border-border rounded-md px-4 py-3 hover:border-accent transition-colors"
            >
              <p className="text-sm text-fg font-medium">{page.title}</p>
              <p className="text-xs text-muted mt-1">by @{page.created_by}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
