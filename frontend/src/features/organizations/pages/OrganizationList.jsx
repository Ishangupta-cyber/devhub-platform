import React, { useEffect, useState } from 'react'
import { createOrganization, listOrganizations } from '../api/organisations'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'

export default function OrganizationList() {

  const [orgs,setOrgs]=useState([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState("")
  const [formData,setFormData]=useState({name:"",description:""})
  const [creating,setCreating]=useState(false)
  const {isAuthenticated}=useAuth()


  useEffect(()=>{

    const fetchOrg=async()=>{
      setLoading(true)
      try {
        const res=await listOrganizations()
        const data=Array.isArray(res.data) ? res.data: res.data.results
        console.log(data)
        setOrgs(data)
      } catch (err) {
        setError("Failed to Load organizations..")
      }
      finally{
        setLoading(false)
      }
    }
    fetchOrg()
  },[])

  const handleChange=(e)=>{
    setFormData({...formData,[e.target.name]:e.target.value})
  }
  const handleSubmit = async(e)=>{
    e.preventDefault()
     if (!formData.name.trim()) return
    setError('')
    setCreating(true)
    try {
      const {data}=createOrganization(formData)
      setOrgs([...orgs,data])
      setFormData({name:"",description:""})
      
    } catch (err) {
       const resData = err.response?.data
      const firstKey = resData && Object.keys(resData)[0]
      setError(firstKey ? (Array.isArray(resData[firstKey]) ? resData[firstKey][0] : resData[firstKey]) : 'Failed to create organization.')
    }
    finally{
      setCreating(false)
    }
  }



  if (loading) return <div className="min-h-screen bg-[#0B0F1A]" />

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-2xl mx-auto">

          <h1 className="font-display text-2xl text-[#E4E7F2] mb-6"> Organizations </h1>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-md bg-[#3A1B23] border border-[#5C2430] text-[#F4A9B5] text-sm">
              {error}
              </div>
          )}

        <div className='space-y-2 mb-6'>
            {orgs.length === 0 && <p className="text-sm text-[#8B90A8]"> No organizations yet...</p>}
          {orgs.map((org)=>(
            <Link
            key={org.id}
            to={`/organizations/${org.id}`}
            state={{ org }}
            className="2block bg-[#12162A] border border-[#242B45] rounded-md px-4 py-3 hover:border-[#7C6FF5] transition-colors"
            >  
             <p className="text-sm text-[#E4E7F2] font-medium">{org.name}</p>
            {org.description && <p className="text-xs text-[#8B90A8] mt-1">{org.description}</p>}
            </Link>
          ))}
        </div>

        {isAuthenticated && (<form className='space-y-2' onSubmit={handleSubmit}>
          <input
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder='Organization Name'
          className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5]"
          />
          <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description (optional)"
              rows={2}
              className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5]"
            />
               <button
              type="submit"
              disabled={creating}
              className="bg-[#7C6FF5] hover:bg-[#6C5FE0] disabled:opacity-50 text-white text-sm font-medium rounded-md px-4 py-2"
            >
              {creating ? 'Creating…' : 'Create organization'}
            </button>


        </form>)}
          
      </div>

    </div>
  )
}
