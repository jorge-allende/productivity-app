import React, { useState } from 'react';
import { X, Copy, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (invitation: { email: string; role: 'Admin' | 'Manager' }) => void;
  workspaceId: string;
  workspaceName: string;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onAddUser, workspaceId, workspaceName }) => {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Admin' | 'Manager'>('Manager');
  const [inviteLink, setInviteLink] = useState('');
  const [showInviteLink, setShowInviteLink] = useState(false);

  const generateInviteCode = () => {
    // Generate a unique invite code
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      const inviteCode = generateInviteCode();
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/signup?invite=${inviteCode}`;
      
      // In a real app, this would save the invitation to the database
      onAddUser({ email, role });
      
      setInviteLink(link);
      setShowInviteLink(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    // You could add a toast notification here
  };

  const handleClose = () => {
    setEmail('');
    setRole('Manager');
    setInviteLink('');
    setShowInviteLink(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {showInviteLink ? 'Invitation Created' : 'Invite User'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {!showInviteLink ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-accent/50 rounded-lg p-3 mb-4">
              <p className="text-sm text-foreground">
                Inviting to: <strong>{workspaceName}</strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="colleague@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'Admin' | 'Manager')}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Manager">Manager</option>
                {currentUser?.role === 'Admin' && (
                  <option value="Admin">Admin</option>
                )}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {role === 'Manager' 
                  ? 'Can view and manage tasks, calendar' 
                  : 'Full access including user management'}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
              >
                Send Invitation
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Invitation sent to <strong>{email}</strong>
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                Share this invitation link:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This link expires in 7 days
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};