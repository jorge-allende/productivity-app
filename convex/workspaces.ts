import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get workspace by ID
export const getWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId);
    return workspace;
  },
});

// Update workspace settings
export const updateWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.optional(v.string()),
    settings: v.optional(v.object({
      allowedDomains: v.optional(v.array(v.string())),
      defaultRole: v.optional(v.union(v.literal("Admin"), v.literal("Manager"))),
    })),
  },
  handler: async (ctx, args) => {
    // TODO: Verify user is admin of workspace
    const { workspaceId, ...updates } = args;
    
    await ctx.db.patch(workspaceId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    
    return workspaceId;
  },
});

// Get workspace members
export const getWorkspaceMembers = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    // Since workspaceId is optional, we need to filter manually
    const allUsers = await ctx.db.query("users").collect();
    const members = allUsers.filter(user => user.workspaceId === args.workspaceId);
    
    return members;
  },
});

// Remove user from workspace (admin only)
export const removeUserFromWorkspace = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    requestingUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify requesting user is admin
    const requestingUser = await ctx.db.get(args.requestingUserId);
    if (!requestingUser || requestingUser.workspaceId !== args.workspaceId || requestingUser.role !== "Admin") {
      throw new Error("Only workspace admins can remove users");
    }
    
    // Don't allow removing the last admin
    const allUsers = await ctx.db.query("users").collect();
    const admins = allUsers.filter(user => 
      user.workspaceId === args.workspaceId && user.role === "Admin"
    );
      
    const userToRemove = await ctx.db.get(args.userId);
    if (userToRemove?.role === "Admin" && admins.length === 1) {
      throw new Error("Cannot remove the last admin from workspace");
    }
    
    // Remove user
    await ctx.db.delete(args.userId);
    
    return true;
  },
});

// Update user role in workspace
export const updateUserRole = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    newRole: v.union(v.literal("Admin"), v.literal("Manager")),
    requestingUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify requesting user is admin
    const requestingUser = await ctx.db.get(args.requestingUserId);
    if (!requestingUser || requestingUser.workspaceId !== args.workspaceId || requestingUser.role !== "Admin") {
      throw new Error("Only workspace admins can change roles");
    }
    
    // Don't allow removing the last admin
    if (args.newRole === "Manager") {
      const allUsers = await ctx.db.query("users").collect();
      const admins = allUsers.filter(user => 
        user.workspaceId === args.workspaceId && user.role === "Admin"
      );
        
      if (admins.length === 1 && admins[0]._id === args.userId) {
        throw new Error("Cannot remove admin role from the last admin");
      }
    }
    
    // Update role
    await ctx.db.patch(args.userId, {
      role: args.newRole,
    });
    
    return true;
  },
});