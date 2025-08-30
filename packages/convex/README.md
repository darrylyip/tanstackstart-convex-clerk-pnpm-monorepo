# @vectr0/convex

The Convex backend package for VECTR0, providing real-time data synchronization, serverless functions, and multi-tenant support.

## Overview

This package contains all backend logic including:
- Database schema definitions
- Query functions for data fetching
- Mutation functions for data modifications
- Authentication and authorization logic
- Multi-tenant data isolation

## Setup

### Prerequisites

1. Create a [Convex account](https://convex.dev)
2. Install the Convex CLI globally (optional):
   ```bash
   npm install -g convex
   ```

### Initial Configuration

1. Navigate to this package:
   ```bash
   cd packages/convex
   ```

2. Initialize Convex (if not already done):
   ```bash
   npx convex dev
   ```
   
   This will:
   - Prompt you to log in to your Convex account
   - Create a new project or connect to an existing one
   - Generate the `_generated` directory with TypeScript types
   - Start the Convex development server

3. The Convex dashboard URL will be displayed - save this for monitoring and debugging.

## Project Structure

```
packages/convex/
├── src/
│   ├── schema.ts           # Database schema definitions
│   ├── queries/            # Read operations
│   │   ├── organizations.ts
│   │   ├── users.ts
│   │   └── schedules.ts
│   ├── mutations/          # Write operations
│   │   ├── organizations.ts
│   │   ├── users.ts
│   │   └── schedules.ts
│   ├── lib/               # Utility functions
│   │   └── index.ts
│   └── auth/              # Authentication helpers
├── _generated/            # Auto-generated Convex types
├── convex.json           # Convex configuration
└── package.json
```

## Database Schema

The schema is defined in `src/schema.ts` with full multi-tenant support:

### Organizations
```typescript
organizations: defineTable({
  name: v.string(),
  slug: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index('by_slug', ['slug'])
```

### Users
```typescript
users: defineTable({
  email: v.string(),
  name: v.string(),
  organizationId: v.id('organizations'),
  role: v.union(v.literal('admin'), v.literal('member'), v.literal('viewer')),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index('by_organization', ['organizationId'])
  .index('by_email', ['email'])
```

### Schedules
```typescript
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
  .index('by_status', ['status'])
```

## Writing Queries

Queries are read-only operations that fetch data. Create them in `src/queries/`:

```typescript
import { query } from '../_generated/server';
import { v } from 'convex/values';

export const getByOrganization = query({
  args: { 
    organizationId: v.id('organizations'),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // Always filter by organization for multi-tenancy
    const items = await ctx.db
      .query('items')
      .withIndex('by_organization', (q) => 
        q.eq('organizationId', args.organizationId)
      )
      .take(args.limit ?? 100);
    
    return items;
  },
});
```

### Query Best Practices

1. **Always use indexes** for better performance
2. **Filter by organizationId** for multi-tenant isolation
3. **Use pagination** with `.take()` and `.paginate()`
4. **Return consistent shapes** for TypeScript inference

## Writing Mutations

Mutations modify data and should include validation:

```typescript
import { mutation } from '../_generated/server';
import { v } from 'convex/values';
import { getCurrentTimestamp } from '../lib';

export const create = mutation({
  args: {
    title: v.string(),
    organizationId: v.id('organizations'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Validate user belongs to organization
    const user = await ctx.db.get(args.userId);
    if (!user || user.organizationId !== args.organizationId) {
      throw new Error('Unauthorized');
    }

    const now = getCurrentTimestamp();
    
    return await ctx.db.insert('items', {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});
```

### Mutation Best Practices

1. **Validate permissions** before modifying data
2. **Use transactions** for multi-table updates
3. **Include timestamps** (createdAt, updatedAt)
4. **Return the created/updated document**
5. **Throw descriptive errors** for client handling

## Authentication & Authorization

### With Clerk (Recommended)

1. Configure Clerk JWT template to include organizationId
2. Validate tokens in Convex functions:

```typescript
import { query } from '../_generated/server';
import { auth } from '../auth';

export const authenticatedQuery = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await auth.getUserIdentity(ctx);
    if (!identity) {
      throw new Error('Not authenticated');
    }
    
    const organizationId = identity.organizationId;
    // Use organizationId for data filtering
  },
});
```

### Role-Based Access Control

```typescript
const requireRole = async (
  ctx: QueryCtx | MutationCtx,
  requiredRole: 'admin' | 'member' | 'viewer'
) => {
  const identity = await auth.getUserIdentity(ctx);
  const user = await ctx.db
    .query('users')
    .withIndex('by_email', q => q.eq('email', identity.email))
    .first();
  
  if (!user) throw new Error('User not found');
  
  const roleHierarchy = { admin: 3, member: 2, viewer: 1 };
  if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
    throw new Error('Insufficient permissions');
  }
  
  return user;
};
```

## Multi-Tenancy Patterns

### 1. Organization Filtering

Always filter queries by organizationId:

```typescript
// ✅ Good - filtered by organization
const items = await ctx.db
  .query('items')
  .withIndex('by_organization', q => q.eq('organizationId', orgId))
  .collect();

// ❌ Bad - returns all items across all organizations
const items = await ctx.db.query('items').collect();
```

### 2. Cross-Organization Validation

Prevent data leakage between organizations:

```typescript
export const updateItem = mutation({
  handler: async (ctx, { itemId, organizationId, ...updates }) => {
    const item = await ctx.db.get(itemId);
    
    // Verify item belongs to the organization
    if (!item || item.organizationId !== organizationId) {
      throw new Error('Item not found');
    }
    
    return await ctx.db.patch(itemId, updates);
  },
});
```

### 3. Cascading Deletes

Handle related data when deleting:

```typescript
export const deleteOrganization = mutation({
  handler: async (ctx, { organizationId }) => {
    // Delete all related data
    const users = await ctx.db
      .query('users')
      .withIndex('by_organization', q => q.eq('organizationId', organizationId))
      .collect();
    
    for (const user of users) {
      await ctx.db.delete(user._id);
    }
    
    // Delete organization
    await ctx.db.delete(organizationId);
  },
});
```

## Real-time Subscriptions

Convex automatically handles real-time subscriptions. Any query used with `useQuery` in the frontend will update when the underlying data changes:

```typescript
// This query will push updates to all connected clients
export const liveSchedules = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('schedules')
      .withIndex('by_organization', q => 
        q.eq('organizationId', args.organizationId)
      )
      .filter(q => q.eq(q.field('status'), 'active'))
      .collect();
  },
});
```

## Testing

### Unit Tests

```typescript
import { test, expect } from 'vitest';
import { convexTest } from 'convex-test';
import { api } from './_generated/api';

test('create organization', async () => {
  const t = convexTest(schema);
  
  const orgId = await t.mutation(api.mutations.organizations.create, {
    name: 'Test Org',
    slug: 'test-org'
  });
  
  const org = await t.query(api.queries.organizations.get, { 
    organizationId: orgId 
  });
  
  expect(org.name).toBe('Test Org');
});
```

### Integration Tests

Test complete workflows:

```typescript
test('user workflow', async () => {
  const t = convexTest(schema);
  
  // Create organization
  const orgId = await t.mutation(api.mutations.organizations.create, {
    name: 'Test Org',
    slug: 'test-org'
  });
  
  // Add user
  const userId = await t.mutation(api.mutations.users.create, {
    name: 'John Doe',
    email: 'john@example.com',
    organizationId: orgId,
    role: 'member'
  });
  
  // Verify user list
  const users = await t.query(api.queries.users.listByOrganization, {
    organizationId: orgId
  });
  
  expect(users).toHaveLength(1);
  expect(users[0].email).toBe('john@example.com');
});
```

## Deployment

### Development

```bash
npx convex dev
```

This starts the development server with hot reloading.

### Production

```bash
npx convex deploy --prod
```

This deploys to your production Convex instance.

### Environment Variables

Configure in your deployment platform:

```bash
CONVEX_DEPLOYMENT=your-deployment-name
CONVEX_URL=https://your-deployment.convex.cloud
```

## Performance Optimization

### 1. Use Indexes

Always query using indexes for better performance:

```typescript
// Define in schema
.index('by_org_and_status', ['organizationId', 'status'])

// Use in query
.withIndex('by_org_and_status', q => 
  q.eq('organizationId', orgId).eq('status', 'active')
)
```

### 2. Pagination

For large datasets, use pagination:

```typescript
export const paginatedList = query({
  args: {
    organizationId: v.id('organizations'),
    paginationOpts: paginationOptsValidator
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('items')
      .withIndex('by_organization', q => 
        q.eq('organizationId', args.organizationId)
      )
      .paginate(args.paginationOpts);
  },
});
```

### 3. Batch Operations

Batch related operations in a single mutation:

```typescript
export const batchCreate = mutation({
  args: {
    items: v.array(v.object({
      title: v.string(),
      // ... other fields
    }))
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const item of args.items) {
      const id = await ctx.db.insert('items', item);
      ids.push(id);
    }
    return ids;
  },
});
```

## Common Patterns

### Soft Deletes

Instead of deleting, mark as deleted:

```typescript
export const softDelete = mutation({
  handler: async (ctx, { itemId }) => {
    return await ctx.db.patch(itemId, {
      deletedAt: Date.now(),
      status: 'deleted'
    });
  },
});

// Filter out soft-deleted items in queries
export const listActive = query({
  handler: async (ctx, args) => {
    return await ctx.db
      .query('items')
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();
  },
});
```

### Audit Logs

Track all changes:

```typescript
export const createWithAudit = mutation({
  handler: async (ctx, args) => {
    const itemId = await ctx.db.insert('items', args);
    
    await ctx.db.insert('auditLogs', {
      action: 'create',
      entityType: 'items',
      entityId: itemId,
      userId: args.userId,
      timestamp: Date.now(),
      changes: args
    });
    
    return itemId;
  },
});
```

## Troubleshooting

### Common Issues

1. **"_generated not found"** - Run `npx convex dev` to generate types
2. **"Index not found"** - Ensure indexes are defined in schema
3. **"Unauthorized"** - Check authentication and organization filtering
4. **"Rate limited"** - Implement pagination or batch operations

### Debugging

1. Use the Convex dashboard for:
   - Viewing real-time logs
   - Inspecting database contents
   - Testing functions directly

2. Add console.log in development:
   ```typescript
   handler: async (ctx, args) => {
     console.log('Query args:', args);
     // ... rest of handler
   }
   ```

3. Use Convex DevTools in the browser for inspecting queries and mutations

## Resources

- [Convex Documentation](https://docs.convex.dev)
- [Convex Discord](https://convex.dev/community)
- [Example Projects](https://github.com/get-convex)
- [Best Practices](https://docs.convex.dev/production/best-practices)