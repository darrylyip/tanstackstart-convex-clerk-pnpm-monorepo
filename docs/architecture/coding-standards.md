# Coding Standards

## Critical Fullstack Rules

- **Type Sharing:** Always define types in packages/shared and import from there
- **API Calls:** Never make direct HTTP calls - use Convex functions only
- **Environment Variables:** Access only through config objects, never process.env directly
- **Error Handling:** All Convex functions must use try-catch with proper error messages
- **State Updates:** Never mutate state directly - use proper Zustand actions
- **Multi-tenancy:** Always filter queries by organizationId
- **Real-time Updates:** Use Convex subscriptions, never polling
- **File Uploads:** Only use Uploadthing for images, never store in Convex

## Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `ScheduleCalendar.tsx` |
| Hooks | camelCase with 'use' | - | `useSchedule.ts` |
| API Routes | - | camelCase | `schedules.generateSchedule` |
| Database Tables | - | camelCase plural | `users` |
