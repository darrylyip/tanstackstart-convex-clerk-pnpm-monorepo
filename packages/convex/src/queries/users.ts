import { query } from '../_generated/server';
import { v } from 'convex/values';

export const get = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const listByOrganization = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
      .collect();
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();
  },
});