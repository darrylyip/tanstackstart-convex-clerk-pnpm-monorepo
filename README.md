# VECTR0

A unified web and mobile application platform built with TanStack Router and Convex backend.

## Architecture

This is a monorepo using PNPM workspaces with the following structure:

- `apps/web` - React web application with TanStack Router
- `apps/mobile` - Future React Native mobile app
- `packages/convex` - Shared Convex backend functions
- `packages/ui` - Shared UI components (shadcn/ui)
- `packages/utils` - Shared utilities and types
- `packages/config` - Shared configuration files

## Prerequisites

- Node.js 20+
- PNPM 9.x
- [Convex account](https://convex.dev) (free tier available)
- [Clerk account](https://clerk.com) (for authentication)

## Getting Started

### 1. Account Setup

Create accounts at:
- [Convex](https://convex.dev) - for the backend
- [Clerk](https://clerk.com) - for authentication

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Initialize Convex

```bash
cd packages/convex
npx convex dev
```

You'll be prompted to:
1. Log in to your Convex account
2. Create a new project or select an existing one
3. Set up your deployment

### 4. Configure Environment Variables

Copy the environment variables template:

```bash
cp .env.example .env
```

Fill in your Convex and Clerk credentials in `.env`:

```bash
# From Convex dashboard
CONVEX_DEPLOYMENT=your-deployment-name
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# From Clerk dashboard  
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 5. Development

Start the development servers:

```bash
# Start both web app and Convex backend
pnpm dev

# Or start individually
pnpm dev:web      # Web app only
pnpm dev:backend  # Convex backend only
```

The web application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
vectr0/
├── apps/
│   ├── web/                    # TanStack Start app
│   │   ├── src/routes/         # File-based routing
│   │   │   ├── index.tsx       # Homepage (prerendered)
│   │   │   ├── features.tsx    # Features (prerendered)  
│   │   │   ├── pricing.tsx     # Pricing (prerendered)
│   │   │   └── app/            # Dynamic app routes
│   │   │       ├── index.tsx   # Dashboard
│   │   │       ├── schedules.tsx
│   │   │       └── users.tsx
│   │   └── ...
│   └── mobile/                 # Future React Native app
├── packages/
│   ├── convex/                 # Shared backend
│   │   ├── src/
│   │   │   ├── schema.ts       # Database schema
│   │   │   ├── queries/        # Query functions
│   │   │   ├── mutations/      # Mutation functions
│   │   │   └── lib/            # Utility functions
│   │   └── convex.json
│   ├── ui/                     # Shared components
│   │   └── src/components/
│   ├── utils/                  # Shared utilities
│   │   └── src/
│   │       ├── types/          # TypeScript types
│   │       └── scheduling/     # Business logic
│   └── config/                 # Shared configurations
└── ...
```

## Commands

```bash
# Development
pnpm dev              # Run web app and backend
pnpm dev:web          # Run web app only  
pnpm dev:backend      # Run Convex backend only

# Building
pnpm build            # Build all packages
pnpm build:web        # Build web app only

# Code Quality  
pnpm lint             # Lint all packages
pnpm lint:fix         # Fix lint issues
pnpm format           # Format all code
pnpm typecheck        # Type check all packages

# Testing
pnpm test             # Run tests
```

## Features

- 🏢 **Multi-tenant Architecture** - Built-in organization support
- ⚡ **Real-time Updates** - Live data synchronization with Convex
- 🎨 **Design System** - Shared UI components with shadcn/ui
- 📱 **Mobile Ready** - Prepared for React Native mobile app
- 🔒 **Authentication** - Clerk integration for user management
- 🚀 **Performance** - TanStack Start with prerendering support
- 🛠 **Type Safety** - Full TypeScript support across the monorepo

## Multi-tenant Support

The application is built with multi-tenancy in mind:

- All data is filtered by `organizationId`
- Users belong to organizations with role-based access
- Shared backend functions handle organization isolation
- Convex queries automatically filter by organization context

## Deployment

The application is designed to deploy to:

- **Web App**: Cloudflare Pages (TanStack Start)
- **Backend**: Convex cloud (automatic)
- **Mobile App**: App stores (future)

## Contributing

1. Follow the coding standards in `packages/config/`
2. Use the shared types from `@vectr0/utils`
3. Keep the multi-tenant architecture in mind
4. Test your changes across packages

## Next Steps

- Set up Clerk authentication integration
- Add more shadcn/ui components to the design system  
- Implement the scheduling features
- Prepare the mobile app structure
- Set up deployment pipelines

For more information, see the individual package README files.