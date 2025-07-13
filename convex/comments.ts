import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getComments = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
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
    userId: v.string(),
    userName: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("comments", {
      ...args,
      createdAt: new Date().toISOString(),
    });
  },
});

export const deleteComment = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});