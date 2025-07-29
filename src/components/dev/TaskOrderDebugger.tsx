import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useAuth } from '../../contexts/AuthContext';

export const TaskOrderDebugger: React.FC = () => {
  const { currentWorkspace } = useAuth();
  const taskOrders = useQuery(
    api.tasks.getTaskOrders, 
    currentWorkspace ? { workspaceId: currentWorkspace.id as Id<"workspaces"> } : "skip"
  );
  const normalizeAllColumns = useMutation(api.tasks.normalizeAllColumns);

  if (!currentWorkspace) {
    return null;
  }

  const handleNormalize = async () => {
    try {
      await normalizeAllColumns({ workspaceId: currentWorkspace.id as Id<"workspaces"> });
      console.log('Successfully normalized all columns');
    } catch (error) {
      console.error('Failed to normalize columns:', error);
    }
  };

  if (!taskOrders) {
    return <div>Loading task orders...</div>;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-md">
      <h3 className="text-sm font-semibold mb-2">Task Order Debug Info</h3>
      
      <div className="space-y-2 text-xs">
        {Object.entries(taskOrders).map(([status, tasks]) => (
          <div key={status}>
            <h4 className="font-medium capitalize">{status.replace('_', ' ')}:</h4>
            <div className="ml-2">
              {tasks.length === 0 ? (
                <span className="text-gray-500">No tasks</span>
              ) : (
                tasks.map((task, index) => (
                  <div key={task.id} className="flex justify-between">
                    <span className="truncate max-w-[200px]">{task.title}</span>
                    <span className="ml-2 font-mono">order: {task.order}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleNormalize}
        className="mt-3 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
      >
        Normalize All Orders
      </button>
      
      <div className="mt-2 text-xs text-gray-500">
        Click to fix any order collisions
      </div>
    </div>
  );
};