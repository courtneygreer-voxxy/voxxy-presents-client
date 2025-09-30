# Environment Management Scripts

Automated scripts for managing Firebase data across environments.

## Quick Commands

```bash
# Complete environment refresh (cleanup + seed)
npm run refresh-env staging
npm run refresh-env production

# Individual operations
npm run cleanup-data staging    # Clear all data
npm run seed-data staging      # Add test accounts/data
```

## Test Accounts Created

After running `refresh-env` or `seed-data`, you'll have these ready-to-use accounts:

### Venue Owner
- **Email**: `venue-test@voxxypresents.com`
- **Password**: `VenueTest123!`
- **Includes**: Pre-approved "Brooklyn Loft" venue

### Organization Owner
- **Email**: `org-test@voxxypresents.com`
- **Password**: `OrgTest123!`
- **Includes**: "Test Events Co" organization with sample event

### Admin
- **Email**: `admin-test@voxxypresents.com`
- **Password**: `AdminTest123!`
- **Access**: Full admin dashboard access

## Setup Requirements

1. **Service Account Keys**: Place Firebase service account JSON files in `./config/`:
   - `voxxy-presents-staging-service-account.json`
   - `voxxy-presents-production-service-account.json`

2. **Dependencies**: Scripts use `tsx` for TypeScript execution and `firebase-admin`

## Usage Examples

### Staging Deployment
```bash
# Before deploying to staging
npm run refresh-env staging
# Deploy your code
# Test with clean data
```

### Production Deployment
```bash
# For production launch (use carefully!)
npm run refresh-env production
```

### Development Testing
```bash
# Just add test data to existing environment
npm run seed-data staging
```

## Safety Features

- **Confirmation prompts** for destructive operations
- **Environment validation** to prevent accidents
- **Batch operations** for performance
- **Error handling** with detailed logging
- **Test data flagging** (isTestData: true)

## What Gets Created

### Venues
- Brooklyn Loft (approved, ready for events)

### Organizations
- Test Events Co (with sample wine tasting event)

### Events
- Community Wine Tasting (2 weeks from run date)

### User Profiles
- Complete user profiles with proper roles
- Email verification enabled
- Beta access granted
- Approval status set

All test data is flagged with `isTestData: true` for easy identification and future cleanup.