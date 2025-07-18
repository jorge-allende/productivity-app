import React, { useEffect, useState, useCallback } from 'react';
import { Moon, Sun, Share2, Filter, Plus, ChevronDown } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { Sidebar } from './Sidebar';
import { useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { DashboardProvider } from '../../contexts/DashboardContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    priority?: string[];
    category?: string[];
    assignedUsers?: string[];
  }>({});
  const [addTaskCallback, setAddTaskCallback] = useState<(() => void) | null>(null);

  const isDashboard = location.pathname === '/';

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handlePriorityFilter = (priority: string) => {
    const newPriorities = filters.priority?.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...(filters.priority || []), priority];
    
    setFilters({ ...filters, priority: newPriorities });
  };

  const handleCategoryFilter = (category: string) => {
    const newCategories = filters.category?.includes(category)
      ? filters.category.filter(c => c !== category)
      : [...(filters.category || []), category];
    
    setFilters({ ...filters, category: newCategories });
  };

  const handleUserFilter = (user: string) => {
    const newUsers = filters.assignedUsers?.includes(user)
      ? filters.assignedUsers.filter(u => u !== user)
      : [...(filters.assignedUsers || []), user];
    
    setFilters({ ...filters, assignedUsers: newUsers });
  };

  const handleAddTask = useCallback(() => {
    if (addTaskCallback) {
      addTaskCallback();
    }
  }, [addTaskCallback]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 bg-background border-b border-border fixed top-0 left-0 right-0 z-50">
        <div className="h-full px-6 flex items-center justify-between max-w-[1920px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-sm">P</span>
            </div>
            <h1 className="text-lg font-semibold text-foreground">Productivity UI</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {isDashboard && (
              <>
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
                <button
                  onClick={handleAddTask}
                  className="flex items-center gap-2 px-4 py-2 bg-foreground text-background hover:bg-foreground/90 rounded-lg transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-accent"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar />

      {/* Page content */}
      <main className="pt-14 pl-64">
        <div className="p-4">
          <DashboardProvider filters={filters} setAddTaskCallback={setAddTaskCallback}>
            {children}
          </DashboardProvider>
        </div>
      </main>
    </div>
  );
};