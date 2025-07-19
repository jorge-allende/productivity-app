import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
  ];

  const bottomNavigation = [
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 bg-background border-r border-border flex flex-col">
      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-border p-4 space-y-1">
        {bottomNavigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </button>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="border-t border-border p-4">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">A</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Anna Taylor</p>
            <p className="text-xs text-muted-foreground">anna@example.com</p>
          </div>
        </button>
      </div>
    </aside>
  );
};