import { mutation } from '../_generated/server';
import { v } from 'convex/values';

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert('organizations', {
      name: args.name,
      slug: args.slug,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('organizations'),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id('organizations') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});