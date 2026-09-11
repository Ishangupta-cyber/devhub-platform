import React from 'react'
import { Draggable } from '@hello-pangea/dnd'

const LINK_TYPE_STYLE = {
  issue: 'bg-success-bg text-success',
  pull_request: 'bg-info-bg text-info',
}

export default function Card({ card, index }) {
  return (
    <Draggable draggableId={String(card.id)} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-subtle border border-border rounded-md p-2"
        >
          <p className="text-xs text-fg">{card.linked_title}</p>
          <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded font-mono ${LINK_TYPE_STYLE[card.linked_type]}`}>
            {card.linked_type}
          </span>
        </div>
      )}
    </Draggable>
  )
}
