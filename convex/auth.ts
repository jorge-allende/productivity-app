import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper to get current user from Auth0 token
export const getCurrentUser = query({
  args: { auth0Id: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.auth0Id) return null;
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", q => q.eq("auth0Id", args.auth0Id!))
      .first();
      
    return user;
  },
});

// Create or update user after Auth0 login
export const syncUser = mutation({
  args: {
    auth0Id: v.string(),
    email: v.string(),
    name: v.string(),
    picture: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("syncUser called with:", { auth0Id: args.auth0Id, email: args.email, name: args.name });
    
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_auth0Id", q => q.eq("auth0Id", args.auth0Id))
      .first();
      
    if (existingUser) {
      console.log("Found existing user:", existingUser._id);
      // Update user info
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        avatar: args.picture,
        lastLoginAt: new Date().toISOString(),
      });
      return existingUser._id;
    }
    
    // For new signups, always create a new workspace
    // This allows every user to have their own workspace
    console.log("Creating new user and workspace for:", args.email);
    
    // Create user without workspace first
    const userId = await ctx.db.insert("users", {
      auth0Id: args.auth0Id,
      email: args.email,
      name: args.name,
      // workspaceId will be set after workspace creation
      role: "Admin", // User is admin of their own workspace
      avatar: args.picture,
      joinedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    });
    
    console.log("Created user with ID:", userId);
    
    // Create workspace with the user as creator
    let workspaceId;
    try {
      workspaceId = await ctx.db.insert("workspaces", {
        name: `${args.name}'s Workspace`,
        createdBy: userId,
        plan: "free",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log("Successfully created workspace:", workspaceId);
    } catch (error) {
      console.error("Failed to create workspace. userId:", userId, "error:", error);
      // Clean up the user if workspace creation fails
      await ctx.db.delete(userId);
      throw error;
    }
    
    // Update user with workspace ID
    await ctx.db.patch(userId, { workspaceId });
    
    return userId;
  },
});

// Join workspace via invitation
export const joinWorkspaceViaInvitation = mutation({
  args: {
    auth0Id: v.string(),
    email: v.string(),
    name: v.string(),
    inviteCode: v.string(),
    picture: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find invitation
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_code", q => q.eq("inviteCode", args.inviteCode))
      .first();
      
    if (!invitation) {
      throw new Error("Invalid invitation code");
    }
    
    // Check if invitation is expired
    if (new Date(invitation.expiresAt) < new Date()) {
      throw new Error("Invitation has expired");
    }
    
    // Check if invitation is for this email (optional)
    if (invitation.email && invitation.email !== args.email) {
      throw new Error("This invitation is for a different email address");
    }
    
    // Check if already accepted
    if (invitation.acceptedAt) {
      throw new Error("This invitation has already been used");
    }
    
    // Create user
    const userId = await ctx.db.insert("users", {
      auth0Id: args.auth0Id,
      email: args.email,
      name: args.name,
      workspaceId: invitation.workspaceId,
      role: invitation.role,
      avatar: args.picture,
      joinedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    });
    
    // Mark invitation as accepted
    await ctx.db.patch(invitation._id, {
      acceptedAt: new Date().toISOString(),
    });
    
    return userId;
  },
});

// Get user's workspace
export const getUserWorkspace = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    
    const workspace = await ctx.db.get(user.workspaceId);
    return workspace;
  },
});