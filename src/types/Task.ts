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
}