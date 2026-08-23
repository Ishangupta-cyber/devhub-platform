import React, { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { createCard, createColumn, deleteColumn, listCards, listColumns, listProjects, updateColumn } from '../api/projects'
import { useAuth } from '../../../hooks/useAuth'
import { listIssues } from '../../issues/api/issues'
import { listPullRequests } from '../../pullRequests/api/pullRequests'

const LINK_TYPE_STYLE = {
  issue: 'bg-[#1B3A2A] text-[#A9F4C0]',
  pull_request: 'bg-[#1B2A3A] text-[#7AB8F4]',
}

export default function ProjectBoard() {
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [columns, setColumns] = useState([])
  const [project, setProject] = useState(location.state?.project || null)
  const { repoId, projectId } = useParams()
  const [error, setError] = useState("")
  const { user } = useAuth()

  const [cardsByColumn, setCardsByColumn] = useState({})

  const [addingColumn, setAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")
  const [editingColumnId, setEditingColumnId] = useState(null)
  const [editName, setEditName] = useState("")

  const [issues, setIssues] = useState([])
  const [pullRequests, setPullRequests] = useState([])
  const [pickerLoaded, setPickerLoaded] = useState(false)
  const [addingCardColumnId,setAddingCardColumnId]=useState(null)
  const [selectedType,setSelectedType]=useState("issue")
  const [cardError,setCardError]=useState("")
  const [selectedItemId,setSelectedItemId]=useState("")


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

      if (columnData.length > 0) {
        const cardResults = await Promise.all(columnData.map((col) => listCards(col.id)))
        const cardsMap = {}
        columnData.forEach((col, idx) => {
          const raw = cardResults[idx].data
          cardsMap[col.id] = Array.isArray(raw) ? raw : raw.results
        })
        setCardsByColumn(cardsMap)
      }

      setLoading(false)

    }
    fetchBoard()
  }, [repoId, projectId])

  const isRepoOwner = user?.username === project?.repository_owner

  const handleAddColumn = async (e) => {
    e.preventDefault()
    if (!newColumnName.trim()) return
    setError('')
    setAddingColumn(true)
    try {
      const lastPosition = columns.length > 0 ? columns[columns.length - 1].position : 0
      const { data } = await createColumn(projectId, { name: newColumnName, position: lastPosition + 10 })
      setColumns([...columns, data])
      setNewColumnName("")

    } catch (err) {
      const resData = err.response?.data
      const firstKey = resData && Object.keys(resData)[0]
      setError(firstKey ? (Array.isArray(resData[firstKey]) ? resData[firstKey][0] : resData[firstKey]) : 'Failed to add column.')
    }
    finally {
      setAddingColumn(false)
    }
  }

  const startEditing = (column) => {
    setEditingColumnId(column.id)
    setEditName(column.name)
  }

  const cancelEditing = () => {
    setEditingColumnId(null)
    setEditName("")
  }

  const handleSaveEdit = async (columnId) => {
    try {
      const { data } = await updateColumn(projectId, columnId, { name: editName })
      setColumns(columns.map((c) => (c.id === columnId ? data : c)))
      cancelEditing()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to rename column.')
    }
  }


  const handleDeleteColumn = async (columnId) => {
    try {
      await deleteColumn(projectId, columnId)
      const filterColumns = columns.filter((c) => c.id !== columnId)
      setColumns(filterColumns)

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to Delete column.')
    }
  }


  const openAddCard = async(columnId) =>{
    setAddingCardColumnId(columnId)
    setCardError("")
    if (!pickerLoaded) {
      const [issueRes,prsRes] = await Promise.all([listIssues(repoId),listPullRequests(repoId)])
      const issueData=Array.isArray(issueRes.data)?issueRes.data:issueRes.data.results
      const prsData=Array.isArray(prsRes.data)?prsRes.data:prsRes.data.results
      setIssues(issueData)
      setPullRequests(prsData)
      setPickerLoaded(true)
    }
  }

  const closeAddCard = (columnId)=>{
    setAddingCardColumnId(null)
    setSelectedItemId("")
  }

  const getAvailableItems = () => {
    const linkedKeys=new Set()
    Object.values(cardsByColumn).flat().forEach((card)=>{
      linkedKeys.add(`${card.linked_type}-${card.linked_id}`)
    })
    const source= selectedType==="issue"?issues:pullRequests
    return source.filter((item)=> !linkedKeys.has(`${item.selectedType}-${item.id}`))
  }

  const handleCreateCard = async(e)=>{
    e.preventDefault()
    if (!selectedItemId) return 
    setCardError("")
    try { 
      
      const {data}=await createCard(addingCardColumnId,{
        link_type:selectedType,
        link_id:Number(selectedItemId)
      })
      setCardsByColumn({...cardsByColumn,[addingCardColumnId]:[...(cardsByColumn[addingCardColumnId] || []),data]})
      closeAddCard()
    } catch (err) {
       setCardError(err.response?.data?.non_field_errors?.[0] || 'Failed to add card.')
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
              <div className="space-y-2 mt-3">
                {(cardsByColumn[column.id] || []).length === 0 && (
                  <p className="text-xs text-[#8B90A8]">No cards.</p>
                )}
                {(cardsByColumn[column.id] || []).map((card) => (
                  <div key={card.id} className="bg-[#0F1424] border border-[#242B45] rounded-md p-2">
                    <p className="text-xs text-[#E4E7F2]">{card.linked_title}</p>
                    <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded font-mono ${LINK_TYPE_STYLE[card.linked_type]}`}>
                      {card.linked_type}
                    </span>
                  </div>
                ))}
              </div>

              {isRepoOwner && (
                addingCardColumnId === column.id ? (
                  <form onSubmit={handleCreateCard} className="mt-3 space-y-2">
                    {cardError && <p className="text-xs text-[#F4A9B5]">{cardError}</p>}
                    <select
                      value={selectedType}
                      onChange={(e) => { setSelectedType(e.target.value); setSelectedItemId('') }}
                      className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-2 py-1 text-[#E4E7F2] text-xs"
                    >
                      <option value="issue">Issue</option>
                      <option value="pull_request">Pull Request</option>
                    </select>
                    <select
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                      className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-2 py-1 text-[#E4E7F2] text-xs"
                    >
                      <option value="">Select…</option>
                      {getAvailableItems().map((item) => (
                        <option key={item.id} value={item.id}>{item.title}</option>
                      ))}
                    </select>
                    <div className="flex gap-3">
                      <button type="submit" className="text-xs text-[#7C6FF5] hover:underline">Add</button>
                      <button type="button" onClick={closeAddCard} className="text-xs text-[#8B90A8] hover:underline">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => openAddCard(column.id)} className="mt-3 text-xs text-[#7C6FF5] hover:underline">
                    + Add card
                  </button>
                )
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
