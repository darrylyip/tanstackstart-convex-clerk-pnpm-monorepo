# STORY-000: Account Setup and Project Initialization

## Story Metadata
- **ID:** STORY-000
- **Epic:** EPIC-001 (Multi-Tenant Foundation & Authentication)
- **Priority:** CRITICAL
- **Estimation:** 2 points
- **Status:** COMPLETED

## User Story
**As a** development team  
**I want** to set up all required service accounts and initialize the project repository  
**So that** we have the necessary infrastructure and credentials to begin development

## Background Context
Before any code can be written, the team needs accounts on various services that VECTR0 depends on. This includes backend services (Convex), authentication (Clerk), deployment platforms (Cloudflare/Vercel), and development tools. This story ensures all prerequisites are in place before development begins.

## Acceptance Criteria
- [ ] Convex account created with project initialized
- [ ] Clerk account created with development instance configured
- [ ] GitHub repository created with proper .gitignore
- [ ] Cloudflare account set up (for future deployment)
- [ ] Environment variables documented and .env.example created
- [ ] All team members have appropriate access levels
- [ ] Development machine prerequisites verified

## Technical Requirements

### 1. Service Accounts Required
```yaml
Required Services:
  Convex:
    url: https://convex.dev
    purpose: Backend database and real-time sync
    tier: Free tier (sufficient for development)
    
  Clerk:
    url: https://clerk.com
    purpose: Authentication and user management
    tier: Free tier (up to 10,000 MAUs)
    features_needed:
      - Organizations (for multi-tenancy)
      - Custom roles
      - JWT templates
    
  Cloudflare:
    url: https://cloudflare.com
    purpose: Deployment and CDN
    tier: Free tier initially
    
  GitHub:
    url: https://github.com
    purpose: Version control and CI/CD
    repository: vectr0/vectr0 (or your org name)

Optional Services:
  Sentry:
    url: https://sentry.io
    purpose: Error tracking
    tier: Free tier
    
  Uploadthing:
    url: https://uploadthing.com
    purpose: File uploads (profile photos)
    tier: Free tier
```

### 2. Local Development Prerequisites
```bash
# Required software versions
node --version     # Should be 20.0.0 or higher
pnpm --version     # Should be 8.15.0 or higher
git --version      # Should be 2.0.0 or higher

# Install PNPM if not present
npm install -g pnpm@8.15.0

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. Environment Variables Template
```bash
# .env.example

# Convex Configuration
CONVEX_DEPLOYMENT=  # From Convex dashboard after project creation
NEXT_PUBLIC_CONVEX_URL=  # From Convex dashboard

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=  # From Clerk dashboard
CLERK_SECRET_KEY=  # From Clerk dashboard
CLERK_JWT_ISSUER_DOMAIN=  # From Clerk JWT Templates

# Deployment (for later)
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=

# Optional Services
SENTRY_DSN=
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
```

### 4. Repository Initialization
```bash
# Create and initialize repository
mkdir vectr0
cd vectr0
git init
git branch -M main

# Create initial .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/

# Environment
.env
.env.local
.env.*.local

# Convex
.env.local
.env.production.local
convex/_generated/

# Build outputs
dist/
build/
.next/
out/
.turbo/

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Testing
coverage/
.nyc_output/
EOF

# Initial commit
git add .gitignore
git commit -m "Initial commit: project setup"
```

## Implementation Steps

1. **Create Service Accounts** (0.5 points)
   - Sign up for Convex at https://convex.dev
   - Sign up for Clerk at https://clerk.com
   - Sign up for Cloudflare at https://cloudflare.com
   - Create GitHub repository

2. **Configure Convex Project** (0.5 points)
   - Log in to Convex dashboard
   - Create new project named "vectr0" (or "vectr0-dev" for development)
   - Note the deployment name and URL for environment variables
   - Keep dashboard open for later configuration

3. **Configure Clerk Application** (0.5 points)
   - Create new Clerk application
   - Enable "Organizations" feature (crucial for multi-tenancy)
   - Configure application name and branding
   - Set up development instance
   - Copy API keys to secure location

4. **Initialize Repository** (0.5 points)
   - Create local project directory
   - Initialize git repository
   - Create .gitignore and .env.example
   - Make initial commit
   - Connect to GitHub remote

## Verification Checklist
- [ ] Can log into Convex dashboard
- [ ] Can log into Clerk dashboard  
- [ ] GitHub repository accessible by all team members
- [ ] Node.js 20+ installed (`node --version`)
- [ ] PNPM 8.15+ installed (`pnpm --version`)
- [ ] .env.example file documents all required variables
- [ ] .gitignore properly configured
- [ ] Initial commit pushed to GitHub

## Configuration Details

### Clerk Organization Settings
1. Navigate to Organizations in Clerk dashboard
2. Enable Organizations feature
3. Configure organization roles:
   - `admin` - Full access to organization
   - `scheduler` - Can manage schedules
   - `physician` - Regular user access

### Convex Project Settings
1. Project naming: Use environment suffixes (vectr0-dev, vectr0-staging, vectr0-prod)
2. Keep development and production in separate projects
3. Note the deployment URL format: `https://<project>.convex.cloud`

## Security Considerations
- Never commit .env files to repository
- Use separate Clerk instances for dev/staging/prod
- Rotate API keys regularly
- Use GitHub secrets for CI/CD variables
- Enable 2FA on all service accounts
- Document which team members have admin access

## Definition of Done
- [ ] All service accounts created and accessible
- [ ] Repository initialized with proper .gitignore
- [ ] Environment variables documented in .env.example
- [ ] Team members have appropriate access
- [ ] Development prerequisites verified
- [ ] Initial commit pushed to GitHub
- [ ] Credentials stored securely (password manager)
- [ ] Setup documentation created for new developers

## Notes for Developer
- Keep all credentials in a password manager, never in plain text
- Use consistent naming across services (vectr0 or your chosen name)
- Set up 2FA immediately on all accounts
- Bookmark all service dashboards for easy access
- Consider using a dedicated email for service accounts
- Take screenshots of dashboard configurations for documentation
- Free tiers are sufficient for initial development

## Quick Setup Script
```bash
#!/bin/bash
# save as setup.sh

echo "🚀 VECTR0 Project Setup"
echo "======================"
echo ""
echo "📋 Prerequisites Check:"
echo -n "Node.js: "
node --version || echo "❌ Not installed"
echo -n "PNPM: "
pnpm --version || echo "❌ Not installed"
echo -n "Git: "
git --version || echo "❌ Not installed"
echo ""
echo "📦 Creating project structure..."
mkdir -p vectr0
cd vectr0
git init
git branch -M main
echo ""
echo "📄 Creating .env.example..."
cat > .env.example << 'EOF'
# Copy this to .env.local and fill in values

# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Optional
SENTRY_DSN=
UPLOADTHING_SECRET=
EOF
echo ""
echo "✅ Setup complete!"
echo ""
echo "📌 Next steps:"
echo "1. Create account at https://convex.dev"
echo "2. Create account at https://clerk.com"
echo "3. Create GitHub repository"
echo "4. Copy .env.example to .env.local"
echo "5. Fill in environment variables"
echo ""
```

## References
- [Convex Getting Started](https://docs.convex.dev/get-started)
- [Clerk Quickstart](https://clerk.com/docs/quickstarts/react)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages)
- [PNPM Installation](https://pnpm.io/installation)