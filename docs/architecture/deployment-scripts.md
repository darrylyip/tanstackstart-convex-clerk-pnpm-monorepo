# Deployment Scripts Configuration

## Root package.json Scripts

Add these scripts to your root `package.json` to support the TanStack Start single web app deployment:

```json
{
  "scripts": {
    // Development commands
    "dev": "turbo run dev",
    "dev:web": "turbo run dev --filter=@vectr0/web",
    "dev:convex": "pnpm --filter=@vectr0/convex dev",
    
    // Build commands
    "build": "turbo run build",
    "build:web": "turbo run build --filter=@vectr0/web",
    
    // Deployment commands
    "deploy:web": "pnpm build:web && pnpm cloudflare:deploy:web",
    "deploy:convex": "pnpm --filter=@vectr0/convex deploy --prod",
    "deploy:all": "pnpm deploy:convex && pnpm deploy:web",
    
    // Cloudflare deployment helpers
    "cloudflare:deploy:web": "wrangler pages deploy apps/web/.output/public --project-name=vectr0",
    
    // Convex commands
    "convex:dev": "pnpm --filter=@vectr0/convex dev",
    "convex:deploy": "pnpm --filter=@vectr0/convex deploy --prod",
    "convex:deploy:staging": "pnpm --filter=@vectr0/convex deploy --deployment staging",
    "convex:dashboard": "pnpm --filter=@vectr0/convex exec convex dashboard",
    "convex:logs": "pnpm --filter=@vectr0/convex exec convex logs --deployment production",
    
    // Preview deployments
    "preview:web": "pnpm build:web && wrangler pages dev apps/web/.output/public --port 3000",
    
    // Health checks
    "health:web": "curl https://www.vectr0.com/health || curl https://www.vectr0.com/",
    "health:convex": "curl $CONVEX_HTTP_URL/health || echo 'Convex health check not available'",
    "health:all": "pnpm health:web && pnpm health:convex",
    
    // Testing
    "test": "turbo run test",
    "test:web": "turbo run test --filter=@vectr0/web",
    "typecheck": "turbo run typecheck",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix"
  },
  "devDependencies": {
    "wrangler": "^3.0.0",
    "turbo": "^2.0.0"
  }
}
```

## Individual App package.json Scripts

### apps/web/package.json (TanStack Start)
```json
{
  "scripts": {
    "dev": "start dev",
    "build": "start build",
    "preview": "start preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext .js,.ts,.tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext .js,.ts,.tsx --fix",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

### packages/convex/package.json
```json
{
  "scripts": {
    "dev": "convex dev",
    "deploy": "convex deploy",
    "deploy:prod": "convex deploy --prod",
    "codegen": "convex codegen",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "dashboard": "convex dashboard",
    "logs": "convex logs"
  }
}
```

### packages/ui/package.json
```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "test": "vitest"
  }
}
```

### packages/utils/package.json
```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch", 
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext .ts --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext .ts --fix",
    "test": "vitest"
  }
}
```

## Wrangler Configuration

### apps/web/wrangler.toml (TanStack Start App)
```toml
name = "vectr0"
compatibility_date = "2024-01-01"

[site]
bucket = "./.output/public"

[env.production]
routes = [
  { pattern = "www.vectr0.com/*", zone_name = "vectr0.com" },
  { pattern = "vectr0.com/*", zone_name = "vectr0.com" }
]

[env.staging]
routes = [
  { pattern = "staging.vectr0.com/*", zone_name = "vectr0.com" }
]

# Optional: Cloudflare Workers for edge functions
[[env.production.services]]
binding = "CONVEX_API"
service = "convex-proxy"

[[env.staging.services]]
binding = "CONVEX_API"
service = "convex-proxy-staging"
```

## Environment Files Setup

### .env.example (root)
```bash
# Convex
CONVEX_DEPLOYMENT=
CONVEX_URL=
CONVEX_HTTP_URL=

# Cloudflare
CF_ACCOUNT_ID=
CF_API_TOKEN=

# Clerk Auth
PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# App Configuration
PUBLIC_APP_URL=https://www.vectr0.com
PUBLIC_ENVIRONMENT=production

# External Services
OPENAI_API_KEY=
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# Calendar Integration
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
```

### apps/web/.env.production (TanStack Start)
```bash
# TanStack Start Public Variables (available in browser)
VITE_CONVEX_URL=https://your-project.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
VITE_APP_URL=https://www.vectr0.com
VITE_ENVIRONMENT=production

# Server-only Variables (SSR/API routes)
CLERK_SECRET_KEY=sk_live_xxxxx
CONVEX_DEPLOY_KEY=prod:xxxxx
```

### apps/web/.env.local (TanStack Start development)
```bash
# TanStack Start Public Variables
VITE_CONVEX_URL=https://your-dev-project.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_APP_URL=http://localhost:3000
VITE_ENVIRONMENT=development

# Server-only Variables
CLERK_SECRET_KEY=sk_test_xxxxx
CONVEX_DEPLOY_KEY=dev:xxxxx
```

### packages/convex/.env.local
```bash
# Convex Environment Variables
CLERK_WEBHOOK_SECRET=whsec_xxxxx
OPENAI_API_KEY=sk-xxxxx
UPLOADTHING_SECRET=sk_live_xxxxx
GOOGLE_CALENDAR_CLIENT_ID=xxxxx.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=xxxxx
```

## Deployment Helper Scripts

### scripts/deploy-all.sh
```bash
#!/bin/bash
set -e

echo "🚀 Starting full VECTR0 deployment..."

# Check if we're on main branch for production
if [ "$1" = "production" ]; then
    BRANCH=$(git branch --show-current)
    if [ "$BRANCH" != "main" ]; then
        echo "❌ Production deployments must be from main branch. Current: $BRANCH"
        exit 1
    fi
fi

# Deploy Convex first (backend)
echo "📦 Deploying Convex backend..."
if [ "$1" = "production" ]; then
    pnpm convex:deploy
else
    pnpm convex:deploy:staging
fi

# Wait for Convex to be ready
echo "⏳ Waiting for Convex deployment..."
sleep 10

# Build and deploy web app
echo "🌐 Building and deploying web application..."
pnpm build:web

if [ "$1" = "production" ]; then
    pnpm cloudflare:deploy:web
else
    wrangler pages deploy apps/web/.output/public --project-name=vectr0-staging
fi

# Wait for deployment
echo "⏳ Waiting for web deployment..."
sleep 15

# Run health checks
echo "🏥 Running health checks..."
if [ "$1" = "production" ]; then
    pnpm health:all
else
    curl https://staging.vectr0.com/ || echo "Staging health check failed"
fi

echo "✅ Deployment complete!"
echo "🔗 URLs:"
if [ "$1" = "production" ]; then
    echo "   Web: https://www.vectr0.com"
    echo "   Convex: $PUBLIC_CONVEX_URL"
else
    echo "   Staging: https://staging.vectr0.com"
    echo "   Convex: [staging deployment URL]"
fi
```

### scripts/rollback.sh
```bash
#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: ./rollback.sh [web|convex|all] [version-or-deployment-id]"
    echo "Example: ./rollback.sh web abc123"
    echo "Example: ./rollback.sh convex previous"
    echo "Example: ./rollback.sh all"
    exit 1
fi

case $1 in
    web)
        echo "🔄 Rolling back web application..."
        if [ -n "$2" ]; then
            wrangler pages deployment tail --project-name=vectr0 --deployment-id="$2"
        else
            echo "❌ Web rollback requires deployment ID"
            echo "Get deployment ID from: wrangler pages deployment list --project-name=vectr0"
            exit 1
        fi
        ;;
    convex)
        echo "🔄 Rolling back Convex deployment..."
        cd packages/convex
        if [ "$2" = "previous" ]; then
            convex deploy --prod --rollback
        elif [ -n "$2" ]; then
            convex deploy --prod --rollback="$2"
        else
            echo "❌ Convex rollback requires version (use 'previous' or specific version)"
            exit 1
        fi
        ;;
    all)
        echo "🔄 Rolling back all services..."
        echo "This will attempt to rollback to the previous stable deployment"
        read -p "Are you sure? This cannot be easily undone. (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # Rollback Convex first
            ./scripts/rollback.sh convex previous
            echo "⚠️  Please manually rollback web app using Cloudflare Pages dashboard"
            echo "   Go to: https://dash.cloudflare.com → Pages → vectr0 → Deployments"
        else
            echo "Rollback cancelled"
        fi
        ;;
    *)
        echo "❌ Unknown service: $1"
        echo "Supported services: web, convex, all"
        exit 1
        ;;
esac
```

### scripts/setup-env.sh
```bash
#!/bin/bash
set -e

echo "🔧 Setting up VECTR0 environment..."

# Create environment files from examples
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo "📝 Created .env.local from .env.example"
fi

if [ ! -f "apps/web/.env.local" ]; then
    cp apps/web/.env.example apps/web/.env.local 2>/dev/null || echo "⚠️  No apps/web/.env.example found"
fi

if [ ! -f "packages/convex/.env.local" ]; then
    touch packages/convex/.env.local
    echo "📝 Created packages/convex/.env.local"
fi

echo "✅ Environment files created!"
echo "📋 Next steps:"
echo "   1. Fill in your environment variables in .env.local files"
echo "   2. Run 'pnpm install' to install dependencies"
echo "   3. Run 'pnpm convex:dev' to start Convex development server"
echo "   4. Run 'pnpm dev:web' to start the web application"
```

## Make Commands (Optional)

### Makefile
```makefile
.PHONY: setup dev build deploy-staging deploy-production rollback health help

help:
	@echo "Available commands:"
	@echo "  make setup           - Set up development environment"
	@echo "  make dev             - Start development servers"
	@echo "  make build           - Build all packages"
	@echo "  make deploy-staging  - Deploy to staging environment"
	@echo "  make deploy-production - Deploy to production environment"
	@echo "  make rollback        - Rollback last deployment"
	@echo "  make health          - Run health checks"

setup:
	@echo "🔧 Setting up VECTR0 development environment..."
	@./scripts/setup-env.sh
	@pnpm install
	@pnpm --filter=@vectr0/convex codegen
	@echo "✅ Setup complete! Run 'make dev' to start development servers"

dev:
	@echo "🚀 Starting development servers..."
	@pnpm dev

build:
	@echo "🔨 Building all packages..."
	@pnpm build

deploy-staging:
	@echo "🚀 Deploying to staging..."
	@./scripts/deploy-all.sh staging
	@echo "✅ Staging deployment complete"

deploy-production:
	@echo "🚀 Deploying to production..."
	@./scripts/deploy-all.sh production
	@echo "✅ Production deployment complete"

rollback:
	@./scripts/rollback.sh all

health:
	@echo "🏥 Running health checks..."
	@pnpm health:all

clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf apps/web/.output
	@rm -rf packages/*/dist
	@rm -rf node_modules/.cache
	@echo "✅ Clean complete"
```

## Turbo Configuration

### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".output/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

## CI/CD Integration

These scripts integrate well with GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Deploy to production
        run: ./scripts/deploy-all.sh production
        env:
          CF_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
```

The simplified scripts focus on the single web application while maintaining flexibility for the monorepo structure and shared packages.