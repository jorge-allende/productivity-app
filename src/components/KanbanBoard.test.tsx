import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KanbanBoard } from './kanban/KanbanBoard';
import { Task } from '../types/Task';
import { Column } from '../types/Column';

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
  KanbanColumn: ({ column, tasks, onAddTask }: any) => (
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
  TaskCard: ({ task }: any) => (
    <div data-testid={`task-card-${task._id}`}>
      {task.title}
    </div>
  ),
}));

describe('KanbanBoard', () => {
  const mockColumns: Column[] = [
    { id: 'todo', title: 'To Do', order: 1 },
    { id: 'in_progress', title: 'In Progress', order: 2 },
    { id: 'done', title: 'Done', order: 3 },
  ];

  const mockTasks: Task[] = [
    {
      _id: '1',
      title: 'Todo Task 1',
      description: 'Description 1',
      priority: 'high',
      tagColor: '#FF6B6B',
      tagName: 'Bug',
      assignedUsers: [],
      attachments: [],
      order: 1000,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      columnId: 'todo',
      createdBy: 'user1',
      watchers: [],
      comments: [],
      mentions: [],
    },
    {
      _id: '2',
      title: 'In Progress Task',
      description: 'Description 2',
      priority: 'medium',
      tagColor: '#4ECDC4',
      tagName: 'Feature',
      assignedUsers: [],
      attachments: [],
      order: 1000,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      columnId: 'in_progress',
      createdBy: 'user1',
      watchers: [],
      comments: [],
      mentions: [],
    },
    {
      _id: '3',
      title: 'Done Task',
      description: 'Description 3',
      priority: 'low',
      tagColor: '#45B7D1',
      tagName: 'Enhancement',
      assignedUsers: [],
      attachments: [],
      order: 1000,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      columnId: 'done',
      createdBy: 'user1',
      watchers: [],
      comments: [],
      mentions: [],
    },
  ];

  const defaultProps = {
    tasks: mockTasks,
    columns: mockColumns,
    boardName: 'Test Board',
    onTaskMove: jest.fn(),
    onAddTask: jest.fn(),
    onAddColumn: jest.fn(),
    onDeleteColumn: jest.fn(),
    onRenameColumn: jest.fn(),
    onRenameBoardName: jest.fn(),
    onTaskClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all three columns', () => {
    render(<KanbanBoard {...defaultProps} />);

    expect(screen.getByTestId('column-todo')).toBeInTheDocument();
    expect(screen.getByTestId('column-in_progress')).toBeInTheDocument();
    expect(screen.getByTestId('column-done')).toBeInTheDocument();
  });

  it('should display correct column titles', () => {
    render(<KanbanBoard {...defaultProps} />);

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('should distribute tasks to correct columns', () => {
    render(<KanbanBoard {...defaultProps} />);

    const todoColumn = screen.getByTestId('column-todo');
    const inProgressColumn = screen.getByTestId('column-in_progress');
    const doneColumn = screen.getByTestId('column-done');

    expect(todoColumn).toHaveTextContent('Tasks: 1');
    expect(inProgressColumn).toHaveTextContent('Tasks: 1');
    expect(doneColumn).toHaveTextContent('Tasks: 1');
  });

  it('should handle empty task list', () => {
    render(<KanbanBoard {...defaultProps} tasks={[]} />);

    expect(screen.getByTestId('column-todo')).toHaveTextContent('Tasks: 0');
    expect(screen.getByTestId('column-in_progress')).toHaveTextContent('Tasks: 0');
    expect(screen.getByTestId('column-done')).toHaveTextContent('Tasks: 0');
  });

  it('should call onAddTask when add button is clicked', async () => {
    render(<KanbanBoard {...defaultProps} />);

    const addButtons = screen.getAllByText('Add Task');
    await userEvent.click(addButtons[0]);

    expect(defaultProps.onAddTask).toHaveBeenCalledWith('todo');
  });

  it('should display board name', () => {
    render(<KanbanBoard {...defaultProps} />);

    expect(screen.getByText('Test Board')).toBeInTheDocument();
  });

  it('should show tasks in their respective columns', () => {
    render(<KanbanBoard {...defaultProps} />);

    expect(screen.getByTestId('task-1')).toHaveTextContent('Todo Task 1');
    expect(screen.getByTestId('task-2')).toHaveTextContent('In Progress Task');
    expect(screen.getByTestId('task-3')).toHaveTextContent('Done Task');
  });

  it('should wrap in DndContext for drag and drop', () => {
    render(<KanbanBoard {...defaultProps} />);

    expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
  });

  it('should handle drag end event', () => {
    render(<KanbanBoard {...defaultProps} />);

    // Simulate drag end
    const mockDragEndEvent = {
      active: { id: '1' },
      over: { id: 'in_progress' },
    };

    // Call the stored onDragEnd handler
    if ((global as any).__mockOnDragEnd) {
      (global as any).__mockOnDragEnd(mockDragEndEvent);
    }

    expect(defaultProps.onTaskMove).toHaveBeenCalled();
  });

  it('should render all tasks when multiple tasks in same column', () => {
    const tasksWithMultipleInSameColumn: Task[] = [
      ...mockTasks,
      {
        _id: '4',
        title: 'Todo Task 2',
        description: 'Description 4',
        priority: 'medium',
        tagColor: '#FF6B6B',
        tagName: 'Bug',
        assignedUsers: [],
        attachments: [],
        order: 2000,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        columnId: 'todo',
        createdBy: 'user1',
        watchers: [],
        comments: [],
        mentions: [],
      },
    ];

    render(<KanbanBoard {...defaultProps} tasks={tasksWithMultipleInSameColumn} />);

    const todoColumn = screen.getByTestId('column-todo');
    expect(todoColumn).toHaveTextContent('Tasks: 2');
    expect(screen.getByTestId('task-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-4')).toBeInTheDocument();
  });

  it('should handle custom columns', () => {
    const customColumns: Column[] = [
      { id: 'backlog', title: 'Backlog', order: 1 },
      { id: 'todo', title: 'To Do', order: 2 },
      { id: 'in_progress', title: 'In Progress', order: 3 },
      { id: 'done', title: 'Done', order: 4 },
    ];

    render(<KanbanBoard {...defaultProps} columns={customColumns} />);

    expect(screen.getByTestId('column-backlog')).toBeInTheDocument();
    expect(screen.getByText('Backlog')).toBeInTheDocument();
  });

  it('should filter tasks by column correctly', () => {
    const mixedTasks: Task[] = [
      {
        _id: '1',
        title: 'Todo Task',
        description: 'Description',
        priority: 'high',
        tagColor: '#FF6B6B',
        tagName: 'Bug',
        assignedUsers: [],
        attachments: [],
        order: 1000,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        columnId: 'todo',
        createdBy: 'user1',
        watchers: [],
        comments: [],
        mentions: [],
      },
      {
        _id: '2',
        title: 'Another Todo Task',
        description: 'Description',
        priority: 'medium',
        tagColor: '#FF6B6B',
        tagName: 'Bug',
        assignedUsers: [],
        attachments: [],
        order: 2000,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        columnId: 'todo',
        createdBy: 'user1',
        watchers: [],
        comments: [],
        mentions: [],
      },
    ];

    render(<KanbanBoard {...defaultProps} tasks={mixedTasks} />);

    const todoColumn = screen.getByTestId('column-todo');
    expect(todoColumn).toHaveTextContent('Tasks: 2');
  });
});