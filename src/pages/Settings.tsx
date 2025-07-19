import React from 'react';
import { BoardHeader } from '../components/board/BoardHeader';
import { User, Bell, Shield, Palette, Globe } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div>
      <div className="mb-2">
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
      </div>

      <BoardHeader />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-muted text-foreground font-medium">
              <User className="w-4 h-4" />
              Profile
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
              <Bell className="w-4 h-4" />
              Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
              <Shield className="w-4 h-4" />
              Security
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
              <Palette className="w-4 h-4" />
              Appearance
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
              <Globe className="w-4 h-4" />
              Language
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Profile Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email"
                  defaultValue="john@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Bio</label>
                <textarea
                  rows={3}
                  defaultValue="Product designer focused on creating intuitive user experiences."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              
              <div className="pt-4">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};