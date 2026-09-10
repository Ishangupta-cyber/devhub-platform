import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { listNotiications, markAsRead } from "../features/notifications/api/notifications";

export const NotificationContext = createContext(null)

const MAX_RECONNECT_DELAY = 30000

function detach(socket) {
  socket.onopen = null
  socket.onmessage = null
  socket.onclose = null
  socket.onerror = null
}

export default function NotificationProvider({ children }) {
  const {isAuthenticated,accessToken}=useAuth()
  const [loading,setLoading]=useState(true)
  const [notifications,setNotifications]=useState([])
  const [connected,setConnected] =useState(false)

  const socketRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef(null)
  const shouldReconnectRef = useRef(false)

  const fetchNotifications = useCallback(async ({silent=false}={})=>{
    if (!silent) setLoading(true)
    try 
    {
      const res = await listNotiications()
      const data = Array.isArray(res.data)? res.data : res.data.results
      setNotifications(data)
    } 
    catch (err) 
    {
      if (!silent) setNotifications([])
    }
    finally 
    {
      if (!silent) setLoading(false)
    }
  },[])

  useEffect(()=>{
    if (!isAuthenticated) {
      setNotifications([])
      setLoading(false)
      return 
    }
    fetchNotifications()
  },[isAuthenticated,fetchNotifications])

  const connect = useCallback(()=>{
    // interceptor refresh pe naya token sirf localStorage mein likhta hai,
    // isliye har connect pe wahi se padho — context ka accessToken stale ho sakta hai
    const token = localStorage.getItem("accessToken")
    if (!token) return

    const socket = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}` )
    socketRef.current=socket

    socket.onopen=()=>{
      setConnected(true)
      // drop ke dauraan aayi notifications WS replay nahi karta, to catch up kar lo
      if (reconnectAttemptsRef.current > 0) {
        fetchNotifications({silent:true})
      }
      reconnectAttemptsRef.current=0
    }

    socket.onmessage=(event)=>{
      const data=JSON.parse(event.data)
      setNotifications((prev)=>[{...data,is_read:false},...prev])
    }

    socket.onerror=(err)=>{
      console.error('WebSocket error',err)
    }

    socket.onclose=()=>{
      detach(socket)
      setConnected(false)

      // socketRef badal gaya = ye purana socket hai, iske liye reconnect mat karo
      if (!shouldReconnectRef.current || socketRef.current!==socket) return

      const attempt = reconnectAttemptsRef.current
      reconnectAttemptsRef.current = attempt + 1
      const delay = Math.min(1000 * 2 ** attempt, MAX_RECONNECT_DELAY)

      reconnectTimeoutRef.current = setTimeout(connect, delay)
    }
  },[fetchNotifications])

  useEffect(()=>{
    if (!accessToken) return

    shouldReconnectRef.current=true
    reconnectAttemptsRef.current=0
    connect()

    return ()=>{
      shouldReconnectRef.current=false
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current=null

      const socket = socketRef.current
      socketRef.current=null

      if (socket) {
        detach(socket)
        if (socket.readyState===WebSocket.OPEN || socket.readyState===WebSocket.CONNECTING){
          socket.close()
        }
      }
      setConnected(false)
    }

  },[accessToken,connect])


  const unreadCount = notifications.filter((n)=>!n.is_read).length

  const handleMarkAsRead= async(id)=>{
    try 
    {
        await markAsRead(id)
        setNotifications((prev)=>prev.map((n)=>(n.id===id ? {...n,is_read:true}:n)))
    } 
    catch (err) {
    }
  }

  const value = {notifications,unreadCount,loading,connected,markAsRead:handleMarkAsRead}

  return (
      <NotificationContext.Provider value={value} >{children}</NotificationContext.Provider>
  )
}
