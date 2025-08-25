# Testing Strategy

## Testing Pyramid
```
     E2E Tests (10%)
    /              \
   Integration (30%) 
  /                  \
Unit Tests (60%)      
```

## Test Organization

### Frontend Tests
```
apps/admin/src/
├── components/
│   └── __tests__/
│       ├── ScheduleCalendar.test.tsx
│       └── PreferenceForm.test.tsx
├── hooks/
│   └── __tests__/
│       └── useSchedule.test.ts
└── services/
    └── __tests__/
        └── schedule.service.test.ts
```

### Backend Tests
```
packages/convex/
├── functions/
│   └── __tests__/
│       ├── schedules.test.ts
│       └── users.test.ts
└── lib/
    └── __tests__/
        └── auth.test.ts
```

### E2E Tests
```
e2e/
├── auth.spec.ts
├── schedule-generation.spec.ts
├── preference-submission.spec.ts
└── shift-trading.spec.ts
```

## Test Examples

### Frontend Component Test
```typescript
// components/__tests__/ScheduleCalendar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ScheduleCalendar } from '../ScheduleCalendar';
import { mockSchedule } from '@/test/fixtures';

describe('ScheduleCalendar', () => {
  it('displays staff shifts correctly', () => {
    render(
      <ScheduleCalendar 
        scheduleId="schedule_123"
        userId="user_456"
        viewMode="month"
      />
    );
    
    expect(screen.getByText('John Smith - Day Shift')).toBeInTheDocument();
    expect(screen.getByLabelText('Christmas Day - 50% staffing')).toBeInTheDocument();
  });

  it('handles shift click events', () => {
    const handleClick = vi.fn();
    render(
      <ScheduleCalendar 
        scheduleId="schedule_123"
        onShiftClick={handleClick}
      />
    );
    
    fireEvent.click(screen.getByText('Day Shift'));
    expect(handleClick).toHaveBeenCalledWith(expect.objectContaining({
      type: 'day',
      userId: 'user_456',
    }));
  });
});
```

### Backend API Test
```typescript
// functions/__tests__/schedules.test.ts
import { convexTest } from 'convex-test';
import { expect, test } from 'vitest';
import { api } from '../_generated/api';

test('generateSchedule respects PTO requests', async () => {
  const t = convexTest(schema);
  
  // Setup test data
  await t.run(async (ctx) => {
    await ctx.db.insert('organizations', { /* ... */ });
    await ctx.db.insert('users', { /* ... */ });
    await ctx.db.insert('ptoRequests', {
      userId: 'user_123',
      startDate: '2025-03-15',
      endDate: '2025-03-17',
      status: 'approved',
    });
  });

  // Generate schedule
  const scheduleId = await t.action(api.schedules.generateSchedule, {
    period: { startDate: '2025-01-01', endDate: '2025-03-31' },
    constraints: { respectPTO: true },
  });

  // Verify PTO dates have no assignments
  const assignments = await t.query(api.schedules.getAssignments, { scheduleId });
  const ptoAssignments = assignments.filter(
    a => a.userId === 'user_123' && 
    a.date >= '2025-03-15' && 
    a.date <= '2025-03-17'
  );
  
  expect(ptoAssignments).toHaveLength(0);
});
```

### E2E Test
```typescript
// e2e/schedule-generation.spec.ts
import { test, expect } from '@playwright/test';

test('admin can generate and publish schedule', async ({ page }) => {
  // Login as admin
  await page.goto('/login');
  await page.fill('[name="email"]', 'admin@hospital.com');
  await page.fill('[name="password"]', 'test-password');
  await page.click('button[type="submit"]');

  // Navigate to schedules
  await page.click('text=Schedules');
  await page.click('text=Generate New Schedule');

  // Configure generation
  await page.fill('[name="startDate"]', '2025-04-01');
  await page.fill('[name="endDate"]', '2025-06-30');
  await page.check('[name="respectPTO"]');
  await page.check('[name="enforceHolidays"]');
  
  // Generate
  await page.click('text=Generate with AI');
  await expect(page.locator('text=Schedule generated successfully')).toBeVisible();

  // Review and publish
  await expect(page.locator('.schedule-preview')).toBeVisible();
  await page.click('text=Publish Schedule');
  
  // Verify published
  await expect(page.locator('text=Schedule published')).toBeVisible();
  await expect(page.locator('[data-status="published"]')).toBeVisible();
});
```
