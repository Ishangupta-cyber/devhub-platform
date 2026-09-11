import { useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { useAuth } from "../../../hooks/useAuth"
import { addMember, listMembers, listOrganizations } from "../api/organisations"

const ROLE_STYLE = {
  owner: 'bg-warn-bg text-warn',
  admin: 'bg-info-bg text-info',
  member: 'bg-subtle text-muted',
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
      const {data}=await addMember(orgId,newMember)
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


  if (loading) return <div className="p-6" />
  if (!org) return <div className="p-6 text-fg text-center pt-20">Organization not found.</div>

    return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/organizations" className="text-xs text-muted hover:text-fg">
          ← back to organizations
        </Link>

        <h1 className="font-display text-2xl text-fg mt-4">{org.name}</h1>
        {org.description && <p className="text-sm text-muted mt-2 mb-6">{org.description}</p>}

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-danger-bg border border-danger-border text-danger text-sm">
            {error}
          </div>
        )}

        <h2 className="font-mono text-xs text-muted mb-3 mt-6">members ({members.length})</h2>

        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between bg-surface border border-border rounded-md px-4 py-3">
              <Link to={`/profile/${member.username}`} className="text-sm text-fg hover:text-accent">
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
              className="flex-1 bg-subtle border border-border rounded-md px-3 py-2 text-fg text-sm outline-none focus:border-accent"
            />
            <select
              name="role"
              value={newMember.role}
              onChange={handleChange}
              className="bg-subtle border border-border rounded-md px-3 py-2 text-fg text-sm outline-none focus:border-accent"
            >
              <option value="member">member</option>
              <option value="admin">admin</option>
              <option value="owner">owner</option>
            </select>
            <button
              type="submit"
              disabled={adding}
              className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium rounded-md px-4 py-2"
            >
              {adding ? 'Adding…' : 'Add'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
