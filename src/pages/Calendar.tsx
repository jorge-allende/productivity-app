import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '../utils/cn';
import { TaskDetailModal } from '../components/ui/TaskDetailModal';
import { Task } from '../types/Task';

const mockTasks: Task[] = [
  {
    _id: '1',
    title: 'Design new landing page',
    description: 'Create a modern and responsive landing page design',
    status: 'todo',
    priority: 'high',
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
    status: 'in_progress',
    priority: 'high',
    tagColor: '#10B981',
    tagName: 'Development',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    assignedUsers: ['Mike'],
    attachments: [{ name: 'auth-flow.pdf', url: '#', type: 'pdf' }],
    order: 1,
  },
];

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDay = (day: Date) => {
    return mockTasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), day)
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleDayClick = (day: Date) => {
    const dayTasks = getTasksForDay(day);
    if (dayTasks.length > 0) {
      setSelectedDay(day);
      setSelectedTasks(dayTasks);
    }
  };

  const priorityColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
        <p className="text-gray-600 dark:text-gray-400">View your tasks by date</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
            <div key={day} className="p-4 text-center font-medium text-gray-700 dark:text-gray-300">
              {day.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={index}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "min-h-[120px] p-2 border-b border-r border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer",
                  !isCurrentMonth && "bg-gray-50 dark:bg-gray-900",
                  dayTasks.length > 0 && "hover:bg-blue-50 dark:hover:bg-blue-900"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded text-sm font-medium mb-2",
                    !isCurrentMonth && "text-gray-400 dark:text-gray-600",
                    isToday && "bg-primary-600 text-white",
                    !isToday && "text-gray-900 dark:text-white"
                  )}
                >
                  {format(day, 'd')}
                </div>

                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task, i) => (
                    <div
                      key={i}
                      className="px-2 py-1 rounded text-xs font-medium truncate"
                      style={{ backgroundColor: task.tagColor + '20', color: task.tagColor }}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>

                {/* Priority indicators */}
                {dayTasks.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {Array.from(new Set(dayTasks.map(task => task.priority))).map(priority => (
                      <div
                        key={priority}
                        className={cn("w-2 h-2 rounded-full", priorityColors[priority])}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedDay && (
        <TaskDetailModal
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
          date={selectedDay}
          tasks={selectedTasks}
        />
      )}
    </div>
  );
};