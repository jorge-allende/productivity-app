import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import type { Id } from '../convex/_generated/dataModel';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskModal } from '../components/ui/TaskModal';
import { TaskEditModal } from '../components/ui/TaskEditModal';
import { Task } from '../types/Task';
import { Column, DEFAULT_COLUMNS } from '../types/Column';
import { useDashboardContext } from '../contexts/DashboardContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { ErrorHandler } from '../utils/errorHandling';
import { useDevTools } from '../utils/devTools';
import { TaskOrderDebugger } from '../components/dev/TaskOrderDebugger';
import { safeLocalStorage } from '../utils/localStorage';
import { DashboardSkeleton } from '../components/ui/SkeletonLoader';

// Using require for api to avoid TypeScript depth issues with Convex queries
const { api } = require('../convex/_generated/api');

// Helper function to map Convex status to columnId
const statusToColumnId = (status: 'todo' | 'in_progress' | 'done'): string => {
  const statusMap: Record<string, string> = {
    'todo': 'todo',
    'in_progress': 'in_progress',
    'done': 'done'
  };
  return statusMap[status] || 'todo';
};

// Helper function to map columnId to Convex status
const columnIdToStatus = (columnId: string): 'todo' | 'in_progress' | 'done' => {
  // Map custom columns to a default status based on their position
  // This ensures tasks don't disappear when moved to custom columns
  const columnMap: Record<string, 'todo' | 'in_progress' | 'done'> = {
    'todo': 'todo',
    'in_progress': 'in_progress',
    'done': 'done'
  };
  
  // If it's a custom column (not one of the predefined ones),
  // we need to handle it differently. For now, custom columns
  // will map to 'in_progress' to keep tasks visible
  if (!columnMap[columnId]) {
    console.warn(`Custom column "${columnId}" detected. Mapping to 'in_progress' status.`);
    return 'in_progress';
  }
  
  return columnMap[columnId];
};

export const Dashboard: React.FC = () => {
  const { filters, setAddTaskCallback } = useDashboardContext();
  const { currentWorkspace } = useWorkspace();
  const { currentUser } = useAuth();
  const { showOrderDebugger } = useDevTools();
  
  // Convex queries and mutations
  const convexTasks = useQuery(api.tasks.getTasks, 
    currentWorkspace && currentUser ? { 
      workspaceId: currentWorkspace.id as Id<"workspaces">,
      auth0Id: currentUser.auth0Id
    } : "skip"
  );
  const createTaskMutation = useMutation(api.tasks.createTask);
  const updateTaskMutation = useMutation(api.tasks.updateTask);
  // const deleteTaskMutation = useMutation(api.tasks.deleteTask); // TODO: Use when delete is implemented
  const reorderTasksMutation = useMutation(api.tasks.reorderTasks);
  
  // Track optimistic updates
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, Partial<Task>>>(new Map());
  
  // Store custom column mappings in state
  // This maps task IDs to their custom column IDs when they're in custom columns
  const [customColumnMappings, setCustomColumnMappings] = useState<Map<string, string>>(() => {
    const saved = safeLocalStorage.getItem<Array<[string, string]>>('customColumnMappings', {
      fallback: []
    });
    return new Map(saved || []);
  });

  // Save custom column mappings to localStorage when they change
  useEffect(() => {
    safeLocalStorage.setItem('customColumnMappings', Array.from(customColumnMappings.entries()));
  }, [customColumnMappings]);

  // Transform Convex tasks to match UI Task interface with optimistic updates
  const tasks: Task[] = useMemo(() => {
    if (!convexTasks) return [];
    
    console.log('Transforming tasks:', convexTasks.length, 'tasks from Convex');
    
    const baseTasks = convexTasks.map((task: any): Task => {
      // Check if this task has a custom column mapping
      const customColumnId = customColumnMappings.get(task._id);
      
      return {
        _id: task._id,
        title: task.title,
        description: task.description,
        // Use custom column if mapped, otherwise use the status-based column
        columnId: customColumnId || statusToColumnId(task.status),
        priority: task.priority,
        tagColor: task.tagColor,
        tagName: task.tagName,
        dueDate: task.dueDate,
        assignedUsers: task.assignedUsers, // For now, using IDs as strings
        attachments: task.attachments,
        order: task.order,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        completedAt: task.status === 'done' ? new Date(task.updatedAt) : undefined,
        // These fields need to be fetched separately or handled differently
        createdBy: 'User', // TODO: Fetch user name from ID
        watchers: [], // TODO: Implement watchers
        comments: [], // TODO: Fetch from comments table
        mentions: [] // TODO: Implement mentions
      };
    });
    
    // Apply optimistic updates
    return baseTasks.map((task: Task) => {
      const update = optimisticUpdates.get(task._id);
      if (update) {
        return { ...task, ...update };
      }
      return task;
    });
  }, [convexTasks, optimisticUpdates, customColumnMappings]);
  const [columns, setColumns] = useState<Column[]>(() => {
    return safeLocalStorage.getItem<Column[]>('kanbanColumns', {
      fallback: DEFAULT_COLUMNS,
      validate: (value) => Array.isArray(value) && value.length > 0
    }) || DEFAULT_COLUMNS;
  });
  const [boardName, setBoardName] = useState<string>(() => {
    return safeLocalStorage.getItem<string>('kanbanBoardName', {
      fallback: 'Kanban Board'
    }) || 'Kanban Board';
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalColumnId, setModalColumnId] = useState<string>('todo');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  // Save columns to localStorage when they change
  useEffect(() => {
    safeLocalStorage.setItem('kanbanColumns', columns);
  }, [columns]);

  // Save board name to localStorage when it changes
  useEffect(() => {
    safeLocalStorage.setItem('kanbanBoardName', boardName);
  }, [boardName]);

  // Memoize the first column ID to prevent unnecessary callback recreation
  const firstColumnId = useMemo(() => columns[0]?.id || 'todo', [columns]);
  
  // Ref to store the current firstColumnId without causing re-renders
  const firstColumnIdRef = useRef(firstColumnId);
  
  // Update ref when firstColumnId changes
  useEffect(() => {
    firstColumnIdRef.current = firstColumnId;
  }, [firstColumnId]);

  // Column management functions
  const handleAddColumn = () => {
    if (columns.length >= 4) return;
    
    const newColumn: Column = {
      id: `column_${Date.now()}`,
      title: `Column ${columns.length + 1}`,
      order: columns.length + 1
    };
    
    setColumns(prev => [...prev, newColumn]);
  };

  const handleDeleteColumn = (columnId: string) => {
    if (columns.length <= 2) return;
    
    // Clean up custom column mappings for the deleted column
    setCustomColumnMappings(prev => {
      const newMappings = new Map(prev);
      // Find all tasks mapped to this column and remove their mappings
      const tasksToRemove: string[] = [];
      newMappings.forEach((mappedColumnId, taskId) => {
        if (mappedColumnId === columnId) {
          tasksToRemove.push(taskId);
        }
      });
      tasksToRemove.forEach(taskId => newMappings.delete(taskId));
      return newMappings;
    });
    
    setColumns(prev => prev.filter(col => col.id !== columnId));
  };

  const handleRenameColumn = (columnId: string, newTitle: string) => {
    // Validate and clean the new title
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) return; // Don't allow empty titles
    
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, title: trimmedTitle } : col
    ));
  };

  const handleRenameBoardName = (newName: string) => {
    // Validate and clean the new name
    const trimmedName = newName.trim();
    if (!trimmedName) return; // Don't allow empty names
    
    setBoardName(trimmedName);
  };

  const handleTaskMove = async (taskId: string, newColumnId: string, newOrder: number) => {
    if (!currentWorkspace || !currentUser) {
      ErrorHandler.handle(new Error('No workspace or user selected'), 'Please log in and select a workspace');
      return;
    }
    
    const task = tasks.find(t => t._id === taskId);
    if (!task) {
      console.error('Task not found:', taskId);
      return;
    }
    
    console.log(`Moving task "${task.title}" from ${task.columnId} to ${newColumnId} with order ${newOrder}`);
    
    // Check if moving to a custom column
    const isCustomColumn = !['todo', 'in_progress', 'done'].includes(newColumnId);
    
    // Update custom column mapping
    if (isCustomColumn) {
      setCustomColumnMappings(prev => {
        const newMappings = new Map(prev);
        newMappings.set(taskId, newColumnId);
        return newMappings;
      });
    } else {
      // Remove custom column mapping if moving back to standard column
      setCustomColumnMappings(prev => {
        const newMappings = new Map(prev);
        newMappings.delete(taskId);
        return newMappings;
      });
    }
    
    // Apply optimistic update
    setOptimisticUpdates(prev => {
      const updates = new Map(prev);
      updates.set(taskId, {
        columnId: newColumnId,
        order: newOrder
      });
      return updates;
    });
    
    try {
      await reorderTasksMutation({
        taskId: taskId as Id<"tasks">,
        newStatus: columnIdToStatus(newColumnId),
        newOrder: newOrder,
        auth0Id: currentUser?.auth0Id
      });
      console.log(`Successfully moved task "${task.title}"`);
      
      // Clear optimistic update on success
      setOptimisticUpdates(prev => {
        const updates = new Map(prev);
        updates.delete(taskId);
        return updates;
      });
    } catch (error) {
      console.error('Error moving task:', error);
      
      // Revert optimistic update on error
      setOptimisticUpdates(prev => {
        const updates = new Map(prev);
        updates.delete(taskId);
        return updates;
      });
      
      // Revert custom column mapping on error
      if (isCustomColumn) {
        setCustomColumnMappings(prev => {
          const newMappings = new Map(prev);
          newMappings.delete(taskId);
          return newMappings;
        });
      }
      
      ErrorHandler.handle(error, 'Failed to move task. Please try again.');
    }
  };

  const handleAddTask = (columnId: string) => {
    setModalColumnId(columnId);
    setIsModalOpen(true);
  };

  // Create a stable callback that uses the ref for the column ID
  const stableAddTaskCallback = useCallback(() => {
    handleAddTask(firstColumnIdRef.current);
  }, []); // Empty dependency array - this function never recreates

  // Register the add task callback with the Layout - using stable callback
  useEffect(() => {
    setAddTaskCallback(() => stableAddTaskCallback); // Wrap in function to prevent immediate execution
    return () => {
      setAddTaskCallback(() => null);
    };
  }, [setAddTaskCallback, stableAddTaskCallback]);

  const handleCreateTask = async (taskData: any) => {
    if (!currentWorkspace || !currentUser) {
      ErrorHandler.handle(new Error('Workspace or user not found'), 'Please log in and select a workspace');
      return;
    }
    
    try {
      const result = await createTaskMutation({
        workspaceId: currentWorkspace.id as Id<"workspaces">,
        title: taskData.title,
        description: taskData.description || '',
        status: columnIdToStatus(modalColumnId),
        priority: taskData.priority || 'medium',
        tagColor: taskData.tagColor || '#3B82F6',
        tagName: taskData.tagName || 'General',
        dueDate: taskData.dueDate,
        assignedUsers: taskData.assignedUsers || [],
        auth0Id: currentUser.auth0Id
      });
      
      // If task was created in a custom column, save the mapping
      const isCustomColumn = !['todo', 'in_progress', 'done'].includes(modalColumnId);
      if (isCustomColumn && result) {
        setCustomColumnMappings(prev => {
          const newMappings = new Map(prev);
          newMappings.set(result, modalColumnId);
          return newMappings;
        });
      }
      
      setIsModalOpen(false);
    } catch (error) {
      ErrorHandler.handle(error, 'Failed to create task. Please try again.');
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleTaskUpdate = async (updatedTask: Task, commentOnly?: boolean) => {
    if (!currentWorkspace) {
      ErrorHandler.handle(new Error('No workspace selected'), 'Please select a workspace');
      return;
    }
    
    try {
      // If it's not comment-only, update the task
      if (!commentOnly) {
        await updateTaskMutation({
          id: updatedTask._id as Id<"tasks">,
          title: updatedTask.title,
          description: updatedTask.description,
          status: columnIdToStatus(updatedTask.columnId),
          priority: updatedTask.priority as 'low' | 'medium' | 'high',
          tagColor: updatedTask.tagColor,
          tagName: updatedTask.tagName,
          dueDate: updatedTask.dueDate,
          assignedUsers: updatedTask.assignedUsers as Id<"users">[],
          auth0Id: currentUser?.auth0Id
        });
        setIsEditModalOpen(false);
        setSelectedTask(null);
      }
      // TODO: Handle comment updates when comment API is integrated
    } catch (error) {
      ErrorHandler.handle(error, 'Failed to update task. Please try again.');
    }
  };



  // Apply filters to tasks
  const filteredTasks = tasks.filter(task => {
    if (filters.priority?.length && !filters.priority.includes(task.priority)) {
      return false;
    }
    if (filters.category?.length && !filters.category.includes(task.tagName)) {
      return false;
    }
    if (filters.assignedUsers?.length) {
      const hasAssignedUser = task.assignedUsers.some(user => 
        filters.assignedUsers?.includes(user)
      );
      if (!hasAssignedUser) return false;
    }
    return true;
  });

  // Show loading state while fetching data
  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            Please select a workspace to view tasks
          </div>
          <button 
            onClick={() => window.location.href = '/settings'}
            className="text-primary-600 hover:text-primary-700 underline"
          >
            Go to Settings
          </button>
        </div>
      </div>
    );
  }
  
  if (convexTasks === undefined) {
    return <DashboardSkeleton />;
  }
  
  // Error state
  if (convexTasks === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            Failed to load tasks
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="text-primary-600 hover:text-primary-700 underline"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <KanbanBoard 
        tasks={filteredTasks}
        columns={columns}
        boardName={boardName}
        onTaskMove={handleTaskMove}
        onAddTask={handleAddTask}
        onTaskClick={handleTaskClick}
        onAddColumn={handleAddColumn}
        onDeleteColumn={handleDeleteColumn}
        onRenameColumn={handleRenameColumn}
        onRenameBoardName={handleRenameBoardName}
      />

      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleCreateTask}
        />
      )}

      {isEditModalOpen && selectedTask && (
        <TaskEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onSave={handleTaskUpdate}
        />
      )}

      {process.env.NODE_ENV === 'development' && showOrderDebugger && (
        <TaskOrderDebugger />
      )}
    </div>
  );
};