import React from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import Column from './Column'

export default function Board({
  columns,
  cardsByColumn,
  isRepoOwner,
  onDragEnd,
  editingColumnId,
  editName,
  onEditNameChange,
  onStartEditing,
  onSaveEdit,
  onCancelEditing,
  onDeleteColumn,
  addingCardColumnId,
  onOpenAddCard,
  onCloseAddCard,
  addCardShared,
  addingColumn,
  newColumnName,
  onNewColumnNameChange,
  onAddColumn,
}) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 items-start">
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            cards={cardsByColumn[column.id] || []}
            isRepoOwner={isRepoOwner}
            isEditing={editingColumnId === column.id}
            editName={editName}
            onEditNameChange={onEditNameChange}
            onStartEditing={() => onStartEditing(column)}
            onSaveEdit={() => onSaveEdit(column.id)}
            onCancelEditing={onCancelEditing}
            onDeleteColumn={() => onDeleteColumn(column.id)}
            isAddingCard={addingCardColumnId === column.id}
            onOpenAddCard={() => onOpenAddCard(column.id)}
            addCardProps={{
              selectedType: addCardShared.selectedType,
              onTypeChange: addCardShared.onTypeChange,
              selectedItemId: addCardShared.selectedItemId,
              onItemChange: addCardShared.onItemChange,
              items: addCardShared.getAvailableItems(),
              cardError: addCardShared.cardError,
              onSubmit: addCardShared.onSubmit,
              onCancel: onCloseAddCard,
            }}
          />
        ))}

        {isRepoOwner && (
          <form onSubmit={onAddColumn} className="w-64 shrink-0">
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => onNewColumnNameChange(e.target.value)}
              placeholder="New column name"
              className="w-full bg-[#0F1424] border border-[#242B45] rounded-md px-3 py-2 text-[#E4E7F2] text-sm outline-none focus:border-[#7C6FF5] mb-2"
            />
            <button
              type="submit"
              disabled={addingColumn}
              className="w-full bg-[#7C6FF5] hover:bg-[#6C5FE0] disabled:opacity-50 text-white text-sm font-medium rounded-md py-2"
            >
              {addingColumn ? 'Adding…' : 'Add column'}
            </button>
          </form>
        )}
      </div>
    </DragDropContext>
  )
}
