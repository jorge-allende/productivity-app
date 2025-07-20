import React from 'react';
import { format, isToday, isTomorrow, isAfter, isBefore, addDays, startOfDay, endOfDay } from 'date-fns';
import { Calendar, Clock, Paperclip, MessageSquare, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Task } from '../../types/Task';

interface AgendaViewProps {
  tasks: Task[];
  currentDate: Date;
  daysToShow?: number;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ tasks, currentDate, daysToShow = 30 }) => {
  const startDate = startOfDay(currentDate);
  const endDate = endOfDay(addDays(startDate, daysToShow));

  // Filter tasks that have due dates within the range
  const tasksInRange = tasks
    .filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return isAfter(taskDate, startDate) && isBefore(taskDate, endDate);
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  // Group tasks by date
  const tasksByDate = tasksInRange.reduce((acc, task) => {
    const dateKey = format(new Date(task.dueDate!), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMMM d');
  };

  const priorityColors = {
    low: 'bg-priority-low',
    medium: 'bg-priority-medium',
    high: 'bg-priority-high',
    urgent: 'bg-red-500',
  };

  const priorityTextColors = {
    low: 'text-priority-low',
    medium: 'text-priority-medium',
    high: 'text-priority-high',
    urgent: 'text-red-500',
  };

  const extractTimeFromDate = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    if (hours === 0 && minutes === 0) return null;
    return format(date, 'h:mm a');
  };

  // Get task count color based on number
  const getCountBadgeColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    if (count <= 2) return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
    if (count <= 4) return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300';
    return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
  };

  const isTaskCompleted = (task: Task) => {
    return !!task.completedAt;
  };

  if (tasksInRange.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No upcoming tasks in the next {daysToShow} days</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total upcoming tasks count */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Upcoming Tasks</h3>
        <div className={cn(
          "px-3 py-1.5 rounded-full text-sm font-medium",
          getCountBadgeColor(tasksInRange.length)
        )}>
          {tasksInRange.length} total {tasksInRange.length === 1 ? 'task' : 'tasks'}
        </div>
      </div>
      {Object.entries(tasksByDate).map(([dateKey, dateTasks]) => {
        const date = new Date(dateKey);
        const dateLabel = getDateLabel(date);
        const dayOfWeek = format(date, 'EEE');
        const dayOfMonth = format(date, 'd');

        return (
          <div key={dateKey} className="space-y-3">
            {/* Date Header */}
            <div className="flex items-center gap-4 sticky top-0 bg-background z-10 py-2">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground uppercase">{dayOfWeek}</div>
                  <div className="text-2xl font-semibold text-foreground">{dayOfMonth}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className={cn(
                      "text-lg font-semibold",
                      isToday(date) && "text-primary-600",
                      !isToday(date) && "text-foreground"
                    )}>
                      {dateLabel}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {dateTasks.length} task{dateTasks.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {/* Task count badge for the day */}
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getCountBadgeColor(dateTasks.length)
                  )}>
                    {dateTasks.length}
                  </div>
                </div>
              </div>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Tasks for this date */}
            <div className="space-y-2 pl-16">
              {dateTasks.map((task) => {
                const time = extractTimeFromDate(task.dueDate!);
                
                return (
                  <div
                    key={task._id}
                    className="group bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      {/* Priority Indicator */}
                      <div className={cn(
                        "w-1 h-full min-h-[60px] rounded-full flex-shrink-0",
                        priorityColors[task.priority]
                      )} />

                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {/* Title and Time */}
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={cn(
                                "font-semibold text-foreground truncate flex items-center gap-2",
                                isTaskCompleted(task) && "text-muted-foreground"
                              )}>
                                {isTaskCompleted(task) && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                                <span className={cn(isTaskCompleted(task) && "line-through")}>
                                  {task.title}
                                </span>
                              </h4>
                              {time && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                                  <Clock className="w-3 h-3" />
                                  <span>{time}</span>
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            {task.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {task.description}
                              </p>
                            )}

                            {/* Tags and Meta */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Tag */}
                              <span
                                className="px-2 py-1 rounded text-xs font-medium"
                                style={{ backgroundColor: task.tagColor + '20', color: task.tagColor }}
                              >
                                {task.tagName}
                              </span>

                              {/* Priority */}
                              <span className={cn(
                                "text-xs font-medium capitalize",
                                priorityTextColors[task.priority]
                              )}>
                                {task.priority} priority
                              </span>

                              {/* Column Status */}
                              <span className="text-xs text-muted-foreground capitalize">
                                {task.columnId.replace('_', ' ')}
                              </span>
                            </div>
                          </div>

                          {/* Assignees */}
                          {task.assignedUsers.length > 0 && (
                            <div className="flex -space-x-2 flex-shrink-0">
                              {task.assignedUsers.slice(0, 3).map((user, index) => (
                                <div
                                  key={index}
                                  className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center"
                                  title={user}
                                >
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {user.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              ))}
                              {task.assignedUsers.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    +{task.assignedUsers.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Footer Stats */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          {task.attachments.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Paperclip className="w-3 h-3" />
                              <span>{task.attachments.length}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{task.comments?.length || 0}</span>
                          </div>
                          {task.createdBy && (
                            <span>Created by {task.createdBy}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};