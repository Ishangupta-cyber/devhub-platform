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
    <div className="bg-[#12162A] border border-[#242B45] rounded-md p-4 w-64 shrink-0">
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
            className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-2 py-1 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5]"
          />
          <div className="flex gap-3">
            <button onClick={onSaveEdit} className="text-xs text-[#7C6FF5] hover:underline">
              Save
            </button>
            <button onClick={onCancelEditing} className="text-xs text-[#8B90A8] hover:underline">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#E4E7F2] font-medium font-mono">{column.name}</p>
          {isRepoOwner && (
            <div className="flex gap-2">
              <button onClick={onStartEditing} className="text-xs text-[#7C6FF5] hover:underline">
                Edit
              </button>
              <button onClick={onDeleteColumn} className="text-xs text-[#F4A9B5] hover:underline">
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      <Droppable droppableId={String(column.id)}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 mt-3">
            {cards.length === 0 && <p className="text-xs text-[#8B90A8]">No cards.</p>}
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
          <button onClick={onOpenAddCard} className="mt-3 text-xs text-[#7C6FF5] hover:underline">
            + Add card
          </button>
        )
      )}
    </div>
  )
}
