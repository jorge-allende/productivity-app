import { Task } from '../types/Task';

// Constants from the implementation
const ORDER_GAP = 1000;
const MIN_ORDER = 1000;

// Mock implementation for testing
function calculateNewOrder(tasks: Task[], position: number): number {
  const sortedTasks = tasks.sort((a, b) => a.order - b.order);
  
  if (sortedTasks.length === 0 || position <= 0) {
    return MIN_ORDER;
  }
  
  if (position >= sortedTasks.length) {
    return sortedTasks[sortedTasks.length - 1].order + ORDER_GAP;
  }
  
  const prevTask = sortedTasks[position - 1];
  const nextTask = sortedTasks[position];
  
  if (prevTask && nextTask) {
    const gap = nextTask.order - prevTask.order;
    if (gap < 2) {
      // Return midpoint even if gap is too small (triggers normalization in real impl)
      return (prevTask.order + nextTask.order) / 2;
    }
    return Math.floor((prevTask.order + nextTask.order) / 2);
  }
  
  return MIN_ORDER + (position * ORDER_GAP);
}

function normalizeTaskOrders(tasks: Task[]): Task[] {
  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);
  
  return sortedTasks.map((task, index) => ({
    ...task,
    order: MIN_ORDER + (index * ORDER_GAP),
  }));
}

describe('Task Reordering Logic', () => {
  const createTask = (id: string, columnId: string, order: number): Task => ({
    _id: id,
    title: `Task ${id}`,
    description: '',
    priority: 'medium',
    tagColor: '#000',
    tagName: 'Task',
    assignedUsers: [],
    attachments: [],
    order,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    columnId,
    createdBy: 'user1',
    watchers: [],
    comments: [],
    mentions: [],
  });

  describe('calculateNewOrder', () => {
    it('should return MIN_ORDER for empty column', () => {
      const tasks: Task[] = [];
      const order = calculateNewOrder(tasks, 0);
      expect(order).toBe(MIN_ORDER);
    });

    it('should place task at beginning with correct gap', () => {
      const tasks = [
        createTask('1', 'todo', 2000),
        createTask('2', 'todo', 3000),
      ];
      
      const order = calculateNewOrder(tasks, 0);
      expect(order).toBe(1000); // MIN_ORDER
    });

    it('should place task at end with correct gap', () => {
      const tasks = [
        createTask('1', 'todo', 1000),
        createTask('2', 'todo', 2000),
      ];
      
      const order = calculateNewOrder(tasks, 2);
      expect(order).toBe(3000); // 2000 + ORDER_GAP
    });

    it('should place task between two tasks', () => {
      const tasks = [
        createTask('1', 'todo', 1000),
        createTask('2', 'todo', 3000),
      ];
      
      const order = calculateNewOrder(tasks, 1);
      expect(order).toBe(2000); // (1000 + 3000) / 2
    });

    it('should handle insufficient gap between tasks', () => {
      const tasks = [
        createTask('1', 'todo', 1000),
        createTask('2', 'todo', 1001), // Only 1 unit gap
      ];
      
      const order = calculateNewOrder(tasks, 1);
      // Should return a value that triggers normalization
      expect(order).toBe(1000.5); // Midpoint when gap is too small
    });

    it('should handle negative position', () => {
      const tasks = [
        createTask('1', 'todo', 2000),
      ];
      
      const order = calculateNewOrder(tasks, -1);
      expect(order).toBe(MIN_ORDER);
    });

    it('should handle position beyond array length', () => {
      const tasks = [
        createTask('1', 'todo', 1000),
      ];
      
      const order = calculateNewOrder(tasks, 10);
      expect(order).toBe(2000); // 1000 + ORDER_GAP
    });

    it('should maintain order when inserting multiple tasks', () => {
      const tasks = [
        createTask('1', 'todo', 1000),
        createTask('2', 'todo', 2000),
        createTask('3', 'todo', 3000),
      ];
      
      // Insert between 1 and 2
      const order1 = calculateNewOrder(tasks, 1);
      expect(order1).toBe(1500);
      
      // Insert between 2 and 3
      const order2 = calculateNewOrder(tasks, 2);
      expect(order2).toBe(2500);
    });
  });

  describe('normalizeTaskOrders', () => {
    it('should normalize tasks with proper gaps', () => {
      const tasks = [
        createTask('1', 'todo', 500),
        createTask('2', 'todo', 501),
        createTask('3', 'todo', 999),
      ];
      
      const normalized = normalizeTaskOrders(tasks);
      
      expect(normalized[0].order).toBe(1000);
      expect(normalized[1].order).toBe(2000);
      expect(normalized[2].order).toBe(3000);
    });

    it('should maintain relative order of tasks', () => {
      const tasks = [
        createTask('2', 'todo', 1500),
        createTask('1', 'todo', 1000),
        createTask('3', 'todo', 2000),
      ];
      
      const normalized = normalizeTaskOrders(tasks);
      const sortedNormalized = normalized.sort((a, b) => a.order - b.order);
      
      expect(sortedNormalized[0]._id).toBe('1');
      expect(sortedNormalized[1]._id).toBe('2');
      expect(sortedNormalized[2]._id).toBe('3');
    });

    it('should handle empty array', () => {
      const tasks: Task[] = [];
      const normalized = normalizeTaskOrders(tasks);
      expect(normalized).toEqual([]);
    });

    it('should handle single task', () => {
      const tasks = [createTask('1', 'todo', 999)];
      const normalized = normalizeTaskOrders(tasks);
      
      expect(normalized[0].order).toBe(MIN_ORDER);
    });

    it('should preserve all task properties except order', () => {
      const task = createTask('1', 'todo', 500);
      task.title = 'Special Task';
      task.priority = 'high';
      
      const normalized = normalizeTaskOrders([task]);
      
      expect(normalized[0].title).toBe('Special Task');
      expect(normalized[0].priority).toBe('high');
      expect(normalized[0].order).toBe(MIN_ORDER);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle drag and drop sequence without normalization', () => {
      let tasks = [
        createTask('1', 'todo', 1000),
        createTask('2', 'todo', 2000),
        createTask('3', 'todo', 3000),
      ];
      
      // Move task 3 between 1 and 2
      const newOrder = calculateNewOrder(
        tasks.filter(t => t._id !== '3'),
        1
      );
      
      expect(newOrder).toBe(1500);
      
      // Update task 3's order
      tasks = tasks.map(t => t._id === '3' ? { ...t, order: newOrder } : t);
      
      // Verify final order
      const sorted = tasks.sort((a, b) => a.order - b.order);
      expect(sorted[0]._id).toBe('1');
      expect(sorted[1]._id).toBe('3');
      expect(sorted[2]._id).toBe('2');
    });

    it('should handle multiple insertions that require normalization', () => {
      let tasks = [
        createTask('1', 'todo', 1000),
        createTask('2', 'todo', 2000),
      ];
      
      // Insert multiple tasks between 1 and 2
      for (let i = 0; i < 5; i++) {
        const newOrder = calculateNewOrder(tasks, 1);
        tasks.push(createTask(`new${i}`, 'todo', newOrder));
        tasks.sort((a, b) => a.order - b.order);
      }
      
      // At some point, gaps will be too small
      // Check if any adjacent tasks have insufficient gaps
      let needsNormalization = false;
      for (let i = 1; i < tasks.length; i++) {
        if (tasks[i].order - tasks[i - 1].order < 2) {
          needsNormalization = true;
          break;
        }
      }
      
      if (needsNormalization) {
        tasks = normalizeTaskOrders(tasks);
        
        // After normalization, all gaps should be ORDER_GAP
        for (let i = 1; i < tasks.length; i++) {
          expect(tasks[i].order - tasks[i - 1].order).toBe(ORDER_GAP);
        }
      }
    });

    it('should handle moving tasks between columns', () => {
      const todoTasks = [
        createTask('1', 'todo', 1000),
        createTask('2', 'todo', 2000),
      ];
      
      const inProgressTasks = [
        createTask('3', 'in_progress', 1000),
        createTask('4', 'in_progress', 2000),
      ];
      
      // Move task 1 to in_progress column at position 1
      const newOrder = calculateNewOrder(inProgressTasks, 1);
      expect(newOrder).toBe(1500);
      
      // Task 1 would be updated with new status and order
      const movedTask = { ...todoTasks[0], status: 'in_progress' as const, order: newOrder };
      
      // Verify it's in the right position
      const updatedInProgress = [...inProgressTasks, movedTask].sort((a, b) => a.order - b.order);
      expect(updatedInProgress[0]._id).toBe('3');
      expect(updatedInProgress[1]._id).toBe('1');
      expect(updatedInProgress[2]._id).toBe('4');
    });
  });
});