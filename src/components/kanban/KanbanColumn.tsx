import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { cn } from '../../utils/cn';
import { TaskCard } from './TaskCard';
import { Task } from '../../types/Task';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onAddTask: () => void;
  onTaskClick?: (task: Task) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, tasks, onAddTask, onTaskClick }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  const taskIds = tasks.map(task => task._id);

  return (
    <div className="flex-1 min-w-[300px]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">{tasks.length}</span>
        </div>
        <button
          onClick={onAddTask}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <Plus className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[500px] p-2 rounded-lg transition-colors",
          isOver ? "bg-gray-100 dark:bg-gray-700" : "bg-gray-50 dark:bg-gray-800"
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} onTaskClick={onTaskClick} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};