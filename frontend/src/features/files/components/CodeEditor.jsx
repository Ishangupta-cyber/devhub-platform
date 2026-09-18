import Editor from '@monaco-editor/react'

const LANG_BY_EXT = {
  js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
  py: 'python', json: 'json', md: 'markdown', html: 'html', css: 'css',
  yml: 'yaml', yaml: 'yaml', sh: 'shell', sql: 'sql',
}

function languageFor(name) {
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
  file, draft, onChange, loading, isDirty, saveState, readOnly, onSave,
}) {
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
        <p className="text-sm text-muted">Select a file to view it.</p>
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

      <Editor
        height="70vh"
        theme="vs-dark"
        language={languageFor(file.name)}
        value={draft}
        onChange={(v) => onChange(v ?? '')}
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