import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useCanManageRepo from '../../../hooks/useCanManageRepo'
import { createWikiPage, listWikiPages } from '../api/wiki'
import { getRepository } from '../../repositories/api/repositories'

export default function WikiPages() {
  const [error,setError]=useState("")
  const {repoId}=useParams()
  const [loading,setLoading]=useState(true)
  const [pages,setPages]=useState([])
  const [repo,setRepo]=useState(null)

  const {canManage,checking}=useCanManageRepo(repo)

  const [formData,setFormData]=useState({title:"",content:""})
  const [creating,setCreating]=useState(false)
  const [showForm,setShowForm]=useState(false)

  useEffect(()=>{
    const fetchData=async()=>{
      setLoading(true)
      try {
        const [pagesRes,repoRes]=await Promise.all([listWikiPages(repoId),getRepository(repoId)])
        const pagesData=Array.isArray(pagesRes.data)?pagesRes.data:pagesRes.data.results
        setPages(pagesData)
        setRepo(repoRes.data)
        
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


  if (loading) return <div className="min-h-screen bg-[#0B0F1A]" />
   return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-2xl mx-auto">
        <Link to={`/repositories/${repoId}`} className="text-xs text-[#8B90A8] hover:text-[#E4E7F2]">
          ← back to repository
        </Link>

        <div className="flex items-center justify-between mt-4 mb-6">
          <h1 className="font-display text-2xl text-[#E4E7F2]">Wiki</h1>
          {!checking && canManage && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#7C6FF5] hover:bg-[#6C5FE0] text-white text-sm font-medium rounded-md px-4 py-2"
            >
              New page
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-[#3A1B23] border border-[#5C2430] text-[#F4A9B5] text-sm">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className="mb-6 bg-[#12162A] border border-[#242B45] rounded-md p-4 space-y-3">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Page title"
              required
              className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5]"
            />
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="## Markdown content..."
              rows={8}
              className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2 text-[#E4E7F2] text-sm font-mono outline-none focus:border-[#7C6FF5]"
            />
            <div className="flex gap-3">
              <button type="submit" disabled={creating} className="text-sm text-[#7C6FF5] hover:underline disabled:opacity-50">
                {creating ? 'Creating…' : 'Create page'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-[#8B90A8] hover:underline">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {pages.length === 0 && <p className="text-sm text-[#8B90A8]">No wiki pages yet.</p>}
          {pages.map((page) => (
            <Link
              key={page.id}
              to={`/repositories/${repoId}/wiki/${page.slug}`}
              className="block bg-[#12162A] border border-[#242B45] rounded-md px-4 py-3 hover:border-[#7C6FF5] transition-colors"
            >
              <p className="text-sm text-[#E4E7F2] font-medium">{page.title}</p>
              <p className="text-xs text-[#8B90A8] mt-1">by @{page.created_by}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
