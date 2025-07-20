import React from 'react';
import { X } from 'lucide-react';
import { TaskForm } from './TaskForm';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    tagColor: string;
    tagName: string;
    dueDate?: string;
    assignedUsers: string[];
    attachments: Array<{ name: string; url: string; type: string }>;
  }) => void;
  initialDueDate?: Date;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, initialDueDate }) => {
  if (!isOpen) return null;

  const handleSave = (taskData: any) => {
    onSave(taskData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg p-4 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Task</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <TaskForm 
          onSave={handleSave}
          onCancel={onClose}
          initialDueDate={initialDueDate}
          mode="modal"
        />
      </div>
    </div>
  );
};