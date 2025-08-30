# Tech Stack

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Monorepo Tool | pnpm | 9.x | Package management | Fast, efficient disk usage, workspace support |
| Frontend Language | TypeScript | 5.3+ | Type-safe development | Reduces bugs, improves developer experience |
| Meta Framework | TanStack Start | latest | Full-stack React | Type-safe, file-based routing with SSR |
| Frontend Framework | React | 19.1 | Dynamic UI (app routes) | Industry standard, vast ecosystem |
| Routing | TanStack Router | 1.x | File-based routing | Type-safe routing with loaders/actions |
| UI Component Library | shadcn/ui | latest | Accessible components | Customizable, owns the code |
| State Management | TanStack Query + Nanostores | 5.x + 1.0.1 | Server/Client state | React Query for server, Nanostores for client |
| Backend Language | TypeScript | 5.3+ | Convex functions | Shared types with frontend |
| Backend Framework | Convex | 1.x | BaaS + real-time | Multi-tenant, reactive queries |
| API Style | Convex Functions | - | Type-safe RPC | End-to-end type safety |
| Database | Convex DB | - | Document store | Built-in multi-tenancy |
| Cache | Convex | - | Built-in caching | Automatic query caching |
| File Storage | Uploadthing | 6.x | Profile photos | Simple integration, free tier |
| Authentication | Clerk | 5.x | Auth + organizations | HIPAA-ready, SSO support |
| Frontend Testing | Vitest | 1.x | Unit tests | Fast, Vite-native |
| Backend Testing | Convex Test | - | Function tests | Built-in testing |
| E2E Testing | Playwright | 1.x | End-to-end | Cross-browser testing |
| Build Tool | TanStack Start/Vite | 1.x | Bundling | Lightning fast builds, SSR/SPA hybrid |
| Bundler | Vite/Rollup | 5.x | Production builds | Tree-shaking, code splitting |
| Package Architecture | pnpm workspaces | - | Code sharing | Shared packages across web/mobile |
| IaC Tool | Terraform | 1.6 | Infrastructure | Cloudflare configuration |
| CI/CD | GitHub Actions | - | Automation | Free for public repos |
| Monitoring | Sentry | 8.x | Error tracking | Generous free tier |
| Logging | Convex | - | Function logs | Built-in logging |
| CSS Framework | TailwindCSS | 3.4 | Utility CSS | Consistent design system |
