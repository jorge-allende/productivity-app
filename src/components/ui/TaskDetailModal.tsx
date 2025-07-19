import React from 'react';
import { X, MessageSquare, Paperclip, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../utils/cn';
import { Task } from '../../types/Task';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  tasks: Task[];
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, date, tasks }) => {
  if (!isOpen) return null;

  const priorityColors = {
    low: 'bg-priority-low/10 text-priority-low',
    medium: 'bg-priority-medium/10 text-priority-medium',
    high: 'bg-priority-high/10 text-priority-high',
    urgent: 'bg-priority-urgent/10 text-priority-urgent',
  };

  const statusColors = {
    todo: 'bg-muted text-muted-foreground',
    in_progress: 'bg-primary/10 text-primary',
    done: 'bg-priority-low/10 text-priority-low',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden border border-border">
        <div className="flex items-center justify-between p-8 border-b border-border">
          <div>
            <h2 className="text-size-1 font-semibold text-card-foreground">
              Tasks for {format(date, 'MMMM d, yyyy')}
            </h2>
            <p className="text-size-4 text-muted-foreground">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {/* Task Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ backgroundColor: task.tagColor + '20', color: task.tagColor }}
                    >
                      {task.tagName}
                    </span>
                    <span className={cn("px-2 py-1 rounded text-xs font-medium", priorityColors[task.priority])}>
                      {task.priority}
                    </span>
                    <span className={cn("px-2 py-1 rounded text-xs font-medium", statusColors[task.status])}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Task Title */}
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{task.title}</h3>

                {/* Task Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{task.description}</p>

                {/* Task Details */}
                <div className="space-y-3">
                  {/* Due Date */}
                  {task.dueDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
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
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};