import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { KanbanBoard } from './kanban/KanbanBoard';
import { Task } from '../types/Task';

// Mock the dnd-kit components
jest.mock('@dnd-kit/core', () => ({
  ...jest.requireActual('@dnd-kit/core'),
  DndContext: ({ children, onDragEnd }: any) => {
    // Store onDragEnd for testing
    (global as any).__mockOnDragEnd = onDragEnd;
    return <div data-testid="dnd-context">{children}</div>;
  },
  DragOverlay: ({ children }: any) => <div data-testid="drag-overlay">{children}</div>,
  useSensor: jest.fn(),
  useSensors: jest.fn(() => []),
  PointerSensor: jest.fn(),
  KeyboardSensor: jest.fn(),
  closestCorners: jest.fn(),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => <div data-testid="sortable-context">{children}</div>,
  verticalListSortingStrategy: jest.fn(),
  useSortable: jest.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

// Mock KanbanColumn
jest.mock('./kanban/KanbanColumn', () => ({
  __esModule: true,
  default: ({ column, tasks, onTaskUpdate, onTaskDelete, onAddTask }: any) => (
    <div data-testid={`column-${column.id}`}>
      <h3>{column.title}</h3>
      <div>Tasks: {tasks.length}</div>
      {tasks.map((task: Task) => (
        <div key={task._id} data-testid={`task-${task._id}`}>
          {task.title}
        </div>
      ))}
      <button onClick={() => onAddTask(column.id)}>Add Task</button>
    </div>
  ),
}));

// Mock TaskCard
jest.mock('./kanban/TaskCard', () => ({
  __esModule: true,
  default: ({ task }: any) => (
    <div data-testid={`task-card-${task._id}`}>
      {task.title}
    </div>
  ),
}));

describe('KanbanBoard', () => {
  const mockTasks: Task[] = [
    {
      _id: '1',
      workspaceId: 'workspace1',
      title: 'Todo Task 1',
      description: 'Description 1',
      status: 'todo',
      priority: 'high',
      tagColor: '#FF6B6B',
      tagName: 'Bug',
      assignedUsers: [],
      attachments: [],
      order: 1000,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      _id: '2',
      workspaceId: 'workspace1',
      title: 'In Progress Task',
      description: 'Description 2',
      status: 'in_progress',
      priority: 'medium',
      tagColor: '#4ECDC4',
      tagName: 'Feature',
      assignedUsers: [],
      attachments: [],
      order: 1000,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      _id: '3',
      workspaceId: 'workspace1',
      title: 'Done Task',
      description: 'Description 3',
      status: 'done',
      priority: 'low',
      tagColor: '#45B7D1',
      tagName: 'Enhancement',
      assignedUsers: [],
      attachments: [],
      order: 1000,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  const mockHandlers = {
    onTaskUpdate: jest.fn(),
    onTaskDelete: jest.fn(),
    onTaskReorder: jest.fn(),
    onAddTask: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all three columns', () => {
    render(
      <KanbanBoard
        tasks={mockTasks}
        {...mockHandlers}
      />
    );

    expect(screen.getByTestId('column-todo')).toBeInTheDocument();
    expect(screen.getByTestId('column-in_progress')).toBeInTheDocument();
    expect(screen.getByTestId('column-done')).toBeInTheDocument();
  });

  it('should display correct column titles', () => {
    render(
      <KanbanBoard
        tasks={mockTasks}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('should distribute tasks to correct columns', () => {
    render(
      <KanbanBoard
        tasks={mockTasks}
        {...mockHandlers}
      />
    );

    const todoColumn = screen.getByTestId('column-todo');
    const inProgressColumn = screen.getByTestId('column-in_progress');
    const doneColumn = screen.getByTestId('column-done');

    expect(todoColumn).toHaveTextContent('Tasks: 1');
    expect(inProgressColumn).toHaveTextContent('Tasks: 1');
    expect(doneColumn).toHaveTextContent('Tasks: 1');

    expect(screen.getByTestId('task-1')).toHaveTextContent('Todo Task 1');
    expect(screen.getByTestId('task-2')).toHaveTextContent('In Progress Task');
    expect(screen.getByTestId('task-3')).toHaveTextContent('Done Task');
  });

  it('should handle empty task list', () => {
    render(
      <KanbanBoard
        tasks={[]}
        {...mockHandlers}
      />
    );

    const todoColumn = screen.getByTestId('column-todo');
    const inProgressColumn = screen.getByTestId('column-in_progress');
    const doneColumn = screen.getByTestId('column-done');

    expect(todoColumn).toHaveTextContent('Tasks: 0');
    expect(inProgressColumn).toHaveTextContent('Tasks: 0');
    expect(doneColumn).toHaveTextContent('Tasks: 0');
  });

  it('should call onAddTask when add button is clicked', async () => {
    render(
      <KanbanBoard
        tasks={mockTasks}
        {...mockHandlers}
      />
    );

    const addButtons = screen.getAllByText('Add Task');
    await userEvent.click(addButtons[0]); // Click add in todo column

    expect(mockHandlers.onAddTask).toHaveBeenCalledWith('todo');
  });

  it('should handle drag and drop between columns', () => {
    render(
      <KanbanBoard
        tasks={mockTasks}
        {...mockHandlers}
      />
    );

    // Simulate drag end event
    const mockDragEndEvent = {
      active: { id: '1' },
      over: { id: 'in_progress' },
    };

    // Call the stored onDragEnd handler
    if ((global as any).__mockOnDragEnd) {
      (global as any).__mockOnDragEnd(mockDragEndEvent);
    }

    expect(mockHandlers.onTaskReorder).toHaveBeenCalledWith('1', 'in_progress', 0);
  });

  it('should handle drag and drop within same column', () => {
    render(
      <KanbanBoard
        tasks={mockTasks}
        {...mockHandlers}
      />
    );

    // Add another task to todo column for reordering
    const moreTasks = [
      ...mockTasks,
      {
        _id: '4',
        workspaceId: 'workspace1',
        title: 'Todo Task 2',
        description: 'Description 4',
        status: 'todo' as const,
        priority: 'medium' as const,
        tagColor: '#FF6B6B',
        tagName: 'Bug',
        assignedUsers: [],
        attachments: [],
        order: 2000,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    render(
      <KanbanBoard
        tasks={moreTasks}
        {...mockHandlers}
      />
    );

    // Simulate drag within same column
    const mockDragEndEvent = {
      active: { id: '1' },
      over: { id: '4' }, // Drag task 1 over task 4
    };

    if ((global as any).__mockOnDragEnd) {
      (global as any).__mockOnDragEnd(mockDragEndEvent);
    }

    expect(mockHandlers.onTaskReorder).toHaveBeenCalledWith('1', 'todo', 1);
  });

  it('should not call reorder when drag is cancelled', () => {
    render(
      <KanbanBoard
        tasks={mockTasks}
        {...mockHandlers}
      />
    );

    // Simulate drag end without over target
    const mockDragEndEvent = {
      active: { id: '1' },
      over: null,
    };

    if ((global as any).__mockOnDragEnd) {
      (global as any).__mockOnDragEnd(mockDragEndEvent);
    }

    expect(mockHandlers.onTaskReorder).not.toHaveBeenCalled();
  });

  it('should sort tasks by order within columns', () => {
    const unorderedTasks: Task[] = [
      {
        _id: '1',
        workspaceId: 'workspace1',
        title: 'Task with order 2000',
        description: '',
        status: 'todo',
        priority: 'medium',
        tagColor: '#FF6B6B',
        tagName: 'Task',
        assignedUsers: [],
        attachments: [],
        order: 2000,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        _id: '2',
        workspaceId: 'workspace1',
        title: 'Task with order 1000',
        description: '',
        status: 'todo',
        priority: 'medium',
        tagColor: '#FF6B6B',
        tagName: 'Task',
        assignedUsers: [],
        attachments: [],
        order: 1000,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    render(
      <KanbanBoard
        tasks={unorderedTasks}
        {...mockHandlers}
      />
    );

    const tasks = screen.getAllByTestId(/^task-/);
    expect(tasks[0]).toHaveTextContent('Task with order 1000');
    expect(tasks[1]).toHaveTextContent('Task with order 2000');
  });
});