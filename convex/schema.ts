import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    tagColor: v.string(),
    tagName: v.string(),
    dueDate: v.optional(v.string()),
    assignedUsers: v.array(v.string()),
    attachments: v.array(v.object({
      name: v.string(),
      url: v.string(),
      type: v.string(),
    })),
    order: v.number(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }),

  comments: defineTable({
    taskId: v.id("tasks"),
    userId: v.string(),
    userName: v.string(),
    content: v.string(),
    createdAt: v.string(),
  }),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),
  }),
});