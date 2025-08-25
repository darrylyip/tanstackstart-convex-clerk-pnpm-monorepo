# Technical Assumptions

## Repository Structure
The platform consists of three separate GitHub repositories enabling independent development and deployment:

1. **admin repository (admin.vectr0.com)**
   - React SPA with TanStack Router (no SSR needed - authenticated app)
   - TailwindCSS + shadcn/ui for consistent design system
   - Recharts for analytics visualization
   - Direct Convex integration for real-time data updates
   - AI scheduling engine integration (OpenAI/Claude/Gemini APIs)

2. **web repository (app.vectr0.com)**
   - React SPA with TanStack Router (no SSR needed - authenticated app)
   - TailwindCSS + shadcn/ui matching admin design system
   - Calendar integration APIs (Google Calendar, CalDAV)
   - Convex for real-time schedule updates
   - Google Ad Manager integration for advertising revenue

3. **marketing repository (www.vectr0.com)**
   - Astro for static site generation with SEO optimization
   - TailwindCSS for styling consistency
   - Marketing content and lead generation
   - Links to app.vectr0.com and admin.vectr0.com

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
- **Frontend Hosting:** Netlify or Cloudflare Pages for all three domains
- **Backend Services:** Convex cloud for serverless backend
- **CDN:** Integrated with hosting provider for global performance
- **Development:** Shared component library published as npm package

## Testing Requirements
- **Unit Testing:** Jest/Vitest for component and utility function testing
- **Integration Testing:** Testing Library for user flow validation
- **E2E Testing:** Playwright for critical scheduling and payment workflows
- **Performance Testing:** Lighthouse audits for mobile performance validation
- **Load Testing:** Schedule generation performance under concurrent users
- **Accessibility Testing:** axe-core integration for WCAG compliance

## Additional Technical Decisions

**Development Approach:**
- TypeScript throughout for type safety and documentation
- Shared design system and component library across repositories
- Common API interfaces and data models
- Consistent error handling and logging strategies
- Environment-specific configuration management

**Performance Optimization:**
- Code splitting for optimal bundle sizes
- Image optimization through Uploadthing/CDN
- Lazy loading for analytics dashboards
- Efficient calendar integration with minimal API calls
- Real-time updates only for active users

**Security Measures:**
- Input validation and sanitization on all user data
- Rate limiting on API endpoints, especially AI scheduling calls
- Secure file upload handling with type validation
- CSRF protection and secure cookie handling
- Regular dependency updates and security scanning
