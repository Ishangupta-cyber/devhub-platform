import { useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { useAuth } from "../../../hooks/useAuth"
import { addMember, listMembers, listOrganizations } from "../api/organisations"

const ROLE_STYLE = {
  owner: 'bg-[#3A2E1B] text-[#F4C97A]',
  admin: 'bg-[#1B2A3A] text-[#7AB8F4]',
  member: 'bg-[#2A2A3A] text-[#B8B8D0]',
}

export default function OrganizationDetail() {
  const [error,setError]=useState("")
  const location=useLocation()
  const {orgId}=useParams()
  const {user}=useAuth()
  const [org,setOrg]=useState(location.state?.org || null)
  const [loading,setLoading]=useState(true)
  const [members,setMembers]=useState([])


  const [newMember,setNewMember]=useState({username:"",role:"member"})
  const [adding,setAdding]=useState(false)

  useEffect(()=>{
    const fetchOrg=async()=>{
      setLoading(true)
      try {
        if(!location.state?.org){
          const orgsRes=await listOrganizations()
          const orgsData=Array.isArray(orgsRes.data)?orgsRes.data:orgsRes.data?.results
          setOrg(orgsData.find((o)=>o.id===Number(orgId)) || null)
        }
        const membersRes=await listMembers(orgId)
        const membersData = Array.isArray(membersRes.data) ? membersRes.data : membersRes.data.results
        setMembers(membersData)
        
      } catch (err) {
         setError('Failed to load organization.')
      }
      finally{
        setLoading(false)
      }
    }
    fetchOrg()
  },[orgId])


  const myMemberShip=members.find((m)=>m.username===user?.username)
  const canAddMembers=myMemberShip && ["owner","admin"].includes(myMemberShip.role)

  const handleChange=(e)=>setNewMember({...newMember,[e.target.name]:e.target.value})

  const handleAddMember = async(e)=>{
    e.preventDefault()
    if (!newMember.username.trim()) return
    setError('')
    setAdding(true)
    try {
      const {data}=addMember(orgId,newMember)
       setMembers([...members, data])
      setNewMember({ username: '', role: 'member' })
      
    } catch (err){ 
      if (err.response?.status === 404) {
        setError('User not found.')
      }
      else
    {
        const resData = err.response?.data
        const firstKey = resData && Object.keys(resData)[0]
        setError(firstKey ? (Array.isArray(resData[firstKey]) ? resData[firstKey][0] : resData[firstKey]) : 'Failed to add member.')
    }}
    finally{
      setAdding(false)
    }
  }


  if (loading) return <div className="min-h-screen bg-[#0B0F1A]" />
  if (!org) return <div className="min-h-screen bg-[#0B0F1A] text-[#E4E7F2] text-center pt-20">Organization not found.</div>

    return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/organizations" className="text-xs text-[#8B90A8] hover:text-[#E4E7F2]">
          ← back to organizations
        </Link>

        <h1 className="font-display text-2xl text-[#E4E7F2] mt-4">{org.name}</h1>
        {org.description && <p className="text-sm text-[#8B90A8] mt-2 mb-6">{org.description}</p>}

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-[#3A1B23] border border-[#5C2430] text-[#F4A9B5] text-sm">
            {error}
          </div>
        )}

        <h2 className="font-mono text-xs text-[#8B90A8] mb-3 mt-6">members ({members.length})</h2>

        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between bg-[#12162A] border border-[#242B45] rounded-md px-4 py-3">
              <Link to={`/profile/${member.username}`} className="text-sm text-[#E4E7F2] hover:text-[#7C6FF5]">
                @{member.username}
              </Link>
              <span className={`text-xs px-2 py-1 rounded-md font-mono ${ROLE_STYLE[member.role]}`}>
                {member.role}
              </span>
            </div>
          ))}
        </div>

        {canAddMembers && (
          <form onSubmit={handleAddMember} className="mt-6 flex gap-2">
            <input
              type="text"
              name="username"
              value={newMember.username}
              onChange={handleChange}
              placeholder="Username"
              className="flex-1 bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5]"
            />
            <select
              name="role"
              value={newMember.role}
              onChange={handleChange}
              className="bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5]"
            >
              <option value="member">member</option>
              <option value="admin">admin</option>
              <option value="owner">owner</option>
            </select>
            <button
              type="submit"
              disabled={adding}
              className="bg-[#7C6FF5] hover:bg-[#6C5FE0] disabled:opacity-50 text-white text-sm font-medium rounded-md px-4 py-2"
            >
              {adding ? 'Adding…' : 'Add'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
