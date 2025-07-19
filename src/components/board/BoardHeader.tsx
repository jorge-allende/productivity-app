import React, { useState } from 'react';
import { LayoutDashboard, Calendar, Share2, Filter, ChevronDown, Users, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface BoardHeaderProps {
  onFilterChange?: (filters: FilterOptions) => void;
  onAddTask?: () => void;
}

export interface FilterOptions {
  priority?: string[];
  category?: string[];
  assignedUsers?: string[];
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({ onFilterChange, onAddTask }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priority: [],
    category: [],
    assignedUsers: []
  });

  const navigation = [
    { name: 'Board', href: '/', icon: LayoutDashboard },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handlePriorityFilter = (priority: string) => {
    const newPriorities = filters.priority?.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...(filters.priority || []), priority];
    
    const newFilters = { ...filters, priority: newPriorities };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleCategoryFilter = (category: string) => {
    const newCategories = filters.category?.includes(category)
      ? filters.category.filter(c => c !== category)
      : [...(filters.category || []), category];
    
    const newFilters = { ...filters, category: newCategories };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleUserFilter = (user: string) => {
    const newUsers = filters.assignedUsers?.includes(user)
      ? filters.assignedUsers.filter(u => u !== user)
      : [...(filters.assignedUsers || []), user];
    
    const newFilters = { ...filters, assignedUsers: newUsers };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between">
        {/* Left side - Navigation */}
        <div className="flex items-center gap-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </button>
            );
          })}
        </div>

        {/* Right side - Share and Filters */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <div className="relative">
            <button
              onClick={handleFilterToggle}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
            </button>

            {/* Filter Dropdown */}
            {showFilters && (
              <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg p-4 z-50">
                <h4 className="text-sm font-medium mb-3">Filter by</h4>
                
                {/* Priority Filters */}
                <div className="mb-4">
                  <h5 className="text-xs text-muted-foreground uppercase mb-2">Priority</h5>
                  <div className="space-y-2">
                    {['low', 'medium', 'high', 'urgent'].map((priority) => (
                      <label key={priority} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.priority?.includes(priority) || false}
                          onChange={() => handlePriorityFilter(priority)}
                          className="rounded border-border"
                        />
                        <span className="text-sm capitalize">{priority}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Category Filters */}
                <div className="mb-4">
                  <h5 className="text-xs text-muted-foreground uppercase mb-2">Category</h5>
                  <div className="space-y-2">
                    {['Design', 'Development', 'Documentation', 'Testing'].map((category) => (
                      <label key={category} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.category?.includes(category) || false}
                          onChange={() => handleCategoryFilter(category)}
                          className="rounded border-border"
                        />
                        <span className="text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* User Filters */}
                <div>
                  <h5 className="text-xs text-muted-foreground uppercase mb-2">Assigned Users</h5>
                  <div className="space-y-2">
                    {['John', 'Sarah', 'Mike', 'Emma', 'Alex'].map((user) => (
                      <label key={user} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.assignedUsers?.includes(user) || false}
                          onChange={() => handleUserFilter(user)}
                          className="rounded border-border"
                        />
                        <span className="text-sm">{user}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {onAddTask && (
            <button
              onClick={onAddTask}
              className="flex items-center gap-2 px-4 py-2 bg-foreground text-background hover:bg-foreground/90 rounded-lg transition-colors text-sm font-medium"
            >
              Add Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
};