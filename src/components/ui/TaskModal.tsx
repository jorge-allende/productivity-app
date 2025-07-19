import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    tagColor: string;
    tagName: string;
    dueDate?: string;
    assignedUsers: string[];
  }) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#3B82F6');
  const [dueDate, setDueDate] = useState('');
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');

  const predefinedColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave({
        title,
        description,
        priority,
        tagColor,
        tagName: tagName || 'General',
        dueDate: dueDate || undefined,
        assignedUsers,
      });
    }
  };

  const addUser = () => {
    if (userInput.trim() && !assignedUsers.includes(userInput)) {
      setAssignedUsers([...assignedUsers, userInput]);
      setUserInput('');
    }
  };

  const removeUser = (user: string) => {
    setAssignedUsers(assignedUsers.filter(u => u !== user));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg w-full max-w-md p-8 border border-border">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-size-1 font-semibold text-card-foreground">Create New Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-size-4 font-normal text-foreground mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label className="block text-size-4 font-normal text-foreground mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-size-4 font-normal text-foreground mb-2">
              Priority
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-size-4 font-normal transition-colors",
                    priority === p
                      ? p === 'low' ? 'bg-priority-low/10 text-priority-low'
                        : p === 'medium' ? 'bg-priority-medium/10 text-priority-medium'
                        : 'bg-priority-high/10 text-priority-high'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-size-4 font-normal text-foreground mb-2">
              Tag
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="Tag name"
                className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-1">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setTagColor(color)}
                    className={cn(
                      "w-8 h-8 rounded border-2",
                      tagColor === color ? 'border-foreground' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-size-4 font-normal text-foreground mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-size-4 font-normal text-foreground mb-2">
              Assigned Users
            </label>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUser())}
                placeholder="Add user"
                className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={addUser}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-size-4 font-normal"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {assignedUsers.map((user) => (
                <span
                  key={user}
                  className="px-2 py-1 bg-muted text-muted-foreground rounded text-size-4 flex items-center gap-1"
                >
                  {user}
                  <button
                    type="button"
                    onClick={() => removeUser(user)}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-8">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-size-3 font-normal"
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-size-3 font-normal"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};