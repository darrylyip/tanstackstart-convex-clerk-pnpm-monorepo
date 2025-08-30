import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Organizations table for multi-tenancy
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_slug', ['slug']),

  // Users table
  users: defineTable({
    email: v.string(),
    name: v.string(),
    organizationId: v.id('organizations'),
    role: v.union(v.literal('admin'), v.literal('member'), v.literal('viewer')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_organization', ['organizationId'])
    .index('by_email', ['email']),

  // Schedules table
  schedules: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    organizationId: v.id('organizations'),
    userId: v.id('users'),
    startDate: v.number(),
    endDate: v.number(),
    status: v.union(
      v.literal('draft'),
      v.literal('active'),
      v.literal('completed'),
      v.literal('cancelled')
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_organization', ['organizationId'])
    .index('by_user', ['userId'])
    .index('by_status', ['status']),
});