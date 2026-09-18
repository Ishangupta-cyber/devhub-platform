import { useCallback, useEffect, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import FileTree from '../components/FileTree'
import CodeEditor from '../components/CodeEditor'
import { getFileTree, getFileNode, updateFileNode } from '../api/files'

export default function CodePage() {
  const { repoId } = useParams()
  const { canManage } = useOutletContext()

  const [tree, setTree] = useState([])
  const [loadingTree, setLoadingTree] = useState(true)
  const [treeError, setTreeError] = useState(null)

  const [activeFile, setActiveFile] = useState(null)  
  const [draft, setDraft] = useState('')              
  const [loadingFile, setLoadingFile] = useState(false)
  const [saveState, setSaveState] = useState('idle')  

  const isDirty = activeFile !== null && draft !== activeFile.content

  useEffect(() => {
    const load = async () => {
      setLoadingTree(true)
      setTreeError(null)
      try {
        const res = await getFileTree(repoId)
        setTree(res.data)
      } catch {
        setTreeError('Could not load files.')
      } finally {
        setLoadingTree(false)
      }
    }
    load()
  }, [repoId])

  const openFile = useCallback(async (node) => {
    if (node.id === activeFile?.id) return

    if (isDirty && !window.confirm('Unsaved changes will be lost. Continue?')) {
      return
    }

    setLoadingFile(true)
    setSaveState('idle')
    try {
      const res = await getFileNode(repoId, node.id)
      setActiveFile(res.data)
      setDraft(res.data.content ?? '')
    } catch {
      setActiveFile(null)
      setDraft('')
    } finally {
      setLoadingFile(false)
    }
  }, [repoId, activeFile?.id, isDirty])

  const save = useCallback(async () => {
    if (!activeFile || !canManage) return

    setSaveState('saving')
    try {
      const res = await updateFileNode(repoId, activeFile.id, { content: draft })
      setActiveFile(res.data)      
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }, [repoId, activeFile, draft, canManage])

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

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <div className="flex gap-4 items-start">

        <aside className="w-60 shrink-0 bg-surface border border-border rounded-lg overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border">
            <span className="w-2 h-2 rounded-full bg-[#FF5F57]" />
            <span className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
            <span className="w-2 h-2 rounded-full bg-[#28C840]" />
            <span className="ml-2 text-[11px] font-mono text-muted">files</span>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {loadingTree && <p className="text-xs text-muted px-3 py-3 font-mono">Loading…</p>}
            {treeError && <p className="text-xs text-red-400 px-3 py-3 font-mono">{treeError}</p>}
            {!loadingTree && !treeError && (
              <FileTree tree={tree} selectedId={activeFile?.id} onSelect={openFile} />
            )}
          </div>
        </aside>

        <section className="flex-1 min-w-0">
          <CodeEditor
            file={activeFile}
            draft={draft}
            onChange={setDraft}
            loading={loadingFile}
            isDirty={isDirty}
            saveState={saveState}
            readOnly={!canManage}
            onSave={save}
          />
        </section>

      </div>
    </div>
  )
}