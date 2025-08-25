# Database Schema

Since we're using Convex (document database), here's the schema definition:

```typescript
// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    settings: v.object({
      timezone: v.string(),
      workWeek: v.array(v.number()), // 0-6 (Sunday-Saturday)
    }),
    subscription: v.object({
      tier: v.union(v.literal("free"), v.literal("paid")),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),

  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    isActive: v.boolean(),
    phone: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  organizationMemberships: defineTable({
    userId: v.id("users"),
    organizationId: v.id("organizations"),
    role: v.union(v.literal("admin"), v.literal("staff"), v.literal("guest")),
    status: v.union(v.literal("active"), v.literal("invited"), v.literal("suspended")),
    isDefault: v.boolean(),
    joinedAt: v.number(),
    invitedBy: v.optional(v.id("users")),
    invitedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_organization", ["organizationId"])
    .index("by_user_org", ["userId", "organizationId"])
    .index("by_status", ["status"]),

  schedulableContacts: defineTable({
    organizationId: v.id("organizations"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    isActive: v.boolean(),
    linkedUserId: v.optional(v.id("users")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_email", ["email"])
    .index("by_phone", ["phone"])
    .index("by_linked_user", ["linkedUserId"]),

  organizationSchedulingRules: defineTable({
    organizationId: v.id("organizations"),
    mandatoryConstraints: v.object({
      maxConsecutiveDays: v.optional(v.number()),
      maxHoursPerWeek: v.optional(v.number()),
      minRestBetweenShifts: v.optional(v.number()),
      requiredCertifications: v.optional(v.array(v.string())),
      minStaffPerShift: v.optional(v.number()),
    }),
    customRules: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      type: v.union(v.literal("hard"), v.literal("soft")),
      expression: v.string(),
      priority: v.optional(v.number()),
      description: v.optional(v.string()),
    }))),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_organization", ["organizationId"]),

  contactSchedulingSettings: defineTable({
    contactId: v.id("schedulableContacts"),
    constraintOverrides: v.optional(v.object({
      maxShiftsPerMonth: v.optional(v.number()),
      maxConsecutiveDays: v.optional(v.number()),
      maxHoursPerWeek: v.optional(v.number()),
    })),
    customRules: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      type: v.union(v.literal("hard"), v.literal("soft")),
      expression: v.string(),
      priority: v.optional(v.number()),
      overridesOrgRule: v.optional(v.string()),
    }))),
    preferences: v.object({
      unavailableDates: v.array(v.string()), // ISO dates
      preferredShiftTypes: v.array(v.string()),
      preferredDaysOff: v.array(v.number()), // 0-6
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_contact", ["contactId"]),

  schedules: defineTable({
    organizationId: v.id("organizations"),
    startDate: v.string(), // ISO date YYYY-MM-DD
    endDate: v.string(), // ISO date YYYY-MM-DD
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    generatedBy: v.union(v.literal("ai"), v.literal("manual")),
    aiMetadata: v.optional(v.object({
      model: v.string(),
      constraints: v.any(),
      generationTime: v.number(),
      fulfillmentScore: v.number(),
    })),
    publishedAt: v.optional(v.number()),
    publishedBy: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_status", ["status"])
    .index("by_date_range", ["startDate", "endDate"]),

  shifts: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    type: v.optional(v.union(v.literal("day"), v.literal("night"))),
    location: v.optional(v.string()),
    priority: v.optional(v.number()),
    notes: v.optional(v.string()),
    timing: v.optional(v.object({
      startTime: v.string(), // HH:MM
      endTime: v.string(), // HH:MM
    })),
    requirements: v.optional(v.object({
      minStaff: v.number(),
      maxStaff: v.number(),
    })),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_type", ["type"]),

  shiftAssignments: defineTable({
    scheduleId: v.id("schedules"),
    shiftId: v.id("shifts"),
    date: v.string(), // ISO date YYYY-MM-DD
    assignedContactId: v.id("schedulableContacts"),
    status: v.union(v.literal("scheduled"), v.literal("absent")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_schedule", ["scheduleId"])
    .index("by_shift", ["shiftId"])
    .index("by_contact", ["assignedContactId"])
    .index("by_date", ["date"]),

  baseHolidays: defineTable({
    name: v.string(),
    month: v.number(), // 1-12
    day: v.number(), // 1-31
    isFloating: v.boolean(),
    floatingRule: v.optional(v.string()), // e.g., "fourth-thursday-november"
    category: v.union(
      v.literal("federal"),
      v.literal("state"),
      v.literal("religious"),
      v.literal("international")
    ),
    country: v.string(), // 'US', 'CA', etc.
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_country", ["country"]),

  organizationHolidaySettings: defineTable({
    organizationId: v.id("organizations"),
    enabled: v.boolean(),
    observedHolidayIds: v.array(v.id("baseHolidays")),
    customHolidays: v.array(
      v.object({
        name: v.string(),
        month: v.number(),
        day: v.number(),
        isSchedulable: v.boolean(),
      })
    ),
    holidayOverrides: v.array(
      v.object({
        baseHolidayId: v.optional(v.id("baseHolidays")),
        customHolidayName: v.optional(v.string()),
        isSchedulable: v.boolean(),
        requiresMinimumStaff: v.optional(v.number()),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"]),

  locations: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    address: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_organization", ["organizationId"]),

  // PTO and preference requests (unchanged for now)
  ptoRequests: defineTable({
    userId: v.id("users"),
    organizationId: v.id("organizations"),
    startDate: v.string(),
    endDate: v.string(),
    reason: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("denied")),
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_organization", ["organizationId"])
    .index("by_organization_status", ["organizationId", "status"])
    .index("by_date_range", ["startDate", "endDate"]),

  preferenceRequests: defineTable({
    userId: v.id("users"),
    scheduleId: v.id("schedules"),
    preferences: v.array(v.object({
      date: v.string(),
      shiftId: v.optional(v.id("shifts")),
      preferenceType: v.union(
        v.literal("prefer"),
        v.literal("avoid"),
        v.literal("unavailable")
      ),
      priority: v.number(), // 1-5
    })),
    status: v.union(v.literal("pending"), v.literal("acknowledged")),
    acknowledgedBy: v.optional(v.id("users")),
    acknowledgedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_schedule", ["scheduleId"])
    .index("by_status", ["status"]),
});
```

## Key Schema Updates

### Multi-Organization Support
- **Removed** `organizationId` and `role` from `users` table
- **Added** `organizationMemberships` junction table for many-to-many relationships
- **Added** `schedulableContacts` for people who can be scheduled without user accounts

### Flexible Scheduling Rules
- **Added** `organizationSchedulingRules` for org-wide constraints and preferences
- **Renamed** `userSchedulingSettings` → `contactSchedulingSettings`
- **Removed** `userSchedulingMetrics` (calculated on-demand instead)

### Simplified Models
- **Flattened** `schedules.period` → direct `startDate` and `endDate` fields
- **Simplified** `shiftAssignments` to only reference `schedulableContacts`
- **Streamlined** status enums (removed unnecessary states)

## Indexes Strategy

### Primary Lookups
- `by_user` - Find all data for a user
- `by_organization` - Find all data for an organization
- `by_contact` - Find all data for a schedulable contact

### Unique Constraints
- `by_clerk_id` - Ensure one user per Clerk ID
- `by_slug` - Ensure unique organization slugs
- `by_user_org` - One membership per user-org combination

### Performance Optimizations
- `by_date` - Quick date-based queries
- `by_status` - Filter by status efficiently
- `by_email`/`by_phone` - Fast contact lookups for linking

## Migration Notes

Since this is a greenfield project with no production data:
1. Deploy the new schema directly
2. No migration needed
3. Implement multi-org support from the start