# 🚀 Deployment & Environment Strategy

## Environment Overview

Voxxy Presents uses a multi-environment strategy to support different stages of development, admin testing, and experimentation:

| Environment | URL | Data Source | Data Sync | Purpose |
|-------------|-----|-------------|-----------|---------|
| **Development** | `localhost:5173` | Firebase Direct | Independent | Local development, feature building |
| **Staging** | `staging.voxxypresents.com` | API + Prod Mirror | Synced from Production | Pre-production testing, transformations |
| **Production** | `www.voxxypresents.com` | API + Firebase | Live Data | Customer-facing live environment |
| **Sandbox** | `sandbox.voxxypresents.com` | Firebase Direct | Independent | Experimental features, wacky ideas |

## 🏗️ Architecture

```
Development (Firebase) → PR → Staging (API + Prod Data) → Production (API)
                                    ↓
                              Sandbox (Firebase Independent)
```

## Environment Setup

### Initial Setup

```bash
# Clone and setup
git clone <repo>
cd voxxy-presents-client
npm run setup

# This will:
# - Install dependencies
# - Create environment files from examples
# - Set up deployment scripts
# - Configure git hooks
```

### Environment Files

Each environment has its own configuration:

- `.env.development` - Local development with Firebase direct access
- `.env.staging` - Staging with API and production data mirror
- `.env.production` - Production with live API
- `.env.sandbox` - Experimental environment with independent data
- `.env.local` - Your current local override (git-ignored)

## 🌊 Data Flow Strategy

### Development
- **Data Source**: Firebase Direct (`voxxy-presents-dev`)
- **Benefits**: Fast iteration, independent test data
- **Use Cases**: Feature development, local testing
- **Admin Controls**: Full access

```bash
npm run dev           # Start development server
npm run seed:dev      # Populate with test data
```

### Staging  
- **Data Source**: API + Production Mirror
- **Benefits**: Production-like testing environment
- **Use Cases**: Pre-production validation, transformation testing
- **Admin Controls**: Testing only

```bash
npm run sync:staging     # Sync production data to staging
npm run build:staging    # Build for staging
npm run deploy:staging   # Deploy to staging
```

### Production
- **Data Source**: Live API + Firebase
- **Benefits**: Customer-facing, real data
- **Use Cases**: Live operations
- **Admin Controls**: Role-based access

```bash
npm run build:production    # Build for production
npm run deploy:production   # Deploy to production (requires confirmation)
```

### Sandbox
- **Data Source**: Firebase Direct (`voxxy-presents-sandbox`)
- **Benefits**: Isolated experimentation
- **Use Cases**: Experimental features, prototypes
- **Admin Controls**: Full access

```bash
npm run build:sandbox    # Build for sandbox
# Deploy to sandbox environment
```

## 🚀 Deployment Workflows

### Development → Staging

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature
   # Develop and test locally
   ```

2. **Submit PR to Staging**
   ```bash
   git push origin feature/your-feature
   # Create PR targeting 'staging' branch
   ```

3. **Auto-Deploy to Staging**
   - Staging auto-deploys from `staging` branch
   - Sync production data for testing
   - Test admin functionality

### Staging → Production

1. **Validate in Staging**
   - Test all functionality
   - Verify data transformations
   - Confirm admin operations

2. **Promote to Production**
   ```bash
   git checkout main
   git merge staging
   npm run deploy:production
   ```

3. **Production Deployment**
   - Runs full test suite
   - Builds optimized bundle
   - Requires manual confirmation
   - Creates git tags for releases

### Experimental → Sandbox

```bash
git checkout -b experimental/wild-idea
# Develop experimental feature
git push origin experimental/wild-idea
# Deploy to sandbox for testing
```

## 🔧 Environment Configuration

Each environment automatically detects its configuration based on:

1. **Environment Variable**: `VITE_ENVIRONMENT`
2. **Hostname Detection**: 
   - `localhost` → development
   - `*.staging.*` → staging  
   - `*.sandbox.*` → sandbox
   - Everything else → production

### Feature Flags

Environment-specific features are controlled via the config system:

```typescript
import { isFeatureEnabled } from '@/config/environments'

// Admin controls enabled per environment
const showAdmin = isFeatureEnabled('adminControls')

// Debug mode for development/staging
const debugMode = isFeatureEnabled('debugMode')

// Experimental features for dev/sandbox
const experimentalFeatures = isFeatureEnabled('experimentalFeatures')
```

## 📊 Data Management

### Development Data
- **Source**: Local Firebase (`voxxy-presents-dev`)
- **Population**: `npm run seed:dev`
- **Reset**: Clear Firebase project and re-seed

### Staging Data  
- **Source**: Production mirror
- **Sync**: `npm run sync:staging` (copies production data)
- **Frequency**: Before deployments or on-demand
- **Benefits**: Test with real data without affecting production

### Production Data
- **Source**: Live API + Firebase
- **Management**: Admin dashboard + API
- **Backup**: Automated Firebase backups
- **Access**: Role-based permissions

### Sandbox Data
- **Source**: Independent Firebase (`voxxy-presents-sandbox`) 
- **Purpose**: Experimental data that doesn't affect other environments
- **Management**: Full admin access for experimentation

## 🛡️ Security & Access

### Environment Access
- **Development**: Full local access
- **Staging**: Team access for testing
- **Production**: Role-based admin access
- **Sandbox**: Experimental access

### API Keys & Secrets
- Separate Firebase projects per environment
- Environment-specific API endpoints
- Secrets managed through hosting platform
- No sensitive data in git repository

## 📈 Monitoring & Rollbacks

### Staging Monitoring
- Test all admin functions
- Verify data transformations
- Check API integrations

### Production Monitoring
- Real-time error tracking
- Performance monitoring
- User analytics

### Rollback Strategy
- Git tag-based releases
- Quick rollback to previous version
- Database state management
- Cache invalidation

## 🔄 Data Synchronization

### Staging Sync Process
```bash
# Manual sync
npm run sync:staging

# Automated sync (in CI/CD)
# - Triggered before staging deployments
# - Runs nightly for fresh test data
# - Preserves staging-specific test data
```

### Sync Safety
- Read-only access to production data
- Staging data is completely replaced (not merged)
- No reverse sync (staging → production)
- Sync logs for troubleshooting

## 🔧 Admin Dashboard Features

### Organization Management
Each organization has a dedicated admin dashboard at `/{org-slug}/admin`:

**Brooklyn Hearts Club**: `/brooklyn-hearts-club/admin`
**Voxxy Presents NYC**: `/voxxy-presents-nyc/admin`

### Admin Capabilities by Environment

| Feature | Development | Staging | Production | Sandbox |
|---------|-------------|---------|------------|---------|
| **Organization Editing** | ✅ Full Access | ✅ Testing Only | ✅ Role-Based | ✅ Full Access |
| **Real-time Updates** | ✅ Firebase Direct | ✅ API Updates | ✅ API Updates | ✅ Firebase Direct |
| **Data Persistence** | ✅ Immediate | ✅ Production Mirror | ✅ Live Data | ✅ Independent |
| **Preview Mode** | ✅ Available | ✅ Available | ✅ Available | ✅ Available |

### Admin Interface Sections
- **Organization**: Branding, contact info, social links, theme settings
- **Events**: Event management and creation (framework ready)
- **Registrations**: Attendee management (framework ready)  
- **Analytics**: Performance insights (framework ready)

### Data Persistence Strategy
- **Development/Sandbox**: Direct Firebase writes for immediate testing
- **Staging/Production**: API-based updates with proper validation
- **Real-time Preview**: Changes appear immediately on public pages
- **Error Handling**: Comprehensive feedback and rollback capabilities

This strategy ensures clean separation between environments while maintaining production-like testing capabilities, supporting experimental development, and providing robust admin functionality for organization management.