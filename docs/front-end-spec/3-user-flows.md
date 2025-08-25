# 3. User Flows

## Critical Flow 1: AI Schedule Generation (Admin)
```mermaid
flowchart TD
    A[Admin Dashboard] --> B[Schedule Management]
    B --> C[Create New Schedule]
    C --> D[Select Organization]
    D --> E[Define Period startDate/endDate]
    E --> F[Review Constraints]
    F --> G[Display Rule Summary]
    G --> H[Trigger AI Generation]
    H --> I[Loading State with Progress]
    I --> J[Display Draft Schedule]
    J --> K[Show Metrics Panel]
    K --> L[Rule Satisfaction %]
    L --> M[Soft Rule Fulfillment]
    M --> N[Conflict Warnings]
    N --> O{Approve Schedule?}
    O -->|Yes| P[Publish Schedule]
    O -->|No| Q[Adjust Constraints]
    Q --> H
    P --> R[Trigger Notifications]
    R --> S[Calendar Sync]
    S --> T[Confirmation Screen]
```

**UI Components Needed:**
- AI generation progress indicator
- Rule satisfaction metrics dashboard
- Conflict visualization panel
- Bulk approval interface

**Success Criteria:**
- Schedule generation completes in <30 seconds
- Clear display of rule fulfillment percentages
- One-click publish with notification confirmation

## Critical Flow 2: Preference Management (Staff)
```mermaid
flowchart TD
    A[Staff Login] --> B[My Preferences]
    B --> C[View Historical Data]
    C --> D[Fulfillment Rate Chart]
    D --> E[Submit New Preference]
    E --> F[Select Preference Type]
    F --> G{Preference Type}
    G -->|Dates Off| H[Calendar Picker]
    G -->|Shift Types| I[Shift Selection]
    G -->|Patterns| J[Pattern Builder]
    H --> K[Save Preference]
    I --> K
    J --> K
    K --> L[Analytics Update]
    L --> M[Confirmation Message]
    M --> N[Updated Dashboard]
```

**UI Components Needed:**
- Fulfillment rate charts and analytics
- Multi-type preference form
- Calendar date picker for unavailable dates
- Pattern builder for complex preferences

## Critical Flow 3: Shift Trading (Staff-to-Staff)
```mermaid
flowchart TD
    A[Staff Dashboard] --> B[My Schedule]
    B --> C[Select Shift to Trade]
    C --> D[Post Trade Request]
    D --> E[Trade Marketplace]
    E --> F[Real-time Notifications]
    F --> G[Other Staff View Trades]
    G --> H[Browse Available Trades]
    H --> I[Select Trade]
    I --> J[Conflict Validation]
    J --> K{Conflicts?}
    K -->|Yes| L[Show Conflicts]
    K -->|No| M[Accept Trade]
    L --> H
    M --> N[Update Both Schedules]
    N --> O[Notify Both Parties]
    O --> P[Calendar Sync]
    P --> Q[Trade Complete]
```

**UI Components Needed:**
- Trade marketplace with filtering
- Real-time notification system
- Conflict checker and validator
- Two-way calendar sync interface

## Critical Flow 4: User Registration & Contact Linking
```mermaid
flowchart TD
    A[Email Invitation] --> B[Signup Form]
    B --> C[Clerk Authentication]
    C --> D[Email Verification]
    D --> E[Account Creation]
    E --> F[Contact Linking Check]
    F --> G{Contact Found?}
    G -->|Yes| H[Link to Existing Contact]
    G -->|No| I[Wait for Admin]
    H --> J[Inherit Schedule History]
    J --> K[Organization Selection]
    K --> L[Dashboard Access]
    I --> M[Limited Access Mode]
```

**UI Components Needed:**
- Invitation acceptance flow
- Contact linking confirmation
- Organization selector for multi-org users
- Onboarding wizard for new users
