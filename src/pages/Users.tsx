import React from 'react';
import { BoardHeader } from '../components/board/BoardHeader';
import { UserPlus, Search } from 'lucide-react';

export const Users: React.FC = () => {
  // Mock user data
  const users = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', avatar: 'J' },
    { id: '2', name: 'Sarah Smith', email: 'sarah@example.com', role: 'Developer', avatar: 'S' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'Designer', avatar: 'M' },
    { id: '4', name: 'Emma Wilson', email: 'emma@example.com', role: 'Developer', avatar: 'E' },
    { id: '5', name: 'Alex Brown', email: 'alex@example.com', role: 'Manager', avatar: 'A' },
  ];

  return (
    <div>
      <div className="mb-2">
        <h1 className="text-lg font-semibold text-foreground">Users</h1>
      </div>

      <BoardHeader />

      <div className="mb-6 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-foreground">User</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-foreground">Email</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-foreground">Role</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border hover:bg-muted/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                      {user.avatar}
                    </div>
                    <span className="text-sm font-medium text-foreground">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-sm text-muted-foreground hover:text-foreground">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};