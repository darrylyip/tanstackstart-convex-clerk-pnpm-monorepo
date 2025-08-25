# Deployment Scripts Configuration

## Root package.json Scripts

Add these scripts to your root `package.json` to support the deployment workflows:

```json
{
  "scripts": {
    // Build commands
    "build": "turbo run build",
    "build:admin": "turbo run build --filter=@vectr0/admin",
    "build:web": "turbo run build --filter=@vectr0/web",
    "build:marketing": "turbo run build --filter=@vectr0/marketing",
    
    // Deployment commands
    "deploy:admin": "pnpm build:admin && pnpm cloudflare:deploy:admin",
    "deploy:web": "pnpm build:web && pnpm cloudflare:deploy:web",
    "deploy:marketing": "pnpm build:marketing && pnpm cloudflare:deploy:marketing",
    "deploy:all-frontends": "concurrently \"pnpm deploy:admin\" \"pnpm deploy:web\" \"pnpm deploy:marketing\"",
    
    // Cloudflare deployment helpers
    "cloudflare:deploy:admin": "wrangler pages deploy apps/admin/dist --project-name=vectr0-admin",
    "cloudflare:deploy:web": "wrangler pages deploy apps/web/dist --project-name=vectr0-app",
    "cloudflare:deploy:marketing": "wrangler pages deploy apps/marketing/dist --project-name=vectr0-marketing",
    
    // Convex commands
    "convex:dev": "cd packages/convex && convex dev",
    "convex:deploy": "cd packages/convex && convex deploy --prod",
    "convex:deploy:staging": "cd packages/convex && convex deploy --deployment staging",
    "convex:dashboard": "cd packages/convex && convex dashboard",
    "convex:logs": "cd packages/convex && convex logs --deployment production",
    
    // Preview deployments
    "preview:admin": "pnpm build:admin && wrangler pages dev apps/admin/dist --port 3001",
    "preview:web": "pnpm build:web && wrangler pages dev apps/web/dist --port 3002",
    "preview:marketing": "pnpm build:marketing && wrangler pages dev apps/marketing/dist --port 3003",
    
    // Health checks
    "health:admin": "curl https://admin.vectr0.com/health",
    "health:web": "curl https://app.vectr0.com/health",
    "health:marketing": "curl https://www.vectr0.com/health",
    "health:all": "concurrently \"pnpm health:admin\" \"pnpm health:web\" \"pnpm health:marketing\""
  },
  "devDependencies": {
    "wrangler": "^3.0.0",
    "concurrently": "^8.0.0"
  }
}
```

## Individual App package.json Scripts

### apps/admin/package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### apps/web/package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### apps/marketing/package.json
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
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
    "typecheck": "tsc --noEmit"
  }
}
```

## Wrangler Configuration

Create `wrangler.toml` files for each app if you want to use Cloudflare Workers features:

### apps/admin/wrangler.toml
```toml
name = "vectr0-admin"
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"

[env.production]
routes = [
  { pattern = "admin.vectr0.com/*", zone_name = "vectr0.com" }
]

[env.staging]
routes = [
  { pattern = "admin-staging.vectr0.com/*", zone_name = "vectr0.com" }
]
```

### apps/web/wrangler.toml
```toml
name = "vectr0-app"
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"

[env.production]
routes = [
  { pattern = "app.vectr0.com/*", zone_name = "vectr0.com" }
]

[env.staging]
routes = [
  { pattern = "app-staging.vectr0.com/*", zone_name = "vectr0.com" }
]
```

### apps/marketing/wrangler.toml
```toml
name = "vectr0-marketing"
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"

[env.production]
routes = [
  { pattern = "www.vectr0.com/*", zone_name = "vectr0.com" },
  { pattern = "vectr0.com/*", zone_name = "vectr0.com" }
]

[env.staging]
routes = [
  { pattern = "staging.vectr0.com/*", zone_name = "vectr0.com" }
]
```

## Environment Files Setup

### .env.example (root)
```bash
# Convex
CONVEX_DEPLOYMENT=
CONVEX_URL=

# Cloudflare
CF_ACCOUNT_ID=
CF_API_TOKEN=

# Clerk Auth
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# App URLs
VITE_APP_URL=
VITE_ADMIN_URL=
VITE_MARKETING_URL=
```

### apps/admin/.env.production
```bash
VITE_CONVEX_URL=https://your-project.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
VITE_APP_URL=https://admin.vectr0.com
VITE_ENVIRONMENT=production
```

### apps/web/.env.production
```bash
VITE_CONVEX_URL=https://your-project.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
VITE_APP_URL=https://app.vectr0.com
VITE_ENVIRONMENT=production
```

### apps/marketing/.env.production
```bash
PUBLIC_APP_URL=https://app.vectr0.com
PUBLIC_ADMIN_URL=https://admin.vectr0.com
PUBLIC_MARKETING_URL=https://www.vectr0.com
```

## Deployment Helper Scripts

### scripts/deploy-all.sh
```bash
#!/bin/bash
set -e

echo "🚀 Starting full deployment..."

# Deploy Convex first
echo "📦 Deploying Convex backend..."
pnpm convex:deploy

# Wait for Convex to be ready
sleep 5

# Deploy all frontends in parallel
echo "🌐 Deploying frontend applications..."
pnpm deploy:all-frontends

# Run health checks
echo "🏥 Running health checks..."
sleep 10
pnpm health:all

echo "✅ Deployment complete!"
```

### scripts/rollback.sh
```bash
#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: ./rollback.sh [admin|web|marketing|convex|all]"
    exit 1
fi

case $1 in
    admin)
        echo "Rolling back admin app..."
        # Add rollback logic for admin
        ;;
    web)
        echo "Rolling back web app..."
        # Add rollback logic for web
        ;;
    marketing)
        echo "Rolling back marketing site..."
        # Add rollback logic for marketing
        ;;
    convex)
        echo "Rolling back Convex..."
        # Add rollback logic for Convex
        ;;
    all)
        echo "Rolling back all services..."
        # Add rollback logic for all
        ;;
    *)
        echo "Unknown service: $1"
        exit 1
        ;;
esac
```

## Make Commands (Optional)

### Makefile
```makefile
.PHONY: deploy-staging deploy-production rollback help

help:
	@echo "Available commands:"
	@echo "  make deploy-staging  - Deploy to staging environment"
	@echo "  make deploy-production - Deploy to production environment"
	@echo "  make rollback       - Rollback last deployment"

deploy-staging:
	@echo "Deploying to staging..."
	pnpm convex:deploy:staging
	git push origin main:staging
	@echo "Staging deployment complete"

deploy-production:
	@echo "Deploying to production..."
	@./scripts/deploy-all.sh
	@echo "Production deployment complete"

rollback:
	@./scripts/rollback.sh all
```