import { useCallback } from 'react';
import { useMutation } from 'convex/react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { ErrorHandler } from '../utils/errorHandling';
import type { Id } from '../convex/_generated/dataModel';
import type { Task } from '../types/Task';

const { api } = require('../convex/_generated/api');

/**
 * Custom hook for task operations with proper error handling and validation
 */
export const useTaskOperations = () => {
  const { currentUser } = useAuth();
  const { currentWorkspace } = useWorkspace();
  
  const createTaskMutation = useMutation(api.tasks.createTask);
  const updateTaskMutation = useMutation(api.tasks.updateTask);
  const reorderTasksMutation = useMutation(api.tasks.reorderTasks);

  const validateOperationContext = useCallback(() => {
    if (!currentWorkspace || !currentUser) {
      throw new Error('No workspace or user selected');
    }
    return { currentUser, currentWorkspace };
  }, [currentUser, currentWorkspace]);

  const createTask = useCallback(async (taskData: any, columnId: string) => {
    const { currentUser, currentWorkspace } = validateOperationContext();
    
    return ErrorHandler.wrapAsync(async () => {
      return await createTaskMutation({
        workspaceId: currentWorkspace.id as Id<"workspaces">,
        title: taskData.title,
        description: taskData.description || '',
        status: columnIdToStatus(columnId),
        priority: taskData.priority || 'medium',
        tagColor: taskData.tagColor || '#3B82F6',
        tagName: taskData.tagName || 'General',
        dueDate: taskData.dueDate,
        assignedUsers: taskData.assignedUsers || [],
        auth0Id: currentUser.auth0Id
      });
    }, 'Failed to create task');
  }, [createTaskMutation, validateOperationContext]);

  const updateTask = useCallback(async (updatedTask: Task, commentOnly?: boolean) => {
    if (commentOnly) return; // Handle comment-only updates separately
    
    const { currentUser } = validateOperationContext();
    
    return ErrorHandler.wrapAsync(async () => {
      return await updateTaskMutation({
        id: updatedTask._id as Id<"tasks">,
        title: updatedTask.title,
        description: updatedTask.description,
        status: columnIdToStatus(updatedTask.columnId),
        priority: updatedTask.priority as 'low' | 'medium' | 'high',
        tagColor: updatedTask.tagColor,
        tagName: updatedTask.tagName,
        dueDate: updatedTask.dueDate,
        assignedUsers: updatedTask.assignedUsers as Id<"users">[],
        auth0Id: currentUser.auth0Id
      });
    }, 'Failed to update task');
  }, [updateTaskMutation, validateOperationContext]);

  const moveTask = useCallback(async (
    taskId: string, 
    newColumnId: string, 
    newOrder: number,
    onOptimisticUpdate?: (taskId: string, update: Partial<Task>) => void,
    onRevertOptimistic?: (taskId: string) => void
  ) => {
    const { currentUser } = validateOperationContext();
    
    // Apply optimistic update
    onOptimisticUpdate?.(taskId, {
      columnId: newColumnId,
      order: newOrder
    });
    
    try {
      await reorderTasksMutation({
        taskId: taskId as Id<"tasks">,
        newStatus: columnIdToStatus(newColumnId),
        newOrder: newOrder,
        auth0Id: currentUser.auth0Id
      });
    } catch (error) {
      // Revert optimistic update on error
      onRevertOptimistic?.(taskId);
      ErrorHandler.handle(error, 'Failed to move task. Please try again.');
      throw error;
    }
  }, [reorderTasksMutation, validateOperationContext]);

  return {
    createTask,
    updateTask,
    moveTask,
    isValid: !!(currentUser && currentWorkspace)
  };
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