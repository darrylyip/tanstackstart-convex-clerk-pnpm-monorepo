# Data Models

## Datetime Field Conventions

VECTR0 uses consistent datetime field types across all models:

**Calendar Dates (string):** Used for date-only fields where time is not relevant
- Format: ISO 8601 date format (YYYY-MM-DD)
- Examples: `startDate`, `endDate`, `date` (for holidays/shifts)
- TypeScript: `string`
- Convex: `v.string()`

**Timestamps (number):** Used for precise moments in time
- Format: Unix timestamp (milliseconds since epoch)
- Examples: `createdAt`, `updatedAt`, `lastLoginAt`, `joinedAt`, `approvedAt`
- TypeScript: `number`
- Convex: `v.number()`

**Time-only (string):** Used for time-of-day fields
- Format: HH:MM (24-hour format)
- Examples: `startTime`, `endTime`
- TypeScript: `string`
- Convex: `v.string()`

## Organization

**Purpose:** Root tenant entity containing all organization-specific data and configuration. Synchronized from Clerk organizations via webhooks.

**Key Attributes:**
- _id: Id<"organizations"> - Convex unique identifier
- clerkOrgId: string - Clerk organization ID (source of truth)
- name: string - Organization display name
- slug: string - Unique URL slug for multi-tenancy
- metadata: object - Hospital system, department, timezone
- settings: OrgSettings - Schedule configuration and preferences
- createdAt: number - Unix timestamp
- updatedAt: number - Unix timestamp

**TypeScript Interface:**
```typescript
interface Organization {
  _id: Id<"organizations">;
  clerkOrgId: string;  // Clerk organization ID
  name: string;
  slug: string;
  metadata?: {
    hospitalSystem?: string;
    department?: string;
    timezone?: string;
  };
  settings?: {
    scheduleConfig?: any;
    preferences?: any;
  };
  createdAt: number;
  updatedAt: number;
}
```

**Relationships:**
- Has many Users (through OrganizationMemberships)
- Has many SchedulableContacts
- Has one OrganizationSchedulingRules
- Has one OrganizationHolidaySettings (optional)
- Has many Schedules
- Has many Locations

## User

**Purpose:** Authentication entity for platform users. Synchronized from Clerk users via webhooks. Users can belong to multiple organizations.

**Key Attributes:**
- _id: Id<"users"> - Convex unique identifier
- clerkUserId: string - Clerk user ID (source of truth)
- email: string - User email address
- name: string - Full name from Clerk
- imageUrl: string - Profile photo URL from Clerk
- organizationId: Id<"organizations"> - Primary organization (optional)
- role: 'admin' | 'org_admin' | 'user' - System-wide role
- metadata: object - Additional user data from Clerk

**TypeScript Interface:**
```typescript
interface User {
  _id: Id<"users">;
  clerkUserId: string;  // Clerk user ID
  email: string;
  name?: string;
  imageUrl?: string;
  organizationId?: Id<"organizations">; // Primary org
  role: 'super_admin' | 'admin' | 'user';
  metadata?: any;  // From Clerk public metadata
  createdAt: number;
  updatedAt: number;
}
```

**Relationships:**
- Has many OrganizationMemberships
- Belongs to primary Organization (optional)
- May have linked SchedulableContacts (one per organization membership)

**Indexes:**
- `by_clerk_id` - Primary lookup by Clerk ID
- `by_organization` - Users in an organization
- `by_email` - Email-based queries

## OrganizationMembership

**Purpose:** Junction table for many-to-many relationship between users and organizations. Synchronized from Clerk organization memberships via webhooks.

**Key Attributes:**
- _id: Id<"organizationMemberships"> - Unique membership identifier
- userId: Id<"users"> - Associated Convex user
- organizationId: Id<"organizations"> - Associated Convex organization
- role: string - Organization-specific role from Clerk
- joinedAt: number - When user joined organization

**TypeScript Interface:**
```typescript
interface OrganizationMembership {
  _id: Id<"organizationMemberships">;
  userId: Id<"users">;
  organizationId: Id<"organizations">;
  role: string;  // Clerk org role: 'org_admin', 'user', etc.
  joinedAt: number;
}
```

**Relationships:**
- Belongs to User
- Belongs to Organization

**Indexes:**
- `by_user` - Query all organizations for a user
- `by_organization` - Query all members of an organization  
- `by_user_org` - Unique constraint and fast lookups

**Synchronization:**
- Created when Clerk webhook fires `organizationMembership.created`
- Updated when Clerk webhook fires `organizationMembership.updated`
- Deleted when Clerk webhook fires `organizationMembership.deleted`

## SchedulableContact

**Purpose:** People who can be scheduled but may not have user accounts yet (per diem, temp staff, external providers)

**Key Attributes:**
- id: string - Unique contact identifier
- organizationId: Id<"organizations"> - Tenant association
- firstName: string - Contact first name
- lastName: string - Contact last name
- email: string - Contact email (optional, for user linking)
- phone: string - Contact phone (optional, for user linking)
- isActive: boolean - Whether contact is available for scheduling
- linkedUserId: Id<"users"> - Associated user account (when they register)
- notes: string - Admin notes about this contact

**TypeScript Interface:**
```typescript
interface SchedulableContact {
  _id: Id<"schedulableContacts">;
  organizationId: Id<"organizations">;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  linkedUserId?: Id<"users">;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
```

**Relationships:**
- Belongs to Organization
- May link to User (when they register)
- Has one ContactSchedulingSettings
- Has many ShiftAssignments

**Indexes:**
- `by_organization` - Query contacts for an organization
- `by_email` - Lookup for user linking
- `by_phone` - Backup lookup for user linking
- `by_linked_user` - Find contacts already linked to users

## OrganizationSchedulingRules

**Purpose:** Organization-wide scheduling rules and constraints that apply to all staff

**Key Attributes:**
- id: string - Unique rules identifier
- organizationId: Id<"organizations"> - Associated organization
- mandatoryConstraints: Object - Legal/safety requirements that cannot be overridden
- customRules: Array - Organization preferences and soft/hard rules

**TypeScript Interface:**
```typescript
interface OrganizationSchedulingRules {
  _id: Id<"organizationSchedulingRules">;
  organizationId: Id<"organizations">;
  
  // Regulatory/safety minimums (cannot be overridden)
  mandatoryConstraints: {
    maxConsecutiveDays?: number;
    maxHoursPerWeek?: number;
    minRestBetweenShifts?: number; // Hours
    requiredCertifications?: string[];
    minStaffPerShift?: number;
  };
  
  // Organization preferences (CAN be overridden by personal rules)
  customRules?: Array<{
    id: string;
    name: string;
    type: 'hard' | 'soft';  // Hard = safety/legal, Soft = org preference
    expression: string;
    priority?: number; // 1-100, for soft rules only
    description?: string;
  }>;
  
  createdAt: number;
  updatedAt: number;
}
```

**Relationships:**
- Belongs to Organization
- Provides defaults for all ContactSchedulingSettings

## ContactSchedulingSettings

**Purpose:** Personal scheduling constraints and preferences that override organization defaults

**Key Attributes:**
- id: string - Unique settings identifier
- contactId: Id<"schedulableContacts"> - Associated contact
- constraintOverrides: Object - More restrictive personal constraints
- customRules: Array - Personal rules that override org rules
- preferences: Object - Simple scheduling preferences

**TypeScript Interface:**
```typescript
interface ContactSchedulingSettings {
  _id: Id<"contactSchedulingSettings">;
  contactId: Id<"schedulableContacts">;
  
  // Personal adjustments to mandatory constraints (MORE restrictive only)
  constraintOverrides?: {
    maxShiftsPerMonth?: number;    // Can be lower than org max
    maxConsecutiveDays?: number;    // Can be lower than org max
    maxHoursPerWeek?: number;       // Can be lower than org max
  };
  
  // Personal rules (override org soft rules)
  customRules?: Array<{
    id: string;
    name: string;
    type: 'hard' | 'soft';
    expression: string;
    priority?: number;              // 1-100, personal rules trump org rules
    overridesOrgRule?: string;      // ID of org rule this replaces
  }>;
  
  // Simple preferences
  preferences: {
    unavailableDates: string[];     // ISO dates YYYY-MM-DD
    preferredShiftTypes: string[];  // Shift type IDs
    preferredDaysOff: number[];     // 0-6 (Sunday-Saturday)
  };
  
  createdAt: number;
  updatedAt: number;
}
```

**Relationships:**
- Belongs to SchedulableContact
- Overrides OrganizationSchedulingRules for the contact

**Rule Resolution Order:**
1. Organization mandatory constraints (cannot override)
2. Personal constraint overrides (more restrictive only)
3. Personal hard rules (must satisfy)
4. Personal soft rules (highest priority)
5. Organization soft rules (lowest priority defaults)

## Schedule

**Purpose:** Represents a scheduling period with all assignments

**Key Attributes:**
- id: string - Unique schedule identifier
- organizationId: Id<"organizations"> - Tenant association
- startDate: string - Schedule start date (ISO format YYYY-MM-DD)
- endDate: string - Schedule end date (ISO format YYYY-MM-DD)
- status: ScheduleStatus - draft | published | archived
- generatedBy: 'ai' | 'manual' - Generation method

**TypeScript Interface:**
```typescript
interface Schedule {
  _id: Id<"schedules">;
  organizationId: Id<"organizations">;
  startDate: string; // ISO date YYYY-MM-DD
  endDate: string; // ISO date YYYY-MM-DD
  status: 'draft' | 'published' | 'archived';
  generatedBy: 'ai' | 'manual';
  aiMetadata?: {
    model: string;
    constraints: Record<string, any>;
    generationTime: number;
    fulfillmentScore: number;
  };
  publishedAt?: number;
  publishedBy?: Id<"users">;
  createdAt: number;
  updatedAt: number;
}
```

**Relationships:**
- Belongs to Organization
- Has many ShiftAssignments
- Affected by OrganizationHolidaySettings

## Shift

**Purpose:** Defines a shift slot that needs to be filled in the schedule

**Key Attributes:**
- id: string - Unique shift identifier
- organizationId: Id<"organizations"> - Tenant association
- name: string - Display name
- type: ShiftType - day | night (optional)
- priority: number - Shift priority (optional)
- notes: string - Additional notes (optional)
- requirements: ShiftRequirements - Staffing requirements (optional)

**TypeScript Interface:**
```typescript
interface Shift {
  _id: Id<"shifts">;
  organizationId: Id<"organizations">;
  name: string;
  type?: 'day' | 'night';
  location?: string;
  priority?: number;
  notes?: string;
  timing?: {
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
  };
  requirements?: {
    minStaff: number;
    maxStaff: number;
  };
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}
```

**Relationships:**
- Belongs to Organization
- Has many ShiftAssignments

## BaseHoliday

**Purpose:** Shared holiday definitions across all organizations (system-wide reference data)

**Key Attributes:**
- id: string - Unique holiday identifier
- name: string - Holiday name
- month: number - Month (1-12)
- day: number - Day of month (1-31)
- isFloating: boolean - Whether holiday moves based on rules (e.g., Thanksgiving)
- floatingRule: string - Rule for floating holidays (e.g., "fourth-thursday-november")
- category: string - Holiday category (federal, state, religious, international)
- country: string - Country code (US, CA, etc.)
- description: string - Optional holiday description

**TypeScript Interface:**
```typescript
interface BaseHoliday {
  _id: Id<"baseHolidays">;
  name: string;
  month: number; // 1-12
  day: number; // 1-31
  isFloating: boolean;
  floatingRule?: string; // e.g., "fourth-thursday-november"
  category: 'federal' | 'state' | 'religious' | 'international';
  country: string; // 'US', 'CA', etc.
  description?: string;
  createdAt: number;
  updatedAt: number;
}
```

**Relationships:**
- Referenced by OrganizationHolidaySettings
- No direct organization association (shared data)

## OrganizationHolidaySettings

**Purpose:** Organization-specific holiday configuration, determining which holidays to observe and how

**Key Attributes:**
- id: string - Unique settings identifier
- organizationId: Id<"organizations"> - Associated organization
- enabled: boolean - Whether organization uses holiday system
- observedHolidayIds: Array - Base holidays this organization observes
- customHolidays: Array - Organization-specific holidays
- holidayOverrides: Array - Scheduling overrides for specific holidays

**TypeScript Interface:**
```typescript
interface OrganizationHolidaySettings {
  _id: Id<"organizationHolidaySettings">;
  organizationId: Id<"organizations">;
  enabled: boolean; // Whether org uses holiday system at all
  
  // Which base holidays to observe
  observedHolidayIds: Id<"baseHolidays">[];
  
  // Custom holidays specific to this org
  customHolidays: Array<{
    name: string;
    month: number;
    day: number;
    isSchedulable: boolean;
  }>;
  
  // Override scheduling behavior for specific holidays
  holidayOverrides: Array<{
    baseHolidayId?: Id<"baseHolidays">;
    customHolidayName?: string;
    isSchedulable: boolean; // Can shifts be scheduled
    requiresMinimumStaff?: number; // Holiday-specific staffing
  }>;
  
  createdAt: number;
  updatedAt: number;
}
```

**Relationships:**
- Belongs to Organization (one-to-one)
- References multiple BaseHolidays
- Affects Schedules and ShiftAssignments

**Indexes:**
- `by_organization` - Query holiday settings for an organization

**Business Rules:**
- Holiday configuration is completely optional - organizations without a record have no holidays
- Base holidays are seeded at system initialization with common US federal holidays
- Organizations can mix base holidays with custom holidays
- Holiday scheduling behavior can be overridden per holiday

## Location

**Purpose:** Physical locations or addresses associated with an organization

**Key Attributes:**
- id: string - Unique location identifier
- organizationId: Id<"organizations"> - Tenant association
- name: string - Location name or identifier
- address: string - Physical address (optional)

**TypeScript Interface:**
```typescript
interface Location {
  _id: Id<"locations">;
  organizationId: Id<"organizations">;
  name: string;
  address?: string;
  createdAt: number;
  updatedAt: number;
}
```

**Relationships:**
- Belongs to Organization

## ShiftAssignment

**Purpose:** Assignment of a person (SchedulableContact) to a specific shift on a specific date

**Key Attributes:**
- id: string - Unique assignment identifier
- scheduleId: Id<"schedules"> - Associated schedule
- shiftId: Id<"shifts"> - Associated shift
- date: string - Date for this assignment (ISO format YYYY-MM-DD)
- assignedContactId: Id<"schedulableContacts"> - Assigned contact (may be linked to a user)
- status: AssignmentStatus - scheduled | absent
- notes: string - Assignment-specific notes

**TypeScript Interface:**
```typescript
interface ShiftAssignment {
  _id: Id<"shiftAssignments">;
  scheduleId: Id<"schedules">;
  shiftId: Id<"shifts">;
  date: string; // ISO date YYYY-MM-DD
  assignedContactId: Id<"schedulableContacts">;
  status: 'scheduled' | 'absent';
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
```

**Relationships:**
- Belongs to Schedule
- Belongs to Shift
- Belongs to SchedulableContact

**Indexes:**
- `by_schedule` - Query assignments for a schedule
- `by_shift` - Query assignments for a shift
- `by_contact` - Query assignments for a contact
- `by_date` - Query assignments for a specific date

**Business Rules:**
- All assignments reference a SchedulableContact
- When a User registers/logs in, a SchedulableContact is automatically created/linked
- Users with organization membership automatically have a linked SchedulableContact
