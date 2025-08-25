# Real-Time Version Management

## Overview

VECTR0 implements a real-time version notification system using Convex to instantly notify users when new application versions are deployed. This eliminates the need for polling and provides a seamless user experience with immediate update notifications.

## Architecture Components

### Deployment Tracking Model

```typescript
// convex/schema.ts - Add to existing schema
deployments: defineTable({
  appName: v.string(), // "admin" | "web" | "marketing"
  version: v.string(),
  gitCommit: v.string(),
  buildNumber: v.number(),
  buildTime: v.number(),
  deployedAt: v.number(),
  environment: v.string(), // "staging" | "production"
  gitTag: v.optional(v.string()), // Git tag for production releases
})
  .index("by_app_env", ["appName", "environment"])
  .index("by_deployed_at", ["deployedAt"])
  .index("by_git_tag", ["gitTag"]),
```

### Convex Functions for Version Management

```typescript
// convex/deployments.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const recordDeployment = mutation({
  args: {
    appName: v.string(),
    version: v.string(),
    gitCommit: v.string(),
    buildNumber: v.number(),
    buildTime: v.number(),
    environment: v.string(),
  },
  handler: async (ctx, args) => {
    // Record new deployment
    await ctx.db.insert("deployments", {
      ...args,
      deployedAt: Date.now(),
    });
    
    // Clean up old deployments (keep last 10)
    const oldDeployments = await ctx.db
      .query("deployments")
      .withIndex("by_app_env", (q) => 
        q.eq("appName", args.appName).eq("environment", args.environment)
      )
      .order("desc")
      .take(20); // Get more than we need
    
    if (oldDeployments.length > 10) {
      const toDelete = oldDeployments.slice(10);
      await Promise.all(
        toDelete.map(deployment => ctx.db.delete(deployment._id))
      );
    }
  },
});

// Real-time query for latest deployment
export const watchLatestDeployment = query({
  args: {
    appName: v.string(),
    environment: v.string(),
  },
  handler: async (ctx, args) => {
    const latest = await ctx.db
      .query("deployments")
      .withIndex("by_app_env", (q) => 
        q.eq("appName", args.appName).eq("environment", args.environment)
      )
      .order("desc")
      .first();
    
    return latest;
  },
});
```

## Frontend Implementation

### Version Check Hook

```typescript
// hooks/useVersionCheck.ts
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";

interface CurrentVersion {
  version: string;
  gitCommit: string;
  buildNumber: number;
  buildTime: number;
  gitTag: string | null;
}

// Injected at build time
const CURRENT_VERSION: CurrentVersion = {
  version: __APP_VERSION__,
  gitCommit: __GIT_COMMIT__,
  buildNumber: __BUILD_NUMBER__,
  buildTime: __BUILD_TIME__,
  gitTag: __GIT_TAG__,
};

const APP_NAME = __APP_NAME__; // "admin" | "web" | "marketing"
const ENVIRONMENT = __ENVIRONMENT__; // "staging" | "production"

export function useVersionCheck() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  
  // Real-time subscription to latest deployment
  const latestDeployment = useQuery(api.deployments.watchLatestDeployment, {
    appName: APP_NAME,
    environment: ENVIRONMENT,
  });
  
  useEffect(() => {
    if (!latestDeployment) return;
    
    // Check if there's a newer deployment
    // For production, prioritize git tag comparison; for staging, use commit/build comparison
    const isNewer = latestDeployment.environment === 'production' && latestDeployment.gitTag
      ? latestDeployment.gitTag !== CURRENT_VERSION.gitTag
      : (
          latestDeployment.gitCommit !== CURRENT_VERSION.gitCommit ||
          latestDeployment.buildNumber > CURRENT_VERSION.buildNumber ||
          latestDeployment.buildTime > CURRENT_VERSION.buildTime
        );
    
    if (isNewer) {
      setHasUpdate(true);
      setUpdateInfo(latestDeployment);
    } else {
      setHasUpdate(false);
      setUpdateInfo(null);
    }
  }, [latestDeployment]);
  
  const refreshApp = () => {
    // Clear all caches and reload
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    window.location.reload();
  };
  
  const dismissUpdate = () => {
    setHasUpdate(false);
  };
  
  return {
    hasUpdate,
    updateInfo,
    currentVersion: CURRENT_VERSION,
    refreshApp,
    dismissUpdate,
  };
}
```

### Update Notification Component

```typescript
// components/UpdateNotification.tsx
import { useVersionCheck } from "@/hooks/useVersionCheck";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function UpdateNotification() {
  const { hasUpdate, updateInfo, refreshApp, dismissUpdate } = useVersionCheck();
  
  if (!hasUpdate || !updateInfo) return null;
  
  return (
    <Alert className="fixed top-4 right-4 w-auto max-w-md z-50 border-blue-200 bg-blue-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <AlertDescription className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">New version available!</span>
              <Badge variant="secondary" className="text-xs">
                {updateInfo.gitTag || `v${updateInfo.version}`}
              </Badge>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Build #{updateInfo.buildNumber}</div>
              <div>
                Deployed {formatDistanceToNow(updateInfo.deployedAt)} ago
              </div>
              {updateInfo.gitCommit && (
                <div className="font-mono">
                  {updateInfo.gitCommit}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={refreshApp} className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
              <Button size="sm" variant="ghost" onClick={dismissUpdate}>
                Later
              </Button>
            </div>
          </AlertDescription>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={dismissUpdate}
          className="h-6 w-6 p-0 ml-2"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </Alert>
  );
}
```

## Build-Time Integration

### Vite Configuration

```typescript
// apps/admin/vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.VERSION || process.env.npm_package_version),
    __GIT_COMMIT__: JSON.stringify(process.env.GITHUB_SHA?.slice(0, 7) || 'dev'),
    __BUILD_NUMBER__: JSON.stringify(parseInt(process.env.GITHUB_RUN_NUMBER || '0')),
    __BUILD_TIME__: JSON.stringify(Date.now()),
    __APP_NAME__: JSON.stringify(process.env.APP_NAME || 'admin'),
    __ENVIRONMENT__: JSON.stringify(process.env.NODE_ENV || 'development'),
    __GIT_TAG__: JSON.stringify(process.env.GIT_TAG || null),
  },
  // ... rest of config
});
```

### Deployment Recording Script

```typescript
// scripts/record-deployment.js
import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(process.env.CONVEX_URL);

const deploymentInfo = {
  appName: process.env.APP_NAME, // "admin" | "web" | "marketing"
  version: process.env.VERSION || process.env.npm_package_version, // Use git tag version for production
  gitCommit: process.env.GITHUB_SHA?.slice(0, 7) || 'unknown',
  buildNumber: parseInt(process.env.GITHUB_RUN_NUMBER || '0'),
  buildTime: Date.now(),
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'staging',
  gitTag: process.env.GIT_TAG || null, // Include git tag for production releases
};

// Record deployment in Convex
await client.mutation("deployments:recordDeployment", deploymentInfo);

// Also generate local version file for immediate checks
import fs from 'fs';
fs.writeFileSync('dist/version.json', JSON.stringify(deploymentInfo, null, 2));

console.log('Deployment recorded:', deploymentInfo);
```

## CI/CD Pipeline Integration

### Updated GitHub Actions Workflow

```yaml