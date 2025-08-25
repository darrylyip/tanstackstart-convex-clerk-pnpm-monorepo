# API Specification

## Convex Function Architecture

Since we're using Convex, we'll implement type-safe functions instead of traditional REST APIs. All functions now require explicit organization context for multi-tenant access control.

### Multi-Organization Authentication Pattern

```typescript
// convex/lib/auth.ts

import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export async function getAuthenticatedUser(
  ctx: QueryCtx | MutationCtx, 
  requiredOrgId?: Id<"organizations">
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user) throw new Error("User not found");

  // Get user's organization memberships
  const memberships = await ctx.db
    .query("organizationMemberships")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .filter((q) => q.eq(q.field("status"), "active"))
    .collect();

  if (memberships.length === 0) {
    throw new Error("User has no active organization memberships");
  }

  // If specific org required, verify access
  if (requiredOrgId) {
    const membership = memberships.find(m => m.organizationId === requiredOrgId);
    if (!membership) {
      throw new Error("Access denied: User not member of required organization");
    }
    return { user, membership, availableOrgs: memberships };
  }

  // Return default org or first available
  const defaultMembership = memberships.find(m => m.isDefault) || memberships[0];
  return { user, membership: defaultMembership, availableOrgs: memberships };
}
```

### Function Implementation Patterns

```typescript
// convex/functions/schedules.ts

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate AI Schedule
export const generateSchedule = mutation({
  args: {
    organizationId: v.id("organizations"), // Explicit org context
    period: v.object({
      startDate: v.string(),
      endDate: v.string(),
    }),
    constraints: v.object({
      respectPTO: v.boolean(),
      enforceHolidays: v.boolean(),
      balanceWorkload: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    // Verify user has admin access to specified organization
    const { user, membership } = await getAuthenticatedUser(ctx, args.organizationId);
    
    if (!["admin"].includes(membership.role)) {
      throw new Error("Admin access required");
    }

    // Fetch all required data for specified organization
    const staffMemberships = await ctx.db
      .query("organizationMemberships")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .filter((q) => q.eq(q.field("role"), "staff"))
      .collect();

    // Get user details for staff members
    const staffUsers = await Promise.all(
      staffMemberships.map(membership => ctx.db.get(membership.userId))
    );

    // Get schedulable contacts for this organization
    const schedulableContacts = await ctx.db
      .query("schedulableContacts")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get organization scheduling rules
    const orgRules = await ctx.db
      .query("organizationSchedulingRules")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .unique();

    // Get contact-specific scheduling settings
    const contactSettings = await Promise.all(
      schedulableContacts.map(contact =>
        ctx.db
          .query("contactSchedulingSettings")
          .withIndex("by_contact", (q) => q.eq("contactId", contact._id))
          .unique()
      )
    );

    const holidays = await ctx.db
      .query("holidays")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const ptoRequests = await ctx.db
      .query("ptoRequests")
      .withIndex("by_organization_status", (q) => 
        q.eq("organizationId", args.organizationId).eq("status", "approved")
      )
      .collect();

    // Call AI service with rules and constraints
    const schedule = await generateAISchedule({
      schedulableContacts,
      orgRules,
      contactSettings: contactSettings.filter(s => s !== null),
      holidays,
      ptoRequests,
      constraints: args.constraints,
      period: args.period,
    });

    // Save schedule
    const scheduleId = await ctx.db.insert("schedules", {
      organizationId: args.organizationId,
      startDate: args.period.startDate,
      endDate: args.period.endDate,
      status: "draft",
      generatedBy: "ai",
      aiMetadata: schedule.metadata,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Save assignments
    for (const assignment of schedule.assignments) {
      await ctx.db.insert("shiftAssignments", {
        scheduleId,
        ...assignment,
      });
    }

    return scheduleId;
  },
});

// Get Schedule with Assignments (Real-time)
export const watchSchedule = query({
  args: {
    scheduleId: v.id("schedules"),
  },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) return null;

    // Verify user has access to schedule's organization
    const { user, membership } = await getAuthenticatedUser(ctx, schedule.organizationId);

    // All roles can view schedules within their organization
    if (!membership) {
      throw new Error("Access denied: Not a member of schedule's organization");
    }

    const assignments = await ctx.db
      .query("shiftAssignments")
      .withIndex("by_schedule", (q) => q.eq("scheduleId", args.scheduleId))
      .collect();

    return { ...schedule, assignments };
  },
});

// Submit Preference Request
export const submitPreference = mutation({
  args: {
    type: v.union(v.literal("dayOff"), v.literal("shiftType"), v.literal("pattern")),
    dates: v.array(v.string()),
    details: v.optional(v.object({
      shiftType: v.optional(v.string()),
      reason: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Get authenticated user with organization context
    const { user } = await getAuthenticatedUser(ctx);

    const preferenceId = await ctx.db.insert("preferenceRequests", {
      userId: user._id,
      type: args.type,
      dates: args.dates,
      details: args.details,
      status: "pending",
      createdAt: Date.now(),
    });

    return preferenceId;
  },
});

// Get Schedule by Month (Non-realtime)
export const getScheduleByMonth = action({
  args: {
    year: v.number(),
    month: v.number(), // 1-12
  },
  handler: async (ctx, args) => {
    // Get authenticated user with organization context
    const { orgId } = await getAuthenticatedUser(ctx);

    // Calculate month date range
    const startDate = `${args.year}-${args.month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(args.year, args.month, 0).toISOString().split('T')[0];

    // Find schedules that overlap with the requested month
    const schedules = await ctx.runQuery(internal.schedules.getByDateRange, {
      organizationId: orgId,
      startDate,
      endDate,
    });

    // Get all assignments for the schedules
    const allAssignments = [];
    for (const schedule of schedules) {
      const assignments = await ctx.runQuery(internal.schedules.getAssignments, {
        scheduleId: schedule._id,
      });
      allAssignments.push(...assignments);
    }

    return {
      schedules,
      assignments: allAssignments,
      month: args.month,
      year: args.year,
    };
  },
});

// Real-time Schedule Updates
export const watchScheduleChanges = query({
  args: {
    scheduleId: v.id("schedules"),
  },
  handler: async (ctx, args) => {
    // Get authenticated user with organization context
    const { orgId } = await getAuthenticatedUser(ctx);

    // This automatically creates a reactive subscription
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) return null;

    // Verify schedule belongs to user's organization
    if (schedule.organizationId !== orgId) {
      throw new Error("Access denied: Schedule not in your organization");
    }

    const assignments = await ctx.db
      .query("shiftAssignments")
      .withIndex("by_schedule", (q) => q.eq("scheduleId", args.scheduleId))
      .collect();

    return { schedule, assignments };
  },
});
```
