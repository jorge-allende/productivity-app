import React, { useState } from 'react';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskModal } from '../components/ui/TaskModal';
import { Task } from '../types/Task';

// Mock data for development
const mockTasks: Task[] = [
  {
    _id: '1',
    title: 'Design new landing page',
    description: 'Create a modern and responsive landing page design',
    status: 'todo' as const,
    priority: 'high' as const,
    tagColor: '#3B82F6',
    tagName: 'Design',
    dueDate: new Date().toISOString(),
    assignedUsers: ['John', 'Sarah'],
    attachments: [],
    order: 1,
  },
  {
    _id: '2',
    title: 'Implement authentication',
    description: 'Add user authentication with JWT tokens',
    status: 'in_progress' as const,
    priority: 'high' as const,
    tagColor: '#10B981',
    tagName: 'Development',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    assignedUsers: ['Mike'],
    attachments: [{ name: 'auth-flow.pdf', url: '#', type: 'pdf' }],
    order: 1,
  },
  {
    _id: '3',
    title: 'Write documentation',
    description: 'Document the API endpoints and usage',
    status: 'done' as const,
    priority: 'medium' as const,
    tagColor: '#F59E0B',
    tagName: 'Documentation',
    assignedUsers: ['Emma'],
    attachments: [],
    order: 1,
  },
];

export const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState(mockTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');

  const handleTaskMove = (taskId: string, newStatus: 'todo' | 'in_progress' | 'done', newOrder: number) => {
    setTasks(prev => prev.map(task => 
      task._id === taskId 
        ? { ...task, status: newStatus, order: newOrder }
        : task
    ));
  };

  const handleAddTask = (status: 'todo' | 'in_progress' | 'done') => {
    setModalStatus(status);
    setIsModalOpen(true);
  };

  const handleCreateTask = (taskData: any) => {
    const newTask = {
      _id: Date.now().toString(),
      ...taskData,
      status: modalStatus,
      attachments: [],
      order: tasks.filter(t => t.status === modalStatus).length + 1,
    };
    setTasks(prev => [...prev, newTask]);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Board</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your tasks efficiently</p>
      </div>

      <KanbanBoard 
        tasks={tasks} 
        onTaskMove={handleTaskMove}
        onAddTask={handleAddTask}
      />

      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleCreateTask}
        />
      )}
    </div>
  );
};