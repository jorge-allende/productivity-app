import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarWidget } from '../components/calendar/CalendarWidget';
import { Task } from '../types/Task';

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('CalendarWidget', () => {
  const mockTasks: Task[] = [
    {
      _id: '1',
      title: 'Task Due Today',
      description: 'Description 1',
      priority: 'high',
      tagColor: '#FF6B6B',
      tagName: 'Bug',
      assignedUsers: [],
      attachments: [],
      order: 1000,
      dueDate: new Date().toISOString().split('T')[0],
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
      title: 'Task Due Tomorrow',
      description: 'Description 2',
      priority: 'medium',
      tagColor: '#4ECDC4',
      tagName: 'Feature',
      assignedUsers: [],
      attachments: [],
      order: 1000,
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
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
      title: 'Task Without Due Date',
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

  it('should render calendar widget', () => {
    render(<CalendarWidget tasks={mockTasks} />);

    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('View full calendar')).toBeInTheDocument();
  });

  it('should display current month and year', () => {
    render(<CalendarWidget tasks={mockTasks} />);

    const currentDate = new Date();
    const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    expect(screen.getByText(monthYear)).toBeInTheDocument();
  });

  it('should render weekday headers', () => {
    render(<CalendarWidget tasks={mockTasks} />);

    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    weekdays.forEach((day, index) => {
      const dayElements = screen.getAllByText(day);
      expect(dayElements.length).toBeGreaterThan(0);
    });
  });

  it('should highlight today\'s date', () => {
    render(<CalendarWidget tasks={mockTasks} />);

    const today = new Date().getDate().toString();
    const todayElement = screen.getByText(today);
    const todayContainer = todayElement.closest('div');
    
    expect(todayContainer).toHaveClass('bg-blue-500');
  });

  it('should display task indicators on dates with tasks', () => {
    render(<CalendarWidget tasks={mockTasks} />);

    // Should show indicators for tasks with due dates
    const indicators = screen.getAllByTestId(/priority-/);
    expect(indicators.length).toBeGreaterThan(0);
  });

  it('should navigate to previous month', async () => {
    render(<CalendarWidget tasks={mockTasks} />);

    const prevButton = screen.getByLabelText('Previous month');
    await userEvent.click(prevButton);

    // Check that the month changed
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - 1);
    const prevMonthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    expect(screen.getByText(prevMonthYear)).toBeInTheDocument();
  });

  it('should navigate to next month', async () => {
    render(<CalendarWidget tasks={mockTasks} />);

    const nextButton = screen.getByLabelText('Next month');
    await userEvent.click(nextButton);

    // Check that the month changed
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 1);
    const nextMonthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    expect(screen.getByText(nextMonthYear)).toBeInTheDocument();
  });

  it('should handle click on date', async () => {
    render(<CalendarWidget tasks={mockTasks} />);

    // Click on today
    const today = new Date().getDate().toString();
    const todayElement = screen.getByText(today);
    
    await userEvent.click(todayElement);

    // The CalendarWidget internally handles date clicks by showing a modal
    // We can't test the modal here as it's part of the CalendarWidget implementation
  });

  it('should display correct priority colors', () => {
    render(<CalendarWidget tasks={mockTasks} />);

    const highPriorityDot = screen.getByTestId('priority-high');
    const mediumPriorityDot = screen.getByTestId('priority-medium');

    expect(highPriorityDot).toHaveClass('bg-red-500');
    expect(mediumPriorityDot).toHaveClass('bg-yellow-500');
  });

  it('should handle empty task list', () => {
    render(<CalendarWidget tasks={[]} />);

    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.queryByTestId(/priority-/)).not.toBeInTheDocument();
  });

  it('should only show tasks with due dates', () => {
    render(<CalendarWidget tasks={mockTasks} />);

    // Task 3 has no due date, so it shouldn't create an indicator
    const tasksWithDueDates = mockTasks.filter(t => t.dueDate);
    const indicators = screen.getAllByTestId(/priority-/);
    
    // Should have indicators only for tasks with due dates
    expect(indicators.length).toBe(tasksWithDueDates.length);
  });
});