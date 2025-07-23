import React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { format } from 'date-fns';
import { cn } from '../../utils/cn';
import { Task } from '../../types/Task';

interface DroppableCalendarDayProps {
  day: Date;
  tasks: Task[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isPastDay: boolean;
  hasOverdueTasks: boolean;
  onDayClick: (day: Date, event: React.MouseEvent) => void;
  getCountBadgeColor: (count: number) => string;
  isTaskCompleted: (task: Task) => boolean;
  isTaskOverdue: (task: Task) => boolean;
}

// Mini draggable task bar component
const DraggableTaskBar: React.FC<{
  task: Task;
  completed: boolean;
  overdue: boolean;
}> = ({ task, completed, overdue }) => {
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
        backgroundColor: completed ? '#e5e7eb' : task.tagColor + '20',
        color: completed ? '#6b7280' : task.tagColor,
        opacity: isDragging ? 0.5 : 1,
      }}
      {...listeners}
      {...attributes}
      className={cn(
        "w-full px-1 py-0.5 rounded text-[11px] truncate cursor-move",
        completed && "opacity-60 line-through",
        overdue && !completed && "ring-1 ring-red-500"
      )}
      title={task.title}
    >
      {task.title}
    </div>
  );
};

export const DroppableCalendarDay: React.FC<DroppableCalendarDayProps> = ({
  day,
  tasks,
  isCurrentMonth,
  isToday,
  isPastDay,
  hasOverdueTasks,
  onDayClick,
  getCountBadgeColor,
  isTaskCompleted,
  isTaskOverdue,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${day.toISOString()}`,
  });

  return (
    <div
      ref={setNodeRef}
      onClick={(e) => onDayClick(day, e)}
      className={cn(
        "h-full min-h-[114px] max-h-[172px] p-1 border-b border-r border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 relative transition-colors group cursor-pointer",
        !isCurrentMonth && "bg-gray-50 dark:bg-gray-900",
        tasks.length > 0 && "hover:bg-blue-50 dark:hover:bg-blue-900",
        isPastDay && "opacity-60 bg-gray-100 dark:bg-gray-800",
        hasOverdueTasks && "border-2 border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/20",
        isOver && "bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500 ring-inset"
      )}
    >
      <div className="day-header flex items-start justify-between mb-1">
        <div
          className={cn(
            "w-6 h-6 flex items-center justify-center rounded text-xs font-medium",
            !isCurrentMonth && "text-gray-400 dark:text-gray-600",
            isToday && "bg-primary-600 text-white",
            !isToday && !isPastDay && "text-gray-900 dark:text-white",
            isPastDay && "text-gray-500 dark:text-gray-400"
          )}
        >
          {format(day, 'd')}
        </div>
        {/* Task count badge */}
        {tasks.length > 0 && (
          <div className={cn(
            "px-1 py-0.5 rounded-full text-[10px] font-medium min-w-[16px] text-center",
            getCountBadgeColor(tasks.length),
            isPastDay && "opacity-70"
          )}>
            {tasks.length}
          </div>
        )}
      </div>

      {/* Task bars */}
      {tasks.length > 0 && (
        <div className="space-y-1 mt-1">
          {tasks.slice(0, 2).map((task) => {
            const completed = isTaskCompleted(task);
            const overdue = isTaskOverdue(task);
            return (
              <DraggableTaskBar
                key={task._id}
                task={task}
                completed={completed}
                overdue={overdue}
              />
            );
          })}
          {tasks.length > 2 && (
            <div 
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onDayClick(day, e);
              }}
            >
              +{tasks.length - 2} more
            </div>
          )}
        </div>
      )}


      {/* Add visual hint for drag drop when hovering with task */}
      {isOver && tasks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/50 px-2 py-1 rounded">
            Drop to reschedule
          </div>
        </div>
      )}

      {/* Priority indicators and overdue badge */}
      {tasks.length > 0 && (
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-1">
            {Array.from(new Set(tasks.map(task => task.priority))).map(priority => (
              <div
                key={priority}
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  priority === 'low' && "bg-priority-low",
                  priority === 'medium' && "bg-priority-medium",
                  priority === 'high' && "bg-priority-high",
                  priority === 'high' && "bg-red-500",
                  isPastDay && "opacity-50"
                )}
              />
            ))}
          </div>
          {hasOverdueTasks && (
            <div className="text-[10px] text-red-500 dark:text-red-400 font-medium">
              Overdue
            </div>
          )}
        </div>
      )}
    </div>
  );
};