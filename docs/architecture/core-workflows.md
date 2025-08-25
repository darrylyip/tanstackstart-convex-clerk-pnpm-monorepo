# Core Workflows

## Schedule Generation Workflow

```mermaid
sequenceDiagram
    participant Admin
    participant UI as Admin Portal
    participant CF as Convex Function
    participant AI as AI Engine
    participant DB as Convex DB
    participant Cal as Calendar Sync
    participant Staff as Staff

    Admin->>UI: Initiate Schedule Generation
    UI->>CF: generateSchedule(orgId, period, constraints)
    CF->>CF: Validate admin permissions for org
    
    par Fetch scheduling data
        CF->>DB: Fetch schedulable contacts
        CF->>DB: Fetch org scheduling rules
        CF->>DB: Fetch contact settings
        CF->>DB: Fetch holidays, PTO
    end
    DB-->>CF: Return all data
    
    CF->>CF: Merge rules (org + personal)
    Note over CF: Rule priority:<br/>1. Org mandatory constraints<br/>2. Personal overrides<br/>3. Personal soft rules<br/>4. Org soft rules
    
    CF->>AI: Generate with merged rules
    Note over AI: Process constraints:<br/>- Hard rules (must satisfy)<br/>- Soft rules (optimize by priority)<br/>- Unavailable dates<br/>- PTO requests
    AI-->>CF: Return draft schedule
    
    CF->>CF: Validate all hard rules met
    CF->>DB: Save draft schedule
    DB-->>CF: Schedule ID
    
    CF-->>UI: Show draft with metrics
    Note over UI: Display:<br/>- Rule satisfaction %<br/>- Soft rule fulfillment<br/>- Warning for conflicts
    UI-->>Admin: Display schedule
    
    Admin->>UI: Approve schedule
    UI->>CF: publishSchedule(scheduleId)
    CF->>DB: Update status to published
    
    par Notify contacts
        CF->>DB: Get linked users for contacts
        CF->>Staff: Send notifications to users
    and Sync calendars
        CF->>Cal: Trigger calendar sync
        Cal->>Cal: Update Google Calendar
        Cal->>Cal: Update Apple Calendar
    end
    
    Cal-->>Staff: Calendar events created
```

## Preference Submission and Tracking

```mermaid
sequenceDiagram
    participant Staff as Staff
    participant Web as Web Portal
    participant CF as Convex Function
    participant DB as Convex DB
    participant Analytics as Analytics Engine

    Staff->>Web: Access preferences page
    Web->>CF: getPreferenceHistory()
    CF->>DB: Query past preferences
    DB-->>CF: Historical data
    CF-->>Web: Display fulfillment rates
    
    Staff->>Web: Submit new preference
    Note over Web: Preference types:<br/>- Specific dates off<br/>- Shift type preferences<br/>- Pattern preferences
    
    Web->>CF: submitPreference(details)
    CF->>CF: Validate preference
    CF->>DB: Store preference request
    DB-->>CF: Preference ID
    
    CF->>Analytics: Track preference
    Analytics->>Analytics: Update metrics
    
    CF-->>Web: Confirmation
    Web-->>Staff: Show success message
    
    Note over CF: When schedule generated
    CF->>CF: Match preferences
    CF->>DB: Update fulfillment status
    CF->>Analytics: Calculate rates
    
    Analytics-->>Web: Real-time fulfillment %
    Web-->>Staff: Display analytics
```

## Shift Trade Workflow

```mermaid
sequenceDiagram
    participant U1 as Staff Member 1
    participant U2 as Staff Member 2
    participant Web as Web Portal
    participant CF as Convex Function
    participant DB as Convex DB
    participant Cal as Calendar Sync

    U1->>Web: Post shift for trade
    Web->>CF: createTradeRequest(shiftId, date)
    CF->>DB: Save trade request
    CF->>CF: Find eligible staff
    CF-->>Web: Trade posted
    
    Note over CF: Real-time notification
    CF->>U2: Notify of trade opportunity
    
    U2->>Web: View available trades
    Web->>CF: getAvailableTrades()
    CF->>DB: Query open trades
    DB-->>CF: Trade list
    CF-->>Web: Display trades
    
    U2->>Web: Accept trade
    Web->>CF: acceptTrade(tradeId)
    CF->>CF: Validate no conflicts
    CF->>DB: Update assignments
    
    par Update calendars
        CF->>Cal: Sync U1 calendar
        CF->>Cal: Sync U2 calendar
    and Notify staff
        CF->>U1: Trade accepted notification
        CF->>U2: Trade confirmed notification
    end
    
    Cal-->>U1: Calendar updated
    Cal-->>U2: Calendar updated
```

## User Registration and Contact Linking

```mermaid
sequenceDiagram
    participant User as New User
    participant Auth as Clerk Auth
    participant CF as Convex Function
    participant DB as Convex DB
    participant Admin as Admin

    Note over Admin: Pre-registration
    Admin->>DB: Create SchedulableContact
    Note over DB: Contact exists with<br/>name, email, no linkedUserId
    
    User->>Auth: Sign up with email
    Auth->>Auth: Verify email
    Auth->>CF: Trigger webhook (user.created)
    
    CF->>DB: Create User record
    CF->>DB: Search SchedulableContacts by email
    
    alt Contact found
        CF->>DB: Link contact to user
        Note over DB: Set linkedUserId
        CF->>DB: Create OrganizationMembership
        Note over CF: Inherit existing<br/>- Shift assignments<br/>- Settings<br/>- History
    else No contact found
        CF->>CF: Wait for admin invitation
    end
    
    CF-->>User: Registration complete
    
    Note over User: First login
    User->>CF: getMyOrganizations()
    CF->>DB: Query memberships
    DB-->>CF: Return organizations
    CF-->>User: Show org selector
```

## Organization Invitation Workflow

```mermaid
sequenceDiagram
    participant Admin
    participant UI as Admin Portal
    participant CF as Convex Function
    participant DB as Convex DB
    participant Email as Email Service
    participant User as Invited User

    Admin->>UI: Add new staff member
    UI->>CF: inviteToOrganization(email, role)
    CF->>CF: Validate admin permissions
    
    CF->>DB: Check if user exists by email
    
    alt User exists
        CF->>DB: Create OrganizationMembership
        CF->>DB: Create linked SchedulableContact
        CF->>Email: Send org invitation
    else User doesn't exist
        CF->>DB: Create SchedulableContact
        Note over DB: Contact ready for scheduling
        CF->>Email: Send signup + org invitation
    end
    
    Email-->>User: Invitation received
    
    User->>UI: Accept invitation
    UI->>CF: acceptInvitation(token)
    CF->>DB: Update membership status
    CF->>DB: Link contact if needed
    
    CF-->>UI: Redirect to org
    UI-->>User: Access granted
```
