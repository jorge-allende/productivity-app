import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all users in a workspace
export const getUsersByWorkspace = query({
  args: { 
    workspaceId: v.id("workspaces"),
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Since workspaceId is optional, we need to filter manually
    const allUsers = await ctx.db.query("users").collect();
    const users = allUsers.filter(user => user.workspaceId === args.workspaceId);
    
    // Filter by search term if provided
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      return users.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    return users;
  },
});

// Get single user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    
    // Users can only update their own profile
    // TODO: Add auth check to verify user is updating their own profile
    
    await ctx.db.patch(userId, updates);
    return userId;
  },
});

// Create invitation
export const createInvitation = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    email: v.string(),
    role: v.union(v.literal("Admin"), v.literal("Manager")),
    invitedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify inviting user is admin
    const invitingUser = await ctx.db.get(args.invitedBy);
    if (!invitingUser || invitingUser.workspaceId !== args.workspaceId || invitingUser.role !== "Admin") {
      throw new Error("Only workspace admins can invite users");
    }
    
    // Check if user already exists in workspace
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();
      
    if (existingUser && existingUser.workspaceId === args.workspaceId) {
      throw new Error("User already exists in this workspace");
    }
    
    // Check for existing pending invitation
    const existingInvitation = await ctx.db
      .query("invitations")
      .withIndex("by_email", q => q.eq("email", args.email))
      .filter(q => 
        q.and(
          q.eq(q.field("workspaceId"), args.workspaceId),
          q.eq(q.field("acceptedAt"), undefined)
        )
      )
      .first();
      
    if (existingInvitation && new Date(existingInvitation.expiresAt) > new Date()) {
      throw new Error("An active invitation already exists for this email");
    }
    
    // Generate invite code
    const inviteCode = generateInviteCode();
    
    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    const invitationId = await ctx.db.insert("invitations", {
      workspaceId: args.workspaceId,
      email: args.email,
      role: args.role,
      inviteCode,
      invitedBy: args.invitedBy,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    });
    
    return { invitationId, inviteCode };
  },
});

// Get invitations for a workspace
export const getInvitations = query({
  args: { 
    workspaceId: v.id("workspaces"),
    includePending: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let invitations = await ctx.db
      .query("invitations")
      .withIndex("by_workspace", q => q.eq("workspaceId", args.workspaceId))
      .collect();
    
    // Filter to only pending if requested
    if (args.includePending) {
      invitations = invitations.filter(inv => !inv.acceptedAt);
    }
    
    // Add inviter info
    const invitationsWithInviter = await Promise.all(
      invitations.map(async (invitation) => {
        const inviter = await ctx.db.get(invitation.invitedBy);
        return {
          ...invitation,
          inviterName: inviter?.name || "Unknown",
        };
      })
    );
    
    return invitationsWithInviter;
  },
});

// Cancel invitation
export const cancelInvitation = mutation({
  args: {
    invitationId: v.id("invitations"),
    requestingUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }
    
    // Verify requesting user is admin of the workspace
    const requestingUser = await ctx.db.get(args.requestingUserId);
    if (!requestingUser || requestingUser.workspaceId !== invitation.workspaceId || requestingUser.role !== "Admin") {
      throw new Error("Only workspace admins can cancel invitations");
    }
    
    // Only allow canceling pending invitations
    if (invitation.acceptedAt) {
      throw new Error("Cannot cancel an accepted invitation");
    }
    
    await ctx.db.delete(args.invitationId);
    return true;
  },
});

// Get user stats for workspace
export const getWorkspaceUserStats = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_workspace", q => q.eq("workspaceId", args.workspaceId))
      .collect();
    
    const stats = {
      totalUsers: users.length,
      adminCount: users.filter(u => u.role === "Admin").length,
      managerCount: users.filter(u => u.role === "Manager").length,
      activeToday: users.filter(u => {
        if (!u.lastLoginAt) return false;
        const lastLogin = new Date(u.lastLoginAt);
        const today = new Date();
        return lastLogin.toDateString() === today.toDateString();
      }).length,
    };
    
    return stats;
  },
});

// Helper function to generate invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Legacy functions for compatibility
export const getWorkspaceUsers = getUsersByWorkspace;
export const getUserById = getUser;