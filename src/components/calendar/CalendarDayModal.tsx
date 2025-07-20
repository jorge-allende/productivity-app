import React, { useState } from 'react';
import { X, Plus, ArrowLeft } from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Task } from '../../types/Task';
import { DraggableModalTask } from './DraggableModalTask';
import { TaskCard } from '../kanban/TaskCard';
import { TaskForm } from '../ui/TaskForm';

interface CalendarDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  tasks: Task[];
  onAddTask?: (task: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    tagColor: string;
    tagName: string;
    dueDate?: string;
    assignedUsers: string[];
    attachments: Array<{ name: string; url: string; type: string }>;
  }) => void;
  onTaskClick?: (task: Task) => void;
}

export const CalendarDayModal: React.FC<CalendarDayModalProps> = ({ isOpen, onClose, date, tasks, onAddTask, onTaskClick }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'create'>('view');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (!isOpen) return null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = () => {
    setActiveId(null);
    // The actual task update will be handled by the parent Calendar component
  };

  const activeTask = activeId ? tasks.find(task => task._id === activeId) : null;

  const isTaskOverdue = (task: Task) => {
    if (!task.dueDate || task.completedAt) return false;
    return isBefore(new Date(task.dueDate), startOfDay(new Date()));
  };

  const isTaskCompleted = (task: Task) => {
    return !!task.completedAt;
  };

  const handleTaskSave = (taskData: any) => {
    if (onAddTask) {
      onAddTask(taskData);
      setMode('view');
    }
  };


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              {mode === 'create' && (
                <button
                  onClick={() => setMode('view')}
                  className="p-1.5 hover:bg-accent rounded"
                >
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {mode === 'view' ? `Tasks for ${format(date, 'MMMM d, yyyy')}` : 'Create New Task'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {mode === 'view' 
                    ? `${tasks.length} task${tasks.length !== 1 ? 's' : ''} scheduled`
                    : `For ${format(date, 'MMMM d, yyyy')}`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {mode === 'view' && onAddTask && (
                <button
                  onClick={() => setMode('create')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-foreground text-background hover:bg-foreground/90 rounded-md transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 8rem)' }}>
            {mode === 'view' ? (
              // View mode - show existing tasks
              tasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm mb-4">No tasks scheduled for this day</p>
                  {onAddTask && (
                    <button
                      onClick={() => setMode('create')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background hover:bg-foreground/90 rounded-md transition-colors text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Your First Task
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <DraggableModalTask
                      key={task._id}
                      task={task}
                      isTaskCompleted={isTaskCompleted}
                      isTaskOverdue={isTaskOverdue}
                      onClick={() => onTaskClick?.(task)}
                    />
                  ))}
                </div>
              )
            ) : (
              // Create mode - show task creation form
              <TaskForm
                onSave={handleTaskSave}
                onCancel={() => setMode('view')}
                initialDueDate={date}
                mode="inline"
              />
            )}
          </div>

        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask && (
          <div className="opacity-80">
            <TaskCard task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};