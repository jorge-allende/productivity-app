import React, { useState, useEffect } from 'react';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskModal } from '../components/ui/TaskModal';
import { TaskEditModal } from '../components/ui/TaskEditModal';
import { Task } from '../types/Task';
import { useDashboardContext } from '../contexts/DashboardContext';

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
    // Time tracking
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000), // 1 day ago
    // Enhanced collaboration
    createdBy: 'Alex',
    watchers: ['Alex', 'John', 'Sarah', 'Emma'],
    comments: [
      {
        id: '1',
        user: 'Alex',
        message: 'Please make sure to follow the brand guidelines for this design.',
        timestamp: new Date(Date.now() - 86400000),
        isEdited: false
      },
      {
        id: '2',
        user: 'John',
        message: 'Should we include the new testimonials section?',
        timestamp: new Date(Date.now() - 43200000),
        isEdited: false
      },
      {
        id: '7',
        user: 'Current User',
        message: 'I can work on the testimonials section. Let me create a mockup first.',
        timestamp: new Date(Date.now() - 7200000),
        isEdited: false
      }
    ],
    mentions: ['Sarah'],
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
    // Time tracking
    createdAt: new Date(Date.now() - 259200000), // 3 days ago
    updatedAt: new Date(Date.now() - 3600000), // 1 hour ago
    // Enhanced collaboration
    createdBy: 'Sarah',
    watchers: ['Sarah', 'Mike', 'Alex'],
    comments: [
      {
        id: '3',
        user: 'Sarah',
        message: 'Make sure to implement proper password hashing with bcrypt and add rate limiting to prevent brute force attacks.',
        timestamp: new Date(Date.now() - 259200000),
        isEdited: true,
        editedAt: new Date(Date.now() - 172800000),
        editHistory: [
          {
            message: 'Make sure to implement proper password hashing and rate limiting.',
            editedAt: new Date(Date.now() - 259200000)
          }
        ]
      },
      {
        id: '4',
        user: 'Mike',
        message: 'Working on the JWT implementation now. Should be ready for review tomorrow.',
        timestamp: new Date(Date.now() - 3600000),
        isEdited: false
      }
    ],
    mentions: [],
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
    // Time tracking
    createdAt: new Date(Date.now() - 432000000), // 5 days ago
    updatedAt: new Date(Date.now() - 345600000), // 4 days ago
    completedAt: new Date(Date.now() - 345600000), // 4 days ago
    // Enhanced collaboration
    createdBy: 'Alex',
    watchers: ['Alex', 'Emma'],
    comments: [
      {
        id: '5',
        user: 'Alex',
        message: 'Please include examples for each endpoint.',
        timestamp: new Date(Date.now() - 432000000),
        isEdited: false
      },
      {
        id: '6',
        user: 'Emma',
        message: 'Documentation is complete and published!',
        timestamp: new Date(Date.now() - 345600000),
        isEdited: false
      }
    ],
    mentions: [],
  },
];

export const Dashboard: React.FC = () => {
  const { filters, setAddTaskCallback } = useDashboardContext();
  const [tasks, setTasks] = useState(mockTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  // Register the add task callback with the Layout
  useEffect(() => {
    setAddTaskCallback(() => handleAddTask('todo'));
    return () => setAddTaskCallback(null);
  }, [setAddTaskCallback]);

  const handleTaskMove = (taskId: string, newStatus: 'todo' | 'in_progress' | 'done', newOrder: number) => {
    const now = new Date();
    setTasks(prev => prev.map(task => {
      if (task._id === taskId) {
        const updatedTask = { 
          ...task, 
          status: newStatus, 
          order: newOrder,
          updatedAt: now
        };
        
        // Set completedAt when moved to done, clear it when moved away from done
        if (newStatus === 'done' && task.status !== 'done') {
          updatedTask.completedAt = now;
        } else if (newStatus !== 'done' && task.status === 'done') {
          updatedTask.completedAt = undefined;
        }
        
        return updatedTask;
      }
      return task;
    }));
  };

  const handleAddTask = (status: 'todo' | 'in_progress' | 'done') => {
    setModalStatus(status);
    setIsModalOpen(true);
  };

  const handleCreateTask = (taskData: any) => {
    const now = new Date();
    const newTask: Task = {
      _id: Date.now().toString(),
      ...taskData,
      status: modalStatus,
      attachments: [],
      order: tasks.filter(t => t.status === modalStatus).length + 1,
      // Time tracking
      createdAt: now,
      updatedAt: now,
      // Enhanced collaboration
      createdBy: 'Current User', // In real app, this would come from authentication
      watchers: ['Current User'], // Creator automatically watches the task
      comments: [],
      mentions: [],
    };
    setTasks(prev => [...prev, newTask]);
    setIsModalOpen(false);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleTaskUpdate = (updatedTask: Task, commentOnly?: boolean) => {
    setTasks(prev => prev.map(task => 
      task._id === updatedTask._id ? { ...updatedTask, updatedAt: new Date() } : task
    ));
    
    // Only close modal if it's not a comment-only update
    if (!commentOnly) {
      setIsEditModalOpen(false);
      setSelectedTask(null);
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

  return (
    <div>
      <KanbanBoard 
        tasks={filteredTasks} 
        onTaskMove={handleTaskMove}
        onAddTask={handleAddTask}
        onTaskClick={handleTaskClick}
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