# Comprehensive Troubleshooting Documentation - Citi Dashboard VPS Deployment

## Project Overview
- **Project**: Citi LATAM RegInsight Dashboard
- **Architecture**: Next.js Frontend + Node.js Backend
- **Deployment**: Mac (Development) + VPS (Production)
- **Domain**: https://banking.scnfinc.com
- **GitHub**: https://github.com/Asif90988/banking-dashboard.git

## System Architecture

### Mac Development Environment
- **Frontend**: http://localhost:3000 (or 3002 if 3000 busy)
- **Backend**: http://localhost:5050
- **API Calls**: Direct to localhost:5050/api
- **Status**: ✅ Working properly with all components

### VPS Production Environment  
- **Frontend**: Port 3050 (via PM2)
- **Backend**: Port 5050 (via PM2)
- **Domain**: https://banking.scnfinc.com
- **Nginx**: Proxy from domain to localhost:3050 (frontend) and localhost:5050 (backend)
- **Status**: ⚠️ Experiencing errors (see Current Issues)

## Initial Problem (RESOLVED ✅)
**Issue**: `Could not find a production build in the '.next' directory`

**Root Cause**: Missing Next.js production build on VPS

**Solution Applied**:
1. Stopped frontend process: `pm2 stop citi-frontend`
2. Cleaned build cache: `rm -rf .next && rm -rf node_modules/.cache`
3. Rebuilt production: `npm run build`
4. Restarted with ecosystem config: `pm2 start ecosystem.config.js`

## WebSocket Configuration (RESOLVED ✅)
**Issue**: WebSocket connections failing (`wss://banking.scnfinc.com/socket.io/`)

**Root Cause**: Nginx missing WebSocket proxy configuration

**Solution Applied**:
```nginx
# Added to nginx config
location /socket.io/ {
    proxy_pass http://localhost:5050;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    # ... additional WebSocket headers
}
```

## CORS Configuration (RESOLVED ✅)
**Issue**: Backend CORS rejecting frontend requests

**Root Cause**: server.js CORS configured for wrong ports and missing production domain

**Solution Applied**:
```javascript
// Updated server.js CORS to include:
const allowedOrigins = [
  "https://banking.scnfinc.com",           // Production domain
  "http://localhost:3050",                 // VPS frontend port
  "http://145.223.79.90:3050",            // VPS IP
  "http://192.168.4.25:3050",             // Mac IP (corrected port)
  // ... other origins
];
```

## Environment-Aware API Configuration (RESOLVED ✅)
**Issue**: Hardcoded API URLs in components causing environment conflicts

**Root Cause**: Components had hardcoded localhost:5050 URLs

**Solution Applied**:
1. **Created environment files**:
   - **Mac**: `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:5050/api`
   - **VPS**: `.env.local` with `NEXT_PUBLIC_API_URL=https://banking.scnfinc.com/api`

2. **Updated all components** (11 files) to use environment variables:
   ```javascript
   // Before (hardcoded):
   fetch("http://localhost:5050/api/budget/overview")
   
   // After (environment-aware):
   const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
   fetch(`${API_BASE}/budget/overview`)
   ```

3. **Components Updated**:
   - BudgetSection.tsx ✅
   - BudgetAnalytics.tsx ✅  
   - ProjectsSection.tsx ✅
   - ProjectsAnalytics.tsx ✅
   - ComplianceSection.tsx ✅
   - ComplianceAnalytics.tsx ✅
   - RiskSection.tsx ✅
   - RiskAnalytics.tsx ✅
   - ActivitiesSection.tsx ✅
   - ChatbotSection.tsx ✅
   - Main app/page.tsx ✅

## Current Issues (ONGOING ⚠️)

### Primary Issue: Null Safety Errors
**Error Type**: `TypeError: Cannot read properties of undefined (reading 'toString')`
**Error Type**: `TypeError: Cannot read properties of undefined (reading 'toLowerCase')`

**Location**: Projects page specifically
**Files Affected**: ProjectsSection.tsx and/or ProjectsAnalytics.tsx

**Root Cause**: API data contains undefined/null values that components try to process without null checks

**Expected Solution**: Add null safety operators and fallbacks:
```javascript
// Before (unsafe):
project.status.toLowerCase()
project.budget_allocated.toString()

// After (null-safe):
(project?.status || '').toLowerCase()
parseFloat(project?.budget_allocated?.toString() || '0')
```

### Secondary Issue: Missing API Endpoints
**Error**: `404 (Not Found)` for `/api/compliance/analytics`
**Root Cause**: Some analytics endpoints may not exist in backend
**Status**: Non-critical, components should handle gracefully

## Git Workflow Issues (RESOLVED ✅)
**Problem**: VPS and GitHub getting out of sync

**Solution Applied**: Hard reset approach for reliable deployment
```bash
# On VPS - force match GitHub exactly
git fetch origin
git reset --hard origin/main
npm run build
pm2 restart citi-frontend citi-backend
```

## PM2 Process Management (ESTABLISHED ✅)
**Requirement**: Avoid affecting other applications (supreme-backend, supreme-frontend)

**Solution**: Individual process control
```bash
# Safe commands (only affect citi):
pm2 start/stop/restart citi-frontend
pm2 start/stop/restart citi-backend
pm2 start ecosystem.config.js

# Dangerous commands (affect all apps):
pm2 stop/restart/delete all  # ❌ Don't use
```

## Ecosystem Configuration (WORKING ✅)
**File**: `ecosystem.config.js`
```javascript
module.exports = {
  apps: [
    {
      name: 'citi-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3050
      }
    },
    {
      name: 'citi-backend', 
      script: 'server.js',
      cwd: './backend',
      env: {
        NODE_ENV: 'production',
        PORT: 5050
      }
    }
  ]
}
```

## Service Status (CURRENT)
### VPS Services:
- ✅ **citi-frontend**: Online, port 3050
- ✅ **citi-backend**: Online, port 5050  
- ✅ **supreme-backend**: Online, unaffected
- ✅ **supreme-frontend**: Online, unaffected

### Functionality Status:
- ✅ **Main dashboard**: Loading properly
- ✅ **WebSocket connections**: Working
- ✅ **API calls**: Connecting successfully
- ⚠️ **Projects page**: Throwing null safety errors
- ❓ **Budget/Compliance/Risk pages**: Need testing after null safety fix

## Next Steps
1. **Immediate**: Fix null safety in ProjectsSection.tsx and ProjectsAnalytics.tsx
2. **Verify**: Test all dashboard sections after fix
3. **Validate**: Confirm git workflow is reliable for future updates
4. **Document**: Any additional API endpoints needed

## Key Commands Reference
```bash
# VPS Deployment Workflow:
cd ~/citi-dashboard
git fetch origin && git reset --hard origin/main
cd frontend && npm run build
pm2 restart citi-frontend citi-backend

# Check Status:
pm2 status
pm2 logs citi-frontend --lines 10

# Debug:
grep -r "toString\|toLowerCase" components/ProjectsSection.tsx
```

## Environment Files
### Mac (.env.local):
```
NEXT_PUBLIC_API_URL=http://localhost:5050/api
NODE_ENV=development
NEXT_PUBLIC_ENABLE_DEBUG=true
```

### VPS (.env.local):
```
NEXT_PUBLIC_API_URL=https://banking.scnfinc.com/api
NODE_ENV=production
NEXT_PUBLIC_ENABLE_DEBUG=false
```

## Contact Points
- **Mac Development**: Working, all components functional
- **VPS Production**: Main dashboard working, projects page needs null safety fixes
- **GitHub Repo**: Environment-aware code pushed and synced
