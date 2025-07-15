export interface TaskComment {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  isEdited?: boolean;
  editedAt?: Date;
  editHistory?: Array<{
    message: string;
    editedAt: Date;
  }>;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  tagColor: string;
  tagName: string;
  dueDate?: string;
  assignedUsers: string[];
  attachments: Array<{ name: string; url: string; type: string }>;
  order: number;
  // Time tracking
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  // Enhanced collaboration
  createdBy: string;
  watchers: string[];
  comments: TaskComment[];
  mentions: string[];
}