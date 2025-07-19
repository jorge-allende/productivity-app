import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { Task } from '../../types/Task';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: 'todo' | 'in_progress' | 'done', newOrder: number) => void;
  onAddTask: (status: 'todo' | 'in_progress' | 'done') => void;
  onTaskClick?: (task: Task) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskMove, onAddTask, onTaskClick }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Initialize sort modes from localStorage or defaults
  const [columnSortModes, setColumnSortModes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('kanbanSortModes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved sort modes:', e);
      }
    }
    return {
      todo: 'custom',
      in_progress: 'custom',
      done: 'custom'
    };
  });

  // Save sort modes to localStorage when they change
  useEffect(() => {
    localStorage.setItem('kanbanSortModes', JSON.stringify(columnSortModes));
  }, [columnSortModes]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const sortTasks = (tasks: Task[], sortMode: string): Task[] => {
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    
    switch(sortMode) {
      case 'priority':
        return [...tasks].sort((a, b) => 
          priorityOrder[a.priority] - priorityOrder[b.priority]
        );
      case 'date':
        return [...tasks].sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
      case 'category':
        return [...tasks].sort((a, b) => 
          (a.tagName || '').localeCompare(b.tagName || '')
        );
      default: // 'custom'
        return [...tasks].sort((a, b) => a.order - b.order);
    }
  };

  const columns = {
    todo: sortTasks(tasks.filter(task => task.status === 'todo'), columnSortModes.todo),
    in_progress: sortTasks(tasks.filter(task => task.status === 'in_progress'), columnSortModes.in_progress),
    done: sortTasks(tasks.filter(task => task.status === 'done'), columnSortModes.done),
  };

  const handleSortModeChange = (columnId: string, mode: string) => {
    setColumnSortModes(prev => ({
      ...prev,
      [columnId]: mode
    }));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = tasks.find(task => task._id === active.id);
    if (!activeTask) return;

    const overId = over.id as string;
    
    // Determine the target column
    let targetColumn: 'todo' | 'in_progress' | 'done';
    let targetTasks: Task[];

    if (overId === 'todo' || overId === 'in_progress' || overId === 'done') {
      targetColumn = overId;
      targetTasks = columns[targetColumn];
    } else {
      // Dropped on another task
      const overTask = tasks.find(task => task._id === overId);
      if (!overTask) return;
      targetColumn = overTask.status;
      targetTasks = columns[targetColumn];
    }

    // Check if moving within same column and column is not in custom mode
    if (activeTask.status === targetColumn && columnSortModes[targetColumn] !== 'custom') {
      // Switch to custom mode to allow manual reordering
      handleSortModeChange(targetColumn, 'custom');
    }

    // Calculate new order
    let newOrder: number;
    if (overId === targetColumn) {
      // Dropped on empty column
      newOrder = targetTasks.length > 0 ? targetTasks[targetTasks.length - 1].order + 1 : 1;
    } else {
      const overTask = targetTasks.find(task => task._id === overId);
      if (overTask) {
        const overIndex = targetTasks.findIndex(task => task._id === overId);
        newOrder = overTask.order;
        
        // If moving within the same column, adjust order calculation
        if (activeTask.status === targetColumn) {
          const activeIndex = targetTasks.findIndex(task => task._id === active.id);
          if (activeIndex < overIndex) {
            newOrder = overTask.order;
          } else {
            newOrder = overTask.order + 0.5;
          }
        }
      } else {
        newOrder = targetTasks.length > 0 ? targetTasks[targetTasks.length - 1].order + 1 : 1;
      }
    }

    onTaskMove(activeTask._id, targetColumn, newOrder);
  };

  const activeTask = activeId ? tasks.find(task => task._id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex justify-center">
        <div className="overflow-x-auto max-w-6xl">
          <div className="grid grid-cols-3 gap-3 pb-2 justify-center" style={{ gridTemplateColumns: 'repeat(3, 280px)' }}>
            <KanbanColumn
              id="todo"
              title="To Do"
              tasks={columns.todo}
              onAddTask={() => onAddTask('todo')}
              onTaskClick={onTaskClick}
              sortMode={columnSortModes.todo}
              onSortModeChange={(mode) => handleSortModeChange('todo', mode)}
            />
            <KanbanColumn
              id="in_progress"
              title="In Progress"
              tasks={columns.in_progress}
              onAddTask={() => onAddTask('in_progress')}
              onTaskClick={onTaskClick}
              sortMode={columnSortModes.in_progress}
              onSortModeChange={(mode) => handleSortModeChange('in_progress', mode)}
            />
            <KanbanColumn
              id="done"
              title="Done"
              tasks={columns.done}
              onAddTask={() => onAddTask('done')}
              onTaskClick={onTaskClick}
              sortMode={columnSortModes.done}
              onSortModeChange={(mode) => handleSortModeChange('done', mode)}
            />
          </div>
        </div>
      </div>
      
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
};