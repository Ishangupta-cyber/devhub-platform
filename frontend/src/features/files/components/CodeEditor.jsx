import { useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'

const LANG_BY_EXT = {
  js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
  ts: 'typescript', tsx: 'typescript', py: 'python', json: 'json', md: 'markdown',
  html: 'html', htm: 'html', css: 'css', scss: 'scss', less: 'less',
  yml: 'yaml', yaml: 'yaml', sh: 'shell', bash: 'shell', sql: 'sql',
  java: 'java', c: 'c', h: 'c', cpp: 'cpp', cc: 'cpp', hpp: 'cpp', cs: 'csharp',
  go: 'go', rs: 'rust', rb: 'ruby', php: 'php', kt: 'kotlin', swift: 'swift',
  xml: 'xml', svg: 'xml', dockerfile: 'dockerfile', ini: 'ini', toml: 'ini',
}

function languageFor(name) {
  if (name?.toLowerCase() === 'dockerfile') return 'dockerfile'
  const ext = name?.split('.').pop()?.toLowerCase()
  return LANG_BY_EXT[ext] ?? 'plaintext'
}

function StatusLabel({ isDirty, saveState, readOnly }) {
  if (readOnly) return <span className="text-muted">read-only</span>
  if (saveState === 'saving') return <span className="text-muted">saving…</span>
  if (saveState === 'error') return <span className="text-red-400">save failed</span>
  if (isDirty) return <span className="text-[#FEBC2E]">● unsaved</span>
  if (saveState === 'saved') return <span className="text-[#28C840]">saved</span>
  return null
}

export default function CodeEditor({
  file, onChange, loading, isDirty, saveState, readOnly, onSave,
  focusToken = 0, onNewFile = null,
}) {
  const editorRef = useRef(null)      // { editor, fileId } of the mounted Monaco
  const pendingFocus = useRef(false)

  // A new file was just created: put the cursor in its editor. Each file gets
  // its own Monaco instance (key={file.id}), which may still be mounting, so
  // remember the request and let onMount honour it.
  useEffect(() => {
    if (!focusToken) return
    const mounted = editorRef.current
    if (mounted && mounted.fileId === file?.id) mounted.editor.focus()
    else pendingFocus.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusToken])

  const handleMount = (editor) => {
    editorRef.current = { editor, fileId: file?.id }
    if (pendingFocus.current) {
      pendingFocus.current = false
      editor.focus()
    }
  }

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6">
        <p className="text-sm text-muted font-mono">Loading file…</p>
      </div>
    )
  }

  if (!file) {
    return (
      <div className="bg-surface border border-border rounded-lg p-12 text-center">
        <p className="text-sm text-muted">Select a file to view its code.</p>
        {onNewFile && (
          <button onClick={onNewFile} className="mt-3 text-sm text-accent hover:underline">
            + New file
          </button>
        )}
      </div>
    )
  }

  if (file.node_type === 'folder') {
    return (
      <div className="bg-surface border border-border rounded-lg p-12 text-center">
        <p className="text-sm text-muted font-mono">{file.path}</p>
        <p className="text-xs text-muted mt-1">This is a folder.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-[11px] font-mono text-muted truncate">{file.path}</span>
        <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
          <StatusLabel isDirty={isDirty} saveState={saveState} readOnly={readOnly} />
          {!readOnly && (
            <button
              onClick={onSave}
              disabled={!isDirty || saveState === 'saving'}
              className="px-2 py-0.5 rounded bg-accent-soft text-accent
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save
            </button>
          )}
        </div>
      </div>

      {/* Uncontrolled: Monaco owns the text and we only listen. Feeding `value`
          back from React state drops keystrokes when typing outruns re-renders.
          key={file.id} gives each file a fresh editor seeded with its content. */}
      <Editor
        key={file.id}
        height="70vh"
        theme="vs-dark"
        language={languageFor(file.name)}
        defaultValue={file.content ?? ''}
        onChange={(v) => onChange(v ?? '')}
        onMount={handleMount}
        loading={<p className="p-6 text-sm text-muted font-mono">Loading editor…</p>}
        options={{
          readOnly,
          fontSize: 13,
          fontFamily: 'JetBrains Mono, monospace',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 12 },
          tabSize: 2,
        }}
      />
    </div>
  )
}