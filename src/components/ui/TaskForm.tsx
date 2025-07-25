import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Upload, FileText, Image, File } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useQuery } from 'convex/react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import type { Id } from '../../convex/_generated/dataModel';

// Import api with require to avoid TypeScript depth issues
const { api } = require('../../convex/_generated/api');

interface TaskFormProps {
  onSave: (task: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
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
  const { currentWorkspace } = useWorkspace();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#3B82F6');
  const [dueDate, setDueDate] = useState(initialDueDate ? initialDueDate.toISOString().split('T')[0] : '');
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');
  const [attachments, setAttachments] = useState<Array<{ name: string; url: string; type: string }>>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [hue, setHue] = useState(217);
  const [saturation, setSaturation] = useState(91);
  const [value, setValue] = useState(97);
  const [isDragging, setIsDragging] = useState(false);
  const colorAreaRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  
  // Fetch workspace users
  const workspaceUsers = useQuery(api.users.getUsersByWorkspace, 
    currentWorkspace ? { 
      workspaceId: currentWorkspace.id as Id<"workspaces">,
      searchTerm: userInput || undefined
    } : "skip"
  );
  
  // Filter users for suggestions
  const filteredUsers = useMemo(() => {
    if (!workspaceUsers || !userInput.trim()) return [];
    
    return workspaceUsers
      .filter((user: any) => 
        !assignedUsers.includes(user.name) &&
        (user.name.toLowerCase().includes(userInput.toLowerCase()) ||
         user.email.toLowerCase().includes(userInput.toLowerCase()))
      )
      .slice(0, 5); // Show max 5 suggestions
  }, [workspaceUsers, userInput, assignedUsers]);

  // Convert hex to HSV
  const hexToHsv = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    const s = max === 0 ? 0 : diff / max;
    const v = max;

    if (diff !== 0) {
      switch (max) {
        case r: h = (g - b) / diff + (g < b ? 6 : 0); break;
        case g: h = (b - r) / diff + 2; break;
        case b: h = (r - g) / diff + 4; break;
      }
      h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
  };

  // Convert HSV to hex
  const hsvToHex = (h: number, s: number, v: number) => {
    h /= 360;
    s /= 100;
    v /= 100;

    const c = v * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;

    if (h < 1/6) { r = c; g = x; b = 0; }
    else if (h < 2/6) { r = x; g = c; b = 0; }
    else if (h < 3/6) { r = 0; g = c; b = x; }
    else if (h < 4/6) { r = 0; g = x; b = c; }
    else if (h < 5/6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    const toHex = (n: number) => {
      const hex = Math.round((n + m) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Reset form when initialDueDate changes
  useEffect(() => {
    if (initialDueDate) {
      setDueDate(initialDueDate.toISOString().split('T')[0]);
    }
  }, [initialDueDate]);

  // Initialize HSV from default color
  useEffect(() => {
    const [h, s, v] = hexToHsv(tagColor);
    setHue(h);
    setSaturation(s);
    setValue(v);
  }, []);

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

  const addUser = (user?: string) => {
    const userToAdd = user || userInput.trim();
    if (userToAdd && !assignedUsers.includes(userToAdd)) {
      setAssignedUsers([...assignedUsers, userToAdd]);
      setUserInput('');
      setShowUserDropdown(false);
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

  // Handle color area click and drag
  const handleColorAreaInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = colorAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newSaturation = Math.round((x / rect.width) * 100);
    const newValue = Math.round(100 - (y / rect.height) * 100);

    setSaturation(Math.max(0, Math.min(100, newSaturation)));
    setValue(Math.max(0, Math.min(100, newValue)));
    setTagColor(hsvToHex(hue, Math.max(0, Math.min(100, newSaturation)), Math.max(0, Math.min(100, newValue))));
  };

  const handleColorAreaMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleColorAreaInteraction(e);
  };

  const handleColorAreaMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleColorAreaInteraction(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle hue slider change
  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHue = parseInt(e.target.value);
    setHue(newHue);
    setTagColor(hsvToHex(newHue, saturation, value));
  };

  // Click outside to close color picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  // Global mouse up handler for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

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
          {(['low', 'medium', 'high'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={cn(
                "px-3 py-1 rounded-lg text-sm font-medium transition-colors capitalize",
                priority === p
                  ? p === 'low' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    : p === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    : p === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
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
        <div ref={colorPickerRef} className="flex-1">
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
                    const [h, s, v] = hexToHsv(hex);
                    setHue(h);
                    setSaturation(s);
                    setValue(v);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="#000000"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-10 h-10 flex-shrink-0 border border-gray-300 dark:border-gray-600 rounded-lg hover:scale-105 transition-transform flex items-center justify-center"
              style={{ backgroundColor: tagColor }}
            >
            </button>
          </div>
          {showColorPicker && (
            <div className="absolute z-50 mt-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 shadow-xl">
              <div className="space-y-4">
                {/* Color Area */}
                <div 
                  ref={colorAreaRef}
                  className="relative w-48 h-48 rounded-lg cursor-crosshair border border-gray-200 dark:border-gray-600"
                  style={{
                    background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`
                  }}
                  onMouseDown={handleColorAreaMouseDown}
                  onMouseMove={handleColorAreaMouseMove}
                >
                  {/* Color cursor */}
                  <div
                    className="absolute w-4 h-4 border-2 border-white rounded-full pointer-events-none shadow-lg"
                    style={{
                      left: `${(saturation / 100) * 100}%`,
                      top: `${100 - (value / 100) * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                </div>
                
                {/* Hue Slider */}
                <div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hue}
                    onChange={handleHueChange}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), 
                        hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))`
                    }}
                  />
                </div>
              </div>
            </div>
          )}
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
          <div className="flex gap-2" ref={userDropdownRef}>
            <div className="flex-1 relative">
              <input
                type="text"
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                  setShowUserDropdown(e.target.value.trim().length > 0);
                }}
                onFocus={() => {
                  if (userInput.trim().length > 0 && filteredUsers.length > 0) {
                    setShowUserDropdown(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addUser();
                  } else if (e.key === 'Escape') {
                    setShowUserDropdown(false);
                  }
                }}
                placeholder="Add user"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              
              {/* User Dropdown */}
              {showUserDropdown && filteredUsers.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredUsers.map((user: any) => (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => addUser(user.name)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => addUser()}
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