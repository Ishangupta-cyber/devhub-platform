import { createContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { listNotiications, markAsRead } from "../features/notifications/api/notifications";

export const NotificationContext = createContext(null)

export default function NotificationProvider({ children }) {
  const {isAuthenticated,accessToken}=useAuth()
  const [loading,setLoading]=useState(true)
  const [notifications,setNotifications]=useState([])
  const [connected,setConnected] =useState(false)
  const socketRef = useRef(null)

  useEffect(()=>{
    if (!isAuthenticated) {
      setNotifications([])
      setLoading(false)
      return 
    }
    const fetchNotification = async ()=>{
      setLoading(true)
      try 
      {
        const res = await listNotiications()
        const data = Array.isArray(res.data)? res.data : res.data.results
        setNotifications(data)
      } 
      catch (err) 
      {
        setNotifications([])
      }
      finally 
      {
        setLoading(false)
      }
    }
    fetchNotification()
  },[isAuthenticated])

  useEffect(()=>{
    if (!accessToken) return

    const socket = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${accessToken}` )
    socketRef.current=socket

    socket.onopen=()=>{
      setConnected(true)
    }
    socket.onmessage=(event)=>{
      const data=JSON.parse(event.data)
      setNotifications((prev)=>[{...data,is_read:false},...prev])
    }
    socket.onclose=()=>{
      setConnected(false)
    }

  },[accessToken])


  const unreadCount = notifications.filter((n)=>!n.is_read).length

  const handleMarkAsRead= async(id)=>{
    try 
    {
        await markAsRead(id)
        setNotifications(notifications.map((n)=>(n.id==id ? {...n,is_read:true}:n)))
    } 
    catch (err) {
    }
  }

  const value = {notifications,unreadCount,loading,markAsRead:handleMarkAsRead}

  return (
      <NotificationContext.Provider value={value} >{children}</NotificationContext.Provider>
  )
}
