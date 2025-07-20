import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, List } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, isBefore, startOfDay, endOfDay, isWithinInterval, isToday, addDays } from 'date-fns';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
} from '@dnd-kit/core';
import { cn } from '../utils/cn';
import { CalendarDayModal } from '../components/calendar/CalendarDayModal';
import { AgendaView } from '../components/calendar/AgendaView';
import { CalendarFilters, CalendarFilterOptions } from '../components/calendar/CalendarFilters';
import { Task } from '../types/Task';
import { TaskCard } from '../components/kanban/TaskCard';
import { DroppableCalendarDay } from '../components/calendar/DroppableCalendarDay';
import { TaskEditModal } from '../components/ui/TaskEditModal';

type ViewMode = 'month' | 'agenda';

const mockTasks: Task[] = [
  {
    _id: '1',
    title: 'Design new landing page',
    description: 'Create a modern and responsive landing page design',
    columnId: 'todo',
    priority: 'high',
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
    watchers: ['Alex', 'John', 'Sarah'],
    comments: [],
    mentions: [],
  },
  {
    _id: '2',
    title: 'Implement authentication',
    description: 'Add user authentication with JWT tokens',
    columnId: 'in_progress',
    priority: 'high',
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
    watchers: ['Sarah', 'Mike'],
    comments: [],
    mentions: [],
  },
  {
    _id: '3',
    title: 'Review Q3 marketing strategy',
    description: 'Analyze performance metrics and plan for next quarter',
    columnId: 'todo',
    priority: 'medium',
    tagColor: '#F59E0B',
    tagName: 'Marketing',
    dueDate: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
    assignedUsers: ['Emma', 'Alex'],
    attachments: [],
    order: 2,
    createdAt: new Date(Date.now() - 432000000), // 5 days ago
    updatedAt: new Date(Date.now() - 172800000), // 2 days ago
    createdBy: 'Emma',
    watchers: ['Emma', 'Alex', 'John'],
    comments: [],
    mentions: [],
  },
  {
    _id: '4',
    title: 'Fix critical production bug',
    description: 'Memory leak in payment processing module',
    columnId: 'in_progress',
    priority: 'urgent',
    tagColor: '#EF4444',
    tagName: 'Bug',
    dueDate: new Date(Date.now() + 3600000 * 2).toISOString(), // 2 hours from now
    assignedUsers: ['David'],
    attachments: [{ name: 'error-logs.txt', url: '#', type: 'text' }],
    order: 2,
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    updatedAt: new Date(Date.now() - 1800000), // 30 mins ago
    createdBy: 'System',
    watchers: ['David', 'Mike', 'Sarah'],
    comments: [],
    mentions: ['David'],
  },
  {
    _id: '5',
    title: 'Prepare investor presentation',
    description: 'Q3 results and future roadmap',
    columnId: 'todo',
    priority: 'high',
    tagColor: '#8B5CF6',
    tagName: 'Business',
    dueDate: new Date(Date.now() + 604800000).toISOString(), // 1 week from now
    assignedUsers: ['John', 'Emma', 'CEO'],
    attachments: [{ name: 'financial-report.xlsx', url: '#', type: 'excel' }],
    order: 3,
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(Date.now() - 43200000), // 12 hours ago
    createdBy: 'CEO',
    watchers: ['CEO', 'John', 'Emma', 'CFO'],
    comments: [],
    mentions: [],
  },
  {
    _id: '6',
    title: 'Code review: New feature branch',
    description: 'Review pull request for user dashboard improvements',
    columnId: 'review',
    priority: 'medium',
    tagColor: '#10B981',
    tagName: 'Development',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    assignedUsers: ['Sarah', 'Mike'],
    attachments: [],
    order: 1,
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    updatedAt: new Date(Date.now() - 3600000), // 1 hour ago
    createdBy: 'David',
    watchers: ['David', 'Sarah', 'Mike'],
    comments: [],
    mentions: [],
  },
  {
    _id: '7',
    title: 'Update documentation',
    description: 'Add API endpoints documentation for v2.0',
    columnId: 'todo',
    priority: 'low',
    tagColor: '#6B7280',
    tagName: 'Documentation',
    dueDate: new Date(Date.now() + 86400000 * 10).toISOString(), // 10 days from now
    assignedUsers: ['Alex'],
    attachments: [],
    order: 4,
    createdAt: new Date(Date.now() - 604800000), // 1 week ago
    updatedAt: new Date(Date.now() - 259200000), // 3 days ago
    createdBy: 'Mike',
    watchers: ['Mike', 'Alex'],
    comments: [],
    mentions: [],
  },
  {
    _id: '8',
    title: 'Team standup meeting',
    description: 'Daily sync on project progress',
    columnId: 'done',
    priority: 'low',
    tagColor: '#059669',
    tagName: 'Meeting',
    dueDate: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), // Today at 10 AM
    assignedUsers: ['Team'],
    attachments: [],
    order: 1,
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    updatedAt: new Date(Date.now() - 3600000), // 1 hour ago
    completedAt: new Date(Date.now() - 3600000), // Completed 1 hour ago
    createdBy: 'John',
    watchers: ['John', 'Sarah', 'Mike', 'David', 'Emma', 'Alex'],
    comments: [],
    mentions: [],
  },
  {
    _id: '9',
    title: 'Submit quarterly report',
    description: 'Financial report submission deadline',
    columnId: 'todo',
    priority: 'urgent',
    tagColor: '#EF4444',
    tagName: 'Urgent',
    dueDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago - OVERDUE
    assignedUsers: ['Emma'],
    attachments: [],
    order: 5,
    createdAt: new Date(Date.now() - 604800000), // 1 week ago
    updatedAt: new Date(Date.now() - 86400000), // 1 day ago
    createdBy: 'CEO',
    watchers: ['CEO', 'Emma', 'CFO'],
    comments: [],
    mentions: ['Emma'],
  },
  {
    _id: '10',
    title: 'Database backup completed',
    description: 'Weekly automated backup process',
    columnId: 'done',
    priority: 'medium',
    tagColor: '#10B981',
    tagName: 'DevOps',
    dueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    assignedUsers: ['System'],
    attachments: [],
    order: 2,
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000), // 1 day ago
    completedAt: new Date(Date.now() - 86400000), // Completed yesterday
    createdBy: 'System',
    watchers: ['Mike', 'David'],
    comments: [],
    mentions: [],
  },
];

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [filters, setFilters] = useState<CalendarFilterOptions>({
    priority: [],
    assignedUsers: [],
    tags: [],
    status: [],
    dateRange: null,
    customDateRange: undefined,
    hideCompleted: false
  });
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekCount = Math.ceil(days.length / 7);

  // Filter tasks based on active filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false;
      }

      // Assignee filter
      if (filters.assignedUsers.length > 0 && 
          !task.assignedUsers.some(user => filters.assignedUsers.includes(user))) {
        return false;
      }

      // Tag filter
      if (filters.tags.length > 0 && !filters.tags.includes(task.tagName)) {
        return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(task.columnId)) {
        return false;
      }

      // Hide completed filter
      if (filters.hideCompleted && task.completedAt) {
        return false;
      }

      // Date range filter
      if (filters.dateRange && task.dueDate) {
        const taskDate = new Date(task.dueDate);
        const today = startOfDay(new Date());
        
        switch (filters.dateRange) {
          case 'today':
            if (!isToday(taskDate)) return false;
            break;
          case 'thisWeek':
            const weekStart = startOfWeek(today);
            const weekEnd = endOfWeek(today);
            if (!isWithinInterval(taskDate, { start: weekStart, end: weekEnd })) return false;
            break;
          case 'next7days':
            const next7End = addDays(today, 7);
            if (!isWithinInterval(taskDate, { start: today, end: next7End })) return false;
            break;
          case 'next30days':
            const next30End = addDays(today, 30);
            if (!isWithinInterval(taskDate, { start: today, end: next30End })) return false;
            break;
          case 'custom':
            if (filters.customDateRange) {
              const { start, end } = filters.customDateRange;
              if (!isWithinInterval(taskDate, { start: startOfDay(start), end: endOfDay(end) })) return false;
            }
            break;
        }
      }

      return true;
    });
  }, [filters, tasks]);

  const getTasksForDay = (day: Date) => {
    return filteredTasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), day)
    );
  };

  const isTaskOverdue = (task: Task) => {
    if (!task.dueDate || task.completedAt) return false;
    return isBefore(new Date(task.dueDate), startOfDay(new Date()));
  };

  const isTaskCompleted = (task: Task) => {
    return !!task.completedAt;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  // Get tasks for today
  const todayTasks = getTasksForDay(new Date());
  const todayTaskCount = todayTasks.length;

  // Get task count color based on number
  const getCountBadgeColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    if (count <= 2) return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
    if (count <= 4) return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300';
    return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
  };

  const handleDayClick = (day: Date, event: React.MouseEvent) => {
    const dayTasks = filteredTasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), day)
    );
    
    // Always open the modal, regardless of whether there are tasks
    setSelectedDay(day);
    setSelectedTasks(dayTasks);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // We can use this later if we need to show more visual feedback
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeTask = tasks.find(task => task._id === active.id);
    if (!activeTask) return;

    // Check if dropped on a calendar day
    const droppedDayString = over.id as string;
    if (droppedDayString.startsWith('day-')) {
      const droppedDate = new Date(droppedDayString.replace('day-', ''));
      
      // Update the task's due date
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === activeTask._id 
            ? { ...task, dueDate: droppedDate.toISOString() }
            : task
        )
      );
    }
  };

  const handleCreateTask = (newTask: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    tagColor: string;
    tagName: string;
    dueDate?: string;
    assignedUsers: string[];
    attachments: Array<{ name: string; url: string; type: string }>;
  }) => {
    const task: Task = {
      _id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      columnId: 'todo',
      priority: newTask.priority,
      tagColor: newTask.tagColor,
      tagName: newTask.tagName,
      dueDate: newTask.dueDate,
      assignedUsers: newTask.assignedUsers,
      attachments: newTask.attachments,
      order: tasks.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Current User',
      watchers: ['Current User'],
      comments: [],
      mentions: [],
    };

    setTasks(prevTasks => [...prevTasks, task]);
  };

  const activeTask = activeId ? tasks.find(task => task._id === activeId) : null;

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleTaskUpdate = (updatedTask: Task, commentOnly?: boolean) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task._id === updatedTask._id ? { ...updatedTask, updatedAt: new Date() } : task
      )
    );
    
    // Only close modal if it's not a comment-only update
    if (!commentOnly) {
      setIsEditModalOpen(false);
      setSelectedTask(null);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">Calendar</h1>
            {/* Task count badges */}
              <div className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium",
                getCountBadgeColor(todayTaskCount)
              )}>
                {todayTaskCount} today
              </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                viewMode === 'month'
                  ? "bg-primary-600 text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <CalendarDays className="w-4 h-4" />
              Month
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                viewMode === 'agenda'
                  ? "bg-primary-600 text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <List className="w-4 h-4" />
              Agenda
            </button>
            <CalendarFilters 
              tasks={tasks}
              filters={filters}
              onFilterChange={setFilters}
            />
          </div>
        </div>


      <div className="max-w-5xl mx-auto w-full">
        <div className="bg-card rounded-lg shadow-sm border border-border flex flex-col">
        {/* Calendar Header */}
        {viewMode === 'month' && (
          <div className="flex items-center justify-between p-2 border-b border-border flex-shrink-0">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-accent rounded"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h2 className="text-size-2 font-semibold text-card-foreground">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-accent rounded"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Month View */}
        {viewMode === 'month' && (
          <>
            {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
            <div key={day} className="p-1 text-center text-xs font-medium text-gray-700 dark:text-gray-300">
              {day.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7" style={{ gridTemplateRows: `repeat(${weekCount}, 1fr)` }}>
          {days.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const today = isSameDay(day, new Date());
            const isPastDay = isBefore(day, startOfDay(new Date())) && !today;
            const hasOverdueTasks = dayTasks.some(task => isTaskOverdue(task));

            return (
              <DroppableCalendarDay
                key={index}
                day={day}
                tasks={dayTasks}
                isCurrentMonth={isCurrentMonth}
                isToday={today}
                isPastDay={isPastDay}
                hasOverdueTasks={hasOverdueTasks}
                onDayClick={handleDayClick}
                getCountBadgeColor={getCountBadgeColor}
                isTaskCompleted={isTaskCompleted}
                isTaskOverdue={isTaskOverdue}
              />
            );
          })}
        </div>
          </>
        )}

        {/* Agenda View */}
        {viewMode === 'agenda' && (
          <div className="p-6">
            <AgendaView tasks={filteredTasks} currentDate={currentDate} />
          </div>
        )}
        </div>
      </div>

      {/* Calendar Day Modal with integrated task creation */}
      {selectedDay && (
        <CalendarDayModal
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
          date={selectedDay}
          tasks={selectedTasks}
          onAddTask={(newTaskData) => {
            handleCreateTask(newTaskData);
            // Refresh the selected tasks to include the new one
            const updatedTasks = filteredTasks.filter(task => 
              task.dueDate && isSameDay(new Date(task.dueDate), selectedDay)
            );
            setSelectedTasks(updatedTasks);
          }}
          onTaskClick={handleTaskClick}
        />
      )}

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask && (
          <div className="opacity-80">
            <TaskCard task={activeTask} />
          </div>
        )}
      </DragOverlay>

      {/* Task Edit Modal */}
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
    </DndContext>
  );
};