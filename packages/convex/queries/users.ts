import { query } from '../_generated/server';
import { v } from 'convex/values';

export const get = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Removed listByOrganization - users don't have a direct organizationId field
// Use organizationMemberships table to find users in an organization

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Users table doesn't have an email index, need to filter
    return await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('email'), args.email))
      .first();
  },
});