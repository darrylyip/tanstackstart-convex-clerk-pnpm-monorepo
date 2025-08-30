# Local Development Setup Instructions

Add this section to your root README.md file:

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** 20.x or higher
- **pnpm** 9.x or higher (`npm install -g pnpm`)
- **Git**

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/vectr0.git
cd vectr0

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Start development servers
pnpm dev
```

This will start:
- 🔧 Convex dev server with dashboard
- 🌐 Web app: http://localhost:4321 (Astro hybrid)
- 📦 Shared packages building in watch mode

### Detailed Setup

#### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/yourusername/vectr0.git
cd vectr0

# Install all dependencies
pnpm install
```

#### 2. Environment Configuration

Create local environment files:

```bash
# Copy root environment template
cp .env.example .env.local

# Create app-specific env files  
cp apps/web/.env.example apps/web/.env.local
touch packages/convex/.env.local
```

Edit `.env.local` files with your development credentials:

**Root `.env.local`:**
```bash
# === CONVEX ===
CONVEX_DEPLOYMENT=dev:your-dev-deployment-name
CONVEX_URL=https://your-dev-project.convex.cloud

# === CLOUDFLARE ===
CF_ACCOUNT_ID=your-cloudflare-account-id
CF_API_TOKEN=your-cloudflare-api-token

# === CLERK AUTH ===
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxxx

# === APP CONFIGURATION ===
PUBLIC_APP_URL=http://localhost:4321
PUBLIC_ENVIRONMENT=development

# === EXTERNAL SERVICES ===
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
UPLOADTHING_SECRET=sk_test_xxxxxxxxxxxxx
UPLOADTHING_APP_ID=test_xxxxxxx

# === CALENDAR INTEGRATION ===
GOOGLE_CALENDAR_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=xxxxxxxxxxxxx
```

**Apps/web `.env.local`:**
```bash
# Astro Public Variables (available in browser)
PUBLIC_CONVEX_URL=https://your-dev-project.convex.cloud
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
PUBLIC_APP_URL=http://localhost:4321
PUBLIC_ENVIRONMENT=development
PUBLIC_ENABLE_DEBUG=true

# Server-only Variables (SSR/API routes only)
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
CONVEX_DEPLOY_KEY=dev:xxxxxxxxxxxxx
```

**packages/convex `.env.local`:**
```bash
# Convex-specific environment variables
CLERK_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
UPLOADTHING_SECRET=sk_test_xxxxxxxxxxxxx
GOOGLE_CALENDAR_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=xxxxxxxxxxxxx

# Development settings
DEBUG=true
LOG_LEVEL=debug
```

#### 3. Convex Setup

```bash
# Initialize Convex project (first time only)
cd packages/convex
pnpm convex login
pnpm convex init

# Return to root and start dev server
cd ../..
pnpm convex:dev
```

This will:
- Create a development deployment
- Generate TypeScript types
- Start the Convex dev server with hot reload
- Open the Convex dashboard

#### 4. Start Development

**Option A: Start Everything (Recommended)**
```bash
# Start all development servers concurrently
pnpm dev
```

**Option B: Start Individually**
```bash
# Terminal 1: Convex backend
pnpm convex:dev

# Terminal 2: Web application  
pnpm dev:web
```

#### 5. Verify Setup

Open your browser and check:
- **Web App**: http://localhost:4321
  - Static pages load (marketing content)
  - `/app/dashboard` requires authentication
- **Convex Dashboard**: Available from Convex dev server output
  - View database tables
  - Test functions in console
  - Monitor real-time updates

### Development Workflow

#### Daily Development

```bash
# Start your day
pnpm dev

# When you make changes to:
# - Astro pages: Hot reload automatically
# - React components: Hot reload automatically  
# - Convex functions: Auto-redeploy to dev server
# - Shared packages: Rebuild automatically with Turbo
```

#### Working with Convex

```bash
# View Convex dashboard
pnpm convex:dashboard

# Deploy to dev environment
pnpm convex:deploy

# View function logs
pnpm convex:logs

# Generate types after schema changes
pnpm --filter=@vectr0/convex codegen
```

#### Working with Clerk

1. **Create Development Application:**
   - Go to https://clerk.dev/dashboard
   - Create new application for development
   - Copy keys to your `.env.local` files

2. **Set up Organizations:**
   - Enable organizations in Clerk settings
   - Configure organization roles: `admin`, `user`
   - Set up webhooks pointing to your Convex dev server

3. **Test Authentication:**
   - Visit http://localhost:3000/app/dashboard
   - Sign up or sign in
   - Create test organization

#### Package Development

```bash
# Work on shared UI components
cd packages/ui
pnpm dev  # Starts in watch mode

# Work on utility functions
cd packages/utils  
pnpm dev  # Builds in watch mode

# Test packages
pnpm test            # All packages
pnpm test:web        # Just web app tests
```

### Troubleshooting

#### Common Issues

1. **Port Conflicts:**
   ```bash
   # Check what's using ports
   lsof -i :3000  # TanStack Start
   lsof -i :3001  # Convex dev server
   
   # Kill processes if needed
   kill -9 <PID>
   ```

2. **Environment Variable Issues:**
   ```bash
   # Variables not showing up in browser
   # ❌ Wrong: CONVEX_URL (no VITE_ prefix)
   # ✅ Correct: VITE_CONVEX_URL
   
   # Check TanStack Start environment loading
   pnpm dev:web --verbose
   ```

3. **Convex Connection Issues:**
   ```bash
   # Clear Convex cache
   rm -rf packages/convex/.convex
   pnpm --filter=@vectr0/convex codegen
   
   # Reinitialize if needed
   cd packages/convex
   pnpm convex init --reinit
   ```

4. **Clerk Authentication Issues:**
   ```bash
   # Verify webhook URL in Clerk dashboard
   # Should point to: https://your-convex-dev-url.convex.cloud/clerk-webhook
   
   # Test webhook locally
   curl -X POST http://localhost:3210/clerk-webhook \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

5. **pnpm Workspace Issues:**
   ```bash
   # Clear all node_modules and reinstall
   pnpm clean
   pnpm install
   
   # Rebuild all packages
   pnpm build
   ```

#### Debug Commands

```bash
# Health check all services
pnpm health:all

# View all environment variables
printenv | grep -E "(VITE_|CONVEX_|CLERK_)"

# Test Convex functions
cd packages/convex
pnpm convex run queries.getAllUsers

# Check package linking
pnpm ls --depth=0
```

#### Performance Tips

```bash
# Use Turbo for faster builds
pnpm turbo build --filter=@vectr0/web

# Cache node_modules with Turbo
export TURBO_CACHE_DIR=~/.cache/turbo

# Use pnpm store for faster installs
pnpm config set store-dir ~/.pnpm-store

# Enable TanStack Start dev tools
# Available in development mode by default
```

### Additional Setup

#### Setting Up Clerk Organizations

1. **Enable Organizations in Clerk Dashboard:**
   - Go to Organization Settings
   - Enable organizations
   - Set maximum members per org (if needed)

2. **Configure Webhook:**
   ```bash
   # In Clerk Dashboard → Webhooks
   Endpoint URL: https://your-convex-dev-url.convex.cloud/clerk-webhook
   Events: user.*, organization.*, organizationMembership.*
   ```

3. **Test Organization Flow:**
   - Sign up as new user
   - Create test organization
   - Invite another test user
   - Verify sync in Convex dashboard

#### Setting Up External Services

```bash
# Uploadthing (File uploads)
# 1. Create account at uploadthing.com
# 2. Create new app
# 3. Copy App ID and Secret to .env.local

# OpenAI (AI features)
# 1. Get API key from platform.openai.com
# 2. Add to .env.local
# 3. Start with gpt-3.5-turbo for development

# Google Calendar (Optional)
# 1. Create project in Google Cloud Console
# 2. Enable Calendar API
# 3. Create OAuth 2.0 credentials
# 4. Add client ID and secret to .env.local
```

### VS Code Setup (Recommended)

**Extensions:**
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss", 
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json",
    "ms-vscode.vscode-react"
  ]
}
```

**Settings (.vscode/settings.json):**
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.includePackageJsonAutoImports": "on"
}
```

### Database Seeding (Optional)

```bash
# Create seed data for development
cd packages/convex

# Add seed script to package.json:
# "seed": "convex run seed:all"

# Run seeding
pnpm seed
```

This setup provides a streamlined development experience with the single TanStack Start application while maintaining the flexibility of the monorepo structure.