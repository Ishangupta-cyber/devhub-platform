import React, { useEffect, useState } from 'react'
import { Link, useLocation, useOutletContext, useParams } from 'react-router-dom'
import { createCard, createColumn, deleteColumn, listCards, listColumns, listProjects, moveCard, updateColumn } from '../api/projects'
import { listIssues } from '../../issues/api/issues'
import { listPullRequests } from '../../pullRequests/api/pullRequests'
import Board from '../components/Board'

export default function ProjectBoard() {
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [columns, setColumns] = useState([])
  const [project, setProject] = useState(location.state?.project || null)
  const { repoId, projectId } = useParams()
  const [error, setError] = useState("")
  const { canManage } = useOutletContext()

  const [cardsByColumn, setCardsByColumn] = useState({})

  const [addingColumn, setAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")
  const [editingColumnId, setEditingColumnId] = useState(null)
  const [editName, setEditName] = useState("")

  const [issues, setIssues] = useState([])
  const [pullRequests, setPullRequests] = useState([])
  const [pickerLoaded, setPickerLoaded] = useState(false)
  const [addingCardColumnId, setAddingCardColumnId] = useState(null)
  const [selectedType, setSelectedType] = useState("issue")
  const [cardError, setCardError] = useState("")
  const [selectedItemId, setSelectedItemId] = useState("")


  const onDragEnd = async (result) => {
    const { source, destination } = result

    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const sourceColId = Number(source.droppableId)
    const destColId = Number(destination.droppableId)

    const sourceCards = [...(cardsByColumn[sourceColId] || [])]
    const [movedCard] = sourceCards.splice(source.index, 1)

    const destCards = sourceColId === destColId ? sourceCards : [...(cardsByColumn[destColId] || [])]

    let newPosition
    if (destCards.length === 0) {
      newPosition = 10
    } else if (destination.index === 0) {
      newPosition = Math.round(destCards[0].position / 2)
    } else if (destination.index >= destCards.length) {
      newPosition = destCards[destCards.length - 1].position + 10
    } else {
      const prevCard = destCards[destination.index - 1]
      const nextCard = destCards[destination.index]
      newPosition = Math.round((prevCard.position + nextCard.position) / 2)
    }

    const updatedMovedCard = { ...movedCard, position: newPosition, column: destColId }
    const newDestCards = [...destCards]
    newDestCards.splice(destination.index, 0, updatedMovedCard)

    const previousState = cardsByColumn

    if (sourceColId === destColId) {
      setCardsByColumn({ ...cardsByColumn, [sourceColId]: newDestCards })
    } else {
      setCardsByColumn({ ...cardsByColumn, [sourceColId]: sourceCards, [destColId]: newDestCards })
    }

    try {
      await moveCard(sourceColId, movedCard.id, { column: destColId, position: newPosition })
    } catch (err) {
      setCardsByColumn(previousState)
      setError('Failed to move card.')
    } finally {
      setError("")
    }
  }

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
    } finally {
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
      setColumns(columns.filter((c) => c.id !== columnId))
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to Delete column.')
    }
  }

  const openAddCard = async (columnId) => {
    setAddingCardColumnId(columnId)
    setCardError("")
    if (!pickerLoaded) {
      const [issueRes, prsRes] = await Promise.all([listIssues(repoId), listPullRequests(repoId)])
      const issueData = Array.isArray(issueRes.data) ? issueRes.data : issueRes.data.results
      const prsData = Array.isArray(prsRes.data) ? prsRes.data : prsRes.data.results
      setIssues(issueData)
      setPullRequests(prsData)
      setPickerLoaded(true)
    }
  }

  const closeAddCard = () => {
    setAddingCardColumnId(null)
    setSelectedItemId("")
  }

  const getAvailableItems = () => {
    const linkedKeys = new Set()
    Object.values(cardsByColumn).flat().forEach((card) => {
      linkedKeys.add(`${card.linked_type}-${card.linked_id}`)
    })
    const source = selectedType === "issue" ? issues : pullRequests
    return source.filter((item) => !linkedKeys.has(`${selectedType}-${item.id}`))
  }

  const handleCreateCard = async (e) => {
    e.preventDefault()
    if (!selectedItemId) return
    setCardError("")
    try {
      const { data } = await createCard(addingCardColumnId, {
        link_type: selectedType,
        link_id: Number(selectedItemId),
      })
      setCardsByColumn({ ...cardsByColumn, [addingCardColumnId]: [...(cardsByColumn[addingCardColumnId] || []), data] })
      closeAddCard()
    } catch (err) {
      setCardError(err.response?.data?.non_field_errors?.[0] || 'Failed to add card.')
    }
  }

  if (loading) return <div className="p-6" />
  if (!project) return <div className="p-6 text-fg text-center pt-20">Board not found.</div>

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <Link to={`/repositories/${repoId}/projects`} className="text-xs text-muted hover:text-fg">
          ← back to projects
        </Link>

        <h1 className="font-display text-2xl text-fg mt-4 mb-6">{project.name}</h1>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-md bg-danger-bg border border-danger-border text-danger text-sm">
            {error}
          </div>
        )}

        <Board
          columns={columns}
          cardsByColumn={cardsByColumn}
          isRepoOwner={canManage}
          onDragEnd={onDragEnd}
          editingColumnId={editingColumnId}
          editName={editName}
          onEditNameChange={setEditName}
          onStartEditing={startEditing}
          onSaveEdit={handleSaveEdit}
          onCancelEditing={cancelEditing}
          onDeleteColumn={handleDeleteColumn}
          addingCardColumnId={addingCardColumnId}
          onOpenAddCard={openAddCard}
          onCloseAddCard={closeAddCard}
          addCardShared={{
            selectedType,
            onTypeChange: (value) => { setSelectedType(value); setSelectedItemId('') },
            selectedItemId,
            onItemChange: setSelectedItemId,
            getAvailableItems,
            cardError,
            onSubmit: handleCreateCard,
          }}
          addingColumn={addingColumn}
          newColumnName={newColumnName}
          onNewColumnNameChange={setNewColumnName}
          onAddColumn={handleAddColumn}
        />
      </div>
    </div>
  )
}
