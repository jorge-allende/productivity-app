import React, { useState, useEffect, useRef } from 'react';
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
import { Plus } from 'lucide-react';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { Task } from '../../types/Task';
import { Column } from '../../types/Column';
import { cn } from '../../utils/cn';

interface KanbanBoardProps {
  tasks: Task[];
  columns: Column[];
  boardName: string;
  onTaskMove: (taskId: string, newColumnId: string, newOrder: number) => void;
  onAddTask: (columnId: string) => void;
  onAddColumn: () => void;
  onDeleteColumn: (columnId: string) => void;
  onRenameColumn: (columnId: string, newTitle: string) => void;
  onRenameBoardName: (newName: string) => void;
  onTaskClick?: (task: Task) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  tasks, 
  columns, 
  boardName,
  onTaskMove, 
  onAddTask, 
  onAddColumn, 
  onDeleteColumn, 
  onRenameColumn,
  onRenameBoardName,
  onTaskClick 
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isEditingBoardName, setIsEditingBoardName] = useState(false);
  const [editBoardNameValue, setEditBoardNameValue] = useState(boardName);
  const boardNameInputRef = useRef<HTMLInputElement>(null);
  
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
    // Initialize with 'custom' for all columns
    const modes: Record<string, string> = {};
    columns.forEach(col => {
      modes[col.id] = 'custom';
    });
    return modes;
  });

  // Save sort modes to localStorage when they change
  useEffect(() => {
    localStorage.setItem('kanbanSortModes', JSON.stringify(columnSortModes));
  }, [columnSortModes]);

  // Update edit value when board name prop changes
  useEffect(() => {
    setEditBoardNameValue(boardName);
  }, [boardName]);

  // Focus and select text when entering board name edit mode
  useEffect(() => {
    if (isEditingBoardName && boardNameInputRef.current) {
      boardNameInputRef.current.focus();
      boardNameInputRef.current.select();
    }
  }, [isEditingBoardName]);

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

  const getColumnTasks = (columnId: string) => {
    const filteredTasks = tasks.filter(task => task.columnId === columnId);
    return sortTasks(filteredTasks, columnSortModes[columnId] || 'custom');
  };

  // Board name editing handlers
  const handleBoardNameClick = () => {
    setIsEditingBoardName(true);
  };

  const handleBoardNameSave = () => {
    const trimmedValue = editBoardNameValue.trim();
    if (trimmedValue && trimmedValue !== boardName) {
      onRenameBoardName(trimmedValue);
    } else {
      setEditBoardNameValue(boardName); // Reset to original if invalid
    }
    setIsEditingBoardName(false);
  };

  const handleBoardNameCancel = () => {
    setEditBoardNameValue(boardName);
    setIsEditingBoardName(false);
  };

  const handleBoardNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBoardNameSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleBoardNameCancel();
    }
  };

  const handleBoardNameBlur = () => {
    handleBoardNameSave();
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
    let targetColumnId: string;
    let targetTasks: Task[];

    // Check if dropped on a column header
    const targetColumn = columns.find(col => col.id === overId);
    if (targetColumn) {
      targetColumnId = targetColumn.id;
      targetTasks = getColumnTasks(targetColumnId);
    } else {
      // Dropped on another task
      const overTask = tasks.find(task => task._id === overId);
      if (!overTask) return;
      targetColumnId = overTask.columnId;
      targetTasks = getColumnTasks(targetColumnId);
    }

    // Check if moving within same column and column is not in custom mode
    if (activeTask.columnId === targetColumnId && columnSortModes[targetColumnId] !== 'custom') {
      // Switch to custom mode to allow manual reordering
      handleSortModeChange(targetColumnId, 'custom');
    }

    // Calculate new order - pass the drop index to backend
    // The backend will handle the actual order calculation with proper gap-based system
    let dropIndex: number;
    
    if (overId === targetColumnId) {
      // Dropped on empty column or at the end
      dropIndex = targetTasks.length;
    } else {
      // Find the position where the task was dropped
      const overTask = targetTasks.find(task => task._id === overId);
      if (overTask) {
        const overIndex = targetTasks.findIndex(task => task._id === overId);
        
        // If moving within the same column, adjust index based on direction
        if (activeTask.columnId === targetColumnId) {
          const activeIndex = targetTasks.findIndex(task => task._id === active.id);
          if (activeIndex < overIndex) {
            // Moving down: place after the over task
            dropIndex = overIndex;
          } else {
            // Moving up: place before the over task
            dropIndex = overIndex;
          }
        } else {
          // Moving to different column: place before the over task
          dropIndex = overIndex;
        }
      } else {
        // Fallback: append to end
        dropIndex = targetTasks.length;
      }
    }
    
    // Pass the drop index as the newOrder - backend will calculate actual order value
    const newOrder = dropIndex;

    onTaskMove(activeTask._id, targetColumnId, newOrder);
  };

  const activeTask = activeId ? tasks.find(task => task._id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full">
        {/* Column Management Header - Fixed width, not scrollable */}
        <div className="flex items-center justify-between mb-4 pl-4 pr-2">
          {isEditingBoardName ? (
            <input
              ref={boardNameInputRef}
              value={editBoardNameValue}
              onChange={(e) => setEditBoardNameValue(e.target.value)}
              onKeyDown={handleBoardNameKeyDown}
              onBlur={handleBoardNameBlur}
              className="text-lg font-semibold text-foreground bg-background border border-border rounded px-2 py-1 min-w-0 flex-1 max-w-[300px]"
              maxLength={100}
            />
          ) : (
            <h2 
              className="text-lg font-semibold text-foreground cursor-pointer hover:text-primary transition-colors hover:bg-background/50 rounded px-2 py-1"
              onClick={handleBoardNameClick}
              title="Click to edit board name"
            >
              {boardName}
            </h2>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {columns.length} of 4 columns
            </span>
            <button
              onClick={onAddColumn}
              disabled={columns.length >= 4}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                columns.length >= 4
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Plus className="w-4 h-4" />
              Add Column
            </button>
          </div>
        </div>

        {/* Scrollable Grid Layout */}
        <div className="overflow-x-auto">
          <div 
            className="grid gap-3 pb-4 px-4" 
            style={{ 
              gridTemplateColumns: `repeat(${columns.length}, 280px)`,
              minWidth: `${columns.length * 280 + (columns.length - 1) * 12}px`
            }}
          >
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={getColumnTasks(column.id)}
                onAddTask={() => onAddTask(column.id)}
                onTaskClick={onTaskClick}
                sortMode={columnSortModes[column.id] || 'custom'}
                onSortModeChange={(mode) => handleSortModeChange(column.id, mode)}
                canDelete={columns.length > 2}
                onDelete={() => onDeleteColumn(column.id)}
                onRename={(newTitle) => onRenameColumn(column.id, newTitle)}
              />
            ))}
          </div>
        </div>
      </div>
      
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
};