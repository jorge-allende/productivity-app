import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import type { Id } from '../convex/_generated/dataModel';
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
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { ErrorHandler } from '../utils/errorHandling';
// Using require for api to avoid TypeScript depth issues with Convex queries
const { api } = require('../convex/_generated/api');

type ViewMode = 'month' | 'agenda';

// Helper function to map Convex status to columnId
const statusToColumnId = (status: 'todo' | 'in_progress' | 'done'): string => {
  const statusMap: Record<string, string> = {
    'todo': 'todo',
    'in_progress': 'in_progress',
    'done': 'done'
  };
  return statusMap[status] || 'todo';
};

export const Calendar: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const { currentUser } = useAuth();
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
  
  // Convex queries and mutations
  const convexTasks = useQuery(api.tasks.getTasks, 
    currentWorkspace && currentUser ? { 
      workspaceId: currentWorkspace.id as Id<"workspaces">,
      auth0Id: currentUser.auth0Id
    } : "skip"
  );
  const updateTaskMutation = useMutation(api.tasks.updateTask);
  
  // Transform Convex tasks to match UI Task interface
  const tasks: Task[] = useMemo(() => {
    if (!convexTasks) return [];
    
    return convexTasks.map((task: any): Task => ({
      _id: task._id,
      title: task.title,
      description: task.description,
      columnId: statusToColumnId(task.status),
      priority: task.priority,
      tagColor: task.tagColor,
      tagName: task.tagName,
      dueDate: task.dueDate,
      assignedUsers: task.assignedUsers, // For now, using IDs as strings
      attachments: task.attachments,
      order: task.order,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      completedAt: task.status === 'done' ? new Date(task.updatedAt) : undefined,
      // These fields need to be fetched separately or handled differently
      createdBy: 'User', // TODO: Fetch user name from ID
      watchers: [], // TODO: Implement watchers
      comments: [], // TODO: Fetch from comments table
      mentions: [] // TODO: Implement mentions
    }));
  }, [convexTasks]);
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeTask = tasks.find(task => task._id === active.id);
    if (!activeTask) return;

    // Check if dropped on a calendar day
    const droppedDayString = over.id as string;
    if (droppedDayString.startsWith('day-')) {
      const droppedDate = new Date(droppedDayString.replace('day-', ''));
      
      // Update the task's due date using Convex mutation
      if (currentWorkspace) {
        try {
          await updateTaskMutation({
            id: activeTask._id as Id<"tasks">,
            dueDate: droppedDate.toISOString(),
            auth0Id: currentUser?.auth0Id
          });
        } catch (error) {
          ErrorHandler.handle(error, 'Failed to update task due date');
        }
      }
    }
  };

  const handleCreateTask = (newTask: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    tagColor: string;
    tagName: string;
    dueDate?: string;
    assignedUsers: string[];
    attachments: Array<{ name: string; url: string; type: string }>;
  }) => {
    // Task creation is handled in Dashboard.tsx
    // This function is not used in Calendar view
    console.warn('Task creation should be handled in Dashboard view');
  };

  const activeTask = activeId ? tasks.find(task => task._id === activeId) : null;

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleTaskUpdate = async (updatedTask: Task, commentOnly?: boolean) => {
    if (!currentWorkspace) {
      ErrorHandler.handle(new Error('No workspace selected'), 'Please select a workspace');
      return;
    }
    
    try {
      // If it's not comment-only, update the task
      if (!commentOnly) {
        await updateTaskMutation({
          id: updatedTask._id as Id<"tasks">,
          title: updatedTask.title,
          description: updatedTask.description,
          status: updatedTask.columnId === 'todo' ? 'todo' : 
                  updatedTask.columnId === 'in_progress' ? 'in_progress' : 'done',
          priority: updatedTask.priority as 'low' | 'medium' | 'high',
          tagColor: updatedTask.tagColor,
          tagName: updatedTask.tagName,
          dueDate: updatedTask.dueDate,
          assignedUsers: updatedTask.assignedUsers as Id<"users">[],
          auth0Id: currentUser?.auth0Id
        });
        setIsEditModalOpen(false);
        setSelectedTask(null);
      }
      // TODO: Handle comment updates when comment API is integrated
    } catch (error) {
      ErrorHandler.handle(error, 'Failed to update task. Please try again.');
    }
  };

  // Show loading state while fetching data
  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">
          Please select a workspace to view tasks
        </div>
      </div>
    );
  }
  
  if (convexTasks === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">
          Loading tasks...
        </div>
      </div>
    );
  }

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