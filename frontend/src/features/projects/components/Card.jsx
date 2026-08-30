import React from 'react'
import { Draggable } from '@hello-pangea/dnd'

const LINK_TYPE_STYLE = {
  issue: 'bg-[#1B3A2A] text-[#A9F4C0]',
  pull_request: 'bg-[#1B2A3A] text-[#7AB8F4]',
}

export default function Card({ card, index }) {
  return (
    <Draggable draggableId={String(card.id)} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-[#0F1424] border border-[#242B45] rounded-md p-2"
        >
          <p className="text-xs text-[#E4E7F2]">{card.linked_title}</p>
          <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded font-mono ${LINK_TYPE_STYLE[card.linked_type]}`}>
            {card.linked_type}
          </span>
        </div>
      )}
    </Draggable>
  )
}
