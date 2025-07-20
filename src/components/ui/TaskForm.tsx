import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Image, File } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TaskFormProps {
  onSave: (task: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    tagColor: string;
    tagName: string;
    dueDate?: string;
    assignedUsers: string[];
    attachments: Array<{ name: string; url: string; type: string }>;
  }) => void;
  onCancel: () => void;
  initialDueDate?: Date;
  mode?: 'modal' | 'inline';
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSave, onCancel, initialDueDate, mode = 'modal' }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#3B82F6');
  const [dueDate, setDueDate] = useState(initialDueDate ? initialDueDate.toISOString().split('T')[0] : '');
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');
  const [attachments, setAttachments] = useState<Array<{ name: string; url: string; type: string }>>([]);

  // Reset form when initialDueDate changes
  useEffect(() => {
    if (initialDueDate) {
      setDueDate(initialDueDate.toISOString().split('T')[0]);
    }
  }, [initialDueDate]);

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
        attachments,
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newAttachments = Array.from(files).map(file => ({
        name: file.name,
        url: URL.createObjectURL(file), // In real app, upload to server and get URL
        type: file.type || 'application/octet-stream'
      }));
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(newAttachments[index].url);
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formClass = mode === 'inline' ? 'space-y-6' : 'space-y-4';
  const labelClass = mode === 'inline' 
    ? 'block text-sm font-medium text-foreground mb-2'
    : 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <form onSubmit={handleSubmit} className={formClass}>
      {/* Title */}
      <div>
        <label className={labelClass}>
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Task title"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={mode === 'inline' ? 4 : 3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          placeholder="Task description"
        />
      </div>

      {/* Priority */}
      <div>
        <label className={labelClass}>
          Priority
        </label>
        <div className="flex gap-2">
          {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-medium transition-colors capitalize",
                priority === p
                  ? p === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : p === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    : p === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Category and Color Row */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className={labelClass}>
            Category
          </label>
          <input
            type="text"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            placeholder="Category name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex-1">
          <label className={labelClass}>
            Color
          </label>
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <input
                type="text"
                value={tagColor.toUpperCase()}
                onChange={(e) => {
                  const hex = e.target.value;
                  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                    setTagColor(hex);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="#000000"
              />
            </div>
            <div className="w-10 h-10 flex-shrink-0 border border-gray-300 dark:border-gray-600 rounded-lg" style={{ backgroundColor: tagColor }}></div>
          </div>
        </div>
      </div>

      {/* Due Date and Assigned Users Row */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className={labelClass}>
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex-1">
          <label className={labelClass}>
            Assigned Users
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUser())}
                placeholder="Add user"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={addUser}
              className="w-10 h-10 flex-shrink-0 bg-foreground text-background hover:bg-foreground/90 rounded-lg transition-colors font-semibold text-sm flex items-center justify-center"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* User Tags Row */}
      {assignedUsers.length > 0 && (
        <div>
          <div className="flex flex-wrap gap-2">
            {assignedUsers.map((user) => (
              <span
                key={user}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm flex items-center gap-1"
              >
                {user}
                <button
                  type="button"
                  onClick={() => removeUser(user)}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Attachments Section */}
      <div>
        <label className={labelClass}>
          Attachments
        </label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-emerald-600 hover:text-emerald-500">Click to upload</span> or drag and drop
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              PDF, DOC, images, or other files
            </div>
          </label>
        </div>
        
        {/* File List */}
        {attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                  {getFileIcon(attachment.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {attachment.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {attachment.type}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit buttons */}
      <div className="flex gap-3 pt-4 justify-center">
        <button
          type="submit"
          className="w-32 px-6 py-3 bg-foreground text-background hover:bg-foreground/90 rounded-lg transition-colors font-semibold text-sm tracking-wide uppercase"
        >
          CREATE
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-32 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
        >
          CANCEL
        </button>
      </div>
    </form>
  );
};