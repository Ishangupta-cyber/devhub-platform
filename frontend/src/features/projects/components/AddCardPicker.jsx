import React from 'react'

export default function AddCardPicker({
  selectedType,
  onTypeChange,
  selectedItemId,
  onItemChange,
  items,
  cardError,
  onSubmit,
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-2">
      {cardError && <p className="text-xs text-danger">{cardError}</p>}
      <select
        value={selectedType}
        onChange={(e) => onTypeChange(e.target.value)}
        className="w-full bg-subtle border border-border rounded-md px-2 py-1 text-fg text-xs"
      >
        <option value="issue">Issue</option>
        <option value="pull_request">Pull Request</option>
      </select>
      <select
        value={selectedItemId}
        onChange={(e) => onItemChange(e.target.value)}
        className="w-full bg-subtle border border-border rounded-md px-2 py-1 text-fg text-xs"
      >
        <option value="">Select…</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>{item.title}</option>
        ))}
      </select>
      <div className="flex gap-3">
        <button type="submit" className="text-xs text-accent hover:underline">Add</button>
        <button type="button" onClick={onCancel} className="text-xs text-muted hover:underline">Cancel</button>
      </div>
    </form>
  )
}
