import { useEffect, useState } from "react"
import { createComment, deleteComment, listComments, updateComment } from "../api/comments"

export default function CommentSection({issueId,isRepoOwner,currentUsername}) {

  const [newComment,setNewComment]=useState("")
  const [comments,setComments]=useState([])
  const [loading,setLoading]=useState(true)
  const [posting,setPosting]=useState(false)
  const [error,setError]=useState("")
  const [editingCommentId,setEditingCommentId]=useState(null)
  const [editContent,setEditContent]=useState("")

  const canModify=(comment)=> comment.author===currentUsername || isRepoOwner

  useEffect(()=>{
      const fetchComments=async()=>{
        try{
        setLoading(true)
        const res= await listComments(issueId)
        const data=Array.isArray(res.data) ? res.data : res.data.results
        setComments(data)
        }
        catch(err){
        setError(err.response?.data?.detail || 'Failed to fetch comments.')
        }
        finally{
          setLoading(false)
        }
      }
      fetchComments()
   
  },[issueId])



  const handleAddComment=async(e)=>{
    try {
      e.preventDefault()
      if (!newComment.trim()) return 
      setPosting(true)

      const {data}= await createComment(issueId,{content:newComment})
      setComments([...comments,data])
    }
    catch(err){
        setError(err.response?.data?.detail || 'Failed to post comment.')
    }
    finally{
      setPosting(false)
    }
  }


  const startEditing = (comment) => {
    setEditingCommentId(comment.id)
    setEditContent(comment.content)
  }

  const handleDeleteComment=async(id)=>{
    if(!window.confirm("Delete this Comment??")) return
    try{
      await deleteComment(issueId,id)
      setComments(comments.filter((comment)=>comment.id!==id))
    }
    catch(err){
      setError(err.response?.data?.detail || 'Failed to delete comment.')
    }
  }

  const cancelEditing=()=>{
    setEditingCommentId(null)
    setEditContent('')
  }

  const handleSaveEdit= async(commentId)=>{
    if (!editContent.trim()) return
    try{
      const {data}=await updateComment(issueId,commentId,{content:editContent})
      setComments(comments.map((c)=>(c.id===commentId? data:c)))
      cancelEditing()
    }
    catch(err){
      setError(err.response?.data?.detail || 'Failed to update comment.')
    }
  }


    if (loading) return <p className="text-xs text-[#8B90A8]">Loading comments…</p>

   return (
    <div className="mt-8 pt-6 border-t border-[#242B45]">
      <h2 className="font-mono text-xs text-[#8B90A8] mb-4">comments ({comments.length})</h2>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-[#0F1424] border border-[#242B45] rounded-md p-3">
            {editingCommentId === comment.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={2}
                  className="w-full bg-[#12162A] border border-[#242B45] rounded-md px-3 py-2 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5]"
                />
                <div className="flex gap-3">
                  <button onClick={() => handleSaveEdit(comment.id)} className="text-xs text-[#7C6FF5] hover:underline">
                    Save
                  </button>
                  <button onClick={cancelEditing} className="text-xs text-[#8B90A8] hover:underline">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-[#E4E7F2]">{comment.content}</p>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-xs text-[#8B90A8]">@{comment.author}</p>
                  {canModify(comment) && (
                    <>
                      <button onClick={() => startEditing(comment)} className="text-xs text-[#7C6FF5] hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-[#F4A9B5] hover:underline">
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5]"
        />
        <button
          type="submit"
          disabled={posting}
          className="bg-[#7C6FF5] hover:bg-[#6C5FE0] disabled:opacity-50 text-white text-sm font-medium rounded-md px-4 py-2"
        >
          Post
        </button>
      </form>
        {error && (
          <div className="mt-4 px-3 py-2 rounded-md bg-[#3A1B23] border border-[#5C2430] text-[#F4A9B5] text-sm">
            {error}
          </div>
        )}
    </div>
  )
}
