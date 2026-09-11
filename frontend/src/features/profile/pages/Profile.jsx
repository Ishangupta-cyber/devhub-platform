import { useEffect, useState } from "react"
import {getProfile,followUser,unfollowUser} from "../api/profile"
import { Link, useParams } from "react-router-dom"
import { useAuth } from "../../../hooks/useAuth"

function Profile() {
  const [profileData,setProfileData]=useState(null)
  const {username}=useParams()
  const [loading,setloading]=useState(true)
  const {user:currentUser}=useAuth()
  const [followLoading,setFollowLoading]=useState(false)

  const fetchProfileData=async()=>{
    try{
      setloading(true)
      const response=await getProfile(username)
      setProfileData(response.data)
    }
    catch(error){
      console.error("Error fetching profile data:", error.response?.data || error.message)
      setProfileData(null)
    }
    finally{
      setloading(false)
    }
  }

  useEffect(()=>{
    fetchProfileData()
  },[username])

  const handleFollowToggle=async()=>{
    setFollowLoading(true)
    try{
      if(profileData.is_following){
        await unfollowUser(username)
        setProfileData(prevData=>({
          ...prevData,
          is_following:false,
          followers_count:prevData.followers_count-1
      }))}
      else{
        await followUser(username)
        setProfileData(prevData=>({
          ...prevData,
          is_following:true,
          followers_count:prevData.followers_count+1
        }))

      }
    }
    catch(error){
      console.error("Error toggling follow status:", error.response?.data || error.message)
    }
    finally{
      setFollowLoading(false)
    }
  }


  if (loading) return <div className="p-6" />
  if (!profileData) return (
    <div className="p-6 text-fg text-center pt-20">User not found.</div>
  )
  const isOwnProfile = currentUser && currentUser.username === username
  return (
    <div className="p-6">
      <div className="max-w-md mx-auto bg-surface border border-border rounded-xl p-8">
        
        <h1 className="font-display text-2xl font-semibold text-fg">
          {profileData ? profileData.full_name : "Loading..."}
        </h1>

        <p className="text-sm text-muted mb-1">
          {profileData?`@${profileData.username}`: "Loading..."}
        </p>

        <p className="text-sm text-muted mb-4">
          {profileData ? profileData.bio : "Loading..."}
        </p>

        <div className="flex gap-4 text-sm text-muted mb-4">
          <Link to={`/profile/${username}/followers`} className="hover:text-fg transition-colors">
          <span className="text-fg font-medium">{profileData?.followers_count || 0}</span> followers
          </Link>
          <Link to={`/profile/${username}/following`} className="hover:text-fg transition-colors">
            <span className="text-fg font-medium">{profileData?.following_count || 0}</span> following
          </Link>
        </div>

       { !isOwnProfile && (
          <button
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium rounded-md py-2.5 transition-colors"
            disabled={followLoading}
            onClick={handleFollowToggle}
          >
            {profileData.is_following?"UnFollow":"Follow"}
          </button>
        )}

      </div>
    </div>
  )
}

export default Profile