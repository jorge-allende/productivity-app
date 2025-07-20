import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Task } from '../../types/Task';

interface DraggableCalendarTaskProps {
  task: Task;
  isPastDay: boolean;
  isCompleted: boolean;
  isOverdue: boolean;
}

export const DraggableCalendarTask: React.FC<DraggableCalendarTaskProps> = ({
  task,
  isPastDay,
  isCompleted,
  isOverdue,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: isCompleted ? '#94a3b820' : task.tagColor + '20',
        color: isCompleted ? '#94a3b8' : task.tagColor,
      }}
      {...listeners}
      {...attributes}
      className={cn(
        "draggable-task px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-0.5 cursor-move",
        isPastDay && "opacity-70",
        isCompleted && "opacity-50",
        isOverdue && "border border-red-500 dark:border-red-400",
        isDragging && "opacity-50 z-50"
      )}
    >
      {isCompleted && <CheckCircle2 className="w-2.5 h-2.5 flex-shrink-0" />}
      {isOverdue && !isCompleted && <AlertCircle className="w-2.5 h-2.5 text-red-500 flex-shrink-0" />}
      <span className={cn(isCompleted && "line-through")}>
        {task.title}
      </span>
    </div>
  );
};