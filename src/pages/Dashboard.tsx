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

// Import api with require to avoid TypeScript depth issues
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
  const columnMap: Record<string, 'todo' | 'in_progress' | 'done'> = {
    'todo': 'todo',
    'in_progress': 'in_progress',
    'done': 'done'
  };
  return columnMap[columnId] || 'todo';
};

export const Dashboard: React.FC = () => {
  const { filters, setAddTaskCallback } = useDashboardContext();
  const { currentWorkspace } = useWorkspace();
  const { currentUser } = useAuth();
  
  // Convex queries and mutations
  const convexTasks = useQuery(api.tasks.getTasks, 
    currentWorkspace ? { workspaceId: currentWorkspace.id as Id<"workspaces"> } : "skip"
  );
  const createTaskMutation = useMutation(api.tasks.createTask);
  const updateTaskMutation = useMutation(api.tasks.updateTask);
  // const deleteTaskMutation = useMutation(api.tasks.deleteTask); // TODO: Use when delete is implemented
  const reorderTasksMutation = useMutation(api.tasks.reorderTasks);
  
  // Transform Convex tasks to match UI Task interface
  const tasks: Task[] = useMemo(() => {
    if (!convexTasks) return [];
    
    return convexTasks.map((task: any): Task => ({
      _id: task._id,
      title: task.title,
      description: task.description,
      columnId: statusToColumnId(task.status),
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
    }));
  }, [convexTasks]);
  const [columns, setColumns] = useState<Column[]>(() => {
    const saved = localStorage.getItem('kanbanColumns');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved columns:', e);
      }
    }
    return DEFAULT_COLUMNS;
  });
  const [boardName, setBoardName] = useState<string>(() => {
    const saved = localStorage.getItem('kanbanBoardName');
    return saved || 'Kanban Board';
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalColumnId, setModalColumnId] = useState<string>('todo');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  // Save columns to localStorage when they change
  useEffect(() => {
    localStorage.setItem('kanbanColumns', JSON.stringify(columns));
  }, [columns]);

  // Save board name to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('kanbanBoardName', boardName);
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
    
    // TODO: Move tasks from deleted column to the first column using Convex mutation
    // const firstColumnId = columns[0].id;
    // Need to update all tasks in the deleted column to move to first column
    
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
    if (!currentWorkspace) return;
    
    try {
      await reorderTasksMutation({
        taskId: taskId as Id<"tasks">,
        newStatus: columnIdToStatus(newColumnId),
        newOrder: newOrder
      });
    } catch (error) {
      console.error('Failed to move task:', error);
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
    if (!currentWorkspace || !currentUser) return;
    
    try {
      await createTaskMutation({
        workspaceId: currentWorkspace.id as Id<"workspaces">,
        title: taskData.title,
        description: taskData.description || '',
        status: columnIdToStatus(modalColumnId),
        priority: taskData.priority || 'medium',
        tagColor: taskData.tagColor || '#3B82F6',
        tagName: taskData.tagName || 'General',
        dueDate: taskData.dueDate,
        assignedUsers: taskData.assignedUsers || [],
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleTaskUpdate = async (updatedTask: Task, commentOnly?: boolean) => {
    if (!currentWorkspace) return;
    
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
        });
        setIsEditModalOpen(false);
        setSelectedTask(null);
      }
      // TODO: Handle comment updates when comment API is integrated
    } catch (error) {
      console.error('Failed to update task:', error);
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
        <div className="text-gray-500 dark:text-gray-400">
          Please select a workspace to view tasks
        </div>
      </div>
    );
  }
  
  if (convexTasks === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">
          Loading tasks...
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
    </div>
  );
};