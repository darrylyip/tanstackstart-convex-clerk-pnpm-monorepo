import { QueryCtx, MutationCtx } from "../_generated/server";
import { ConvexError } from "convex/values";
import { Id } from "../_generated/dataModel";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new ConvexError("User not found");
  }

  return user;
}

export async function requireAuth(ctx: QueryCtx | MutationCtx, organizationId?: Id<"organizations">) {
  const user = await getCurrentUser(ctx);
  
  // If no specific organizationId provided, use the user's default organization
  let targetOrgId = organizationId;
  
  if (!targetOrgId) {
    // Find user's default organization membership
    const defaultMembership = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isDefault"), true))
      .unique();
    
    if (!defaultMembership) {
      throw new ConvexError("No organization membership found");
    }
    
    targetOrgId = defaultMembership.organizationId;
  }

  // Verify user has access to this organization
  const membership = await ctx.db
    .query("organizationMemberships")
    .withIndex("by_user_org", (q) => q.eq("userId", user._id).eq("organizationId", targetOrgId))
    .unique();

  if (!membership || membership.status !== "active") {
    throw new ConvexError("No active membership in organization");
  }

  return {
    user,
    organizationId: targetOrgId,
    role: membership.role,
    membership,
  };
}

export function requireRole(requiredRole: "super_admin" | "admin" | "user") {
  return async (ctx: QueryCtx | MutationCtx, organizationId?: Id<"organizations">) => {
    const { user, organizationId: orgId, membership } = await requireAuth(ctx, organizationId);
    
    const roleHierarchy: Record<string, number> = {
      super_admin: 3,
      admin: 2,
      user: 1,
    };

    if (roleHierarchy[membership.role] < roleHierarchy[requiredRole]) {
      throw new ConvexError("Insufficient permissions");
    }

    return { user, organizationId: orgId, membership };
  };
}