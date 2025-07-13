import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getTasks = query({
  handler: async (ctx) => {
    return await ctx.db.query("tasks").order("asc").collect();
  },
});

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    tagColor: v.string(),
    tagName: v.string(),
    dueDate: v.optional(v.string()),
    assignedUsers: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db.query("tasks").filter(q => q.eq(q.field("status"), args.status)).collect();
    const maxOrder = Math.max(...tasks.map(t => t.order || 0), 0);
    
    return await ctx.db.insert("tasks", {
      ...args,
      attachments: [],
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done"))),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    tagColor: v.optional(v.string()),
    tagName: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    assignedUsers: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const reorderTasks = mutation({
  args: {
    taskId: v.id("tasks"),
    newStatus: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    newOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const { taskId, newStatus, newOrder } = args;
    
    // Get all tasks in the target column
    const tasksInColumn = await ctx.db
      .query("tasks")
      .filter(q => q.eq(q.field("status"), newStatus))
      .order("asc")
      .collect();
    
    // Update the moved task
    await ctx.db.patch(taskId, {
      status: newStatus,
      order: newOrder,
      updatedAt: new Date().toISOString(),
    });
    
    // Reorder other tasks
    for (const task of tasksInColumn) {
      if (task._id !== taskId && task.order >= newOrder) {
        await ctx.db.patch(task._id, {
          order: task.order + 1,
        });
      }
    }
  },
});