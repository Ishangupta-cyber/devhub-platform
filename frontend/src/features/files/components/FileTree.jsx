import { useEffect, useRef, useState } from 'react'

// Inline text field used for "new file", "new folder" and "rename".
export function NameInput({ depth = 0, icon, initial = '', placeholder, onSubmit, onCancel, error }) {
  const [value, setValue] = useState(initial)
  const ref = useRef(null)
  const busy = useRef(false)

  useEffect(() => {
    ref.current?.focus()
    // select the name without the extension, like VS Code
    const dot = initial.lastIndexOf('.')
    ref.current?.setSelectionRange(0, dot > 0 ? dot : initial.length)
  }, [initial])

  const submit = async () => {
    if (busy.current) return
    const name = value.trim()
    if (!name || name === initial) return onCancel()
    busy.current = true
    try { await onSubmit(name) } finally { busy.current = false }
  }

  return (
    <div style={{ paddingLeft: `${depth * 14 + 8}px` }} className="pr-2 py-0.5">
      <div className="flex items-center gap-1.5">
        <span className="w-3 shrink-0" />
        <span className="shrink-0 text-[13px]">{icon}</span>
        <input
          ref={ref}
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); submit() }
            if (e.key === 'Escape') { e.preventDefault(); busy.current = true; onCancel() }
          }}
          onBlur={submit}
          className={`min-w-0 flex-1 bg-canvas border rounded px-1.5 py-0.5 text-[13px] font-mono text-fg outline-none ${
            error ? 'border-red-400' : 'border-accent'
          }`}
        />
      </div>
      {error && <p className="text-[11px] text-red-400 font-mono mt-1 ml-5">{error}</p>}
    </div>
  )
}

function RowAction({ title, onClick, children }) {
  return (
    <span
      role="button"
      tabIndex={0}
      title={title}
      aria-label={title}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onClick() } }}
      className="px-1 rounded text-muted hover:text-fg hover:bg-border"
    >
      {children}
    </span>
  )
}

function TreeNode({ node, depth, ctx }) {
  const { selectedId, expanded, onToggle, onSelect, canManage, creating, renamingId, onRename, onDelete, renderCreateInput, renderRenameInput } = ctx
  const isFolder = node.node_type === 'folder'
  const isOpen = isFolder && expanded.has(node.id)
  const isSelected = node.id === selectedId

  if (renamingId === node.id) return renderRenameInput(node, depth)

  const activate = () => (isFolder ? onToggle(node) : onSelect(node))

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label={`${isFolder ? 'Folder' : 'File'} ${node.name}`}
        aria-expanded={isFolder ? isOpen : undefined}
        onClick={activate}
        onKeyDown={(e) => { if (e.key === 'Enter') activate() }}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        className={`group w-full flex items-center gap-1.5 py-1 pr-1 text-left text-[13px] font-mono cursor-pointer
          rounded transition-colors ${
            isSelected ? 'bg-accent-soft text-accent' : 'text-muted hover:text-fg hover:bg-subtle'
          }`}
      >
        <span className="w-3 shrink-0 text-[10px]">{isFolder ? (isOpen ? '▾' : '▸') : ''}</span>
        <span className="shrink-0">{isFolder ? (isOpen ? '📂' : '📁') : '📄'}</span>
        <span className="truncate flex-1">{node.name}</span>
        {canManage && (
          <span className="hidden group-hover:flex group-focus-within:flex [@media(hover:none)]:flex items-center text-[11px] shrink-0">
            <RowAction title={`Rename ${node.name}`} onClick={() => onRename(node)}>✎</RowAction>
            <RowAction title={`Delete ${node.name}`} onClick={() => onDelete(node)}>✕</RowAction>
          </span>
        )}
      </div>

      {isOpen && (
        <div>
          {creating?.parentId === node.id && renderCreateInput(depth + 1)}
          {node.children?.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} ctx={ctx} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function FileTree({ tree, ...ctx }) {
  const rootCreating = ctx.creating && ctx.creating.parentId === null

  if (!tree.length && !rootCreating) {
    return (
      <div className="px-3 py-4 text-xs text-muted font-mono">
        <p>No files yet.</p>
        {ctx.canManage && (
          <button onClick={() => ctx.onStartCreate('file')} className="mt-2 text-accent hover:underline">
            + Create your first file
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="py-1">
      {rootCreating && ctx.renderCreateInput(0)}
      {tree.map((node) => (
        <TreeNode key={node.id} node={node} depth={0} ctx={ctx} />
      ))}
    </div>
  )
}
