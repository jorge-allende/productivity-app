import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, Paperclip, Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';
import { format } from 'date-fns';
import { Task } from '../../types/Task';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
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

  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow",
        isDragging && "opacity-50"
      )}
    >
      {/* Tag */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="px-2 py-1 rounded text-xs font-medium"
          style={{ backgroundColor: task.tagColor + '20', color: task.tagColor }}
        >
          {task.tagName}
        </span>
        <span className={cn("px-2 py-1 rounded text-xs font-medium", priorityColors[task.priority])}>
          {task.priority}
        </span>
      </div>

      {/* Title */}
      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{task.title}</h4>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {task.description}
      </p>

      {/* Due date */}
      {task.dueDate && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <Calendar className="w-3 h-3" />
          <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assigned users */}
        <div className="flex -space-x-2">
          {task.assignedUsers.slice(0, 3).map((user, index) => (
            <div
              key={index}
              className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-900 flex items-center justify-center"
            >
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {user.charAt(0).toUpperCase()}
              </span>
            </div>
          ))}
          {task.assignedUsers.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                +{task.assignedUsers.length - 3}
              </span>
            </div>
          )}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-3">
          {task.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Paperclip className="w-4 h-4" />
              <span className="text-xs">{task.attachments.length}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs">0</span>
          </div>
        </div>
      </div>
    </div>
  );
};