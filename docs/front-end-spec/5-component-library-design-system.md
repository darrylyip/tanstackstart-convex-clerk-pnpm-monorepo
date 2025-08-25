# 5. Component Library & Design System

## shadcn/ui Foundation
Built on shadcn/ui v4 components with healthcare-specific customizations:

### Core Components

#### ScheduleCard (Custom)
**Base**: shadcn Card component
```tsx
// Displays schedule metadata and period info
// Variants: draft, published, archived
// States: normal, hover, selected, disabled
<ScheduleCard 
  schedule={schedule}
  startDate={startDate}
  endDate={endDate}
  status="published"
  generatedBy="ai"
  assignmentCount={42}
/>
```

#### ShiftAssignmentCard (Custom)
**Base**: shadcn Card + Badge components
```tsx
// Displays individual shift assignments
// Variants: scheduled, absent, conflicted
// States: normal, hover, dragging, disabled
<ShiftAssignmentCard 
  assignment={shiftAssignment}
  contact={schedulableContact}
  shift={shift}
  date={date}
  status="scheduled"
  onEdit={handleEdit}
/>
```

#### ContactChip (Custom)
**Base**: shadcn Badge + Avatar components
```tsx
// Variants: standard, compact, with-avatar, linked-user
// States: active, inactive, conflicted
<ContactChip 
  contact={schedulableContact}
  linkedUser={linkedUser}
  isActive={true}
  avatar={avatarUrl}
  variant="with-avatar"
/>
```

#### ConflictAlert (Custom)
**Base**: shadcn Alert component
```tsx
// Enhanced with healthcare-specific styling
<ConflictAlert 
  type="warning"
  message="Schedule conflict detected"
  actions={resolveActions}
  severity="medium"
/>
```

#### AIGenerationProgress (Custom)
**Base**: shadcn Progress + Card components
```tsx
// Shows AI schedule generation status
<AIGenerationProgress 
  status="generating"
  progress={65}
  currentStep="Applying soft rules"
  estimatedTime="15 seconds"
/>
```

#### RuleSatisfactionPanel (Custom)
**Base**: shadcn Card + Progress components
```tsx
// Displays rule fulfillment metrics
<RuleSatisfactionPanel 
  mandatoryRules={100}
  softRules={87}
  conflicts={conflicts}
  fulfillmentScore={93}
/>
```

#### PreferenceFulfillmentChart (Custom)
**Base**: Custom chart component with shadcn styling
```tsx
// Analytics for preference tracking
<PreferenceFulfillmentChart 
  data={fulfillmentHistory}
  timeRange="6months"
  showTrends={true}
/>
```

#### TradeMarketplace (Custom)
**Base**: shadcn Card + Table components
```tsx
// Shift trading interface
<TradeMarketplace 
  availableTrades={trades}
  myRequests={myTrades}
  onAcceptTrade={handleAccept}
  onPostTrade={handlePost}
/>
```

#### OnboardingWizard (Custom)
**Base**: shadcn Dialog + Stepper components
```tsx
// New user onboarding flow
<OnboardingWizard 
  currentStep={2}
  totalSteps={4}
  userType="schedulableContact"
  hasLinkedContact={true}
/>
```

### shadcn Components Used
- **Button**: Primary actions, secondary actions, ghost variants
- **Input**: Form fields with validation states
- **Select**: Dropdown selections with search
- **Calendar**: Date/time selection with constraints
- **Dialog**: Modals for complex interactions
- **Sheet**: Sliding panels for mobile
- **Table**: Data grids with sorting/filtering
- **Tabs**: Section navigation
- **Avatar**: User identification
- **Badge**: Status indicators
- **Card**: Content containers
- **Alert**: System messages
- **Skeleton**: Loading states

## MCP Server Integration
Leverage shadcn MCP server for:
- Component discovery and selection
- Code generation with proper dependencies
- Demo patterns for complex implementations
- Multi-framework reference (if expanding beyond React)
