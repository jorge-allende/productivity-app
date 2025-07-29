import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getTasks = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Verify user has access to this workspace
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", identity.subject))
      .first();
    
    if (!user || user.workspaceId !== args.workspaceId) {
      throw new Error("Access denied to this workspace");
    }
    
    const tasks = await ctx.db
      .query("tasks")
      .filter(q => q.eq(q.field("workspaceId"), args.workspaceId))
      .collect();
    
    console.log(`[GET_TASKS] Found ${tasks.length} tasks for workspace ${args.workspaceId}`);
    console.log(`[GET_TASKS] User ${user.auth0Id} accessing workspace ${user.workspaceId}`);
    
    // Sort tasks by order within each status to ensure correct display
    // This provides an additional safeguard against any ordering issues
    return tasks.sort((a, b) => {
      // First sort by status (todo -> in_progress -> done)
      const statusOrder = { todo: 0, in_progress: 1, done: 2 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      
      // Then sort by order within the same status
      return (a.order || 0) - (b.order || 0);
    });
  },
});

// Constants for the gap-based ordering system
const ORDER_GAP = 1000; // Gap between consecutive tasks
const MIN_ORDER = 1000;
const MAX_ORDER = Number.MAX_SAFE_INTEGER - ORDER_GAP;

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
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Verify user has access to this workspace
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", identity.subject))
      .first();
    
    if (!user || user.workspaceId !== args.workspaceId) {
      throw new Error("Access denied to this workspace");
    }
    
    // Get all tasks in the same status column, sorted by order
    const tasks = await ctx.db
      .query("tasks")
      .filter(q => 
        q.and(
          q.eq(q.field("workspaceId"), args.workspaceId),
          q.eq(q.field("status"), args.status)
        )
      )
      .collect();
    
    // Sort tasks by order to find the right position
    const sortedTasks = tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Calculate the order for the new task (append to end)
    let newOrder: number;
    if (sortedTasks.length === 0) {
      newOrder = MIN_ORDER;
    } else {
      const lastOrder = sortedTasks[sortedTasks.length - 1].order || 0;
      newOrder = Math.max(lastOrder + ORDER_GAP, MIN_ORDER);
    }
    
    console.log(`Creating task in ${args.status} with order ${newOrder}`);
    
    return await ctx.db.insert("tasks", {
      ...args,
      attachments: [],
      order: newOrder,
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
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Get the task to verify workspace access
    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }
    
    // Verify user has access to the task's workspace
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", identity.subject))
      .first();
    
    if (!user || user.workspaceId !== task.workspaceId) {
      throw new Error("Access denied to this task");
    }
    
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
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Get the task to verify workspace access
    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }
    
    // Verify user has access to the task's workspace
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", identity.subject))
      .first();
    
    if (!user || user.workspaceId !== task.workspaceId) {
      throw new Error("Access denied to this task");
    }
    
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
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const { taskId, newStatus, newOrder } = args;
    
    // Get the task to find its workspace and current status
    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Task not found");
    
    // Verify user has access to the task's workspace
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", identity.subject))
      .first();
    
    if (!user || user.workspaceId !== task.workspaceId) {
      throw new Error("Access denied to this task");
    }
    
    const oldStatus = task.status;
    const oldOrder = task.order;
    
    console.log(`[REORDER] Moving task ${taskId} from ${oldStatus}:${oldOrder} to ${newStatus} at position ${newOrder}`);
    console.log(`[REORDER] Task workspace: ${task.workspaceId}, User workspace: ${user.workspaceId}`);
    
    // Get all tasks in the target column (excluding the task being moved)
    const targetColumnTasks = await ctx.db
      .query("tasks")
      .filter(q => 
        q.and(
          q.eq(q.field("workspaceId"), task.workspaceId),
          q.eq(q.field("status"), newStatus),
          q.neq(q.field("_id"), taskId)
        )
      )
      .collect();
    
    // Sort tasks by order
    const sortedTargetTasks = targetColumnTasks.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Calculate the final order value based on the drop position
    let finalOrder: number;
    
    if (sortedTargetTasks.length === 0) {
      // Empty column - use the base order
      finalOrder = MIN_ORDER;
    } else if (newOrder <= 0) {
      // Dropped at the beginning
      const firstTask = sortedTargetTasks[0];
      finalOrder = Math.max(firstTask.order - ORDER_GAP, MIN_ORDER);
    } else if (newOrder >= sortedTargetTasks.length) {
      // Dropped at the end
      const lastTask = sortedTargetTasks[sortedTargetTasks.length - 1];
      finalOrder = lastTask.order + ORDER_GAP;
    } else {
      // Dropped between two tasks
      const dropIndex = Math.floor(newOrder);
      const prevTask = sortedTargetTasks[dropIndex - 1];
      const nextTask = sortedTargetTasks[dropIndex];
      
      if (prevTask && nextTask) {
        // Calculate the midpoint between the two tasks
        finalOrder = Math.floor((prevTask.order + nextTask.order) / 2);
        
        // Check if we have enough gap, if not, we need to normalize
        if (nextTask.order - prevTask.order < 2) {
          console.log(`[REORDER] Insufficient gap between orders, normalizing column ${newStatus}`);
          await normalizeColumnOrders(ctx, task.workspaceId, newStatus);
          
          // Recalculate after normalization
          const refreshedTasks = await ctx.db
            .query("tasks")
            .filter(q => 
              q.and(
                q.eq(q.field("workspaceId"), task.workspaceId),
                q.eq(q.field("status"), newStatus),
                q.neq(q.field("_id"), taskId)
              )
            )
            .collect();
          
          const refreshedSorted = refreshedTasks.sort((a, b) => (a.order || 0) - (b.order || 0));
          const refreshedPrev = refreshedSorted[dropIndex - 1];
          const refreshedNext = refreshedSorted[dropIndex];
          
          if (refreshedPrev && refreshedNext) {
            finalOrder = Math.floor((refreshedPrev.order + refreshedNext.order) / 2);
          } else {
            finalOrder = MIN_ORDER + (dropIndex * ORDER_GAP);
          }
        }
      } else {
        // Fallback to position-based calculation
        finalOrder = MIN_ORDER + (dropIndex * ORDER_GAP);
      }
    }
    
    console.log(`[REORDER] Final order for task ${taskId}: ${finalOrder}`);
    
    // Update the task with the new status and order
    await ctx.db.patch(taskId, {
      status: newStatus,
      order: finalOrder,
      updatedAt: new Date().toISOString(),
    });
    
    // Verify the task still exists and has correct workspace
    const updatedTask = await ctx.db.get(taskId);
    if (!updatedTask) {
      console.error(`[REORDER] ERROR: Task ${taskId} disappeared after update!`);
    } else {
      console.log(`[REORDER] Task ${taskId} verified after update:`, {
        workspaceId: updatedTask.workspaceId,
        status: updatedTask.status,
        order: updatedTask.order
      });
    }
    
    // Verify no duplicate orders exist
    const allTasksInColumn = await ctx.db
      .query("tasks")
      .filter(q => 
        q.and(
          q.eq(q.field("workspaceId"), task.workspaceId),
          q.eq(q.field("status"), newStatus)
        )
      )
      .collect();
    
    const orderCounts = new Map<number, number>();
    for (const t of allTasksInColumn) {
      const count = orderCounts.get(t.order) || 0;
      orderCounts.set(t.order, count + 1);
    }
    
    // Check for duplicates
    const duplicates = Array.from(orderCounts.entries()).filter(([_, count]) => count > 1);
    if (duplicates.length > 0) {
      console.error(`[REORDER] Duplicate orders detected in ${newStatus}:`, duplicates);
      // Force normalization if duplicates are found
      await normalizeColumnOrders(ctx, task.workspaceId, newStatus);
    }
    
    console.log(`[REORDER] Task ${taskId} successfully moved to ${newStatus}:${finalOrder}`);
  },
});

// Helper function to normalize orders in a column
async function normalizeColumnOrders(
  ctx: any,
  workspaceId: string,
  status: "todo" | "in_progress" | "done"
) {
  console.log(`[NORMALIZE] Normalizing orders for column ${status}`);
  
  const tasks = await ctx.db
    .query("tasks")
    .filter((q: any) => 
      q.and(
        q.eq(q.field("workspaceId"), workspaceId),
        q.eq(q.field("status"), status)
      )
    )
    .collect();
  
  // Sort by current order
  const sortedTasks = tasks.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  
  // Reassign orders with proper gaps
  for (let i = 0; i < sortedTasks.length; i++) {
    const newOrder = MIN_ORDER + (i * ORDER_GAP);
    await ctx.db.patch(sortedTasks[i]._id, {
      order: newOrder,
    });
  }
  
  console.log(`[NORMALIZE] Normalized ${sortedTasks.length} tasks in column ${status}`);
}

// Mutation to normalize all columns in a workspace (useful for fixing order issues)
export const normalizeAllColumns = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Verify user has access to this workspace
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", identity.subject))
      .first();
    
    if (!user || user.workspaceId !== args.workspaceId) {
      throw new Error("Access denied to this workspace");
    }
    
    console.log(`[NORMALIZE ALL] Starting normalization for workspace ${args.workspaceId}`);
    
    // Normalize each column
    const statuses: Array<"todo" | "in_progress" | "done"> = ["todo", "in_progress", "done"];
    for (const status of statuses) {
      await normalizeColumnOrders(ctx, args.workspaceId, status);
    }
    
    console.log(`[NORMALIZE ALL] Completed normalization for workspace ${args.workspaceId}`);
  },
});

// Debug query to check task orders
export const getTaskOrders = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Verify user has access to this workspace
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", identity.subject))
      .first();
    
    if (!user || user.workspaceId !== args.workspaceId) {
      throw new Error("Access denied to this workspace");
    }
    
    const tasks = await ctx.db
      .query("tasks")
      .filter(q => q.eq(q.field("workspaceId"), args.workspaceId))
      .collect();
    
    // Group by status and sort by order
    const tasksByStatus = {
      todo: tasks.filter(t => t.status === "todo").sort((a, b) => a.order - b.order),
      in_progress: tasks.filter(t => t.status === "in_progress").sort((a, b) => a.order - b.order),
      done: tasks.filter(t => t.status === "done").sort((a, b) => a.order - b.order),
    };
    
    // Return simplified data for debugging
    return {
      todo: tasksByStatus.todo.map(t => ({ id: t._id, title: t.title, order: t.order })),
      in_progress: tasksByStatus.in_progress.map(t => ({ id: t._id, title: t.title, order: t.order })),
      done: tasksByStatus.done.map(t => ({ id: t._id, title: t.title, order: t.order })),
    };
  },
});