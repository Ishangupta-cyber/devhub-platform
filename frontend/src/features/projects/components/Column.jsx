import React from 'react'
import { Droppable } from '@hello-pangea/dnd'
import Card from './Card'
import AddCardPicker from './AddCardPicker'

export default function Column({
  column,
  cards,
  isRepoOwner,
  isEditing,
  editName,
  onEditNameChange,
  onStartEditing,
  onSaveEdit,
  onCancelEditing,
  onDeleteColumn,
  isAddingCard,
  onOpenAddCard,
  addCardProps,
}) {
  return (
    <div className="bg-surface border border-border rounded-md p-4 w-64 shrink-0">
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
            className="w-full bg-subtle border border-border rounded-md px-2 py-1 text-fg text-sm outline-none focus:border-accent"
          />
          <div className="flex gap-3">
            <button onClick={onSaveEdit} className="text-xs text-accent hover:underline">
              Save
            </button>
            <button onClick={onCancelEditing} className="text-xs text-muted hover:underline">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-fg font-medium font-mono">{column.name}</p>
          {isRepoOwner && (
            <div className="flex gap-2">
              <button onClick={onStartEditing} className="text-xs text-accent hover:underline">
                Edit
              </button>
              <button onClick={onDeleteColumn} className="text-xs text-danger hover:underline">
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      <Droppable droppableId={String(column.id)}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 mt-3">
            {cards.length === 0 && <p className="text-xs text-muted">No cards.</p>}
            {cards.map((card, index) => (
              <Card key={card.id} card={card} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {isRepoOwner && (
        isAddingCard ? (
          <AddCardPicker {...addCardProps} />
        ) : (
          <button onClick={onOpenAddCard} className="mt-3 text-xs text-accent hover:underline">
            + Add card
          </button>
        )
      )}
    </div>
  )
}
