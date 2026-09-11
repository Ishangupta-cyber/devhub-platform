import React from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import Column from './Column'

export default function Board({
  columns,
  cardsByColumn,
  isRepoOwner,
  checking,
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

        {!checking && isRepoOwner && (
          <form onSubmit={onAddColumn} className="w-64 shrink-0">
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => onNewColumnNameChange(e.target.value)}
              placeholder="New column name"
              className="w-full bg-subtle border border-border rounded-md px-3 py-2 text-fg text-sm outline-none focus:border-accent mb-2"
            />
            <button
              type="submit"
              disabled={addingColumn}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium rounded-md py-2"
            >
              {addingColumn ? 'Adding…' : 'Add column'}
            </button>
          </form>
        )}
      </div>
    </DragDropContext>
  )
}
