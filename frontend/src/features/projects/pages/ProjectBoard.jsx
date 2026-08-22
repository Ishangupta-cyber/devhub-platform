import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { createColumn, deleteColumn, listColumns, listProjects, updateColumn } from '../api/projects'
import { useAuth } from '../../../hooks/useAuth'

export default function ProjectBoard() {
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [columns, setColumns] = useState([])
  const [project, setProject] = useState(location.state?.project || null)
  const { repoId, projectId } = useParams()
  const [error, setError] = useState("")
  const {user}=useAuth()


  const [addingColumn,setAddingColumn]=useState(false)
  const [newColumnName,setNewColumnName]=useState("")
  const [editingColumnId,setEditingColumnId]=useState(null)
  const [editName,setEditName]=useState("")


  useEffect(() => {
    const fetchBoard = async () => {
      setLoading(true)
      if (!location.state?.project) {
        const projectsRes = await listProjects(repoId)
        const projectData = Array.isArray(projectsRes.data) ? projectsRes.data : projectsRes.data.results
        const found = projectData.find((p) => p.id === Number(projectId))
        setProject(found || null)
      }
      const columnRes = await listColumns(projectId)
      const columnData = Array.isArray(columnRes.data) ? columnRes.data : columnRes.data.results
      setColumns(columnData)
      setLoading(false)

    }
    fetchBoard()
  }, [repoId, projectId])

  const isRepoOwner=user?.username===project?.repository_owner

  const handleAddColumn = async(e)=>{
    e.preventDefault()
    if (!newColumnName.trim()) return
    setError('')
    addingColumn(true)
    try {
      const lastPosition=columns.length>0 ? columns[columns.length-1].position : 0
      const {data}=await createColumn(projectId,{name:newColumnName,position:lastPosition+10})
      setColumns([...columns,data]) 
      setNewColumnName("")
      
    } catch (err) {
       const resData = err.response?.data
      const firstKey = resData && Object.keys(resData)[0]
      setError(firstKey ? (Array.isArray(resData[firstKey]) ? resData[firstKey][0] : resData[firstKey]) : 'Failed to add column.')
    }
    finally{
      setAddingColumn(false)
    }
  }

  const startEditing= (column)=>{
    setEditingColumnId(column.id)
    setEditName(column.name)
  }

  const cancelEditing=()=>{
    setEditingColumnId(null)
    setEditName("")
  }

  const handleSaveEdit=async(columnId)=>{
    try {
      const {data}= await updateColumn(projectId,columnId,{name:editName})
      setColumns(columns.map((c)=> (c.id===columnId? data:c)))
      cancelEditing()
    } catch (err) {
       setError(err.response?.data?.detail || 'Failed to rename column.')
    }
  }


  const handleDeleteColumn=async(columnId)=>{
    try {
      await deleteColumn(projectId,columnId)
      const filterColumns=columns.filter((c)=>c.id!==id)
      setColumns(filterColumns)
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to Delete column.')
    }
  }

  if (loading) return <div className="min-h-screen bg-[#0B0F1A]" />
  if (!project) return <div className="min-h-screen bg-[#0B0F1A] text-[#E4E7F2] text-center pt-20">Board not found.</div>


  return (
    <div className="min-h-screen bg-[#0B0F1A] p-6">
      <div className="max-w-5xl mx-auto">
        <Link to={`/repositories/${repoId}/projects`} className="text-xs text-[#8B90A8] hover:text-[#E4E7F2]">
          ← back to projects
        </Link>

        <h1 className="font-display text-2xl text-[#E4E7F2] mt-4 mb-6">{project.name}</h1>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-[#3A1B23] border border-[#5C2430] text-[#F4A9B5] text-sm">
            {error}
          </div>
        )}

        (<div className="flex gap-4 overflow-x-auto pb-4 items-start">
          {columns.map((column) => (
            <div
              key={column.id}
              className="bg-[#12162A] border border-[#242B45] rounded-md p-4 w-64 shrink-0"
            >
              {editingColumnId === column.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-2 py-1 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5]"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => handleSaveEdit(column.id)} className="text-xs text-[#7C6FF5] hover:underline">
                      Save
                    </button>
                    <button onClick={cancelEditing} className="text-xs text-[#8B90A8] hover:underline">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#E4E7F2] font-medium font-mono">{column.name}</p>
                  {isRepoOwner && (
                    <div className="flex gap-2">
                      <button onClick={() => startEditing(column)} className="text-xs text-[#7C6FF5] hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteColumn(column.id)} className="text-xs text-[#F4A9B5] hover:underline">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {isRepoOwner && (
            <form onSubmit={handleAddColumn} className="w-64 shrink-0">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="New column name"
                className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5] mb-2"
              />
              <button
                type="submit"
                disabled={addingColumn}
                className="w-full bg-[#7C6FF5] hover:bg-[#6C5FE0] disabled:opacity-50 text-white text-sm font-medium rounded-md py-2"
              >
                {addingColumn ? 'Adding…' : 'Add column'}
              </button>
            </form>
          )}
        </div>)

      </div>
    </div>

  )

}
