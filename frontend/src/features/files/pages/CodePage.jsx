import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext, useParams, useSearchParams } from 'react-router-dom'
import FileTree, { NameInput } from '../components/FileTree'
import CodeEditor from '../components/CodeEditor'
import { createFileNode, deleteFileNode, getFileTree, getFileNode, updateFileNode } from '../api/files'

// Turn a DRF / Django error payload into one readable line.
function errorMessage(err, fallback) {
  const data = err?.response?.data
  if (!data) return fallback
  if (typeof data === 'string') return fallback
  if (Array.isArray(data)) return data[0] ?? fallback
  if (data.detail) return data.detail
  const first = Object.values(data)[0]
  return (Array.isArray(first) ? first[0] : first) || fallback
}

// id -> { node, parentId } for quick lookups over the nested tree
function indexTree(tree) {
  const index = new Map()
  const walk = (nodes, parentId) => {
    for (const n of nodes) {
      index.set(n.id, { node: n, parentId })
      if (n.children?.length) walk(n.children, n.id)
    }
  }
  walk(tree, null)
  return index
}

function ancestorsOf(index, id) {
  const ids = []
  let cur = index.get(id)?.parentId ?? null
  while (cur !== null && cur !== undefined) {
    ids.push(cur)
    cur = index.get(cur)?.parentId ?? null
  }
  return ids
}

function subtreeIds(node) {
  const ids = [node.id]
  node.children?.forEach((c) => ids.push(...subtreeIds(c)))
  return ids
}

export default function CodePage() {
  const { repoId } = useParams()
  const { canManage } = useOutletContext()
  const [searchParams, setSearchParams] = useSearchParams()

  const [tree, setTree] = useState([])
  const [loadingTree, setLoadingTree] = useState(true)
  const [treeError, setTreeError] = useState(null)
  const [expanded, setExpanded] = useState(() => new Set())
  const [selectedId, setSelectedId] = useState(null)

  const [activeFile, setActiveFile] = useState(null)
  const [draft, setDraft] = useState('')
  const [loadingFile, setLoadingFile] = useState(false)
  const [saveState, setSaveState] = useState('idle')
  const [focusToken, setFocusToken] = useState(0)

  const [creating, setCreating] = useState(null)        // { type: 'file'|'folder', parentId }
  const [createError, setCreateError] = useState(null)
  const [renamingId, setRenamingId] = useState(null)
  const [renameError, setRenameError] = useState(null)
  const [actionError, setActionError] = useState(null)

  const index = useMemo(() => indexTree(tree), [tree])
  const isDirty = activeFile !== null && draft !== activeFile.content

  const loadTree = useCallback(async () => {
    const res = await getFileTree(repoId)
    setTree(res.data)
    return indexTree(res.data)
  }, [repoId])

  const expand = (ids) => setExpanded((prev) => new Set([...prev, ...ids]))

  // ---- open / save ------------------------------------------------------

  const save = useCallback(async () => {
    if (!activeFile || !canManage) return true
    setSaveState('saving')
    try {
      const res = await updateFileNode(repoId, activeFile.id, { content: draft })
      setActiveFile(res.data)
      setSaveState('saved')
      return true
    } catch {
      setSaveState('error')
      return false
    }
  }, [repoId, activeFile, draft, canManage])

  // Before switching away from a file with edits: save it if we can,
  // otherwise ask before throwing the edits away.
  const leaveCurrentFile = useCallback(async () => {
    if (!isDirty) return true
    if (canManage && await save()) return true
    return window.confirm('Unsaved changes will be lost. Continue?')
  }, [isDirty, canManage, save])

  const showFile = useCallback((data) => {
    setActiveFile(data)
    setDraft(data.content ?? '')
    setSelectedId(data.id)
    setSaveState('idle')
    setSearchParams((p) => { p.set('file', data.id); return p }, { replace: true })
  }, [setSearchParams])

  const openFile = useCallback(async (node) => {
    if (node.id === activeFile?.id) return
    if (!(await leaveCurrentFile())) return

    setLoadingFile(true)
    setSelectedId(node.id)
    try {
      const res = await getFileNode(repoId, node.id)
      showFile(res.data)
    } catch {
      setActiveFile(null)
      setDraft('')
      setActionError('Could not open that file.')
    } finally {
      setLoadingFile(false)
    }
  }, [repoId, activeFile?.id, leaveCurrentFile, showFile])

  // initial load: tree, then reopen ?file=<id> if the URL has one
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      setLoadingTree(true)
      setTreeError(null)
      try {
        const idx = await loadTree()
        if (cancelled) return
        setExpanded(new Set([...idx.values()].filter((e) => e.parentId === null && e.node.node_type === 'folder').map((e) => e.node.id)))

        const fileId = Number(searchParams.get('file'))
        if (fileId && idx.get(fileId)?.node.node_type === 'file') {
          expand(ancestorsOf(idx, fileId))
          setLoadingFile(true)
          try {
            const res = await getFileNode(repoId, fileId)
            if (!cancelled) showFile(res.data)
          } finally {
            if (!cancelled) setLoadingFile(false)
          }
        }
      } catch {
        if (!cancelled) setTreeError('Could not load files.')
      } finally {
        if (!cancelled) setLoadingTree(false)
      }
    }
    init()
    return () => { cancelled = true }
    // run once per repo; searchParams is read only for the initial file
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoId])

  // autosave 1.5s after typing stops
  useEffect(() => {
    if (!isDirty || !canManage) return
    const timer = setTimeout(save, 1500)
    return () => clearTimeout(timer)
  }, [draft, isDirty, canManage, save])

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (isDirty) save()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isDirty, save])

  useEffect(() => {
    if (!isDirty) return
    const warn = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isDirty])

  // ---- create ------------------------------------------------------------

  // New items go into the selected folder, else next to the open file, else root.
  const targetFolderId = () => {
    const sel = selectedId != null ? index.get(selectedId) : null
    if (sel?.node.node_type === 'folder') return sel.node.id
    if (sel) return sel.parentId
    return null
  }

  const startCreate = (type) => {
    const parentId = targetFolderId()
    if (parentId !== null) expand([parentId, ...ancestorsOf(index, parentId)])
    setRenamingId(null)
    setCreateError(null)
    setActionError(null)
    setCreating({ type, parentId })
  }

  // "src/utils/helpers.js" creates src/ and utils/ if they don't exist yet.
  const submitCreate = async (rawName) => {
    const parts = rawName.split('/').map((p) => p.trim()).filter(Boolean)
    if (!parts.length) return setCreating(null)
    const leafName = parts.pop()
    const { type } = creating
    let parentId = creating.parentId

    try {
      if (type === 'file' && !(await leaveCurrentFile())) return

      let idx = index
      for (const folderName of parts) {
        const siblings = parentId === null ? tree : idx.get(parentId)?.node.children ?? []
        const existing = siblings.find((n) => n.name === folderName)
        if (existing && existing.node_type !== 'folder') {
          throw new Error(`'${folderName}' is a file, not a folder.`)
        }
        if (existing) {
          parentId = existing.id
        } else {
          const res = await createFileNode(repoId, { name: folderName, node_type: 'folder', parent: parentId })
          parentId = res.data.id
          idx = await loadTree()
        }
      }

      const res = await createFileNode(repoId, { name: leafName, node_type: type, parent: parentId, content: '' })
      const newIdx = await loadTree()
      expand(ancestorsOf(newIdx, res.data.id))
      setCreating(null)
      setCreateError(null)

      if (type === 'file') {
        showFile(res.data)
        setFocusToken((t) => t + 1)   // put the cursor straight into the editor
      } else {
        setSelectedId(res.data.id)
        expand([res.data.id])
      }
    } catch (err) {
      setCreateError(err instanceof Error && !err.response ? err.message : errorMessage(err, 'Could not create it.'))
    }
  }

  const cancelCreate = () => { setCreating(null); setCreateError(null) }

  const renderCreateInput = (depth) => (
    <NameInput
      key={`create-${creating.type}-${creating.parentId}`}
      depth={depth}
      icon={creating.type === 'folder' ? '📁' : '📄'}
      placeholder={creating.type === 'folder' ? 'folder name' : 'file name, e.g. src/app.js'}
      onSubmit={submitCreate}
      onCancel={cancelCreate}
      error={createError}
    />
  )

  // ---- rename / delete ----------------------------------------------------

  const startRename = (node) => {
    setCreating(null)
    setRenameError(null)
    setRenamingId(node.id)
  }

  const submitRename = async (node, name) => {
    try {
      await updateFileNode(repoId, node.id, { name })
      await loadTree()
      setRenamingId(null)
      setRenameError(null)
      // the open file's path changes if it, or a folder above it, was renamed
      if (activeFile) {
        const res = await getFileNode(repoId, activeFile.id)
        setActiveFile((cur) => (cur ? { ...cur, name: res.data.name, path: res.data.path } : cur))
      }
    } catch (err) {
      setRenameError(errorMessage(err, 'Could not rename it.'))
    }
  }

  const renderRenameInput = (node, depth) => (
    <NameInput
      key={`rename-${node.id}`}
      depth={depth}
      icon={node.node_type === 'folder' ? '📁' : '📄'}
      initial={node.name}
      onSubmit={(name) => submitRename(node, name)}
      onCancel={() => { setRenamingId(null); setRenameError(null) }}
      error={renameError}
    />
  )

  const handleDelete = async (node) => {
    const isFolder = node.node_type === 'folder'
    const msg = isFolder
      ? `Delete folder "${node.name}" and everything inside it?`
      : `Delete "${node.name}"?`
    if (!window.confirm(msg)) return

    setActionError(null)
    try {
      await deleteFileNode(repoId, node.id)
      const removed = new Set(subtreeIds(node))
      if (activeFile && removed.has(activeFile.id)) {
        setActiveFile(null)
        setDraft('')
        setSearchParams((p) => { p.delete('file'); return p }, { replace: true })
      }
      if (removed.has(selectedId)) setSelectedId(null)
      await loadTree()
    } catch (err) {
      setActionError(errorMessage(err, 'Could not delete it.'))
    }
  }

  const toggleFolder = (node) => {
    setSelectedId(node.id)
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(node.id)) next.delete(node.id)
      else next.add(node.id)
      return next
    })
  }

  const targetLabel = (() => {
    const id = targetFolderId()
    return id === null ? '/' : `/${index.get(id)?.node.name ?? ''}/`
  })()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-start">

        <aside className="w-full md:w-64 shrink-0 bg-surface border border-border rounded-lg overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border">
            <span className="w-2 h-2 rounded-full bg-[#FF5F57]" />
            <span className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
            <span className="w-2 h-2 rounded-full bg-[#28C840]" />
            <span className="ml-2 text-[11px] font-mono text-muted flex-1">files</span>
            {canManage && !loadingTree && !treeError && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startCreate('file')}
                  title={`New file in ${targetLabel}`}
                  className="text-[11px] font-mono px-1.5 py-0.5 rounded text-accent hover:bg-accent-soft"
                >
                  + File
                </button>
                <button
                  onClick={() => startCreate('folder')}
                  title={`New folder in ${targetLabel}`}
                  className="text-[11px] font-mono px-1.5 py-0.5 rounded text-accent hover:bg-accent-soft"
                >
                  + Folder
                </button>
              </div>
            )}
          </div>

          {actionError && (
            <p className="text-[11px] text-red-400 px-3 pt-2 font-mono">{actionError}</p>
          )}

          <div className="max-h-[40vh] md:max-h-[70vh] overflow-y-auto">
            {loadingTree && <p className="text-xs text-muted px-3 py-3 font-mono">Loading…</p>}
            {treeError && <p className="text-xs text-red-400 px-3 py-3 font-mono">{treeError}</p>}
            {!loadingTree && !treeError && (
              <FileTree
                tree={tree}
                selectedId={selectedId}
                expanded={expanded}
                onToggle={toggleFolder}
                onSelect={openFile}
                canManage={canManage}
                creating={creating}
                onStartCreate={startCreate}
                renderCreateInput={renderCreateInput}
                renamingId={renamingId}
                onRename={startRename}
                renderRenameInput={renderRenameInput}
                onDelete={handleDelete}
              />
            )}
          </div>
        </aside>

        <section className="flex-1 min-w-0">
          <CodeEditor
            file={activeFile}
            onChange={setDraft}
            loading={loadingFile}
            isDirty={isDirty}
            saveState={saveState}
            readOnly={!canManage}
            onSave={save}
            focusToken={focusToken}
            onNewFile={canManage ? () => startCreate('file') : null}
          />
        </section>

      </div>
    </div>
  )
}
