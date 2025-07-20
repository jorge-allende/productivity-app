import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { MessageSquare, Paperclip, Calendar, CheckCircle2, AlertCircle, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../utils/cn';
import { Task } from '../../types/Task';

interface DraggableModalTaskProps {
  task: Task;
  isTaskCompleted: (task: Task) => boolean;
  isTaskOverdue: (task: Task) => boolean;
  onClick?: () => void;
}

export const DraggableModalTask: React.FC<DraggableModalTaskProps> = ({
  task,
  isTaskCompleted,
  isTaskOverdue,
  onClick,
}) => {
  const completed = isTaskCompleted(task);
  const overdue = isTaskOverdue(task);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={cn(
        "border rounded-lg p-4 transition-colors relative cursor-pointer",
        overdue && !completed ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/20" : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700",
        completed && "opacity-60 bg-gray-100 dark:bg-gray-800",
        isDragging && "opacity-50 z-50 shadow-lg"
      )}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        {...attributes}
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-move hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l-lg transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      <div className="pl-6">
        {/* Task Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-1 rounded text-xs font-medium"
              style={{ 
                backgroundColor: completed ? '#94a3b820' : task.tagColor + '20', 
                color: completed ? '#94a3b8' : task.tagColor 
              }}
            >
              {task.tagName}
            </span>
            <span className={cn(
              "px-2 py-1 rounded text-xs font-medium", 
              completed ? "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400" : 
                task.priority === 'low' ? "bg-priority-low/10 text-priority-low" :
                task.priority === 'medium' ? "bg-priority-medium/10 text-priority-medium" :
                task.priority === 'high' ? "bg-priority-high/10 text-priority-high" :
                "bg-red-500/10 text-red-500"
            )}>
              {task.priority}
            </span>
            <span className="px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">
              {task.columnId}
            </span>
            {completed && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                <CheckCircle2 className="w-3 h-3 inline mr-1" />
                Completed
              </span>
            )}
            {overdue && !completed && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                <AlertCircle className="w-3 h-3 inline mr-1" />
                Overdue
              </span>
            )}
          </div>
        </div>

        {/* Task Title */}
        <h3 className={cn(
          "font-semibold mb-2 flex items-center gap-2",
          completed ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"
        )}>
          {completed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          {overdue && !completed && <AlertCircle className="w-4 h-4 text-red-500" />}
          <span className={cn(completed && "line-through")}>
            {task.title}
          </span>
        </h3>

        {/* Task Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{task.description}</p>

        {/* Task Details */}
        <div className="space-y-3">
          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span className={cn(overdue && !completed && "text-red-500 font-medium")}>
                Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                {overdue && !completed && ' (Overdue)'}
              </span>
            </div>
          )}

          {/* Assigned Users */}
          {task.assignedUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Assigned to:</span>
              <div className="flex -space-x-2">
                {task.assignedUsers.map((user, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800 flex items-center justify-center"
                  >
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {user.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 ml-2">
                {task.assignedUsers.map((user, index) => (
                  <span
                    key={index}
                    className="text-xs text-gray-600 dark:text-gray-400"
                  >
                    {user}
                    {index < task.assignedUsers.length - 1 && ','}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer with stats */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              {task.attachments.length > 0 && (
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <Paperclip className="w-4 h-4" />
                  <span className="text-sm">{task.attachments.length} attachment{task.attachments.length !== 1 ? 's' : ''}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">0 comments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};