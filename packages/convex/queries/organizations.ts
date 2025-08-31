import { query } from '../_generated/server';
import { v } from 'convex/values';

export const get = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.organizationId);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('organizations')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query('organizations').collect();
  },
});