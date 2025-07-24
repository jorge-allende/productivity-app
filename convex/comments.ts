import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getComments = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    // Verify the task belongs to user's workspace
    
    return await ctx.db
      .query("comments")
      .filter(q => q.eq(q.field("taskId"), args.taskId))
      .order("desc")
      .collect();
  },
});

export const addComment = mutation({
  args: {
    taskId: v.id("tasks"),
    userId: v.id("users"),
    userName: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    // Verify the task belongs to user's workspace
    
    // Get the task to find its workspace
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    
    return await ctx.db.insert("comments", {
      ...args,
      workspaceId: task.workspaceId,
      createdAt: new Date().toISOString(),
    });
  },
});

export const deleteComment = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    // TODO: Add authentication check
    // Verify the comment belongs to user's workspace
    
    await ctx.db.delete(args.id);
  },
});