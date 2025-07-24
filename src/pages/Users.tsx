import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import type { Id } from '../convex/_generated/dataModel';
import { UsersHeader } from '../components/users/UsersHeader';
import { AddUserModal } from '../components/users/AddUserModal';
import { EditUserModal } from '../components/users/EditUserModal';
import { UserPlus, Search, Edit2, Trash2, Shield, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';

// Import api with require to avoid TypeScript depth issues
const { api } = require('../convex/_generated/api');

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager';
  avatar: string;
}

export const Users: React.FC = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Convex queries and mutations
  const convexUsers = useQuery(api.users.getUsersByWorkspace, 
    currentWorkspace ? { 
      workspaceId: currentWorkspace.id as Id<"workspaces">,
      searchTerm: searchQuery || undefined
    } : "skip"
  );
  
  const createInvitationMutation = useMutation(api.users.createInvitation);
  const updateUserProfileMutation = useMutation(api.users.updateUserProfile);
  
  // Transform Convex users to match UI User interface
  const users: User[] = useMemo(() => {
    if (!convexUsers) return [];
    
    return convexUsers.map((user: any): User => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || getInitials(user.name)
    }));
  }, [convexUsers]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Generate initials from name
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.map(part => part[0]).join('').toUpperCase();
  };

  // Users are already filtered by search in the query
  const filteredUsers = users;

  // Handle invitation
  const handleInviteUser = async (invitation: { email: string; role: 'Admin' | 'Manager' }) => {
    if (!currentWorkspace || !currentUser) return;
    
    try {
      const result = await createInvitationMutation({
        workspaceId: currentWorkspace.id as Id<"workspaces">,
        email: invitation.email,
        role: invitation.role,
        invitedBy: currentUser.id as Id<"users">
      });
      console.log('Invitation created:', result);
    } catch (error) {
      console.error('Failed to create invitation:', error);
    }
  };

  // Edit user
  const handleEditUser = async (updatedUser: User) => {
    try {
      await updateUserProfileMutation({
        userId: updatedUser.id as Id<"users">,
        name: updatedUser.name,
        avatar: updatedUser.avatar
      });
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  // Delete user
  const handleDeleteUser = (userId: string) => {
    // TODO: Implement user removal from workspace
    console.log('User removal not yet implemented');
    setShowDeleteConfirm(null);
  };

  // Open edit modal
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  // Show loading state while fetching data
  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">
          Please select a workspace to view users
        </div>
      </div>
    );
  }
  
  if (convexUsers === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2">
        <h1 className="text-lg font-semibold text-foreground">Users</h1>
      </div>

      <UsersHeader />

      {/* Workspace info */}
      <div className="mb-4 p-4 bg-accent/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">
              Workspace: <strong>{currentWorkspace.name}</strong>
            </span>
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase">
              {currentWorkspace.plan}
            </span>
          </div>
        </div>
      </div>

      {/* Demo role switcher */}
      <div className="mb-4 p-4 bg-accent/50 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm text-foreground">
            Current demo user: <strong>{currentUser?.name}</strong> ({currentUser?.role})
          </span>
        </div>
        <select
          value={currentUser?.id}
          onChange={(e) => {
            const selectedUser = users.find(u => u.id === e.target.value);
            if (selectedUser && currentUser) {
              setCurrentUser({
                ...currentUser,
                id: selectedUser.id,
                name: selectedUser.name,
                email: selectedUser.email,
                role: selectedUser.role
              });
            }
          }}
          className="px-3 py-1 text-sm rounded border border-border bg-background"
        >
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
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
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-border hover:bg-muted/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-sm">
                      {user.avatar}
                    </div>
                    <span className="text-sm font-medium text-foreground">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'Admin' 
                      ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(user.id)}
                      className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddUser={handleInviteUser}
        workspaceId={currentWorkspace.id}
        workspaceName={currentWorkspace.name}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
        }}
        onEditUser={handleEditUser}
        user={editingUser}
      />

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete User</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
                className="flex-1 px-4 py-2 text-sm font-medium bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};