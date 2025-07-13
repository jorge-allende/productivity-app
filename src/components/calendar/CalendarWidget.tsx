import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '../../utils/cn';
import { Task } from '../../types/Task';

interface CalendarWidgetProps {
  tasks: Task[];
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), day)
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const priorityColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Calendar</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {format(currentDate, 'MMMM yyyy')}
        </span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex gap-4 text-xs font-medium text-gray-600 dark:text-gray-400">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
            <div key={day} className="w-8 text-center">
              {day}
            </div>
          ))}
        </div>
        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dayTasks = getTasksForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={index}
              className={cn(
                "relative h-8 flex flex-col items-center justify-center rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
                !isCurrentMonth && "text-gray-400 dark:text-gray-600",
                isToday && "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300"
              )}
            >
              <span className="text-xs">{format(day, 'd')}</span>
              {dayTasks.length > 0 && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                  {dayTasks.slice(0, 3).map((task, i) => (
                    <div
                      key={i}
                      className={cn("w-1 h-1 rounded-full", priorityColors[task.priority])}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Today's Tasks</h4>
        <div className="space-y-2">
          {getTasksForDay(new Date()).length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No tasks scheduled for today</p>
          ) : (
            getTasksForDay(new Date()).map(task => (
              <div key={task._id} className="text-sm">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", priorityColors[task.priority])} />
                  <span className="text-gray-700 dark:text-gray-300">{task.title}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};