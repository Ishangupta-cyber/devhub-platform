
import { useState } from 'react'

function TreeNode({ node, depth, selectedId, onSelect }) {
  const [open, setOpen] = useState(depth === 0)
  const isFolder = node.node_type === 'folder'
  const isSelected = node.id === selectedId

  const handleClick = () => {
    if (isFolder) setOpen((o) => !o)
    else onSelect(node)
  }

  return (
    <div>
      <button
        onClick={handleClick}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        className={`w-full flex items-center gap-1.5 py-1 pr-2 text-left text-[13px] font-mono
          rounded transition-colors ${
            isSelected
              ? 'bg-accent-soft text-accent'
              : 'text-muted hover:text-fg hover:bg-subtle'
          }`}
      >
        <span className="w-3 shrink-0 text-[10px]">
          {isFolder ? (open ? '▾' : '▸') : ''}
        </span>
        <span className="shrink-0">{isFolder ? '📁' : '📄'}</span>
        <span className="truncate">{node.name}</span>
      </button>

      {isFolder && open && node.children?.length > 0 && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}


export default function FileTree({ tree, selectedId, onSelect }) {
  if (!tree.length) {
    return (
      <p className="text-xs text-muted px-2 py-3 font-mono">
        No files yet.
      </p>
    )
  }

  return (
    <div className="py-1">
      {tree.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}