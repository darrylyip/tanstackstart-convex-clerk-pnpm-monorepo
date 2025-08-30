import { query } from '../_generated/server';
import { v } from 'convex/values';

export const get = query({
  args: { scheduleId: v.id('schedules') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.scheduleId);
  },
});

export const listByOrganization = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('schedules')
      .withIndex('by_organization', (q) => q.eq('organizationId', args.organizationId))
      .collect();
  },
});

export const listByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('schedules')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
  },
});

export const listByStatus = query({
  args: { 
    organizationId: v.id('organizations'),
    status: v.union(
      v.literal('draft'),
      v.literal('active'),
      v.literal('completed'),
      v.literal('cancelled')
    )
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('schedules')
      .withIndex('by_status', (q) => q.eq('status', args.status))
      .filter((q) => q.eq(q.field('organizationId'), args.organizationId))
      .collect();
  },
});