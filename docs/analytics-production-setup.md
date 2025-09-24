# Analytics Production Setup

## Production-Only Tracking Configuration

Analytics tracking has been configured to **only run in production environment** to:
- Avoid polluting production data with development/testing activities
- Maintain data quality and accuracy for GTM insights
- Reduce Mixpanel usage costs during development

## Configuration Details

### Mixpanel Credentials
- **Project Token**: `3a0b59ad74eb6f0b0f5947adbbf947a4`
- **API Key**: `15688daea8855e34ab6537425fab077f` (for server-side operations if needed)
- **Environment**: Production only (`VITE_ENVIRONMENT=production`)

### Environment Logic
```typescript
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT;
const isProductionEnvironment = ENVIRONMENT === 'production';

// Analytics only enabled when:
// 1. MIXPANEL_TOKEN is set
// 2. VITE_ENVIRONMENT === 'production'
const isEnabled = !!MIXPANEL_TOKEN && isProductionEnvironment;
```

### Environment Files

#### ✅ Production (.env.production)
```bash
VITE_ENVIRONMENT=production
VITE_MIXPANEL_TOKEN=3a0b59ad74eb6f0b0f5947adbbf947a4
# Analytics ENABLED - tracks real user interactions
```

#### 🚫 Development (.env.development)
```bash
VITE_ENVIRONMENT=development
# VITE_MIXPANEL_TOKEN=<not set or different token>
# Analytics DISABLED - no events sent to Mixpanel
```

#### 🚫 Staging (.env.staging)
```bash
VITE_ENVIRONMENT=staging
VITE_MIXPANEL_TOKEN=your-mixpanel-staging-token-here
# Analytics DISABLED - staging data separate from production
```

## Testing the Setup

### Development/Staging Environment
- Visit `/analytics-test`
- Console will show: "Analytics disabled - development/staging environment"
- Test buttons will trigger events but nothing sent to Mixpanel
- UI shows "Analytics Enabled: No (Non-Production)"

### Production Environment
- Visit `/analytics-test`
- Console will show: "Mixpanel analytics initialized for production environment"
- Test buttons will send real events to Mixpanel
- UI shows "Analytics Enabled: Yes (Production Only)"

## Console Messages for Debugging

### Development
```
Analytics disabled - development environment
```

### Staging
```
Analytics disabled - staging environment
```

### Production (Success)
```
Mixpanel analytics initialized for production environment
```

### Production (Error)
```
Mixpanel token not found. Analytics tracking disabled.
```

## Deployment Checklist

### Before Production Deploy
1. ✅ Confirm `.env.production` has `VITE_ENVIRONMENT=production`
2. ✅ Confirm `.env.production` has `VITE_MIXPANEL_TOKEN=3a0b59ad74eb6f0b0f5947adbbf947a4`
3. ✅ Build with production environment: `npm run build:production`
4. ✅ Deploy to production hosting

### After Production Deploy
1. ✅ Visit `/analytics-test` on production URL
2. ✅ Verify "Analytics Enabled: Yes (Production Only)"
3. ✅ Click test buttons and verify events in Mixpanel dashboard
4. ✅ Check browser console for "Mixpanel analytics initialized" message

## Data Privacy & Compliance

### GDPR Compliance
- Uses EU Mixpanel endpoint: `https://api-eu.mixpanel.com`
- No PII stored in event properties
- User consent can be managed through localStorage flags

### Data Quality
- Production-only tracking ensures clean, actionable data
- Development activities don't skew user behavior metrics
- Testing and debugging isolated from real user analytics

## Mixpanel Dashboard Access
- Project Token: `3a0b59ad74eb6f0b0f5947adbbf947a4`
- API Key: `15688daea8855e34ab6537425fab077f`
- Dashboard URL: https://mixpanel.com/project/YOUR_PROJECT_ID

## Troubleshooting

### No Events in Mixpanel
1. Check environment variable: `VITE_ENVIRONMENT=production`
2. Check Mixpanel token is set correctly
3. Verify production build and deployment
4. Check browser console for initialization message
5. Use `/analytics-test` page to verify setup

### Events in Development
If you see analytics events firing in development:
1. Check `.env.development` doesn't have production token
2. Verify `VITE_ENVIRONMENT` is not set to "production"
3. Check console messages for environment detection

## Security Notes
- Mixpanel tokens are public-facing (safe to expose in frontend)
- API key should be kept secure for server-side operations
- Production token only works with approved domains (configure in Mixpanel dashboard)