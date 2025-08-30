# High Level Architecture

## Technical Summary

VECTR0 employs a full-stack React architecture with TanStack Start deployed on Cloudflare Pages, utilizing server-side rendering for SEO-critical pages and client-side React for dynamic app features. The pnpm workspace monorepo enables code sharing through dedicated packages (@vectr0/convex, @vectr0/ui, @vectr0/utils) across web and future mobile applications. TanStack Start provides type-safe file-based routing with seamless SPA navigation while maintaining SSR benefits for marketing pages. The /app/* routes deliver rich interactivity with Convex for real-time updates. AI-powered scheduling uses Gemini 1.5 Flash (free tier) transitioning to GPT-4o-mini for production, with comprehensive constraint satisfaction for healthcare-specific requirements. The platform achieves PRD goals through edge caching for static pages, serverless scaling for dynamic features, and sustainable advertising via Google Ad Manager.

## Platform and Infrastructure Choice

**Platform:** Cloudflare Pages + Convex Cloud
**Key Services:** Cloudflare Pages (hosting), Convex (database/real-time), Clerk (auth), Uploadthing (images), Google Ad Manager (ads)
**Deployment Host and Regions:** Cloudflare global edge network (300+ PoPs), Convex US regions (us-west-2 primary)

## Repository Structure

**Structure:** Monorepo with pnpm workspaces
**Monorepo Tool:** pnpm workspaces (Turborepo optional for build caching)
**Package Organization:** 
- `apps/web` - TanStack Start application (www.vectr0.com)
- `apps/mobile` - Future React Native application
- `packages/convex` - Shared database schemas, queries, mutations
- `packages/ui` - Shared UI components and design system
- `packages/utils` - Shared business logic and utilities

## High Level Architecture Diagram

```mermaid
graph TB
    subgraph "Users"
        A[Staff Members]
        B[Administrators]
        C[Visitors]
    end
    
    subgraph "Cloudflare Edge"
        D[www.vectr0.com<br/>TanStack Start]
        E[/app/* Routes<br/>SPA Navigation]
        F[Static Pages<br/>Prerendered + CDN]
        G[Cloudflare Workers<br/>Rate Limiting]
    end
    
    subgraph "Backend Services"
        H[Convex Cloud<br/>Multi-tenant DB]
        I[Clerk Auth<br/>Organizations]
        J[AI Scheduler<br/>Gemini/GPT-4]
        K[Uploadthing<br/>Profile Photos]
    end
    
    subgraph "External Services"
        L[Google Calendar API]
        M[CalDAV<br/>Apple Calendar]
        N[Google Ad Manager]
        O[Sentry<br/>Error Tracking]
    end
    
    A --> E
    B --> E
    C --> F
    
    E --> G
    F --> D
    
    G --> H
    G --> I
    
    H --> J
    E --> K
    
    E --> L
    E --> M
    E --> N
    
    E --> O
    
    H -.->|WebSocket| E
```

## Architectural Patterns

- **Full-Stack React Architecture:** TanStack Start SSR for marketing, SPA for app - *Rationale:* Unified React patterns with optimal SEO and performance for public pages, seamless navigation for authenticated features
- **Multi-Tenant Isolation:** Organization-based data partitioning in Convex - *Rationale:* HIPAA-ready data isolation while maintaining single codebase
- **Event-Driven Updates:** Real-time schedule changes via Convex subscriptions - *Rationale:* Instant updates across all connected clients without polling
- **Shared Package Architecture:** pnpm workspaces with @vectr0/* packages - *Rationale:* Code reuse between web and future mobile apps
- **Repository Pattern:** Abstract Convex queries in @vectr0/convex package - *Rationale:* Single source of truth for database operations
- **Unified Routing:** Type-safe file-based routing with loaders/actions - *Rationale:* End-to-end type safety from routes to data fetching with excellent developer experience
- **Constraint Satisfaction AI:** Structured prompts for schedule generation - *Rationale:* Reliable constraint handling with healthcare requirements
