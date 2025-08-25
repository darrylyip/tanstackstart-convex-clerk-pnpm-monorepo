# 9. Multi-Device Responsiveness Strategy

## Device-Specific Breakpoints
```css
/* Mobile-first responsive design */
/* Mobile (320px - 767px) */
mobile-xs: 320px   /* iPhone SE, Galaxy S8 */
mobile-sm: 375px   /* iPhone 12/13/14 */
mobile-lg: 414px   /* iPhone Pro Max */

/* Tablet (768px - 1023px) */
tablet-sm: 768px   /* iPad Mini, Android tablets */
tablet-md: 820px   /* iPad Air */
tablet-lg: 1024px  /* iPad Pro 11" */

/* Desktop (1024px+) */
desktop-sm: 1024px /* Small laptops */
desktop-md: 1280px /* Standard desktops */
desktop-lg: 1440px /* Large monitors */
desktop-xl: 1920px /* Ultra-wide displays */
```

## Device-Specific Design Patterns

### 📱 Mobile (320px - 767px)
**Navigation:**
- Hamburger menu with shadcn Sheet drawer
- Bottom tab navigation for primary actions
- Collapsible search bar

**Schedule View:**
- Vertical list layout with ShiftAssignments
- Swipe gestures for assignment actions
- Pull-to-refresh functionality
- Card-based SchedulableContact assignments
- Organization context always visible

**Data Display:**
- Single-column layouts
- Accordion/collapsible sections
- Infinite scroll for long lists
- Thumb-friendly touch targets (44px minimum)

```tsx
// Mobile-optimized schedule view
<div className="block md:hidden">
  <div className="space-y-2 p-4">
    {scheduleItems.map(item => (
      <Card key={item.id} className="w-full">
        <CardContent className="p-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {item.physician.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.shift.location || item.shift.type}
              </p>
            </div>
            <Badge variant="outline" className="ml-2 flex-shrink-0">
              {item.timeSlot}
            </Badge>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
</div>
```

### 📱 Tablet (768px - 1023px)
**Navigation:**
- Persistent sidebar navigation
- Tab-based secondary navigation
- Header with search and actions

**Schedule View:**
- Split-view: schedule list + assignment details
- Drag-and-drop ShiftAssignment editing
- Multi-column layouts (2-3 columns)
- Modal dialogs for ContactSchedulingSettings
- Organization switcher in sidebar

**Data Display:**
- Grid layouts (2-3 columns)
- Data tables with horizontal scroll
- Side panels for additional details
- Touch-optimized controls

```tsx
// Tablet-optimized layout
<div className="hidden md:block lg:hidden">
  <div className="flex h-screen">
    {/* Sidebar Navigation */}
    <aside className="w-64 border-r bg-background">
      <nav className="p-4 space-y-2">
        {navigationItems.map(item => (
          <Button 
            key={item.id}
            variant="ghost" 
            className="w-full justify-start"
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </nav>
    </aside>
    
    {/* Main Content */}
    <main className="flex-1 overflow-auto">
      <div className="grid grid-cols-2 gap-4 p-6">
        {/* Calendar View */}
        <div className="col-span-1">
          <ScheduleCalendar />
        </div>
        {/* Details Panel */}
        <div className="col-span-1">
          <ScheduleDetails />
        </div>
      </div>
    </main>
  </div>
</div>
```

### 🖥️ Desktop (1024px+)
**Navigation:**
- Full horizontal navigation bar
- Persistent sidebar for quick access
- Breadcrumb navigation
- Advanced search with filters

**Schedule View:**
- Full calendar grid view with ShiftAssignments
- Multiple SchedulableContact timelines
- Advanced drag-and-drop assignment management
- Contextual menus for organization rules
- Bulk assignment operations

**Data Display:**
- Multi-column layouts (3-4+ columns)
- Full-featured data tables
- Multiple panel layouts
- Keyboard shortcuts support

```tsx
// Desktop-optimized layout
<div className="hidden lg:block">
  <div className="flex h-screen flex-col">
    {/* Header Navigation */}
    <header className="border-b bg-background px-6 py-3">
      <div className="flex items-center justify-between">
        <nav className="flex space-x-6">
          {primaryNavItems.map(item => (
            <Button key={item.id} variant="ghost">
              {item.label}
            </Button>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          <Input 
            placeholder="Search schedules..." 
            className="w-64"
          />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
    
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r bg-background p-4">
        <QuickFilters />
        <UpcomingAlerts />
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="grid grid-cols-12 gap-6 p-6">
          {/* Calendar Grid */}
          <div className="col-span-8">
            <FullCalendarView />
          </div>
          {/* Right Panel */}
          <div className="col-span-4 space-y-4">
            <PhysicianDetails />
            <ConflictAlerts />
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  </div>
</div>
```

## Responsive Component System

### Touch-Optimized Interactions
```tsx
// Mobile-first button sizing
<Button 
  size="lg"                    // Default large for mobile
  className="h-12 md:h-10 lg:h-9 w-full md:w-auto"
>
  Save Schedule
</Button>

// Touch-friendly spacing
<div className="space-y-4 md:space-y-3 lg:space-y-2">
  {/* Content with progressive spacing reduction */}
</div>
```

### Adaptive Typography
```tsx
// Responsive text sizing
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Schedule Management
</h1>

<p className="text-base md:text-sm lg:text-base leading-relaxed md:leading-normal">
  Body content with device-appropriate sizing
</p>
```

### Progressive Enhancement
```tsx
// Feature detection and progressive enhancement
const ScheduleView = () => {
  const [isMobile] = useMediaQuery("(max-width: 767px)")
  const [isTablet] = useMediaQuery("(min-width: 768px) and (max-width: 1023px)")
  const [isDesktop] = useMediaQuery("(min-width: 1024px)")
  
  if (isMobile) return <MobileScheduleView />
  if (isTablet) return <TabletScheduleView />
  return <DesktopScheduleView />
}
```

## Device-Specific Features

### Mobile Enhancements
- **Swipe Gestures**: Left/right swipe for navigation
- **Pull-to-Refresh**: Update schedule data
- **Haptic Feedback**: Confirm actions (where supported)
- **Voice Input**: Search and quick commands
- **Offline Mode**: Cache critical schedule data

### Tablet Enhancements
- **Split-Screen Support**: Multi-app usage
- **Apple Pencil Support**: Drawing and annotations
- **Drag-and-Drop**: Enhanced schedule management
- **Picture-in-Picture**: Keep schedule visible during calls
- **External Keyboard**: Keyboard shortcuts

### Desktop Enhancements
- **Multi-Monitor Support**: Span across displays
- **Keyboard Shortcuts**: Power user efficiency
- **Right-Click Menus**: Contextual actions
- **File System Integration**: Export/import capabilities
- **Advanced Filtering**: Complex query builder

## Testing Strategy
```tsx
// Responsive testing utilities
const breakpointTests = {
  mobile: { width: 375, height: 667 },      // iPhone SE
  mobileLarge: { width: 414, height: 896 }, // iPhone Pro Max
  tablet: { width: 768, height: 1024 },     // iPad
  tabletLarge: { width: 1024, height: 1366 }, // iPad Pro
  desktop: { width: 1280, height: 720 },    // Standard desktop
  desktopLarge: { width: 1920, height: 1080 } // Full HD
}
```

## Performance Considerations by Device
- **Mobile**: Prioritize critical rendering path, minimize bundle size
- **Tablet**: Balance features with performance, optimize touch interactions
- **Desktop**: Full feature set, advanced interactions, keyboard accessibility
