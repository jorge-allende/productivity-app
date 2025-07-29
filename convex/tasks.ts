import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getTasks = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    // const user = await ctx.auth.getUserIdentity();
    // if (!user) throw new Error("Not authenticated");
    
    // Verify user has access to this workspace
    // const membership = await ctx.db
    //   .query("users")
    //   .filter(q => 
    //     q.and(
    //       q.eq(q.field("email"), user.email),
    //       q.eq(q.field("workspaceId"), args.workspaceId)
    //     )
    //   )
    //   .first();
    // if (!membership) throw new Error("Access denied");
    
    return await ctx.db
      .query("tasks")
      .filter(q => q.eq(q.field("workspaceId"), args.workspaceId))
      .order("asc")
      .collect();
  },
});

export const createTask = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    description: v.string(),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    tagColor: v.string(),
    tagName: v.string(),
    dueDate: v.optional(v.string()),
    assignedUsers: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    
    const tasks = await ctx.db
      .query("tasks")
      .filter(q => 
        q.and(
          q.eq(q.field("workspaceId"), args.workspaceId),
          q.eq(q.field("status"), args.status)
        )
      )
      .collect();
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
    assignedUsers: v.optional(v.array(v.id("users"))),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check and verify task belongs to user's workspace
    
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const deleteTask = mutation({
  args: { 
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check and verify task belongs to user's workspace
    
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
    // TODO: Add authentication check and verify task belongs to user's workspace
    
    const { taskId, newStatus, newOrder } = args;
    
    // Get the task to find its workspace and current status
    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Task not found");
    
    const oldStatus = task.status;
    const oldOrder = task.order;
    
    console.log(`Moving task ${taskId} from ${oldStatus}:${oldOrder} to ${newStatus}:${newOrder}`);
    
    // First, update the moved task
    await ctx.db.patch(taskId, {
      status: newStatus,
      order: Math.round(newOrder), // Use integer orders to avoid floating point issues
      updatedAt: new Date().toISOString(),
    });
    
    // If moving to a different column, we need to handle both source and target columns
    if (oldStatus !== newStatus) {
      // Get tasks in the source column (excluding the moved task)
      const sourceColumnTasks = await ctx.db
        .query("tasks")
        .filter(q => 
          q.and(
            q.eq(q.field("workspaceId"), task.workspaceId),
            q.eq(q.field("status"), oldStatus),
            q.neq(q.field("_id"), taskId)
          )
        )
        .order("asc")
        .collect();
      
      // Reorder source column tasks to fill the gap
      for (const sourceTask of sourceColumnTasks) {
        if (sourceTask.order > oldOrder) {
          await ctx.db.patch(sourceTask._id, {
            order: sourceTask.order - 1,
          });
        }
      }
    }
    
    // Get tasks in the target column AFTER the moved task has been updated
    const targetColumnTasks = await ctx.db
      .query("tasks")
      .filter(q => 
        q.and(
          q.eq(q.field("workspaceId"), task.workspaceId),
          q.eq(q.field("status"), newStatus),
          q.neq(q.field("_id"), taskId) // Exclude the moved task
        )
      )
      .order("asc")
      .collect();
    
    // Reorder target column tasks to make space
    const roundedNewOrder = Math.round(newOrder);
    for (const targetTask of targetColumnTasks) {
      if (targetTask.order >= roundedNewOrder) {
        await ctx.db.patch(targetTask._id, {
          order: targetTask.order + 1,
        });
      }
    }
    
    console.log(`Task ${taskId} successfully moved to ${newStatus}:${roundedNewOrder}`);
  },
});