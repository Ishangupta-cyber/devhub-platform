import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {getFollowers,getFollwing} from '../api/profile'

export default function FollowList({type}) {

  const [list, setList] = useState([])
  const { username } = useParams()
  const [loading, setLoading] = useState(true)


  useEffect(()=>{

    const fetchList=async()=>{
       setLoading(true)
    const fetchFn= type==="followers"? getFollowers: getFollwing
    try{
      const res=await fetchFn(username)
      setList(res.data)
    } catch (error) {
      console.error(`Error fetching ${type}:`, error)
    } finally {
      setLoading(false)
    }
    }

    fetchList()

  },[username,type])


  if (loading) return <div className="min-h-screen bg-[#0B0F1A]" />

  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-md mx-auto">
        <h1 className="font-display text-xl text-[#E4E7F2] mb-4 capitalize">{type}</h1>
        <div className="space-y-2">
          {list.length === 0 && (
            <p className="text-sm text-[#8B90A8]">No {type} yet.</p>
          )}
          {list.map((person) => (
            <Link
              key={person.username}
              to={`/profile/${person.username}`}
              className="block bg-[#12162A] border border-[#242B45] rounded-md px-4 py-3 hover:border-[#7C6FF5] transition-colors"
            >
              <p className="text-sm text-[#E4E7F2] font-medium">{person.full_name}</p>
              <p className="text-xs text-[#8B90A8]">@{person.username}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
