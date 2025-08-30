# STORY-002: Clerk + Convex Authentication Integration

## Story Metadata
- **ID:** STORY-002
- **Epic:** EPIC-001 (Multi-Tenant Foundation & Authentication)
- **Priority:** CRITICAL
- **Estimation:** 5 points
- **Status:** READY_FOR_DEV
- **Dependencies:** STORY-001 (monorepo structure must be created first)

## User Story
**As a** platform user  
**I want** secure authentication integrated between Clerk and Convex  
**So that** I can access the platform with proper identity verification and organization context

## Background Context
VECTR0 uses Clerk for authentication and organization management, while Convex handles the backend data layer. The platform uses a unified TanStack Start application serving both marketing content (prerendered) and dynamic app features (/app/* routes). This story establishes the secure connection between these services, enabling JWT-based authentication, organization context, and role-based access control. This integration is critical for multi-tenancy as it ensures users only access their organization's data.

## Acceptance Criteria
- [ ] Clerk provider integrated with Convex backend
- [ ] JWT validation working in Convex functions
- [ ] Organization ID automatically extracted from JWT
- [ ] User profile synced between Clerk and Convex
- [ ] Role-based middleware implemented
- [ ] Protected and public Convex functions configured
- [ ] Authentication works across marketing and app routes in unified web application

## Technical Requirements

### 1. Clerk JWT Template Configuration
```json
// In Clerk Dashboard > JWT Templates > Create New Template
{
  "aud": "convex",
  "org_id": "{{org.id}}",
  "org_slug": "{{org.slug}}",
  "org_role": "{{org_membership.role}}",
  "user_id": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "name": "{{user.full_name}}",
  "image_url": "{{user.image_url}}"
}
```

### 2. Convex Auth Configuration
```typescript
// convex/auth.config.js
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
```

### 3. Convex Schema with Auth
```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // Clerk user ID (unique identifier from Clerk)
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    
    // Organization membership
    organizationId: v.optional(v.string()),
    organizationRole: v.optional(v.string()),
    
    // User role (system-level)
    role: v.union(
      v.literal("super_admin"),
      v.literal("admin"), 
      v.literal("user")
    ),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_org", ["organizationId"]),

  organizations: defineTable({
    clerkOrgId: v.string(),
    name: v.string(),
    slug: v.string(),
    
    // Organization settings
    settings: v.object({
      scheduleConfig: v.optional(v.any()),
      features: v.optional(v.array(v.string())),
    }),
    
    // Subscription info
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_org_id", ["clerkOrgId"])
    .index("by_slug", ["slug"]),
});
```

### 4. Authentication Helper Functions
```typescript
// convex/lib/auth.ts
import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";
import { ConvexError } from "convex/values";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new ConvexError("User not found");
  }

  return user;
}

export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  
  if (!user.organizationId) {
    throw new ConvexError("No organization selected");
  }

  return {
    user,
    organizationId: user.organizationId,
    role: user.organizationRole,
  };
}

export function requireRole(role: string) {
  return async (ctx: QueryCtx | MutationCtx) => {
    const { user, role: userRole } = await requireAuth(ctx);
    
    const roleHierarchy = {
      super_admin: 3,
      admin: 2,
      user: 1,
    };

    if (!userRole || roleHierarchy[userRole] < roleHierarchy[role]) {
      throw new ConvexError("Insufficient permissions");
    }

    return { user, organizationId: user.organizationId };
  };
}
```

### 5. User Sync Function
```typescript
// convex/functions/users.ts
import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";

export const syncUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    organizationRole: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("users", {
        ...args,
        role: args.metadata?.role || "user",
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});
```

### 6. Webhook Handler for Clerk Events
```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return new Response("Missing webhook secret", { status: 500 });
    }

    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const body = await request.text();
    const wh = new Webhook(webhookSecret);
    
    let evt;
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      return new Response("Invalid signature", { status: 400 });
    }

    switch (evt.type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.users.syncUser, {
          clerkId: evt.data.id,
          email: evt.data.email_addresses[0].email_address,
          name: `${evt.data.first_name} ${evt.data.last_name}`.trim(),
          imageUrl: evt.data.image_url,
          metadata: evt.data.public_metadata,
        });
        break;

      case "organizationMembership.created":
      case "organizationMembership.updated":
        await ctx.runMutation(internal.users.syncUser, {
          clerkId: evt.data.public_user_data.user_id,
          organizationId: evt.data.organization.id,
          organizationRole: evt.data.role,
        });
        break;
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
```

### 7. Frontend Integration with TanStack Start
```typescript
// apps/web/app/root.tsx
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { Outlet } from '@tanstack/react-router';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

function RootLayout() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <Outlet />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

## Implementation Steps

1. **Configure Clerk JWT Template** (1 point)
   - Log into Clerk Dashboard
   - Create JWT template with Convex audience
   - Configure organization claims
   - Note the issuer domain

2. **Set Up Convex Auth in @vectr0/convex Package** (1 point)
   - Create auth.config.js with Clerk domain in packages/convex
   - Configure environment variables
   - Test JWT validation

3. **Create Database Schema with Migration Strategy** (1 point)
   - Define users and organizations tables in packages/convex/src/schema.ts
   - Create necessary indexes for multi-tenant queries
   - Ensure schema supports unified web application
   - **Implement schema migration for Clerk fields using Convex migrations**

4. **Implement Auth Helpers in Shared Package** (1 point)
   - Create getCurrentUser function in packages/convex/src/lib/auth.ts
   - Implement requireAuth middleware
   - Build role-based access control for admin vs physician features

5. **Set Up User Sync and TanStack Start Integration** (1 point)
   - Create user sync mutation in packages/convex
   - Configure Clerk webhooks
   - Integrate authentication with TanStack Start root layout
   - Test user creation/update flow across marketing and app routes

## Environment Variables
```bash
# Clerk (Frontend) - TanStack Start
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Clerk (Backend) - Convex Package
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev
CLERK_WEBHOOK_SECRET=whsec_...

# Convex - Shared Backend
VITE_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOYMENT=your-deployment-name
```

## Testing Checklist
- [ ] User can sign up via Clerk
- [ ] User profile syncs to Convex database
- [ ] JWT tokens are validated in Convex functions
- [ ] Organization context is preserved
- [ ] Role-based access control works
- [ ] Webhooks process successfully
- [ ] User can sign out properly
- [ ] Protected routes require authentication

## Security Considerations
- Store webhook secret securely
- Validate all JWT claims
- Implement rate limiting on auth endpoints
- Log authentication events
- Use HTTPS for all webhooks
- Rotate secrets regularly

## Definition of Done
- [ ] Clerk JWT template configured
- [ ] Convex auth.config.js implemented
- [ ] User sync working via webhooks
- [ ] Authentication helpers tested
- [ ] Frontend integration complete
- [ ] All environment variables documented
- [ ] Security review completed
- [ ] Documentation updated

## Notes for Developer
- Test with multiple organizations to verify isolation
- Use Clerk's test mode for development
- Monitor webhook delivery in Clerk dashboard
- Set up ngrok for local webhook testing
- Keep auth logic in packages/convex/src/lib/auth.ts for shared access
- Use TypeScript for type safety across all packages
- Remember to handle token refresh
- Ensure authentication works for both prerendered marketing pages and dynamic /app/* routes
- Test role-based access for admin features within the unified application

### Role System Architecture
- **super_admin**: System-wide access to all organizations (set in Clerk public metadata)
- **admin**: Organization-level admin access (set via organization membership)
- **user**: Standard user access (default role)
- Roles follow hierarchy: super_admin (3) > admin (2) > user (1)
- System super admins can access any organization's data
- Regular admins and users are limited to their assigned organization(s)

## Schema Migration Strategy for Clerk Integration

### Migration Workflow for Adding Clerk Fields

When updating the existing schema to support Clerk authentication fields, follow this migration strategy:

#### Step 1: Create Migration for User Table
```typescript
// convex/migrations.ts
import { migrations } from "convex/server";

export const addClerkFieldsToUsers = migrations.define({
  table: "users",
  migrateOne: async (ctx, user) => {
    // Add optional Clerk fields to existing users
    if (user.clerkId === undefined) {
      await ctx.db.patch(user._id, {
        clerkId: null, // Will be populated by webhook
        organizationId: null,
        organizationRole: null,
      });
    }
  },
});
```

#### Step 2: Update Schema to Support Migration
```typescript
// convex/schema.ts - Transitional schema
export default defineSchema({
  users: defineTable({
    // Make Clerk fields optional during migration
    clerkId: v.optional(v.string()),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    
    // Organization membership (optional during migration)
    organizationId: v.optional(v.string()),
    organizationRole: v.optional(v.string()),
    
    // Existing fields remain unchanged
    role: v.union(
      v.literal("super_admin"),
      v.literal("admin"), 
      v.literal("user")
    ),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_org", ["organizationId"]),
  // ... rest of schema
});
```

#### Step 3: Run Migration
```bash
# Deploy migration
npx convex deploy

# Run migration (can be done programmatically or via CLI)
npx convex run migrations:addClerkFieldsToUsers

# Monitor migration progress
npx convex run migrations:status
```

#### Step 4: Update Schema Post-Migration
After migration completes and all users have Clerk IDs populated:
```typescript
// convex/schema.ts - Final schema
export default defineSchema({
  users: defineTable({
    // Now required after migration
    clerkId: v.string(),
    email: v.string(),
    // ... rest remains same
  })
  // ... indexes remain same
});
```

### Migration Best Practices
- Always use optional fields during transition period
- Handle both migrated and non-migrated records in your code
- Use `dryRun: true` to test migrations before applying
- Run migrations in batches to avoid timeouts
- Monitor migration progress and be prepared to restart if needed

## Troubleshooting Guide
```bash
# Test JWT validation
npx convex run --no-push functions/testAuth

# Check webhook signature
curl -X POST http://localhost:3000/clerk-webhook \
  -H "svix-id: test" \
  -H "svix-timestamp: $(date +%s)" \
  -H "svix-signature: test" \
  -d '{}'

# Verify user sync
npx convex run --no-push functions/users:getUser '{"clerkId": "user_..."}'

# Migration commands
npx convex run migrations:status
npx convex run migrations:addClerkFieldsToUsers --dryRun=true
npx convex run migrations:addClerkFieldsToUsers
```

## References
- [Clerk + Convex Integration](https://docs.convex.dev/auth/clerk)
- [Clerk JWT Templates](https://clerk.com/docs/backend-requests/making/jwt-templates)
- [Convex Auth Documentation](https://docs.convex.dev/auth)
- [Clerk Webhooks](https://clerk.com/docs/integrations/webhooks)