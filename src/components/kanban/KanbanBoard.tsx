import React, { useState } from 'react';
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
import { CalendarWidget } from '../calendar/CalendarWidget';
import { Task } from '../../types/Task';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: 'todo' | 'in_progress' | 'done', newOrder: number) => void;
  onAddTask: (status: 'todo' | 'in_progress' | 'done') => void;
  onTaskClick?: (task: Task) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskMove, onAddTask, onTaskClick }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns = {
    todo: tasks.filter(task => task.status === 'todo').sort((a, b) => a.order - b.order),
    in_progress: tasks.filter(task => task.status === 'in_progress').sort((a, b) => a.order - b.order),
    done: tasks.filter(task => task.status === 'done').sort((a, b) => a.order - b.order),
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
    <div className="flex gap-6">
      <div className="flex-1 flex gap-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <KanbanColumn
            id="todo"
            title="To Do"
            tasks={columns.todo}
            onAddTask={() => onAddTask('todo')}
            onTaskClick={onTaskClick}
          />
          <KanbanColumn
            id="in_progress"
            title="In Progress"
            tasks={columns.in_progress}
            onAddTask={() => onAddTask('in_progress')}
            onTaskClick={onTaskClick}
          />
          <KanbanColumn
            id="done"
            title="Done"
            tasks={columns.done}
            onAddTask={() => onAddTask('done')}
            onTaskClick={onTaskClick}
          />

          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} />}
          </DragOverlay>
        </DndContext>
      </div>

      <div className="w-80">
        <CalendarWidget tasks={tasks} />
      </div>
    </div>
  );
};