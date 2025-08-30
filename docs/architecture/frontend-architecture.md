# Frontend Architecture

## Astro Hybrid Architecture

### Rendering Strategy
- **Static Pages (SSG)**: Homepage, features, pricing, blog - pre-rendered at build time
- **Dynamic App (/app/*)**: React SPA with client-side routing via TanStack Router
- **Selective Hydration**: Astro Islands for interactive components on static pages
- **Edge Caching**: Static assets served from CDN with aggressive caching

### Component Organization
```
apps/web/src/
├── pages/                  # Astro pages
│   ├── index.astro        # Homepage (static)
│   ├── features.astro     # Features (static)
│   ├── pricing.astro      # Pricing (static)
│   ├── blog/              # Blog posts (static)
│   └── app/               # Dynamic app route
│       └── [...all].astro # React SPA entry
├── components/
│   ├── marketing/         # Static marketing components
│   │   ├── Hero.astro
│   │   ├── Features.astro
│   │   └── Pricing.astro
│   └── app/               # React app components
│       ├── schedule/
│       │   ├── ScheduleCalendar.tsx
│       │   ├── ShiftCard.tsx
│       │   └── HolidayIndicator.tsx
│       ├── preferences/
│       │   ├── PreferenceForm.tsx
│       │   ├── FulfillmentChart.tsx
│       │   └── PreferenceHistory.tsx
│       ├── trading/
│       │   ├── TradeMarketplace.tsx
│       │   ├── TradeRequest.tsx
│       │   └── TradeCard.tsx
│       └── shared/
│           ├── UserAvatar.tsx
│           ├── LoadingSpinner.tsx
│           └── ErrorBoundary.tsx
├── app/                   # React SPA
│   ├── routes/           # TanStack Router
│   ├── hooks/
│   │   ├── useSchedule.ts
│   │   ├── usePreferences.ts
│   │   └── useRealtime.ts
│   ├── services/
│   ├── stores/           # Zustand stores
│   └── main.tsx
└── layouts/
    ├── Marketing.astro    # Marketing layout
    └── App.astro          # App layout
```

### Astro Page Template (Static)
```astro
---
// src/pages/index.astro
export const prerender = true; // Static at build time

import Layout from '@/layouts/Marketing.astro';
import Hero from '@/components/marketing/Hero.astro';
import Features from '@/components/marketing/Features.astro';
import { PricingCalculator } from '@/components/marketing/PricingCalculator';
---

<Layout title="VECTR0 - AI-Powered Healthcare Scheduling">
  <Hero />
  <Features />
  <!-- Astro Island: Interactive component on static page -->
  <PricingCalculator client:visible />
</Layout>
```

### React App Entry (Dynamic)
```astro
---
// src/pages/app/[...all].astro
export const prerender = false; // Dynamic/SPA mode

import Layout from '@/layouts/App.astro';
---

<Layout title="VECTR0 App">
  <div id="root"></div>
  <script>
    import('../../app/main.tsx');
  </script>
</Layout>
```

### React Component Template
```typescript
// components/app/schedule/ScheduleCalendar.tsx
import { useState, useMemo } from 'react';
import { useQuery } from '@vectr0/convex/react';
import { api } from '@vectr0/convex';
import { Calendar } from '@vectr0/ui/calendar';
import { ShiftCard } from './ShiftCard';
import { HolidayIndicator } from './HolidayIndicator';
import { format, startOfMonth, endOfMonth } from '@vectr0/utils/dates';

interface ScheduleCalendarProps {
  scheduleId: string;
  userId?: string;
  viewMode: 'month' | 'week';
  onShiftClick?: (shift: Shift) => void;
}

export function ScheduleCalendar({ 
  scheduleId, 
  userId, 
  viewMode = 'month',
  onShiftClick 
}: ScheduleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { currentOrg } = useOrganization();
  
  const schedule = useQuery(api.schedules.getSchedule, { scheduleId });
  const holidays = useQuery(
    api.holidays.getByDateRange, 
    currentOrg ? {
      organizationId: currentOrg._id,
      startDate: format(startOfMonth(selectedDate), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(selectedDate), 'yyyy-MM-dd'),
    } : "skip"
  );

  const filteredAssignments = useMemo(() => {
    if (!schedule?.assignments) return [];
    if (!userId) return schedule.assignments;
    return schedule.assignments.filter(a => a.userId === userId);
  }, [schedule, userId]);

  return (
    <div className="flex flex-col space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="rounded-md border"
        components={{
          Day: ({ date, ...props }) => {
            const dayAssignments = filteredAssignments.filter(
              a => a.date === format(date, 'yyyy-MM-dd')
            );
            const holiday = holidays?.find(
              h => h.date === format(date, 'yyyy-MM-dd')
            );
            
            return (
              <div {...props} className="relative">
                {holiday && <HolidayIndicator holiday={holiday} />}
                {dayAssignments.map(assignment => (
                  <ShiftCard
                    key={assignment.id}
                    assignment={assignment}
                    onClick={() => onShiftClick?.(assignment)}
                  />
                ))}
              </div>
            );
          },
        }}
      />
    </div>
  );
}
```

## Multi-Organization Context Management

### Organization Provider
```typescript
// providers/OrganizationProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface OrganizationContextValue {
  currentOrg: Organization | null;
  availableOrgs: OrganizationMembership[];
  switchOrganization: (orgId: Id<"organizations">) => void;
  isLoading: boolean;
  userMembership: OrganizationMembership | null;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [currentOrgId, setCurrentOrgId] = useState<Id<"organizations"> | null>(null);
  
  // Get user's memberships
  const memberships = useQuery(api.users.getMyMemberships, {});
  const currentOrg = useQuery(
    api.organizations.get,
    currentOrgId ? { organizationId: currentOrgId } : "skip"
  );

  // Set default organization on first load
  useEffect(() => {
    if (memberships && memberships.length > 0 && !currentOrgId) {
      const defaultMembership = memberships.find(m => m.isDefault) || memberships[0];
      setCurrentOrgId(defaultMembership.organizationId);
      
      // Persist to localStorage
      localStorage.setItem('currentOrgId', defaultMembership.organizationId);
    }
  }, [memberships, currentOrgId]);

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('currentOrgId');
    if (saved) {
      setCurrentOrgId(saved as Id<"organizations">);
    }
  }, []);

  const switchOrganization = (orgId: Id<"organizations">) => {
    setCurrentOrgId(orgId);
    localStorage.setItem('currentOrgId', orgId);
  };

  const currentMembership = memberships?.find(m => m.organizationId === currentOrgId);

  return (
    <OrganizationContext.Provider
      value={{
        currentOrg: currentOrg || null,
        availableOrgs: memberships || [],
        switchOrganization,
        isLoading: !memberships || (currentOrgId && !currentOrg),
        userMembership: currentMembership || null,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
}
```

### Organization Switcher Component
```typescript
// components/shared/OrganizationSwitcher.tsx
import { useState } from 'react';
import { ChevronDown, Building2, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useOrganization } from '@/providers/OrganizationProvider';

export function OrganizationSwitcher() {
  const { currentOrg, availableOrgs, switchOrganization, userMembership } = useOrganization();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          size="sm"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">
              {currentOrg?.name || 'Select Organization'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableOrgs.map((membership) => (
          <DropdownMenuItem
            key={membership.organizationId}
            onClick={() => switchOrganization(membership.organizationId)}
            className="flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            <div className="flex-1">
              <div className="font-medium">{membership.organization?.name}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {membership.role} {membership.isDefault && '• Default'}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <Plus className="h-4 w-4" />
          Join Organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## State Management Architecture

### Enhanced State Structure
```typescript
// stores/useAppStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  // User state
  user: User | null;
  
  // Organization context is now handled by OrganizationProvider
  // No longer stored in global state to avoid sync issues
  
  // UI state
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // Schedule state
  activeScheduleId: string | null;
  viewMode: 'month' | 'week' | 'day';
  
  // Actions
  setUser: (user: User | null) => void;
  toggleSidebar: () => void;
  setViewMode: (mode: 'month' | 'week' | 'day') => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        organization: null,
        sidebarOpen: true,
        theme: 'system',
        activeScheduleId: null,
        viewMode: 'month',
        
        setUser: (user) => set({ user }),
        setOrganization: (organization) => set({ organization }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setViewMode: (viewMode) => set({ viewMode }),
      }),
      {
        name: 'vectr0-storage',
        partialize: (state) => ({ theme: state.theme, viewMode: state.viewMode }),
      }
    )
  )
);
```

### State Management Patterns
- Use Zustand for client-side UI state
- Convex handles all server state with real-time subscriptions
- No need for complex state management for server data
- Optimistic updates handled by Convex mutations

## Routing Architecture

### Route Organization
```
apps/web/src/routes/
├── __root.tsx           # Root layout with auth
├── _authenticated/
│   ├── dashboard.tsx     # Main dashboard
│   ├── schedule/
│   │   ├── index.tsx     # Schedule list
│   │   └── $id.tsx       # Schedule detail
│   ├── preferences.tsx   # Preferences management
│   ├── trades.tsx        # Shift trading
│   └── profile.tsx       # User profile
└── _public/
    ├── login.tsx
    └── signup.tsx
```

### Protected Route Pattern
```typescript
// routes/_authenticated.tsx
import { Outlet, Navigate } from '@tanstack/react-router';
import { useAuth } from '@clerk/clerk-react';
import { MainLayout } from '@/components/layouts/MainLayout';

export function AuthenticatedRoute() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
```

## Frontend Services Layer

### API Client Setup
```typescript
// lib/convex.ts
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

### Service Example
```typescript
// services/schedule.service.ts
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function useScheduleService() {
  const generateSchedule = useMutation(api.schedules.generateSchedule);
  const publishSchedule = useMutation(api.schedules.publishSchedule);
  const getSchedule = useQuery(api.schedules.getSchedule);

  return {
    generateSchedule: async (period: SchedulePeriod, constraints: Constraints) => {
      try {
        const scheduleId = await generateSchedule({ period, constraints });
        return { success: true, scheduleId };
      } catch (error) {
        console.error('Failed to generate schedule:', error);
        return { success: false, error };
      }
    },
    
    publishSchedule: async (scheduleId: string) => {
      try {
        await publishSchedule({ scheduleId });
        return { success: true };
      } catch (error) {
        console.error('Failed to publish schedule:', error);
        return { success: false, error };
      }
    },
  };
}
```
