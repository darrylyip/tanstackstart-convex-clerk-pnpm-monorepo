# Local Development Setup Instructions

Add this section to your root README.md file:

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** 20.x or higher
- **pnpm** 8.x or higher (`npm install -g pnpm`)
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
- 🔧 Convex dev server: http://localhost:3210
- 🌐 Web app: http://localhost:3000
- 🏥 Admin app: http://localhost:3001  
- 🌐 Marketing site: http://localhost:3002

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
cp apps/admin/.env.example apps/admin/.env.local
cp apps/web/.env.example apps/web/.env.local
cp apps/marketing/.env.example apps/marketing/.env.local
```

Edit `.env.local` with your development credentials:

```bash
# Convex Development
CONVEX_DEPLOYMENT=dev
VITE_CONVEX_URL=http://localhost:3210

# Clerk Auth (get from https://clerk.dev)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# GitHub Token for shadcn-ui MCP Server
# Create a token at https://github.com/settings/tokens
# Required for AI-powered component development via shadcn-ui MCP server
# Without token: 60 requests/hour | With token: 5,000 requests/hour
GITHUB_TOKEN=ghp_xxxxx

# Local URLs
VITE_APP_URL=http://localhost:3000
VITE_ADMIN_URL=http://localhost:3001
VITE_MARKETING_URL=http://localhost:3002
```

#### 3. Database Setup (Convex)

```bash
# Initialize Convex project (first time only)
cd packages/convex
npx convex init

# Return to root
cd ../..

# Start Convex dev server
pnpm convex:dev
```

The Convex dev server will:
- Run on http://localhost:3210
- Provide a local database
- Hot reload on schema changes
- Show real-time logs

#### 4. Start Development Servers

```bash
# Start all services (recommended)
pnpm dev

# Or start individual services:
pnpm dev:admin     # Admin app only
pnpm dev:web       # Web app only
pnpm dev:marketing # Marketing site only
pnpm convex:dev    # Convex backend only
```

### Development Workflow

#### Working on Features

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and test locally
pnpm dev

# Run tests
pnpm test

# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Fix formatting
pnpm format
```

#### Testing Your Changes

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for specific app
pnpm test --filter=@vectr0/admin

# Run E2E tests (requires apps running)
pnpm test:e2e
```

#### Building Locally

```bash
# Build all apps
pnpm build

# Build specific app
pnpm build --filter=@vectr0/admin

# Preview production build
pnpm preview
```

### Project Structure

```
vectr0/
├── apps/                   # Frontend applications
│   ├── admin/             # Admin dashboard (Vite + React)
│   ├── web/               # Web app (Vite + React)
│   └── marketing/         # Marketing site (Astro)
├── packages/              # Shared packages
│   ├── convex/           # Backend (Convex)
│   ├── shared/           # Shared types & utilities
│   ├── ui/               # Shared UI components
│   └── config/           # Shared configurations
├── docs/                  # Documentation
└── scripts/              # Build & deployment scripts
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all development servers |
| `pnpm build` | Build all applications |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all code |
| `pnpm format` | Format code with Prettier |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm clean` | Clean all build outputs |
| `pnpm convex:dev` | Start Convex dev server |
| `pnpm dev:admin` | Start admin app only |
| `pnpm dev:web` | Start web app only |
| `pnpm dev:marketing` | Start marketing site only |

### Common Development Tasks

#### Adding a New Package

```bash
# Add to specific app
pnpm add react-hook-form --filter=@vectr0/admin

# Add to shared packages
pnpm add date-fns --filter=@vectr0/shared

# Add dev dependency to root
pnpm add -D @types/node
```

#### Creating New Components

```bash
# Shared UI component
mkdir -p packages/ui/src/components/NewComponent
touch packages/ui/src/components/NewComponent/index.tsx

# App-specific component
mkdir -p apps/admin/src/components/NewFeature
touch apps/admin/src/components/NewFeature/index.tsx
```

#### Working with Convex

```bash
# Generate Convex types
pnpm convex:codegen

# Deploy to dev environment
pnpm convex:dev

# View Convex dashboard
pnpm convex:dashboard

# Run Convex function locally
pnpm convex run functions/myFunction
```

### Troubleshooting

#### Port Already in Use

```bash
# Kill process on specific port
lsof -ti:3000 | xargs kill -9

# Or change port in vite.config.ts
export default {
  server: {
    port: 3003 // Different port
  }
}
```

#### Dependency Issues

```bash
# Clear all node_modules and reinstall
pnpm clean:deps
pnpm install

# Clear pnpm cache
pnpm store prune
```

#### Convex Connection Issues

```bash
# Restart Convex dev server
pnpm convex:dev --once # Run migrations
pnpm convex:dev        # Start server

# Check Convex logs
pnpm convex logs
```

#### Environment Variable Issues

```bash
# Verify environment variables are loaded
pnpm dev --debug

# Check variable naming:
# - Vite apps: Must start with VITE_
# - Convex: No prefix required
# - Astro: Must start with PUBLIC_
```

### MCP Server Integration (AI-Powered Development)

#### shadcn-ui MCP Server Setup

The project integrates with the shadcn-ui Model Context Protocol (MCP) server to enable AI-powered component development. This server provides AI assistants with comprehensive access to shadcn/ui components across React, Svelte, and Vue frameworks.

##### Why Use the MCP Server?

- **Component Discovery**: AI can browse and understand available shadcn/ui components
- **Code Generation**: Automatically generate component implementations with proper patterns
- **Multi-Framework Support**: Access components for React, Svelte, and Vue
- **Usage Examples**: Get demos and best practices for component implementation
- **Metadata Access**: Retrieve component dependencies and configuration

##### GitHub Token Requirement

The MCP server requires a GitHub token to function effectively:

- **Without token**: Limited to 60 GitHub API requests per hour (quickly exhausted)
- **With token**: Increases limit to 5,000 requests per hour
- The token only needs basic authentication - no special permissions required

##### Setting Up Your GitHub Token

1. **Create a GitHub Personal Access Token**:
   ```bash
   # Go to GitHub Settings → Developer settings → Personal access tokens
   # Or visit: https://github.com/settings/tokens
   # Click "Generate new token (classic)"
   # Select minimal scopes or no scopes (just for rate limiting)
   # Copy the generated token (starts with ghp_)
   ```

2. **Add to Environment Variables**:
   ```bash
   # Add to your .env.local file
   GITHUB_TOKEN=ghp_your_token_here
   ```

3. **Run the MCP Server** (if using with AI tools):
   ```bash
   # Install globally
   npm install -g @jpisnice/shadcn-ui-mcp-server

   # Run with your token
   npx @jpisnice/shadcn-ui-mcp-server --github-api-key $GITHUB_TOKEN
   ```

##### Benefits for Development

- **Faster Component Development**: AI can instantly access component patterns
- **Consistent Implementation**: Ensures components follow shadcn/ui best practices
- **Cross-Framework Knowledge**: Get Vue or Svelte equivalents of React components
- **Reduced Context Switching**: No need to manually browse documentation

### IDE Setup

#### VS Code (Recommended)

Install recommended extensions:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "astro-build.astro-vscode"
  ]
}
```

Settings for `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

#### WebStorm / IntelliJ

1. Enable ESLint: Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
2. Enable Prettier: Settings → Languages & Frameworks → JavaScript → Prettier
3. Set TypeScript version: Settings → Languages & Frameworks → TypeScript → Use project version

### Getting Help

- 📖 [Documentation](./docs)
- 💬 [Discord Community](https://discord.gg/vectr0)
- 🐛 [Report Issues](https://github.com/yourusername/vectr0/issues)
- 📧 [Email Support](mailto:support@vectr0.com)

### Next Steps

1. **Review the architecture**: Read [docs/architecture](./docs/architecture/index.md)
2. **Understand the data model**: Check [docs/architecture/data-models.md](./docs/architecture/data-models.md)
3. **Learn the deployment process**: See [Deployment](#deployment) section
4. **Start building**: Pick an issue from [GitHub Issues](https://github.com/yourusername/vectr0/issues)

---

## For Individual App READMEs

### apps/admin/README.md - Development Section

```markdown
## Development

### Setup

```bash
# From project root
pnpm install
pnpm dev:admin
```

The admin app will be available at http://localhost:3001

### Local Development

```bash
# Start dev server
pnpm dev

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

### Environment Variables

Create `apps/admin/.env.local`:

```bash
VITE_CONVEX_URL=http://localhost:3210
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_APP_URL=http://localhost:3001
VITE_ENVIRONMENT=development
```
```

### apps/web/README.md - Development Section

```markdown
## Development

### Setup

```bash
# From project root
pnpm install
pnpm dev:web
```

The web app will be available at http://localhost:3000

### Local Development

```bash
# Start dev server
pnpm dev

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

### Environment Variables

Create `apps/web/.env.local`:

```bash
VITE_CONVEX_URL=http://localhost:3210
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_APP_URL=http://localhost:3000
VITE_ENVIRONMENT=development
```
```

### apps/marketing/README.md - Development Section

```markdown
## Development

### Setup

```bash
# From project root
pnpm install
pnpm dev:marketing
```

The marketing site will be available at http://localhost:3002

### Local Development

```bash
# Start dev server
pnpm dev

# Build site
pnpm build

# Preview build
pnpm preview
```

### Environment Variables

Create `apps/marketing/.env.local`:

```bash
PUBLIC_APP_URL=http://localhost:3000
PUBLIC_ADMIN_URL=http://localhost:3001
PUBLIC_MARKETING_URL=http://localhost:3002
PUBLIC_ENVIRONMENT=development
```
```