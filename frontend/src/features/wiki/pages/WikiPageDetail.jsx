import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useCanManageRepo from '../../../hooks/useCanManageRepo'
import { createWikiPage, deleteWikiPage, getWikiPage, updateWikiPage } from '../api/wiki'
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

  if (loading) return <div className="min-h-screen bg-[#0B0F1A]" />
  if (!page) return <div className="min-h-screen bg-[#0B0F1A] text-[#E4E7F2] text-center pt-20">Page not found.</div>

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-2xl mx-auto">
        <Link to={`/repositories/${repoId}/wiki`} className="text-xs text-[#8B90A8] hover:text-[#E4E7F2]">
          ← back to wiki
        </Link>

        {error && (
          <div className="mt-4 px-3 py-2 rounded-md bg-[#3A1B23] border border-[#5C2430] text-[#F4A9B5] text-sm">
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
              className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5]"
            />
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={16}
              className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2 text-[#E4E7F2] text-sm font-mono outline-none focus:border-[#7C6FF5]"
            />
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="text-sm text-[#7C6FF5] hover:underline disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="text-sm text-[#8B90A8] hover:underline">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start justify-between mt-4">
              <h1 className="font-display text-2xl text-[#E4E7F2]">{page.title}</h1>
              {!checking && canManage && (
                <div className="flex gap-3 shrink-0 ml-4">
                  <button onClick={() => setEditing(true)} className="text-sm text-[#7C6FF5] hover:underline">Edit</button>
                  <button onClick={handleDelete} className="text-sm text-[#F4A9B5] hover:underline">Delete</button>
                </div>
              )}
            </div>

            <p className="text-xs text-[#8B90A8] mt-1 mb-6">by @{page.created_by}</p>

            <div className="prose-wiki text-sm text-[#E4E7F2] space-y-3">
              <ReactMarkdown>{page.content}</ReactMarkdown>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
