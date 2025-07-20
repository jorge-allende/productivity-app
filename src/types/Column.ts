export interface Column {
  id: string;
  title: string;
  order: number;
}

export const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', order: 1 },
  { id: 'in_progress', title: 'In Progress', order: 2 },
  { id: 'done', title: 'Done', order: 3 }
];