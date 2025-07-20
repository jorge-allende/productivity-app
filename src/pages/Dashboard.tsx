import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskModal } from '../components/ui/TaskModal';
import { TaskEditModal } from '../components/ui/TaskEditModal';
import { Task } from '../types/Task';
import { Column, DEFAULT_COLUMNS } from '../types/Column';
import { useDashboardContext } from '../contexts/DashboardContext';

// Mock data for development
const mockTasks: Task[] = [
  {
    _id: '1',
    title: 'Design new landing page',
    description: 'Create a modern and responsive landing page design',
    columnId: 'todo',
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
    columnId: 'in_progress',
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
    columnId: 'done',
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
    
    // Move tasks from deleted column to the first column
    const firstColumnId = columns[0].id;
    setTasks(prev => prev.map(task => 
      task.columnId === columnId ? { ...task, columnId: firstColumnId } : task
    ));
    
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

  const handleTaskMove = (taskId: string, newColumnId: string, newOrder: number) => {
    const now = new Date();
    setTasks(prev => prev.map(task => {
      if (task._id === taskId) {
        const updatedTask = { 
          ...task, 
          columnId: newColumnId, 
          order: newOrder,
          updatedAt: now
        };
        
        // Set completedAt when moved to done column, clear it when moved away from done
        const doneColumn = columns.find(col => col.title.toLowerCase().includes('done'));
        if (newColumnId === doneColumn?.id && task.columnId !== doneColumn?.id) {
          updatedTask.completedAt = now;
        } else if (newColumnId !== doneColumn?.id && task.columnId === doneColumn?.id) {
          updatedTask.completedAt = undefined;
        }
        
        return updatedTask;
      }
      return task;
    }));
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

  const handleCreateTask = (taskData: any) => {
    const now = new Date();
    const newTask: Task = {
      _id: Date.now().toString(),
      ...taskData,
      columnId: modalColumnId,
      attachments: [],
      order: tasks.filter(t => t.columnId === modalColumnId).length + 1,
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