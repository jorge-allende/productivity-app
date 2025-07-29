import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getComments = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Get the task to verify workspace access
    const task = await ctx.db.get(args.taskId);
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
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Get the task to find its workspace
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    
    // Verify user has access to the task's workspace
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", identity.subject))
      .first();
    
    if (!user || user.workspaceId !== task.workspaceId) {
      throw new Error("Access denied to this task");
    }
    
    // Verify the userId matches the authenticated user
    if (args.userId !== user._id) {
      throw new Error("Cannot comment as another user");
    }
    
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
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Get the comment to verify workspace access
    const comment = await ctx.db.get(args.id);
    if (!comment) {
      throw new Error("Comment not found");
    }
    
    // Verify user has access to the comment's workspace
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", (q) => q.eq("auth0Id", identity.subject))
      .first();
    
    if (!user || user.workspaceId !== comment.workspaceId) {
      throw new Error("Access denied to this comment");
    }
    
    // Only allow users to delete their own comments
    if (comment.userId !== user._id) {
      throw new Error("Can only delete your own comments");
    }
    
    await ctx.db.delete(args.id);
  },
});