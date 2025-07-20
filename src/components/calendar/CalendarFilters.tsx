import React, { useState } from 'react';
import { Filter, ChevronDown, X, Calendar, Clock, Users, Tag, Layers, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Task } from '../../types/Task';

export interface CalendarFilterOptions {
  priority: string[];
  assignedUsers: string[];
  tags: string[];
  status: string[];
  dateRange: 'today' | 'thisWeek' | 'next7days' | 'next30days' | 'custom' | null;
  customDateRange?: { start: Date; end: Date };
  hideCompleted: boolean;
}

interface CalendarFiltersProps {
  tasks: Task[];
  filters: CalendarFilterOptions;
  onFilterChange: (filters: CalendarFilterOptions) => void;
  className?: string;
}

export const CalendarFilters: React.FC<CalendarFiltersProps> = ({ 
  tasks, 
  filters, 
  onFilterChange,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Extract unique values from tasks
  const uniqueUsers = Array.from(new Set(tasks.flatMap(task => task.assignedUsers))).sort();
  const uniqueTags = Array.from(new Set(tasks.map(task => task.tagName))).sort();
  const statuses = ['todo', 'in_progress', 'review', 'done'];

  // Calculate active filter count
  const activeFilterCount = 
    filters.priority.length + 
    filters.assignedUsers.length + 
    filters.tags.length + 
    filters.status.length + 
    (filters.dateRange ? 1 : 0) +
    (filters.hideCompleted ? 1 : 0);

  const handlePriorityToggle = (priority: string) => {
    const newPriorities = filters.priority.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...filters.priority, priority];
    onFilterChange({ ...filters, priority: newPriorities });
  };

  const handleUserToggle = (user: string) => {
    const newUsers = filters.assignedUsers.includes(user)
      ? filters.assignedUsers.filter(u => u !== user)
      : [...filters.assignedUsers, user];
    onFilterChange({ ...filters, assignedUsers: newUsers });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFilterChange({ ...filters, tags: newTags });
  };

  const handleStatusToggle = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFilterChange({ ...filters, status: newStatuses });
  };

  const handleDateRangeChange = (range: CalendarFilterOptions['dateRange']) => {
    if (range === 'custom') {
      onFilterChange({ ...filters, dateRange: range });
    } else {
      onFilterChange({ ...filters, dateRange: range, customDateRange: undefined });
    }
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      onFilterChange({
        ...filters,
        dateRange: 'custom',
        customDateRange: {
          start: new Date(customStartDate),
          end: new Date(customEndDate)
        }
      });
    }
  };

  const handleClearAll = () => {
    onFilterChange({
      priority: [],
      assignedUsers: [],
      tags: [],
      status: [],
      dateRange: null,
      customDateRange: undefined,
      hideCompleted: false
    });
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const priorityColors = {
    low: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    medium: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    high: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
    urgent: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
  };

  const statusIcons = {
    todo: <Layers className="w-3 h-3" />,
    in_progress: <Clock className="w-3 h-3" />,
    review: <Users className="w-3 h-3" />,
    done: <CheckCircle2 className="w-3 h-3" />
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
          activeFilterCount > 0 
            ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-800"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Filter className="w-4 h-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="px-1.5 py-0.5 bg-primary-600 text-white rounded-full text-xs font-medium min-w-[20px] text-center">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h4 className="text-sm font-semibold">Filter tasks</h4>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-accent rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="max-h-[500px] overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Date Range Filters */}
              <div>
                <h5 className="text-xs text-muted-foreground uppercase mb-3 flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Date Range
                </h5>
                <div className="space-y-2">
                  {[
                    { value: 'today', label: 'Today' },
                    { value: 'thisWeek', label: 'This Week' },
                    { value: 'next7days', label: 'Next 7 days' },
                    { value: 'next30days', label: 'Next 30 days' },
                    { value: 'custom', label: 'Custom range' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dateRange"
                        checked={filters.dateRange === option.value}
                        onChange={() => handleDateRangeChange(option.value as CalendarFilterOptions['dateRange'])}
                        className="text-primary-600"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
                
                {/* Custom Date Range Inputs */}
                {filters.dateRange === 'custom' && (
                  <div className="mt-3 space-y-2 pl-6">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-border rounded-md bg-background"
                      placeholder="Start date"
                    />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-border rounded-md bg-background"
                      placeholder="End date"
                    />
                    <button
                      onClick={handleCustomDateApply}
                      disabled={!customStartDate || !customEndDate}
                      className="w-full px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Priority Filters */}
              <div>
                <h5 className="text-xs text-muted-foreground uppercase mb-3">Priority</h5>
                <div className="space-y-2">
                  {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                    <label key={priority} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.priority.includes(priority)}
                        onChange={() => handlePriorityToggle(priority)}
                        className="rounded border-border text-primary-600"
                      />
                      <span className={cn(
                        "text-sm capitalize px-2 py-0.5 rounded-full",
                        priorityColors[priority]
                      )}>
                        {priority}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Filters */}
              <div>
                <h5 className="text-xs text-muted-foreground uppercase mb-3">Status</h5>
                <div className="space-y-2">
                  {statuses.map((status) => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={() => handleStatusToggle(status)}
                        className="rounded border-border text-primary-600"
                      />
                      <div className="flex items-center gap-2 text-sm">
                        {statusIcons[status as keyof typeof statusIcons]}
                        <span className="capitalize">{status.replace('_', ' ')}</span>
                      </div>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 cursor-pointer mt-3 pt-3 border-t border-border">
                    <input
                      type="checkbox"
                      checked={filters.hideCompleted}
                      onChange={() => onFilterChange({ ...filters, hideCompleted: !filters.hideCompleted })}
                      className="rounded border-border text-primary-600"
                    />
                    <span className="text-sm">Hide completed tasks</span>
                  </label>
                </div>
              </div>

              {/* Tag Filters */}
              {uniqueTags.length > 0 && (
                <div>
                  <h5 className="text-xs text-muted-foreground uppercase mb-3 flex items-center gap-2">
                    <Tag className="w-3 h-3" />
                    Tags
                  </h5>
                  <div className="space-y-2">
                    {uniqueTags.map((tag) => (
                      <label key={tag} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.tags.includes(tag)}
                          onChange={() => handleTagToggle(tag)}
                          className="rounded border-border text-primary-600"
                        />
                        <span className="text-sm">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Assignee Filters */}
              {uniqueUsers.length > 0 && (
                <div>
                  <h5 className="text-xs text-muted-foreground uppercase mb-3 flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    Assigned to
                  </h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {uniqueUsers.map((user) => (
                      <label key={user} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.assignedUsers.includes(user)}
                          onChange={() => handleUserToggle(user)}
                          className="rounded border-border text-primary-600"
                        />
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium text-muted-foreground">
                              {user.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span>{user}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};