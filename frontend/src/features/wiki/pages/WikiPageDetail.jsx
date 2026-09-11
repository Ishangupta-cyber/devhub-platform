import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import useCanManageRepo from '../../../hooks/useCanManageRepo'
import ReactMarkdown from 'react-markdown'
import { deleteWikiPage, getWikiPage, updateWikiPage } from '../api/wiki'
import { getRepository } from '../../repositories/api/repositories'

export default function WikiPageDetail() {

  const [loading,setLoading]=useState(true)
  const [page,setPage]=useState(null)
  const {slug,repoId}=useParams()
  const navigate=useNavigate()
  const [repo,setRepo]=useState(null)
  const [error,setError]=useState("")
  const [saving,setSaving]=useState(false)
  const {canManage,checking}=useCanManageRepo(repo)
  const [editing,setEditing]=useState(false)
  const [formData,setFormData]=useState({title:"",content:""})

  useEffect(()=>{
    const fetchData=async()=>{
      setLoading(true)
      try {
      const [pageRes,repoRes]=await Promise.all([getWikiPage(slug,repoId),getRepository(repoId)])
      setPage(pageRes.data)
      setRepo(repoRes.data)
      setFormData({title:pageRes.data.title,content:pageRes.data.content})
        
      } 
      catch (err) {
        setPage(null)
      }
      finally{
        setLoading(false)
      }
    }
    fetchData()
  },[repoId,slug])

  const handleChange=(e)=> setFormData({...formData,[e.target.name]:e.target.value})

  const handleSave=async(e)=>{
    e.preventDefault()
    setError("")
    setSaving(true)
    try{
      const {data} = await updateWikiPage(repoId,slug,formData)
      setPage(data)
      setEditing(false)
    }
    catch(err){
      setError(err.response?.data?.detail || 'Failed to save page.')
    }
    finally{
      setSaving(false)
    }
  }

  const handleDelete=async()=>{
    if (!window.confirm("Delete this Page? This can't be undone.. ")) return 
    try {
      await deleteWikiPage(repoId,slug)
      navigate(`/repositories/${repoId}/wiki`)
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete page.")
    }
  }

  if (loading) return <div className="p-6" />
  if (!page) return <div className="p-6 text-fg text-center pt-20">Page not found.</div>

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <Link to={`/repositories/${repoId}/wiki`} className="text-xs text-muted hover:text-fg">
          ← back to wiki
        </Link>

        {error && (
          <div className="mt-4 px-3 py-2 rounded-md bg-danger-bg border border-danger-border text-danger text-sm">
            {error}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSave} className="mt-4 space-y-3">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-subtle border border-border rounded-md px-3 py-2 text-fg text-sm outline-none focus:border-accent"
            />
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={16}
              className="w-full bg-subtle border border-border rounded-md px-3 py-2 text-fg text-sm font-mono outline-none focus:border-accent"
            />
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="text-sm text-accent hover:underline disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="text-sm text-muted hover:underline">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start justify-between mt-4">
              <h1 className="font-display text-2xl text-fg">{page.title}</h1>
              {!checking && canManage && (
                <div className="flex gap-3 shrink-0 ml-4">
                  <button onClick={() => setEditing(true)} className="text-sm text-accent hover:underline">Edit</button>
                  <button onClick={handleDelete} className="text-sm text-danger hover:underline">Delete</button>
                </div>
              )}
            </div>

            <p className="text-xs text-muted mt-1 mb-6">by @{page.created_by}</p>

            <div className="prose-wiki text-sm text-fg space-y-3">
              <ReactMarkdown>{page.content}</ReactMarkdown>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
