# Technical Assumptions

## Repository Structure
The platform uses a monorepo structure with pnpm workspaces, enabling code sharing across web and future mobile applications:

### Monorepo Organization
```
vectr0/ (monorepo root)
├── apps/
│   ├── web/          # Astro hybrid app (www.vectr0.com)
│   └── mobile/       # Future React Native app
├── packages/
│   ├── convex/       # Shared Convex queries, mutations, schemas
│   ├── ui/           # Shared UI components (web/mobile compatible)
│   └── utils/        # Shared business logic and utilities
└── pnpm-workspace.yaml
```

### Web Application (www.vectr0.com)
Single Astro application with hybrid rendering:

**Static Pages (SSG, CDN-optimized):**
- Homepage, features, pricing, blog - Pre-rendered at build time
- Zero JavaScript by default for maximum performance
- Astro Islands for selective interactivity
- Aggressive CDN caching for global performance

**Dynamic App Routes (/app/*):**
- React SPA with TanStack Router for authenticated users
- TailwindCSS + shadcn/ui for consistent design system
- Recharts for analytics visualization
- Direct Convex integration for real-time data updates
- AI scheduling engine integration (OpenAI/Claude/Gemini APIs)
- Calendar integration APIs (Google Calendar, CalDAV)
- Google Ad Manager integration for advertising revenue
- Role-based access control for admin features

### Shared Packages Architecture
**@vectr0/convex:**
- Shared database schema definitions
- Reusable queries and mutations
- Type-safe API contracts
- Real-time subscription logic

**@vectr0/ui:**
- Platform-agnostic design tokens
- Web components (React)
- Mobile components (React Native - future)
- Shared styling utilities

**@vectr0/utils:**
- Business logic and algorithms
- Date/time manipulation
- Schedule optimization logic
- Validation functions
- API client utilities

## Service Architecture

**Backend Services:**
- **Database & Real-time:** Convex cloud for all three applications
- **Authentication:** Clerk with multi-tenant/organization support
  - Shared authentication between admin.vectr0.com and app.vectr0.com
  - Enterprise SSO/SAML readiness for hospital systems
  - HIPAA-compliant infrastructure foundation
- **File Storage:** Uploadthing for profile photo management
  - Direct client-side uploads from React SPAs
  - Automatic image optimization and CDN delivery
  - 2GB free tier sufficient for 1000+ physician profiles
  - Migration path to AWS S3/CloudFront for enterprise compliance

**External Integrations:**
- **AI Scheduling:** OpenAI/Claude/Gemini APIs for constraint satisfaction
- **Calendar Sync:** Google Calendar API and CalDAV for Apple Calendar
- **Advertising:** Google Ad Manager for targeted ad serving
- **Analytics:** Built-in tracking for preference fulfillment and ROI metrics

**Hosting & Deployment:**
- **Frontend Hosting:** Netlify/Vercel/Cloudflare Pages with hybrid support
  - Static pages served from edge CDN (aggressive caching)
  - Dynamic app routes served from origin (with smart caching)
- **Backend Services:** Convex cloud for serverless backend
- **CDN Strategy:** 
  - Static assets and pages: Cached at edge (1 year TTL)
  - App routes: Origin with session-based caching
  - API routes: Direct to Convex (real-time)
- **Development:** pnpm workspace with hot module replacement across packages

## Testing Requirements
- **Unit Testing:** Jest/Vitest for component and utility function testing
- **Integration Testing:** Testing Library for user flow validation
- **E2E Testing:** Playwright for critical scheduling and payment workflows
- **Performance Testing:** Lighthouse audits for mobile performance validation
- **Load Testing:** Schedule generation performance under concurrent users
- **Accessibility Testing:** axe-core integration for WCAG compliance

## Additional Technical Decisions

**Monorepo Management:**
- pnpm workspaces for efficient dependency management
- Shared packages for cross-platform code reuse
- Turborepo for optimized build caching (optional)
- Changesets for coordinated package versioning
- Single CI/CD pipeline with selective deployment

**Development Approach:**
- TypeScript throughout for type safety and documentation
- Shared design system via @vectr0/ui package
- Common API interfaces via @vectr0/convex package
- Consistent error handling and logging strategies
- Environment-specific configuration management
- Platform-specific entry points with shared core logic

**Performance Optimization:**
- Astro's selective hydration for minimal JavaScript
- Static pages with zero runtime JS by default
- Code splitting for app routes only
- Image optimization through Uploadthing/CDN
- Lazy loading for analytics dashboards
- Efficient calendar integration with minimal API calls
- Real-time updates only for active users
- Edge caching for static content globally

**Security Measures:**
- Input validation and sanitization on all user data
- Rate limiting on API endpoints, especially AI scheduling calls
- Secure file upload handling with type validation
- CSRF protection and secure cookie handling
- Regular dependency updates and security scanning

## Mobile Application Strategy

**React Native Integration:**
- Shared @vectr0/convex package for consistent backend integration
- Shared @vectr0/utils for business logic reuse
- Native performance with platform-specific UI components
- Expo or bare React Native based on requirements
- Unified TypeScript types across web and mobile

**Code Sharing Benefits:**
- Single source of truth for Convex schemas and functions
- Consistent data validation and business rules
- Shared authentication logic via Clerk SDK
- Unified scheduling algorithms and calendar integration
- Type-safe API contracts preventing web/mobile drift

**Development Workflow:**
- Hot reload across packages during development
- Shared testing utilities for business logic
- Platform-specific UI with shared logic core
- Coordinated releases through pnpm changesets
- Single CI/CD pipeline with matrix builds
