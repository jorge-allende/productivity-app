import { Task } from '../types/Task';

// Helper function to generate dates
const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// Mock user IDs that match our mock users
export const mockUserIds = {
  dev: 'dev_user_123',
  test: 'test_user_456', 
  jane: 'jane_doe_789',
  john: 'john_smith_101',
  sarah: 'sarah_chen_102',
  mike: 'mike_wilson_103'
};

// Comprehensive mock tasks for development
export const mockTasks: Task[] = [
  // TODO Column Tasks
  {
    _id: 'task_001',
    title: 'Implement user authentication flow',
    description: 'Set up Auth0 integration with proper error handling and token refresh logic. Include social login options.',
    columnId: 'todo',
    priority: 'high',
    tagColor: '#ef4444',
    tagName: 'Backend',
    dueDate: daysFromNow(7),
    assignedUsers: [mockUserIds.dev, mockUserIds.john],
    attachments: [
      { name: 'auth-flow-diagram.pdf', url: '#', type: 'application/pdf' },
      { name: 'requirements.docx', url: '#', type: 'application/msword' }
    ],
    order: 1,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(2),
    createdBy: mockUserIds.dev,
    watchers: [mockUserIds.sarah],
    comments: [
      {
        id: 'comment_001',
        user: 'John Smith',
        message: 'Should we include Google and GitHub as social login options?',
        timestamp: daysAgo(1)
      },
      {
        id: 'comment_002', 
        user: 'Dev User',
        message: 'Yes, let\'s start with Google and add GitHub in phase 2.',
        timestamp: daysAgo(1)
      }
    ],
    mentions: []
  },
  {
    _id: 'task_002',
    title: 'Design new landing page',
    description: 'Create a modern, responsive landing page design that showcases our key features. Include hero section, features grid, testimonials, and pricing.',
    columnId: 'todo',
    priority: 'medium',
    tagColor: '#3b82f6',
    tagName: 'Design',
    dueDate: daysFromNow(10),
    assignedUsers: [mockUserIds.sarah],
    attachments: [
      { name: 'inspiration-board.png', url: '#', type: 'image/png' }
    ],
    order: 2,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    createdBy: mockUserIds.sarah,
    watchers: [mockUserIds.dev, mockUserIds.mike],
    comments: [],
    mentions: []
  },
  {
    _id: 'task_003',
    title: 'Add real-time notifications',
    description: 'Implement WebSocket-based real-time notifications for task updates, comments, and mentions.',
    columnId: 'todo',
    priority: 'medium',
    tagColor: '#8b5cf6',
    tagName: 'Feature',
    dueDate: daysFromNow(14),
    assignedUsers: [mockUserIds.mike],
    attachments: [],
    order: 3,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    createdBy: mockUserIds.dev,
    watchers: [],
    comments: [],
    mentions: []
  },
  {
    _id: 'task_004',
    title: 'Optimize database queries',
    description: 'Review and optimize slow database queries identified in performance monitoring.',
    columnId: 'todo',
    priority: 'low',
    tagColor: '#f59e0b',
    tagName: 'Performance',
    assignedUsers: [mockUserIds.john],
    attachments: [],
    order: 4,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
    createdBy: mockUserIds.mike,
    watchers: [],
    comments: [],
    mentions: []
  },
  {
    _id: 'task_005',
    title: 'Create API documentation',
    description: 'Document all REST API endpoints with examples and response schemas.',
    columnId: 'todo',
    priority: 'low',
    tagColor: '#6366f1',
    tagName: 'Documentation',
    assignedUsers: [],
    attachments: [],
    order: 5,
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
    createdBy: mockUserIds.test,
    watchers: [],
    comments: [],
    mentions: []
  },

  // IN PROGRESS Column Tasks
  {
    _id: 'task_006',
    title: 'Implement drag and drop functionality',
    description: 'Add drag and drop support for tasks between columns with proper visual feedback and animations.',
    columnId: 'in_progress',
    priority: 'high',
    tagColor: '#8b5cf6',
    tagName: 'Feature',
    dueDate: daysFromNow(3),
    assignedUsers: [mockUserIds.dev],
    attachments: [
      { name: 'dnd-library-comparison.xlsx', url: '#', type: 'application/excel' }
    ],
    order: 1,
    createdAt: daysAgo(8),
    updatedAt: daysAgo(0),
    createdBy: mockUserIds.dev,
    watchers: [mockUserIds.jane, mockUserIds.sarah],
    comments: [
      {
        id: 'comment_003',
        user: 'Jane Doe',
        message: 'Make sure to test on mobile devices too!',
        timestamp: daysAgo(0)
      }
    ],
    mentions: [mockUserIds.jane]
  },
  {
    _id: 'task_007',
    title: 'Fix responsive layout issues',
    description: 'Address layout problems on tablet and mobile viewports. Focus on the dashboard and calendar views.',
    columnId: 'in_progress',
    priority: 'high',
    tagColor: '#dc2626',
    tagName: 'Bug',
    dueDate: daysFromNow(2),
    assignedUsers: [mockUserIds.sarah, mockUserIds.jane],
    attachments: [],
    order: 2,
    createdAt: daysAgo(6),
    updatedAt: daysAgo(0),
    createdBy: mockUserIds.test,
    watchers: [],
    comments: [
      {
        id: 'comment_004',
        user: 'Sarah Chen',
        message: 'Found issues on iPad Pro and iPhone 12. Working on fixes.',
        timestamp: daysAgo(0)
      }
    ],
    mentions: []
  },
  {
    _id: 'task_008',
    title: 'Add dark mode support',
    description: 'Implement system-wide dark mode with proper color contrast and theme switching.',
    columnId: 'in_progress',
    priority: 'medium',
    tagColor: '#3b82f6',
    tagName: 'Design',
    dueDate: daysFromNow(5),
    assignedUsers: [mockUserIds.sarah],
    attachments: [
      { name: 'dark-theme-palette.fig', url: '#', type: 'application/figma' }
    ],
    order: 3,
    createdAt: daysAgo(4),
    updatedAt: daysAgo(1),
    createdBy: mockUserIds.sarah,
    watchers: [mockUserIds.dev],
    comments: [],
    mentions: []
  },
  {
    _id: 'task_009',
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing, building, and deployment to staging/production.',
    columnId: 'in_progress',
    priority: 'medium',
    tagColor: '#10b981',
    tagName: 'DevOps',
    assignedUsers: [mockUserIds.mike],
    attachments: [],
    order: 4,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(2),
    createdBy: mockUserIds.mike,
    watchers: [mockUserIds.john],
    comments: [],
    mentions: []
  },

  // DONE Column Tasks
  {
    _id: 'task_010',
    title: 'Set up project repository',
    description: 'Initialize Git repository with proper .gitignore, README, and branch protection rules.',
    columnId: 'done',
    priority: 'high',
    tagColor: '#10b981',
    tagName: 'DevOps',
    assignedUsers: [mockUserIds.mike],
    attachments: [],
    order: 1,
    createdAt: daysAgo(15),
    updatedAt: daysAgo(12),
    completedAt: daysAgo(12),
    createdBy: mockUserIds.mike,
    watchers: [],
    comments: [],
    mentions: []
  },
  {
    _id: 'task_011',
    title: 'Create initial React app structure',
    description: 'Set up React 19 with TypeScript, configure folder structure, and add essential dependencies.',
    columnId: 'done',
    priority: 'high',
    tagColor: '#ef4444',
    tagName: 'Backend',
    assignedUsers: [mockUserIds.dev, mockUserIds.john],
    attachments: [],
    order: 2,
    createdAt: daysAgo(14),
    updatedAt: daysAgo(11),
    completedAt: daysAgo(11),
    createdBy: mockUserIds.dev,
    watchers: [],
    comments: [
      {
        id: 'comment_005',
        user: 'John Smith',
        message: 'Great job on the folder structure! Very clean.',
        timestamp: daysAgo(11)
      }
    ],
    mentions: []
  },
  {
    _id: 'task_012',
    title: 'Design database schema',
    description: 'Create Convex schema for tasks, users, workspaces, and comments with proper relationships.',
    columnId: 'done',
    priority: 'high',
    tagColor: '#f59e0b',
    tagName: 'Database',
    dueDate: daysFromNow(-10),
    assignedUsers: [mockUserIds.john],
    attachments: [
      { name: 'schema-diagram.pdf', url: '#', type: 'application/pdf' }
    ],
    order: 3,
    createdAt: daysAgo(13),
    updatedAt: daysAgo(10),
    completedAt: daysAgo(10),
    createdBy: mockUserIds.john,
    watchers: [mockUserIds.dev],
    comments: [],
    mentions: []
  },
  {
    _id: 'task_013',
    title: 'Configure TailwindCSS',
    description: 'Set up TailwindCSS with custom theme, colors, and utility classes.',
    columnId: 'done',
    priority: 'medium',
    tagColor: '#3b82f6',
    tagName: 'Design',
    assignedUsers: [mockUserIds.sarah],
    attachments: [],
    order: 4,
    createdAt: daysAgo(12),
    updatedAt: daysAgo(9),
    completedAt: daysAgo(9),
    createdBy: mockUserIds.sarah,
    watchers: [],
    comments: [],
    mentions: []
  },
  {
    _id: 'task_014',
    title: 'Write unit tests for utils',
    description: 'Add comprehensive unit tests for utility functions and custom hooks.',
    columnId: 'done',
    priority: 'low',
    tagColor: '#10b981',
    tagName: 'Testing',
    assignedUsers: [mockUserIds.jane],
    attachments: [],
    order: 5,
    createdAt: daysAgo(11),
    updatedAt: daysAgo(8),
    completedAt: daysAgo(8),
    createdBy: mockUserIds.test,
    watchers: [],
    comments: [
      {
        id: 'comment_006',
        user: 'Test User',
        message: 'Coverage is now at 95%! 🎉',
        timestamp: daysAgo(8)
      }
    ],
    mentions: []
  },
  {
    _id: 'task_015',
    title: 'Add ESLint and Prettier',
    description: 'Configure code linting and formatting with pre-commit hooks.',
    columnId: 'done',
    priority: 'low',
    tagColor: '#6366f1',
    tagName: 'Tooling',
    assignedUsers: [mockUserIds.mike],
    attachments: [],
    order: 6,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(7),
    completedAt: daysAgo(7),
    createdBy: mockUserIds.mike,
    watchers: [],
    comments: [],
    mentions: []
  }
];

// Mock users for assignment dropdowns and filters
export const mockUsers = [
  {
    _id: mockUserIds.dev,
    name: 'Dev User',
    email: 'dev@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Dev+User&background=3b82f6&color=fff',
    role: 'Admin'
  },
  {
    _id: mockUserIds.test,
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Test+User&background=10b981&color=fff',
    role: 'Manager'
  },
  {
    _id: mockUserIds.jane,
    name: 'Jane Doe',
    email: 'jane@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Doe&background=f59e0b&color=fff',
    role: 'Manager'
  },
  {
    _id: mockUserIds.john,
    name: 'John Smith',
    email: 'john@example.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=8b5cf6&color=fff',
    role: 'Admin'
  },
  {
    _id: mockUserIds.sarah,
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=ec4899&color=fff',
    role: 'Manager'
  },
  {
    _id: mockUserIds.mike,
    name: 'Mike Wilson',
    email: 'mike@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Wilson&background=06b6d4&color=fff',
    role: 'Manager'
  }
];

// Get user by ID helper
export const getUserById = (userId: string) => {
  return mockUsers.find(user => user._id === userId);
};

// Get users by IDs helper
export const getUsersByIds = (userIds: string[]) => {
  return userIds.map(id => getUserById(id)).filter(Boolean);
};