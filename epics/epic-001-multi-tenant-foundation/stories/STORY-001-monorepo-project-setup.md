# STORY-001: Monorepo Project Setup with TanStack Start and Convex Backend

## Story Metadata
- **ID:** STORY-001
- **Epic:** EPIC-001 (Multi-Tenant Foundation & Authentication)
- **Priority:** CRITICAL
- **Estimation:** 5 points
- **Status:** COMPLETED
- **Dependencies:** STORY-000 (accounts must be created first)

## User Story
**As a** development team  
**I want** to set up a monorepo project structure with TanStack Start and Convex backend  
**So that** we have a scalable foundation for building a unified web application and future mobile app with shared code

## Background Context
VECTR0 uses a unified architecture with TanStack Start for both marketing content (prerendered) and dynamic app features (/app/* routes), preparing for future mobile app development. The monorepo structure efficiently manages shared code, types, and backend functions across web and mobile applications. Using pnpm workspaces enables fast builds and efficient dependency management. Convex provides the real-time backend with built-in multi-tenancy support.

## Prerequisites
- [ ] Convex account created at https://convex.dev (free tier available)
- [ ] Clerk account created at https://clerk.com (for authentication)
- [ ] Node.js 20+ and PNPM 8.15+ installed locally

## Acceptance Criteria
- [ ] Monorepo initialized with PNPM workspaces
- [ ] Two app packages created: web (TanStack Start) and mobile (future)
- [ ] Shared packages configured: convex, ui, utils
- [ ] Convex backend initialized and connected
- [ ] Build pipeline working for all apps
- [ ] Development servers can run concurrently
- [ ] TypeScript path aliases configured across packages

## Technical Requirements

### 1. Root Package Configuration
```json
// package.json
{
  "name": "vectr0",
  "private": true,
  "scripts": {
    "dev": "pnpm --recursive --parallel dev",
    "build": "pnpm --recursive build",
    "lint": "pnpm --recursive lint",
    "lint:fix": "pnpm --recursive lint:fix",
    "format": "pnpm --recursive format",
    "format:check": "pnpm --recursive format:check",
    "typecheck": "pnpm --recursive typecheck",
    "test": "pnpm --recursive test",
    "dev:web": "pnpm --filter @vectr0/web dev",
    "dev:backend": "pnpm --filter @vectr0/convex dev"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint-config-prettier": "^9.0.0",
    "prettier": "^3.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### 2. Workspace Configuration
```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 3. Workspace Package Dependencies
```json
// apps/web/package.json
{
  "name": "@vectr0/web",
  "dependencies": {
    "@vectr0/convex": "workspace:*",
    "@vectr0/ui": "workspace:*",
    "@vectr0/utils": "workspace:*",
    "@tanstack/start": "^1.0.0",
    "@tanstack/react-router": "^1.0.0"
  }
}
```

### 4. Convex Setup
```json
// packages/convex/convex.json
{
  "functions": "src",
  "node": {
    "externalPackages": ["@vectr0/utils"]
  }
}
```

### 5. Development Tooling Configuration

#### Shared TypeScript Config
```json
// packages/config/typescript/base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@vectr0/ui": ["../../packages/ui/src"],
      "@vectr0/utils": ["../../packages/utils/src"],
      "@vectr0/convex": ["../../packages/convex/src"]
    }
  },
  "include": ["src/**/*", "*.config.*"],
  "exclude": ["node_modules", ".next", "dist"]
}
```

#### Shared ESLint Config
```json
// packages/config/eslint/base.js
module.exports = {
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
  env: {
    node: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  rules: {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error"
  },
  ignorePatterns: ["dist", "node_modules", "_generated"]
};
```

#### Shared Prettier Config
```json
// packages/config/prettier/index.js
module.exports = {
  semi: true,
  trailingComma: "es5",
  singleQuote: false,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  endOfLine: "lf"
};
```

## Implementation Steps

1. **Initialize Monorepo** (1 point)
   - Initialize PNPM workspaces
   - Create workspace configuration files
   - Set up root package.json with scripts
   - Configure git with proper .gitignore

2. **Create App Packages** (2 points)
   - Scaffold web app with TanStack Start + React + TypeScript
   - Create placeholder mobile app directory structure
   - Configure web app's package.json and app.config.ts
   - Set up TanStack Start routing with marketing and app routes

3. **Set Up Shared Packages and Development Tooling** (1.5 points)
   - Create @vectr0/utils for types and business logic
   - Create @vectr0/ui for shadcn/ui components and design system
   - Create @vectr0/convex for shared backend functions
   - Set up shared ESLint, Prettier, and TypeScript configurations
   - Configure proper TypeScript project references and workspace dependencies

4. **Initialize Convex Backend Package** (1 point)
   - Run `npx convex dev` in packages/convex to initialize
   - Create organized directory structure (src/queries, src/mutations, etc.)
   - Set up initial schema.ts file with multi-tenant structure
   - Configure environment variables and connect to web app

## File Structure
```
vectr0/
├── apps/
│   ├── web/                    # TanStack Start app (www.vectr0.com)
│   │   ├── app/
│   │   │   ├── routes/         # File-based routing
│   │   │   │   ├── index.tsx           # Homepage (prerendered)
│   │   │   │   ├── features.tsx        # Features (prerendered)
│   │   │   │   ├── pricing.tsx         # Pricing (prerendered)
│   │   │   │   └── app/                # Dynamic app routes
│   │   │   │       ├── dashboard.tsx
│   │   │   │       ├── schedules/
│   │   │   │       └── users/
│   │   │   ├── components/
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── app.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   └── mobile/                 # Future React Native app
│       ├── src/
│       └── package.json
├── packages/
│   ├── convex/                 # Shared backend
│   │   ├── src/
│   │   │   ├── schema.ts
│   │   │   ├── queries/
│   │   │   ├── mutations/
│   │   │   └── lib/
│   │   ├── _generated/
│   │   ├── convex.json
│   │   └── package.json
│   ├── ui/                     # Shared components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   └── shadcn/
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   ├── utils/                  # Shared utilities
│   │   ├── src/
│   │   │   ├── types/
│   │   │   └── scheduling/
│   │   └── package.json
│   └── config/                 # Shared configurations
│       ├── eslint/
│       │   └── base.js
│       ├── prettier/
│       │   └── index.js
│       ├── typescript/
│       │   └── base.json
│       └── package.json
├── .env.example
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md
```

## Dependencies
- Node.js 20+
- PNPM 9.x
- TypeScript 5.3+
- TanStack Start 1.x
- TanStack Router 1.x
- React 19.1
- Convex 1.x

## Environment Variables
```bash
# .env.example
CONVEX_DEPLOYMENT=
VITE_CONVEX_URL=
VITE_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

## Testing Checklist
- [ ] `pnpm install` completes without errors
- [ ] `pnpm dev` starts web application and Convex backend
- [ ] Web app accessible at localhost:3000 with marketing routes
- [ ] /app/* routes work for dynamic content
- [ ] Convex functions hot reload on changes
- [ ] Shared package changes reflect in web app
- [ ] TypeScript compilation succeeds across all packages
- [ ] ESLint and Prettier work across all packages
- [ ] `pnpm lint` and `pnpm format` commands work from root
- [ ] Build command produces deployable TanStack Start application

## Definition of Done
- [ ] Monorepo structure created and committed
- [ ] TanStack Start web app running with marketing and app routes
- [ ] Convex backend connected and functional
- [ ] Shared packages (@vectr0/convex, @vectr0/ui, @vectr0/utils) properly linked
- [ ] TypeScript compilation working across all packages
- [ ] ESLint, Prettier, and shared TypeScript configs set up across monorepo
- [ ] README updated with TanStack Start setup instructions
- [ ] Environment variables documented
- [ ] Mobile app directory structure prepared for future development

## Notes for Developer
- **IMPORTANT**: Create accounts at Convex and Clerk before starting
- When running `npx convex dev`, you'll be prompted to log in to Convex
- Convex will create a new project or let you select an existing one
- Use `pnpm create @tanstack/start` for the web app with TypeScript template
- Install shadcn/ui CLI in the ui package: `pnpm dlx shadcn-ui@latest init`
- Set up path aliases in tsconfig.json for cleaner imports
- Configure TanStack Start for prerendering marketing pages and dynamic app routes
- **Turborepo is optional** - can be added later for build caching if needed
- Remember to add `.env.local` to .gitignore
- Use `pnpm --filter <package>` to run commands in specific packages
- Convex will auto-generate TypeScript types in `_generated/` directory

## Commands Reference
```bash
# Account Setup (do this first!)
# 1. Create Convex account: https://convex.dev
# 2. Create Clerk account: https://clerk.com

# Initial setup
pnpm init
echo "packages:\n  - \"apps/*\"\n  - \"packages/*\"" > pnpm-workspace.yaml
pnpm create @tanstack/start apps/web
mkdir -p apps/mobile/src packages/convex/src packages/ui/src packages/utils/src
cd packages/convex && npx convex dev --once # Will prompt for Convex login

# Development
pnpm dev              # Run web app and backend
pnpm dev:web          # Run web app only
pnpm dev:backend      # Run Convex backend only
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm lint:fix         # Fix lint issues
pnpm format           # Format all code
pnpm typecheck        # Type check all packages
```

## References
- [PNPM Workspaces](https://pnpm.io/workspaces)
- [PNPM Workspaces](https://pnpm.io/workspaces)
- [Convex Quick Start](https://docs.convex.dev/quickstart)
- [Vite Configuration](https://vitejs.dev/config/)
- [Unified Project Structure](/docs/architecture/unified-project-structure.md)
- [TanStack Start Docs](https://tanstack.com/start)
- [High Level Architecture](/docs/architecture/high-level-architecture.md)