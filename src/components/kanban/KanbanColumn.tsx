import React, { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreVertical, Check, ArrowUpDown, Calendar, Tag, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { TaskCard } from './TaskCard';
import { Task } from '../../types/Task';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onAddTask: () => void;
  onTaskClick?: (task: Task) => void;
  sortMode: string;
  onSortModeChange: (mode: string) => void;
  canDelete?: boolean;
  onDelete?: () => void;
  onRename?: (newTitle: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, tasks, onAddTask, onTaskClick, sortMode, onSortModeChange, canDelete, onDelete, onRename }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update editValue when title prop changes
  useEffect(() => {
    setEditValue(title);
  }, [title]);

  // Focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleTitleClick = () => {
    if (onRename) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== title && onRename) {
      onRename(trimmedValue);
    } else {
      setEditValue(title); // Reset to original if invalid
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const taskIds = tasks.map(task => task._id);

  return (
    <div className="w-[280px]">
      <div className="bg-accent rounded-lg">
        <div className="px-3 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className="text-sm font-medium text-foreground bg-background border border-border rounded px-1 py-0.5 min-w-0 flex-1 max-w-[120px]"
                maxLength={50}
              />
            ) : (
              <h3 
                className={cn(
                  "text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors",
                  onRename && "hover:bg-background/50 rounded px-1 py-0.5"
                )}
                onClick={handleTitleClick}
                title={onRename ? "Click to edit column name" : undefined}
              >
                {title}
              </h3>
            )}
            <span className="text-sm font-medium text-primary">
              {tasks.length}
            </span>
            {sortMode !== 'custom' && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {sortMode === 'priority' && <ArrowUpDown className="w-3 h-3" />}
                {sortMode === 'date' && <Calendar className="w-3 h-3" />}
                {sortMode === 'category' && <Tag className="w-3 h-3" />}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="p-1 hover:bg-background/50 rounded transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
              
              {showSortMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg p-1 z-10">
                  {[
                    { value: 'custom', label: 'Custom Order', tooltip: 'Drag to reorder' },
                    { value: 'priority', label: 'Sort by Priority' },
                    { value: 'date', label: 'Sort by Due Date' },
                    { value: 'category', label: 'Sort by Category' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSortModeChange(option.value);
                        setShowSortMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-accent transition-colors",
                        sortMode === option.value && "bg-accent"
                      )}
                      title={option.tooltip}
                    >
                      <span className="flex items-center gap-2">
                        {option.label}
                        {option.tooltip && (
                          <span className="text-xs text-muted-foreground">({option.tooltip})</span>
                        )}
                      </span>
                      {sortMode === option.value && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {canDelete && onDelete && (
              <button
                onClick={onDelete}
                className="p-1 hover:bg-background/50 rounded transition-colors group"
                title="Delete column"
              >
                <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
              </button>
            )}
            
            <button
              onClick={onAddTask}
              className="p-1 hover:bg-background/50 rounded transition-colors"
            >
              <Plus className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div
          ref={setNodeRef}
          className={cn(
            "min-h-[500px] px-3 pb-3 transition-colors",
            isOver ? "bg-accent/10" : ""
          )}
        >
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {tasks.map((task) => (
                <TaskCard key={task._id} task={task} onTaskClick={onTaskClick} />
              ))}
            </div>
          </SortableContext>
        </div>
      </div>
    </div>
  );
};