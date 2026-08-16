import { useEffect, useState } from "react"
import {getProfile,followUser,unfollowUser} from "../api/profile"
import { useParams } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import Navbar from "../components/Navbar"

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


  if (loading) return <div className="min-h-screen bg-[#0B0F1A]" />
  if (!profileData) return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-[#0B0F1A] text-[#E4E7F2] text-center pt-20">User not found.</div>
    </>
  )
  const isOwnProfile = currentUser && currentUser.username === username
  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-md mx-auto bg-[#12162A] border border-[#242B45] rounded-xl p-8">
        
        {/* Name */}
        <h1 className="font-display text-2xl font-semibold text-[#E4E7F2]">
          {profileData ? profileData.full_name : "Loading..."}
        </h1>

        {/* Username */}
        <p className="text-sm text-[#8B90A8] mb-1">
          {profileData?`@${profileData.username}`: "Loading..."}
        </p>

        {/* Bio */}
        <p className="text-sm text-[#8B90A8] mb-4">
          {profileData ? profileData.bio : "Loading..."}
        </p>

        {/* Followers / Following row */}
        <div className="flex gap-4 text-sm text-[#8B90A8] mb-4">
          <span>
            <span className="text-[#E4E7F2] font-medium">{profileData?.followers_count || 0}</span> followers
          </span>
          <span>
            <span className="text-[#E4E7F2] font-medium">{profileData?.following_count || 0}</span> following
          </span>
        </div>

        {/* Follow/Unfollow button */}
       { !isOwnProfile && (
          <button
            className="w-full bg-[#7C6FF5] hover:bg-[#6C5FE0] disabled:opacity-50 text-white text-sm font-medium rounded-md py-2.5 transition-colors"
            disabled={followLoading}
            onClick={handleFollowToggle}
          >
            Follow
          </button>
        )}

      </div>
    </div>
    </>
  )
}

export default Profile