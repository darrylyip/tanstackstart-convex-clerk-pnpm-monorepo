# 4. Data Model Integration

## Core Data Types
Based on the architecture data models, UI components work with these key entities:

### Organization Context
```typescript
interface Organization {
  _id: Id<"organizations">;
  name: string;
  slug: string;
  settings: {
    timezone: string;
    workWeek: DayOfWeek[];
  };
}

interface OrganizationMembership {
  _id: Id<"organizationMemberships">;
  userId: Id<"users">;
  organizationId: Id<"organizations">;
  role: 'admin' | 'staff' | 'guest';
  status: 'active' | 'invited' | 'suspended';
  isDefault: boolean;
}
```

### Schedule & Assignment Types
```typescript
interface Schedule {
  _id: Id<"schedules">;
  organizationId: Id<"organizations">;
  startDate: string; // ISO date YYYY-MM-DD
  endDate: string; // ISO date YYYY-MM-DD
  status: 'draft' | 'published' | 'archived';
  generatedBy: 'ai' | 'manual';
}

interface ShiftAssignment {
  _id: Id<"shiftAssignments">;
  scheduleId: Id<"schedules">;
  shiftId: Id<"shifts">;
  date: string; // ISO date YYYY-MM-DD
  assignedContactId: Id<"schedulableContacts">;
  status: 'scheduled' | 'absent';
}

interface SchedulableContact {
  _id: Id<"schedulableContacts">;
  organizationId: Id<"organizations">;
  firstName: string;
  lastName: string;
  isActive: boolean;
  linkedUserId?: Id<"users">;
}
```

### Scheduling Rules Types
```typescript
interface OrganizationSchedulingRules {
  _id: Id<"organizationSchedulingRules">;
  organizationId: Id<"organizations">;
  mandatoryConstraints: {
    maxConsecutiveDays?: number;
    maxHoursPerWeek?: number;
    minRestBetweenShifts?: number;
  };
}

interface ContactSchedulingSettings {
  _id: Id<"contactSchedulingSettings">;
  contactId: Id<"schedulableContacts">;
  constraintOverrides?: {
    maxShiftsPerMonth?: number;
    maxConsecutiveDays?: number;
    maxHoursPerWeek?: number;
  };
  preferences: {
    unavailableDates: string[];
    preferredShiftTypes: string[];
    preferredDaysOff: number[];
  };
}
```

## Datetime Handling Convention
Following the architecture standards:
- **Calendar Dates**: String format YYYY-MM-DD (startDate, endDate, date fields)
- **Timestamps**: Number format (milliseconds since epoch) for createdAt, updatedAt
- **Time-only**: String format HH:MM (24-hour) for shift timing
