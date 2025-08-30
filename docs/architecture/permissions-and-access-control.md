# Permissions and Access Control

## Overview

VECTR0 uses **CASL (Conditional Ability Specification Language)** for fine-grained, attribute-based access control across the multi-tenant healthcare scheduling platform. CASL provides flexible role-to-permission mapping with React integration and Convex backend validation.

## Why CASL?

- **Multi-tenant ready** - Natural support for organization-scoped permissions
- **Attribute-based** - Can check permissions based on resource attributes
- **React integration** - Built-in components and hooks
- **TypeScript support** - Full type safety for actions and subjects
- **Scalable** - From simple role checks to complex business rules
- **Healthcare compliant** - Supports HIPAA-required access controls

## Permission Framework Architecture

### Core Concepts

```typescript
// Permission Structure
type Actions = 
  | 'create' | 'read' | 'update' | 'delete' 
  | 'manage' | 'invite' | 'approve' | 'export' 
  | 'impersonate' | 'billing';

type Subjects = 
  | 'Schedule' | 'User' | 'Organization' | 'Trade' 
  | 'Preference' | 'Analytics' | 'Holiday' 
  | 'Billing' | 'SystemConfig' | 'all';

export type AppAbility = MongoAbility<[Actions, Subjects]>;
```

### Permission Hierarchy

```
super_admin
├── can('manage', 'all') - Full platform access
├── can('impersonate', 'User') - Support access
├── can('manage', 'SystemConfig') - Platform settings
└── can('billing', 'all') - Billing management

admin (organization-scoped)
├── can('manage', 'Schedule', { organizationId: X })
├── can('invite', 'User', { organizationId: X })
├── can('approve', 'Trade', { organizationId: X })
├── can('read', 'Analytics', { organizationId: X })
└── cannot('read', 'Organization', { _id: { $ne: X } })

user (organization-scoped)
├── can('read', 'Schedule', { organizationId: X, visibility: 'public' })
├── can('update', 'Schedule', { organizationId: X, assignedUsers: userId })
├── can('create', 'Trade', { userId: Y })
└── can('update', 'Preference', { userId: Y })
```

## Implementation

### 1. Core Ability Definition

```typescript
// packages/utils/src/permissions/abilities.ts
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { User, OrganizationMembership } from '../types';

export type Actions = 
  | 'create' | 'read' | 'update' | 'delete' 
  | 'manage' | 'invite' | 'approve' | 'export'
  | 'impersonate' | 'billing';

export type Subjects = 
  | 'Schedule' | 'User' | 'Organization' | 'Trade' 
  | 'Preference' | 'Analytics' | 'Holiday' 
  | 'Billing' | 'SystemConfig' | 'all';

export type AppAbility = MongoAbility<[Actions, Subjects]>;

export function defineAbilitiesFor(
  user: User, 
  membership?: OrganizationMembership
): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  // Super Admin - Platform-wide access
  if (user.role === 'super_admin') {
    can('manage', 'all');
    can('impersonate', 'User');
    can('billing', 'all');
    can('manage', 'SystemConfig');
    return build();
  }

  // No access without organization membership
  if (!membership) {
    return build(); // Empty permissions
  }

  const orgId = membership.organizationId;

  // Organization Admin
  if (membership.role === 'admin') {
    // Schedule management
    can('manage', 'Schedule', { organizationId: orgId });
    can('export', 'Schedule', { organizationId: orgId });
    
    // User management within org
    can(['read', 'update'], 'User', { organizationId: orgId });
    can('invite', 'User', { organizationId: orgId });
    
    // Trade approval
    can('approve', 'Trade', { organizationId: orgId });
    can('read', 'Trade', { organizationId: orgId });
    
    // Organization settings
    can('update', 'Organization', { _id: orgId });
    can('manage', 'Holiday', { organizationId: orgId });
    
    // Analytics access
    can('read', 'Analytics', { organizationId: orgId });
    can('export', 'Analytics', { organizationId: orgId });
    
    // Preferences for all users in org
    can('read', 'Preference', { organizationId: orgId });
    
    // Billing for organization
    can('read', 'Billing', { organizationId: orgId });
    
    // Restrict access to other organizations
    cannot('read', 'Organization', { _id: { $ne: orgId } });
    cannot('read', 'Schedule', { organizationId: { $ne: orgId } });
  }

  // Regular User
  if (membership.role === 'user') {
    const userId = user._id;
    
    // Schedule access - own assignments and public schedules
    can('read', 'Schedule', { 
      organizationId: orgId,
      $or: [
        { assignedUsers: { $in: [userId] } },
        { visibility: 'public' },
        { createdBy: userId }
      ]
    });
    
    // Can update own schedule assignments (preferences)
    can('update', 'Schedule', { 
      organizationId: orgId, 
      assignedUsers: { $in: [userId] }
    });
    
    // Trade management
    can('create', 'Trade', { fromUserId: userId });
    can('read', 'Trade', { 
      organizationId: orgId,
      $or: [
        { fromUserId: userId },
        { toUserId: userId },
        { status: 'open' }
      ]
    });
    can('update', 'Trade', { 
      $or: [
        { fromUserId: userId },
        { toUserId: userId }
      ]
    });
    
    // Preference management
    can('manage', 'Preference', { userId: userId });
    
    // Own profile
    can(['read', 'update'], 'User', { _id: userId });
    
    // Read-only org info
    can('read', 'Organization', { _id: orgId });
    can('read', 'Holiday', { organizationId: orgId });
    
    // Limited analytics - own data only
    can('read', 'Analytics', { 
      organizationId: orgId, 
      userId: userId 
    });
  }

  return build();
}

// Helper functions
export function canAccessOrganization(ability: AppAbility, orgId: string): boolean {
  return ability.can('read', 'Organization', { _id: orgId });
}

export function canManageSchedules(ability: AppAbility, orgId: string): boolean {
  return ability.can('manage', 'Schedule', { organizationId: orgId });
}

export function canInviteUsers(ability: AppAbility, orgId: string): boolean {
  return ability.can('invite', 'User', { organizationId: orgId });
}
```

### 2. React Integration

```typescript
// apps/web/src/app/providers/AbilityProvider.tsx
import React, { createContext, ReactNode, useMemo } from 'react';
import { AbilityContext } from '@casl/react';
import { defineAbilitiesFor, AppAbility } from '@vectr0/utils/permissions';
import { useUser } from '@clerk/clerk-react';
import { useOrganization } from '../hooks/useOrganization';

export function AbilityProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser } = useUser();
  const { user: convexUser, membership } = useOrganization();
  
  const ability = useMemo(() => {
    if (!convexUser) return null;
    return defineAbilitiesFor(convexUser, membership);
  }, [convexUser, membership]);
  
  if (!ability) {
    return <div className="flex items-center justify-center p-4">Loading permissions...</div>;
  }
  
  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

// apps/web/src/app/hooks/useAbility.ts
import { useContext } from 'react';
import { AbilityContext } from '@casl/react';
import type { AppAbility } from '@vectr0/utils/permissions';

export function useAbility(): AppAbility {
  const ability = useContext(AbilityContext);
  if (!ability) {
    throw new Error('useAbility must be used within AbilityProvider');
  }
  return ability;
}
```

### 3. Component Usage Examples

```typescript
// apps/web/src/app/components/ScheduleActions.tsx
import React from 'react';
import { Can } from '@casl/react';
import { useAbility } from '../hooks/useAbility';
import { Schedule } from '@vectr0/utils/types';

interface ScheduleActionsProps {
  schedule: Schedule;
}

export function ScheduleActions({ schedule }: ScheduleActionsProps) {
  const ability = useAbility();
  
  return (
    <div className="flex gap-2">
      {/* Declarative permission checks */}
      <Can I="read" this={schedule} ability={ability}>
        <button className="btn-secondary">
          View Schedule
        </button>
      </Can>
      
      <Can I="update" this={schedule} ability={ability}>
        <button className="btn-primary">
          Edit Schedule
        </button>
      </Can>
      
      <Can I="delete" this={schedule} ability={ability}>
        <button className="btn-danger">
          Delete Schedule
        </button>
      </Can>
      
      <Can I="export" this={schedule} ability={ability}>
        <button className="btn-secondary">
          Export Schedule
        </button>
      </Can>
      
      {/* Programmatic permission checks */}
      {ability.can('approve', 'Trade', { organizationId: schedule.organizationId }) && (
        <button className="btn-primary">
          Approve Trades
        </button>
      )}
    </div>
  );
}

// apps/web/src/app/components/UserInviteButton.tsx
import React from 'react';
import { Can } from '@casl/react';
import { useOrganization } from '../hooks/useOrganization';

export function UserInviteButton() {
  const { organization } = useOrganization();
  
  if (!organization) return null;
  
  return (
    <Can I="invite" this={{ organizationId: organization._id }} a="User">
      <button className="btn-primary">
        Invite Team Member
      </button>
    </Can>
  );
}

// apps/web/src/app/components/AdminDashboard.tsx
import React from 'react';
import { Can } from '@casl/react';
import { useAbility } from '../hooks/useAbility';
import { useOrganization } from '../hooks/useOrganization';

export function AdminDashboard() {
  const ability = useAbility();
  const { organization } = useOrganization();
  
  if (!organization) return null;
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <Can I="read" this={{ organizationId: organization._id }} a="Analytics">
        <div className="card">
          <h3>Organization Analytics</h3>
          {/* Analytics content */}
        </div>
      </Can>
      
      <Can I="manage" this={{ organizationId: organization._id }} a="Schedule">
        <div className="card">
          <h3>Schedule Management</h3>
          {/* Schedule management */}
        </div>
      </Can>
      
      {/* Super admin only features */}
      {ability.can('manage', 'SystemConfig') && (
        <div className="card">
          <h3>System Configuration</h3>
          {/* Platform settings */}
        </div>
      )}
      
      {ability.can('impersonate', 'User') && (
        <div className="card">
          <h3>User Impersonation</h3>
          {/* Support tools */}
        </div>
      )}
    </div>
  );
}
```

### 4. Route Protection

```typescript
// apps/web/src/app/components/ProtectedRoute.tsx
import React from 'react';
import { useAbility } from '../hooks/useAbility';
import { useOrganization } from '../hooks/useOrganization';
import { Actions, Subjects } from '@vectr0/utils/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  action: Actions;
  subject: Subjects;
  resource?: any;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  action, 
  subject, 
  resource,
  fallback = <div>Access denied</div>
}: ProtectedRouteProps) {
  const ability = useAbility();
  const { organization } = useOrganization();
  
  // Add organization context to resource if not provided
  const resourceWithContext = resource || { 
    organizationId: organization?._id 
  };
  
  if (!ability.can(action, subject, resourceWithContext)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Usage in routes
export function AdminOnlyPage() {
  return (
    <ProtectedRoute 
      action="read" 
      subject="Analytics"
      fallback={<div>You need admin access to view this page</div>}
    >
      <AdminDashboard />
    </ProtectedRoute>
  );
}
```

## Convex Integration

### 1. Permission Checking Middleware

```typescript
// packages/convex/lib/permissions.ts
import { QueryCtx, MutationCtx } from './_generated/server';
import { defineAbilitiesFor, Actions, Subjects, AppAbility } from '@vectr0/utils/permissions';
import { getAuthenticatedUser } from './auth';

export async function checkPermission(
  ctx: QueryCtx | MutationCtx,
  action: Actions,
  subject: Subjects,
  resource?: any
): Promise<{ user: any; membership: any; ability: AppAbility }> {
  const { user, membership } = await getAuthenticatedUser(ctx);
  const ability = defineAbilitiesFor(user, membership);
  
  if (!ability.can(action, subject, resource)) {
    throw new Error(`Permission denied: Cannot ${action} ${subject}`);
  }
  
  return { user, membership, ability };
}

export async function withPermission<T>(
  ctx: QueryCtx | MutationCtx,
  action: Actions,
  subject: Subjects,
  resource: any,
  handler: (ctx: QueryCtx | MutationCtx, auth: { user: any; membership: any; ability: AppAbility }) => Promise<T>
): Promise<T> {
  const auth = await checkPermission(ctx, action, subject, resource);
  return handler(ctx, auth);
}
```

### 2. Protected Mutations

```typescript
// packages/convex/schedules.ts
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { checkPermission } from './lib/permissions';

export const createSchedule = mutation({
  args: {
    organizationId: v.id('organizations'),
    name: v.string(),
    period: v.object({
      startDate: v.string(),
      endDate: v.string(),
    }),
    assignments: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    // Check permission before proceeding
    const { user, membership } = await checkPermission(
      ctx, 
      'create', 
      'Schedule', 
      { organizationId: args.organizationId }
    );
    
    // Proceed with creation
    const scheduleId = await ctx.db.insert('schedules', {
      ...args,
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return scheduleId;
  },
});

export const updateSchedule = mutation({
  args: {
    scheduleId: v.id('schedules'),
    updates: v.object({
      name: v.optional(v.string()),
      assignments: v.optional(v.array(v.any())),
    }),
  },
  handler: async (ctx, args) => {
    // Get existing schedule
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      throw new Error('Schedule not found');
    }
    
    // Check permission with actual resource
    await checkPermission(ctx, 'update', 'Schedule', schedule);
    
    // Proceed with update
    await ctx.db.patch(args.scheduleId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
    
    return args.scheduleId;
  },
});

export const deleteSchedule = mutation({
  args: { scheduleId: v.id('schedules') },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      throw new Error('Schedule not found');
    }
    
    await checkPermission(ctx, 'delete', 'Schedule', schedule);
    
    await ctx.db.delete(args.scheduleId);
    return true;
  },
});
```

### 3. Protected Queries

```typescript
// packages/convex/schedules.ts (continued)
export const getSchedules = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx, args) => {
    const { ability } = await checkPermission(
      ctx, 
      'read', 
      'Schedule', 
      { organizationId: args.organizationId }
    );
    
    // Get all schedules for organization
    const schedules = await ctx.db
      .query('schedules')
      .withIndex('by_organization', (q) => 
        q.eq('organizationId', args.organizationId)
      )
      .collect();
    
    // Filter based on user's specific permissions
    return schedules.filter(schedule => 
      ability.can('read', 'Schedule', schedule)
    );
  },
});

export const getSchedule = query({
  args: { scheduleId: v.id('schedules') },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) {
      return null;
    }
    
    // Check if user can read this specific schedule
    const { ability } = await checkPermission(ctx, 'read', 'Schedule', schedule);
    
    return schedule;
  },
});
```

## Testing Permissions

### 1. Unit Testing Abilities

```typescript
// packages/utils/src/permissions/__tests__/abilities.test.ts
import { defineAbilitiesFor } from '../abilities';
import { User, OrganizationMembership } from '../../types';

describe('Permission Abilities', () => {
  const mockOrg1 = 'org1' as any;
  const mockOrg2 = 'org2' as any;
  const mockUser = { _id: 'user1', role: 'user' } as User;

  describe('Super Admin', () => {
    test('can manage everything', () => {
      const superAdmin = { ...mockUser, role: 'super_admin' } as User;
      const ability = defineAbilitiesFor(superAdmin);
      
      expect(ability.can('manage', 'all')).toBe(true);
      expect(ability.can('read', 'Schedule')).toBe(true);
      expect(ability.can('delete', 'Organization')).toBe(true);
      expect(ability.can('impersonate', 'User')).toBe(true);
    });
  });

  describe('Organization Admin', () => {
    const membership = { 
      organizationId: mockOrg1, 
      role: 'admin' 
    } as OrganizationMembership;

    test('can manage resources in their organization', () => {
      const ability = defineAbilitiesFor(mockUser, membership);
      
      expect(ability.can('manage', 'Schedule', { organizationId: mockOrg1 })).toBe(true);
      expect(ability.can('invite', 'User', { organizationId: mockOrg1 })).toBe(true);
      expect(ability.can('read', 'Analytics', { organizationId: mockOrg1 })).toBe(true);
    });

    test('cannot access other organizations', () => {
      const ability = defineAbilitiesFor(mockUser, membership);
      
      expect(ability.can('read', 'Schedule', { organizationId: mockOrg2 })).toBe(false);
      expect(ability.can('manage', 'User', { organizationId: mockOrg2 })).toBe(false);
    });
  });

  describe('Regular User', () => {
    const membership = { 
      organizationId: mockOrg1, 
      role: 'user' 
    } as OrganizationMembership;

    test('can read public schedules in their org', () => {
      const ability = defineAbilitiesFor(mockUser, membership);
      
      expect(ability.can('read', 'Schedule', { 
        organizationId: mockOrg1, 
        visibility: 'public' 
      })).toBe(true);
    });

    test('can manage their own preferences', () => {
      const ability = defineAbilitiesFor(mockUser, membership);
      
      expect(ability.can('manage', 'Preference', { userId: 'user1' })).toBe(true);
      expect(ability.can('manage', 'Preference', { userId: 'other-user' })).toBe(false);
    });

    test('cannot invite users', () => {
      const ability = defineAbilitiesFor(mockUser, membership);
      
      expect(ability.can('invite', 'User')).toBe(false);
    });
  });
});
```

### 2. Integration Testing

```typescript
// packages/convex/__tests__/schedules.test.ts
import { convexTest } from 'convex-test';
import { describe, test, expect } from 'vitest';
import { api } from './_generated/api';

describe('Schedule Permissions', () => {
  test('admin can create schedules', async () => {
    const t = convexTest();
    
    // Setup admin user
    const adminId = await t.mutation(api.users.create, {
      email: 'admin@hospital.com',
      role: 'user', // Will be admin via membership
    });
    
    const orgId = await t.mutation(api.organizations.create, {
      name: 'Test Hospital',
      slug: 'test-hospital',
    });
    
    await t.mutation(api.organizations.addMember, {
      userId: adminId,
      organizationId: orgId,
      role: 'admin',
    });
    
    // Test schedule creation
    const scheduleId = await t.mutation(api.schedules.createSchedule, {
      organizationId: orgId,
      name: 'Test Schedule',
      period: { startDate: '2024-01-01', endDate: '2024-01-31' },
      assignments: [],
    });
    
    expect(scheduleId).toBeDefined();
  });

  test('regular user cannot create schedules', async () => {
    const t = convexTest();
    
    // Setup regular user
    const userId = await t.mutation(api.users.create, {
      email: 'user@hospital.com',
      role: 'user',
    });
    
    const orgId = await t.mutation(api.organizations.create, {
      name: 'Test Hospital',
      slug: 'test-hospital',
    });
    
    await t.mutation(api.organizations.addMember, {
      userId,
      organizationId: orgId,
      role: 'user',
    });
    
    // Test schedule creation should fail
    await expect(
      t.mutation(api.schedules.createSchedule, {
        organizationId: orgId,
        name: 'Test Schedule',
        period: { startDate: '2024-01-01', endDate: '2024-01-31' },
        assignments: [],
      })
    ).rejects.toThrow('Permission denied');
  });
});
```

## Package Installation

```bash
# Install CASL packages
pnpm add @casl/ability @casl/react

# Install for Convex package (utils)
cd packages/utils
pnpm add @casl/ability

# Install for React app
cd apps/web  
pnpm add @casl/ability @casl/react
```

## Key Benefits

### 1. **Fine-Grained Control**
- Check permissions based on resource attributes
- Support for complex healthcare access rules
- Dynamic permission evaluation

### 2. **Multi-Tenant Ready**
- Organization-scoped permissions by default
- Prevents cross-tenant data access
- Scales with organization growth

### 3. **Type Safety**
- Full TypeScript support for actions and subjects
- Compile-time permission checking
- IDE autocomplete for permissions

### 4. **Performance**
- Client-side permission evaluation
- Cached ability objects
- Minimal backend permission checks

### 5. **Healthcare Compliance**
- Supports HIPAA access control requirements
- Audit trail capabilities
- Role-based access control (RBAC)

## Security Considerations

### 1. **Never Trust Frontend**
- Always validate permissions on Convex backend
- Frontend permissions are for UX only
- Backend is the source of truth

### 2. **Resource-Specific Permissions**
- Check permissions on actual resources, not just types
- Include organization context in all checks
- Validate resource ownership

### 3. **Regular Permission Audits**
- Log all administrative actions
- Regular review of super admin accounts
- Monitor permission escalations

This CASL-based permission system provides a robust, scalable foundation for VECTR0's multi-tenant healthcare platform while maintaining the flexibility needed for complex healthcare access control requirements.