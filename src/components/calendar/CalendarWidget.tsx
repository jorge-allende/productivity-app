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
    low: 'bg-priority-low',
    medium: 'bg-priority-medium',
    high: 'bg-priority-high',
    urgent: 'bg-red-500',
  };

  // Get task count color based on number
  const getCountBadgeColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    if (count <= 2) return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
    if (count <= 4) return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300';
    return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
  };

  // Get total tasks for current month
  const monthTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return isSameMonth(taskDate, currentDate);
  });
  const monthTaskCount = monthTasks.length;

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm min-h-[400px] flex flex-col">
      <div className="px-3 py-2.5 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Calendar</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousMonth}
              className="p-0.5 hover:bg-accent rounded transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <span className="text-xs text-muted-foreground min-w-[100px] text-center">
              {format(currentDate, 'MMM yyyy')}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-0.5 hover:bg-accent rounded transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
          {/* Month task count badge */}
          {monthTaskCount > 0 && (
            <div className={cn(
              "px-1.5 py-0.5 rounded-full text-xs font-medium",
              getCountBadgeColor(monthTaskCount)
            )}>
              {monthTaskCount}
            </div>
          )}
          </div>
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <div className="grid grid-cols-7 gap-0.5 text-xs font-medium text-muted-foreground mb-2">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
            <div key={day} className="text-center">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5 flex-1">
          {days.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={index}
                className={cn(
                  "relative h-7 flex items-center justify-center rounded text-xs cursor-pointer hover:bg-accent transition-colors",
                  !isCurrentMonth && "text-muted-foreground/40",
                  isToday && "bg-primary text-primary-foreground font-medium"
                )}
              >
                <span>{format(day, 'd')}</span>
                {dayTasks.length > 0 && (
                  <>
                    {/* Task count badge */}
                    <div className="absolute -top-1 -right-1 z-10">
                      <div className={cn(
                        "w-4 h-4 rounded-full text-[10px] font-medium flex items-center justify-center",
                        getCountBadgeColor(dayTasks.length),
                        "shadow-sm border border-white dark:border-gray-800"
                      )}>
                        {dayTasks.length}
                      </div>
                    </div>
                    {/* Priority dots */}
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                      {dayTasks.slice(0, 2).map((task, i) => (
                        <div
                          key={i}
                          className={cn("w-1 h-1 rounded-full", priorityColors[task.priority])}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      
        <div className="mt-auto pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-foreground">Today's Tasks</h4>
            {getTasksForDay(new Date()).length > 0 && (
              <div className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                getCountBadgeColor(getTasksForDay(new Date()).length)
              )}>
                {getTasksForDay(new Date()).length}
              </div>
            )}
          </div>
          <div className="space-y-1">
            {getTasksForDay(new Date()).length === 0 ? (
              <p className="text-xs text-muted-foreground">No tasks for today</p>
            ) : (
              getTasksForDay(new Date()).slice(0, 3).map(task => (
                <div key={task._id}>
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-1 h-1 rounded-full flex-shrink-0", priorityColors[task.priority])} />
                    <span className="text-xs text-muted-foreground line-clamp-1">{task.title}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};