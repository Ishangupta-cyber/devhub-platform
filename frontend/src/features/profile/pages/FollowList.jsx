import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
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


  if (loading) return <div className="p-6" />

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto">
        <h1 className="font-display text-xl text-fg mb-4 capitalize">{type}</h1>
        <div className="space-y-2">
          {list.length === 0 && (
            <p className="text-sm text-muted">No {type} yet.</p>
          )}
          {list.map((person) => (
            <Link
              key={person.username}
              to={`/profile/${person.username}`}
              className="block bg-surface border border-border rounded-md px-4 py-3 hover:border-accent transition-colors"
            >
              <p className="text-sm text-fg font-medium">{person.full_name}</p>
              <p className="text-xs text-muted">@{person.username}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
