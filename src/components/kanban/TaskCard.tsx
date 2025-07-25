import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, Paperclip, Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';
import { format } from 'date-fns';
import { Task } from '../../types/Task';

interface TaskCardProps {
  task: Task;
  onTaskClick?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };


  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging && onTaskClick) {
      e.stopPropagation();
      onTaskClick(task);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={cn(
        "bg-background p-3 rounded shadow-sm cursor-move hover:shadow-md transition-all flex flex-col border border-border w-full",
        isDragging && "opacity-50"
      )}
    >
      {/* Tag and Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {task.tagName && (
            <>
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: task.tagColor }}
              />
              <span className="text-xs text-muted-foreground font-medium">{task.tagName}</span>
            </>
          )}
        </div>
        {/* Priority badge */}
        <span
          className={cn(
            "px-2 py-0.5 rounded text-xs font-medium capitalize",
            task.priority === 'low' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
              : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          )}
        >
          {task.priority}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-foreground mb-2 line-clamp-2">{task.title}</h4>

      {/* Description */}
      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
        {task.description}
      </p>

      {/* Due date */}
      {task.dueDate && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <Calendar className="w-3 h-3" />
          <span>{format(new Date(task.dueDate), 'MMM d')}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2">
        {/* Assigned users */}
        <div className="flex -space-x-1">
          {task.assignedUsers.slice(0, 3).map((user, index) => (
            <div
              key={index}
              className="w-5 h-5 rounded-full bg-muted border border-background flex items-center justify-center"
            >
              <span className="text-[10px] font-medium text-muted-foreground">
                {user.charAt(0).toUpperCase()}
              </span>
            </div>
          ))}
          {task.assignedUsers.length > 3 && (
            <div className="w-5 h-5 rounded-full bg-muted border border-background flex items-center justify-center">
              <span className="text-[10px] font-medium text-muted-foreground">
                +{task.assignedUsers.length - 3}
              </span>
            </div>
          )}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2">
          {task.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Paperclip className="w-3 h-3" />
              <span className="text-xs">{task.attachments.length}</span>
            </div>
          )}
          {task.comments && task.comments.length > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="w-3 h-3" />
              <span className="text-xs">{task.comments.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};