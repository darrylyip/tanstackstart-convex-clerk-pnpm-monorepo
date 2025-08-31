import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const syncUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    photoUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    lastLoginAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        photoUrl: args.photoUrl,
        phone: args.phone,
        lastLoginAt: args.lastLoginAt || now,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        isActive: true,
        phone: args.phone,
        photoUrl: args.photoUrl,
        lastLoginAt: args.lastLoginAt || now,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const syncOrganization = internalMutation({
  args: {
    clerkOrgId: v.string(),
    name: v.string(),
    slug: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        slug: args.slug,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("organizations", {
        clerkOrgId: args.clerkOrgId,
        name: args.name,
        slug: args.slug,
        settings: {
          timezone: args.metadata?.timezone || "America/New_York",
          workWeek: args.metadata?.workWeek || [1, 2, 3, 4, 5], // Mon-Fri default
        },
        subscription: {
          tier: args.metadata?.subscriptionTier || "free",
        },
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const syncOrganizationMembership = internalMutation({
  args: {
    clerkUserId: v.string(),
    clerkOrgId: v.string(),
    role: v.string(),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Find the user
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkUserId))
      .unique();

    if (!user) {
      // Create a minimal user record if they don't exist
      // Full user details will be synced when user.created webhook fires
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkUserId,
        email: "", // Will be updated by user.created webhook
        firstName: "",
        lastName: "",
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      user = await ctx.db.get(userId);
      if (!user) {
        throw new Error(`Failed to create user with Clerk ID ${args.clerkUserId}`);
      }
    }

    // Find the organization
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .unique();

    if (!organization) {
      throw new Error(`Organization with Clerk ID ${args.clerkOrgId} not found`);
    }

    // Map Clerk roles to our role system
    const roleMapping: Record<string, "super_admin" | "admin" | "user"> = {
      "org:admin": "admin",
      "org:member": "user",
      "admin": "admin",
      "member": "user",
    };

    const mappedRole = roleMapping[args.role] || "user";

    // Check for existing membership
    const existing = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_user_org", (q) => q.eq("userId", user._id).eq("organizationId", organization._id))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        role: mappedRole,
        status: "active",
        isDefault: args.isDefault ?? existing.isDefault,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // If this is the user's first membership, make it default
      const existingMemberships = await ctx.db
        .query("organizationMemberships")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      const isFirstMembership = existingMemberships.length === 0;

      return await ctx.db.insert("organizationMemberships", {
        userId: user._id,
        organizationId: organization._id,
        role: mappedRole,
        status: "active",
        isDefault: args.isDefault ?? isFirstMembership,
        joinedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});