# Unified Project Structure

```plaintext
vectr0/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       ├── ci.yaml            # Tests and linting
│       ├── deploy-admin.yaml  # Deploy admin app
│       ├── deploy-web.yaml    # Deploy web app
│       └── deploy-marketing.yaml
├── apps/                       # Application packages
│   ├── admin/                  # admin.vectr0.com
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── schedules/
│   │   │   │   ├── users/
│   │   │   │   └── analytics/
│   │   │   ├── routes/         # TanStack Router
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── stores/         # Zustand stores
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   ├── web/                    # app.vectr0.com
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── schedule/
│   │   │   │   ├── preferences/
│   │   │   │   ├── trading/
│   │   │   │   └── profile/
│   │   │   ├── routes/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── marketing/              # www.vectr0.com
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   └── layouts/
│       ├── astro.config.mjs
│       └── package.json
├── packages/                   # Shared packages
│   ├── shared/                 # Shared types/utilities
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── organization.ts
│   │   │   │   ├── user.ts
│   │   │   │   ├── schedule.ts
│   │   │   │   └── index.ts
│   │   │   ├── constants/
│   │   │   └── utils/
│   │   │       ├── dates.ts
│   │   │       └── validation.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── ui/                     # Shared UI components
│   │   ├── src/
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── index.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   ├── convex/                 # Backend functions
│   │   ├── _generated/
│   │   ├── functions/
│   │   │   ├── schedules.ts
│   │   │   ├── users.ts
│   │   │   ├── preferences.ts
│   │   │   └── holidays.ts
│   │   ├── actions/
│   │   │   ├── ai-scheduler.ts
│   │   │   └── calendar-sync.ts
│   │   ├── lib/
│   │   │   └── auth.ts
│   │   ├── schema.ts
│   │   ├── convex.json
│   │   └── package.json
│   └── config/                 # Shared configuration
│       ├── eslint/
│       │   └── base.js
│       ├── typescript/
│       │   └── base.json
│       └── tailwind/
│           └── base.js
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
│   ├── VECTR0-PRD.md
│   └── architecture.md
├── .env.example                # Environment template
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # PNPM workspace config
├── turbo.json                  # Turborepo config
└── README.md
```
