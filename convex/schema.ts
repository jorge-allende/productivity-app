import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  workspaces: defineTable({
    name: v.string(),
    createdBy: v.id("users"),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    settings: v.optional(v.object({
      allowedDomains: v.optional(v.array(v.string())),
      defaultRole: v.optional(v.union(v.literal("Admin"), v.literal("Manager"))),
    })),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_creator", ["createdBy"]),

  tasks: defineTable({
    workspaceId: v.id("workspaces"),
    title: v.string(),
    description: v.string(),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    tagColor: v.string(),
    tagName: v.string(),
    dueDate: v.optional(v.string()),
    assignedUsers: v.array(v.id("users")),
    attachments: v.array(v.object({
      name: v.string(),
      url: v.string(),
      type: v.string(),
    })),
    order: v.number(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_workspace", ["workspaceId"])
    .index("by_workspace_status", ["workspaceId", "status"]),

  comments: defineTable({
    workspaceId: v.id("workspaces"),
    taskId: v.id("tasks"),
    userId: v.id("users"),
    userName: v.string(),
    content: v.string(),
    createdAt: v.string(),
  }).index("by_task", ["taskId"])
    .index("by_workspace", ["workspaceId"]),

  users: defineTable({
    auth0Id: v.string(),
    email: v.string(),
    name: v.string(),
    workspaceId: v.optional(v.id("workspaces")),
    role: v.union(v.literal("Admin"), v.literal("Manager")),
    avatar: v.optional(v.string()),
    joinedAt: v.string(),
    lastLoginAt: v.optional(v.string()),
  }).index("by_auth0Id", ["auth0Id"])
    .index("by_email", ["email"]),

  invitations: defineTable({
    workspaceId: v.id("workspaces"),
    email: v.string(),
    role: v.union(v.literal("Admin"), v.literal("Manager")),
    inviteCode: v.string(),
    invitedBy: v.id("users"),
    expiresAt: v.string(),
    acceptedAt: v.optional(v.string()),
    createdAt: v.string(),
  }).index("by_code", ["inviteCode"])
    .index("by_workspace", ["workspaceId"])
    .index("by_email", ["email"]),
});