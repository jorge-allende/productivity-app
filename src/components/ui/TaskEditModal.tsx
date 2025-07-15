import React, { useState, useEffect, useRef } from 'react';
import { X, Pencil, Edit2, Clock, History, Eye } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Task, TaskComment } from '../../types/Task';

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onSave: (updatedTask: Task, commentOnly?: boolean) => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({ isOpen, onClose, task, onSave }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [tagName, setTagName] = useState(task.tagName);
  const [tagColor, setTagColor] = useState(task.tagColor);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');
  const [assignedUsers, setAssignedUsers] = useState<string[]>(task.assignedUsers);
  const [userInput, setUserInput] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [value, setValue] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const particleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const colorAreaRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  
  // Comment state
  const [comments, setComments] = useState<TaskComment[]>(task.comments);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [viewingHistoryId, setViewingHistoryId] = useState<string | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Watchers state
  const [watchers, setWatchers] = useState<string[]>(task.watchers);
  const [showWatchersDropdown, setShowWatchersDropdown] = useState(false);
  const [newWatcher, setNewWatcher] = useState('');
  const watchersDropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setTagName(task.tagName);
    setTagColor(task.tagColor);
    setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setAssignedUsers(task.assignedUsers);
    setComments(task.comments);
    setWatchers(task.watchers);
    
    // Update HSV values when task color changes
    const [h, s, v] = hexToHsv(task.tagColor);
    setHue(h);
    setSaturation(s);
    setValue(v);
  }, [task]);

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

  // Global mouse up handler for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave({
        ...task,
        title,
        description,
        priority,
        tagColor,
        tagName: tagName || 'General',
        dueDate: dueDate ? new Date(dueDate).toISOString() : task.dueDate,
        assignedUsers,
      });
      setIsEditMode(false);
      onClose();
    }
  };

  const handleCancel = () => {
    // Reset form values to original task values
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setTagName(task.tagName);
    setTagColor(task.tagColor);
    setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setAssignedUsers(task.assignedUsers);
    setUserInput('');
    setShowColorPicker(false);
    
    // Update HSV values when task color changes
    const [h, s, v] = hexToHsv(task.tagColor);
    setHue(h);
    setSaturation(s);
    setValue(v);
    
    // Exit edit mode
    setIsEditMode(false);
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

  const createParticleEffect = () => {
    const button = saveButtonRef.current;
    if (!button) return;

    const colors = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];
    const buttonRect = button.getBoundingClientRect();
    
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.position = 'fixed';
      particle.style.width = `${2 + Math.random() * 4}px`;
      particle.style.height = particle.style.width;
      particle.style.borderRadius = '50%';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.pointerEvents = 'none';
      particle.style.opacity = '0.9';
      particle.style.boxShadow = `0 0 8px ${particle.style.backgroundColor}`;
      particle.style.zIndex = '9999';
      
      // Start from button center
      const centerX = buttonRect.left + buttonRect.width / 2;
      const centerY = buttonRect.top + buttonRect.height / 2;
      
      // Random direction and distance
      const angle = Math.random() * Math.PI * 2;
      const distance = 80 + Math.random() * 120;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;
      particle.style.setProperty('--x', `${x}px`);
      particle.style.setProperty('--y', `${y}px`);
      
      const duration = 1.2 + Math.random() * 0.8;
      particle.style.animation = `particleFloat ${duration}s ease-out forwards`;
      
      document.body.appendChild(particle);
      
      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, duration * 1000);
    }
  };

  const startHoverEffect = () => {
    if (particleIntervalRef.current) return;
    
    createParticleEffect();
    particleIntervalRef.current = setInterval(() => {
      createParticleEffect();
    }, 300);
  };

  const stopHoverEffect = () => {
    if (particleIntervalRef.current) {
      clearInterval(particleIntervalRef.current);
      particleIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (particleIntervalRef.current) {
        clearInterval(particleIntervalRef.current);
      }
    };
  }, []);

  // Comment handling functions
  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj: TaskComment = {
        id: Date.now().toString(),
        user: 'Current User', // In real app, this would come from authentication
        message: newComment.trim(),
        timestamp: new Date(),
        isEdited: false
      };
      
      const updatedComments = [...comments, newCommentObj];
      setComments(updatedComments);
      setNewComment('');
      
      // Update the task with new comments
      onSave({
        ...task,
        comments: updatedComments
      }, true);
    }
  };

  const handleEditComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment && comment.user === 'Current User') { // Check if user owns the comment
      setEditingCommentId(commentId);
      setEditingCommentText(comment.message);
    }
  };

  const handleSaveEdit = (commentId: string) => {
    if (editingCommentText.trim()) {
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          const editHistory = comment.editHistory || [];
          editHistory.push({
            message: comment.message,
            editedAt: comment.editedAt || comment.timestamp
          });
          
          return {
            ...comment,
            message: editingCommentText.trim(),
            isEdited: true,
            editedAt: new Date(),
            editHistory
          };
        }
        return comment;
      });
      
      setComments(updatedComments);
      setEditingCommentId(null);
      setEditingCommentText('');
      
      // Update the task with edited comments
      onSave({
        ...task,
        comments: updatedComments
      }, true);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const formatCommentDate = (date: Date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInHours = (now.getTime() - commentDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return commentDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return commentDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: commentDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      }) + ' at ' + commentDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (commentInputRef.current) {
      commentInputRef.current.style.height = 'auto';
      commentInputRef.current.style.height = `${commentInputRef.current.scrollHeight}px`;
    }
  }, [newComment]);

  // Watchers functionality
  const handleAddWatcher = () => {
    if (newWatcher.trim() && !watchers.includes(newWatcher.trim())) {
      const updatedWatchers = [...watchers, newWatcher.trim()];
      setWatchers(updatedWatchers);
      setNewWatcher('');
      
      // Update the task with new watchers
      onSave({
        ...task,
        watchers: updatedWatchers
      }, true);
    }
  };

  const handleRemoveWatcher = (watcherToRemove: string) => {
    const updatedWatchers = watchers.filter(watcher => watcher !== watcherToRemove);
    setWatchers(updatedWatchers);
    
    // Update the task with new watchers
    onSave({
      ...task,
      watchers: updatedWatchers
    }, true);
  };

  // Click outside to close watchers dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (watchersDropdownRef.current && !watchersDropdownRef.current.contains(event.target as Node)) {
        setShowWatchersDropdown(false);
      }
    };

    if (showWatchersDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWatchersDropdown]);


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg p-4 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Task' : 'Task Details'}
          </h2>
          <div className="flex items-center gap-2">
            {!isEditMode && (
              <>
                <div className="relative" ref={watchersDropdownRef}>
                  <button
                    onClick={() => setShowWatchersDropdown(!showWatchersDropdown)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-1"
                    title={`Watchers (${watchers.length})`}
                  >
                    <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{watchers.length}</span>
                  </button>
                  
                  {showWatchersDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Watchers ({watchers.length})
                        </h4>
                        
                        {watchers.length > 0 ? (
                          <div className="space-y-2 mb-3">
                            {watchers.map((watcher, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 dark:text-gray-300">{watcher}</span>
                                <button
                                  onClick={() => handleRemoveWatcher(watcher)}
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                  title="Remove watcher"
                                >
                                  <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">No watchers yet</div>
                        )}
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newWatcher}
                            onChange={(e) => setNewWatcher(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddWatcher();
                              }
                            }}
                            placeholder="Add watcher"
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            onClick={handleAddWatcher}
                            className="px-3 py-1 text-sm bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setIsEditMode(true)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="Edit task"
                >
                  <Pencil className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <style>{`
          @keyframes particleFloat {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 0.8;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translate(var(--x), var(--y)) scale(0);
              opacity: 0;
            }
          }
        `}</style>
        
        {isEditMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
                    priority === p
                      ? p === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : p === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  )}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Category and Color Row */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  className="w-10 h-10 flex-shrink-0 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25 font-semibold text-sm flex items-center justify-center"
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

          <div className="flex gap-3 pt-4 justify-center">
            <button
              ref={saveButtonRef}
              type="submit"
              onMouseEnter={startHoverEffect}
              onMouseLeave={stopHoverEffect}
              className="w-32 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/30 font-semibold text-sm tracking-wide uppercase"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-32 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
          </div>
          </form>
        ) : (
          <div className="space-y-3">
            {/* Preview Mode Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                {task.title}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white min-h-[76px]">
                {task.description || 'No description'}
              </div>
            </div>

            {/* Priority and Category Row */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  task.priority === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                )}>
                  {task.priority}
                </span>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <span
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ backgroundColor: task.tagColor + '20', color: task.tagColor }}
                >
                  {task.tagName || 'General'}
                </span>
              </div>
            </div>

            {/* Due Date and Assigned Users Row */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assigned Users
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white min-h-[36px] flex items-center">
                  {task.assignedUsers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {task.assignedUsers.map((user) => (
                        <span
                          key={user}
                          className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm"
                        >
                          {user}
                        </span>
                      ))}
                    </div>
                  ) : (
                    'No assigned users'
                  )}
                </div>
              </div>
            </div>

            {/* Task Metadata */}
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Created by <span className="font-medium text-gray-900 dark:text-white">{task.createdBy}</span> · 
              Created on {task.createdAt.toLocaleDateString()}{task.completedAt ? ' · ' : ' · '}
              {task.completedAt && (
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Completed on {task.completedAt.toLocaleDateString()} · 
                </span>
              )}
              Last updated {task.updatedAt.toLocaleDateString()}
            </div>


            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Comments ({comments.length})
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                {comments.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto mb-3">
                    {(showAllComments ? comments : comments.slice(-3)).map((comment) => (
                      <div key={comment.id} className="border-l-2 border-gray-300 dark:border-gray-600 pl-3">
                        {editingCommentId === comment.id ? (
                          // Edit mode for comment
                          <div className="space-y-2">
                            <textarea
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                              rows={2}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(comment.id)}
                                className="px-2 py-1 text-xs bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-2 py-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Display mode for comment
                          <>
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-gray-900 dark:text-white">
                                  {comment.user}
                                </span>
                                {comment.isEdited && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                                    (edited)
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatCommentDate(comment.timestamp)}
                                </span>
                                {comment.user === 'Current User' && (
                                  <button
                                    onClick={() => handleEditComment(comment.id)}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                    title="Edit comment"
                                  >
                                    <Edit2 className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{comment.message}</p>
                            {comment.isEdited && comment.editedAt && (
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3" />
                                <span>Edited {formatCommentDate(comment.editedAt)}</span>
                                {comment.editHistory && comment.editHistory.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <button
                                      onClick={() => setViewingHistoryId(comment.id)}
                                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                    >
                                      <History className="w-3 h-3" />
                                      View history
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-sm mb-3">No comments yet</div>
                )}
                
                {/* Show all/less button */}
                {comments.length > 3 && (
                  <button
                    onClick={() => setShowAllComments(!showAllComments)}
                    className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline mb-3"
                  >
                    {showAllComments ? 'Show less' : `Show all ${comments.length} comments`}
                  </button>
                )}
                
                {/* Add comment input */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                  <div className="flex gap-2">
                    <textarea
                      ref={commentInputRef}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none min-h-[32px]"
                      rows={1}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Press Enter to send • Shift+Enter for new line
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Comment History Modal */}
      {viewingHistoryId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit History</h3>
              <button
                onClick={() => setViewingHistoryId(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            {(() => {
              const comment = comments.find(c => c.id === viewingHistoryId);
              if (!comment || !comment.editHistory) return null;
              
              const allVersions: Array<{ message: string; date: Date; isCurrent?: boolean }> = [
                ...comment.editHistory.map(h => ({ message: h.message, date: h.editedAt })),
                { message: comment.message, date: comment.editedAt || comment.timestamp, isCurrent: true }
              ];
              
              return (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {allVersions.reverse().map((version, index) => (
                    <div key={index} className="border-l-2 border-gray-300 dark:border-gray-600 pl-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatCommentDate(version.date)}
                        </span>
                        {version.isCurrent && (
                          <span className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{version.message}</p>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};