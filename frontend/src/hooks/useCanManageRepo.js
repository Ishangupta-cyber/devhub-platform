import React, { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { listMembers } from '../features/organizations/api/organisations'

export default function useCanManageRepo(repo) {

  const {user}=useAuth()
  const [checking,setChecking]=useState(true)
  const [canManage,setCanManage]=useState(false)

  useEffect(()=>{
    const checkPermission = async()=>{
      setChecking(true)
      if (!repo || !user){
        setCanManage(false)
        setChecking(false)
        return 
      }
      if (repo.owner===user.username){
        setChecking(false)
        setCanManage(true)
        return 
      }
      if (!repo.organization){
        setCanManage(false)
        setChecking(false)
        return 
      }
      try { 
        const membersRes=await listMembers(repo.organization.id)
        const membersData=Array.isArray(membersRes.data)?membersRes.data:membersRes.data.results
        const myMemberShip=membersData.find((m)=>m.username===user.username)

        setCanManage(!!myMemberShip && ["owner","admin"].includes(myMemberShip.role))
        
      } catch (err) {
        setCanManage(false)
      }
      finally{
        setChecking(false)
      }
    }

    checkPermission()
    
  },[user?.username,repo?.organization?.id,repo?.owner])

  return {canManage,checking}
}
