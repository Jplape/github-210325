import { useDroppable } from '@dnd-kit/core';

interface DroppableDayProps {
  date: string;
  children: React.ReactNode;
  isOver?: boolean;
}

export function DroppableDay({ date, children, isOver }: DroppableDayProps) {
  const { setNodeRef, isOver: isDraggingOver } = useDroppable({
    id: date,
    data: { type: 'day', date }
  });

  return (
    <div 
      ref={setNodeRef}
      className={`relative ${
        isDraggingOver ? 'ring-2 ring-indigo-500 ring-opacity-50 bg-indigo-50' : ''
      } ${isOver ? 'bg-indigo-50' : ''}`}
    >
      {isDraggingOver && (
        <div className="absolute inset-0 pointer-events-none border-2 border-indigo-500 border-dashed rounded-lg z-10" />
      )}
      {children}
    </div>
  );
}