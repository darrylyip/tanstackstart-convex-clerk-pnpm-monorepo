# Unified Project Structure

```plaintext
vectr0/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       ├── ci.yaml            # Tests and linting
│       └── deploy.yaml        # Deploy web app to Cloudflare
├── apps/                       # Application packages
│   ├── web/                    # www.vectr0.com (TanStack Start)
│   │   ├── app/
│   │   │   ├── routes/        # TanStack Router routes
│   │   │   │   ├── index.tsx           # Homepage (prerendered)
│   │   │   │   ├── features.tsx        # Features (prerendered)
│   │   │   │   ├── pricing.tsx         # Pricing (prerendered)
│   │   │   │   ├── blog/               # Blog routes
│   │   │   │   └── app/                # Dynamic app routes
│   │   │   │       ├── dashboard.tsx
│   │   │   │       ├── schedules/
│   │   │   │       ├── preferences.tsx
│   │   │   │       └── users/
│   │   │   ├── components/
│   │   │   │   ├── marketing/          # Marketing components
│   │   │   │   └── app/                # App components
│   │   │   │       ├── dashboard/
│   │   │   │       ├── schedules/
│   │   │   │       ├── preferences/
│   │   │   │       ├── trading/
│   │   │   │       ├── profile/
│   │   │   │       ├── users/          # Admin features
│   │   │   │       └── analytics/      # Admin features
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── services/       # API services
│   │   │   ├── stores/         # Zustand stores
│   │   │   ├── styles/         # Global styles
│   │   │   └── utils/
│   │   ├── public/
│   │   ├── app.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   └── mobile/                 # Future React Native app
│       ├── src/
│       │   ├── screens/
│       │   ├── components/
│       │   ├── navigation/
│       │   └── services/
│       ├── app.json
│       └── package.json
├── packages/                   # Shared packages
│   ├── convex/                 # Shared Convex backend
│   │   ├── src/
│   │   │   ├── schema.ts       # Database schema
│   │   │   ├── queries/        # Shared queries
│   │   │   │   ├── schedules.ts
│   │   │   │   ├── users.ts
│   │   │   │   └── preferences.ts
│   │   │   ├── mutations/      # Shared mutations
│   │   │   │   ├── schedules.ts
│   │   │   │   ├── trades.ts
│   │   │   │   └── preferences.ts
│   │   │   ├── functions/      # Shared functions
│   │   │   │   └── holidays.ts
│   │   │   ├── actions/        # Server actions
│   │   │   │   ├── ai-scheduler.ts
│   │   │   │   └── calendar-sync.ts
│   │   │   └── lib/
│   │   │       └── auth.ts
│   │   ├── _generated/
│   │   ├── convex.json
│   │   └── package.json
│   ├── ui/                     # Shared UI components
│   │   ├── src/
│   │   │   ├── components/     # Platform-agnostic components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── calendar.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   └── form/
│   │   │   ├── design-tokens/  # Colors, spacing, etc.
│   │   │   │   ├── colors.ts
│   │   │   │   ├── spacing.ts
│   │   │   │   └── typography.ts
│   │   │   └── shadcn/         # shadcn/ui components
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   └── utils/                  # Shared business logic
│       ├── src/
│       │   ├── types/
│       │   │   ├── organization.ts
│       │   │   ├── user.ts
│       │   │   ├── schedule.ts
│       │   │   └── index.ts
│       │   ├── constants/
│       │   │   └── schedules.ts
│       │   ├── scheduling/     # Schedule algorithms
│       │   │   ├── optimizer.ts
│       │   │   ├── constraints.ts
│       │   │   └── validator.ts
│       │   ├── validation/     # Shared validators
│       │   │   ├── schedule.ts
│       │   │   └── preferences.ts
│       │   └── dates/
│       │       ├── formatting.ts
│       │       └── calculations.ts
│       └── package.json
├── infrastructure/             # IaC definitions
│   └── cloudflare/
│       ├── pages.tf
│       ├── workers.tf
│       └── variables.tf
├── scripts/                    # Build/deploy scripts
│   ├── setup.sh
│   ├── deploy.sh
│   └── test-all.sh
├── docs/                       # Documentation
│   ├── prd/                   # Product requirements
│   └── architecture/          # Architecture docs
├── .env.example                # Environment template
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # PNPM workspace config
├── turbo.json                  # Turborepo config (optional)
└── README.md
```

## Key Changes from Previous Structure

### 1. Single Web Application
- Consolidated `admin`, `web`, and `marketing` apps into single `apps/web`
- Uses TanStack Start with prerendering:
  - Prerendered pages for marketing content
  - Dynamic SPA navigation for `/app/*` routes
  - Role-based access control for admin features

### 2. Shared Packages Architecture
- **@vectr0/convex**: Centralized backend logic
- **@vectr0/ui**: Reusable UI components
- **@vectr0/utils**: Business logic and utilities
- All packages prefixed with `@vectr0/` namespace

### 3. Mobile-Ready Structure
- `apps/mobile` placeholder for React Native app
- Shared packages designed for cross-platform use
- TypeScript types ensure consistency

### 4. Simplified CI/CD
- Single deployment pipeline for web app
- Selective deployment based on changed paths
- Unified testing across all packages

## Package Dependencies

```json
// apps/web/package.json
{
  "dependencies": {
    "@vectr0/convex": "workspace:*",
    "@vectr0/ui": "workspace:*",
    "@vectr0/utils": "workspace:*"
  }
}

// apps/mobile/package.json
{
  "dependencies": {
    "@vectr0/convex": "workspace:*",
    "@vectr0/utils": "workspace:*"
  }
}
```

## Development Workflow

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Run Development**
   ```bash
   pnpm dev        # Runs all apps
   pnpm dev:web    # Web app only
   ```

3. **Build for Production**
   ```bash
   pnpm build
   ```

4. **Run Tests**
   ```bash
   pnpm test
   ```