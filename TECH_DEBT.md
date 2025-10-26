# Tech Debt & Future Improvements

**Last Updated**: October 26, 2025

This document tracks technical debt, known issues, and future improvement opportunities for Voxxy Presents.

---

## 🔴 Critical Security Issues

### 1. CORS Configuration - Wide Open
**File**: `voxxy-presents-api/src/app.ts:27-40`
**Issue**: API has `origin: true` allowing ALL origins with credentials enabled
**Risk**: High - Exposes API to CSRF attacks and unauthorized access
**Fix**: Whitelist specific domains only
```typescript
// Current (INSECURE):
origin: true

// Should be:
origin: ['https://voxxypresents.com', 'https://www.voxxypresents.com']
```

### 2. Hardcoded Admin Key Fallback
**File**: `voxxy-presents-client/src/services/api.ts:27`
**Issue**: Admin key defaults to `'voxxy-admin-2024'` if env var missing
**Risk**: High - Production vulnerability if env var not set
**Fix**: Remove fallback, throw error if missing

### 3. Firebase Config - No Validation
**File**: `voxxy-presents-client/src/lib/firebase.ts:6-14`
**Issue**: Firebase config read from env without validation
**Risk**: Medium - Could fail silently in production
**Fix**: Add runtime validation for required env vars

---

## 🟡 Medium Priority Issues

### 4. No Input Validation (Zod)
**Files**: Throughout client and API
**Issue**: Zod is installed but not used - no runtime validation
**Risk**: Medium - Data corruption, injection attacks
**Impact**: API accepts `any` types, forms have no schema validation
**Fix**:
- Add Zod schemas for all API endpoints
- Add form validation schemas
- Validate database writes

### 5. Inconsistent Error Handling
**Files**: Throughout codebase
**Issue**: Mixed error patterns (179 try-catch, only 2 .catch())
**Risk**: Medium - Silent failures, poor UX
**Examples**:
- Auth errors logged but not surfaced
- Cache failures are silent
- Production errors expose internal details
**Fix**: Implement consistent error handling strategy

### 6. No Test Coverage
**Files**: `package.json:9` (API), various test files
**Issue**: API test script just echoes error, no actual tests run
**Risk**: Medium - No safety net for changes
**Fix**:
- Implement Jest/Vitest test suite
- Add integration tests for critical paths
- Set up CI/CD test gates

### 7. Excessive Console Logging
**Files**: 361 console statements across 69 files
**Issue**: Debug logging includes request bodies in production
**Risk**: Low-Medium - Performance impact, data leakage
**Fix**:
- Replace with proper logging library (Winston/Pino)
- Remove debug logs from production builds
- Use environment-based log levels

### 8. "Latest" Version Dependencies
**File**: `voxxy-presents-client/package.json:38-92`
**Issue**: 20+ Radix UI packages pinned to `"latest"`
**Risk**: Medium - Non-deterministic builds, unexpected breaking changes
**Fix**: Lock to specific versions

---

## 🟢 Low Priority / Nice to Have

### 9. Dual Data Source Complexity
**File**: `voxxy-presents-client/src/config/environments.ts:74-113`
**Issue**: System uses both Firebase and API as data sources
**Impact**: Complex routing logic, increased chance of data inconsistency
**Fix**: Consolidate to single data source (prefer API over Firebase)

### 10. Module Mismatches
**Files**: tsconfig files
**Issue**:
- Client uses ESNext modules
- API uses CommonJS
- Zod version mismatch (client: 3.24.1, API: 4.0.14)
**Fix**: Align module systems and dependency versions

### 11. Environment Detection Fragility
**File**: `voxxy-presents-client/src/config/environments.ts:118-150`
**Issue**: Relies on hostname parsing, cached after first check
**Fix**: Use explicit environment variables

### 12. No Health Check Monitoring
**Files**: API health endpoint exists but unused
**Issue**: No active monitoring or alerting
**Fix**: Implement health check monitoring and alerts

### 13. Firebase Direct Access Pattern
**Files**: Throughout client
**Issue**: Client directly accesses Firestore in many places
**Risk**: Could hit Firebase quota limits, expensive reads at scale
**Fix**: Route all data access through API

### 14. No Rate Limiting
**Files**: API endpoints
**Issue**: No rate limiting middleware
**Risk**: Vulnerable to DoS attacks
**Fix**: Add rate limiting (express-rate-limit)

---

## 📝 Recent Improvements (October 26, 2025)

### ✅ Completed
- Removed RSVP functionality (simplified to calendar clicks)
- Redesigned subscription modal (email OR phone, animated)
- Fixed subscriber list filtering by organization
- Fixed duplicate subscription bug
- Removed undefined field errors in Firebase writes
- Added QR code for subscriber signups
- Removed ticket validation tab
- Changed Budget button from green to purple
- Removed tagline field (simplified public page)
- **CRM Table View**: Professional table with Email & Phone columns
- **No Duplicate Restrictions**: Allow multiple signups, manual cleanup

---

## 🎯 Future Feature Roadmap

### Phase 1: CRM Enhancements
- [ ] Search/filter subscribers by name, email, phone
- [ ] Sort columns (name, date, contact method)
- [ ] Bulk actions (select multiple, delete, export)
- [ ] Subscriber segments (tags, groups)
- [ ] Import subscribers from CSV

### Phase 2: Communication
- [ ] Broadcast announcements (implemented but needs testing)
- [ ] SMS integration for phone subscribers
- [ ] Email templates and campaigns
- [ ] Unified messaging (check method, send via email/SMS)
- [ ] Message history and analytics

### Phase 3: Analytics
- [ ] Subscriber growth charts
- [ ] Event attendance tracking
- [ ] Conversion funnels (QR → Subscribe)
- [ ] Engagement metrics
- [ ] Calendar click tracking dashboard

### Phase 4: Advanced Features
- [ ] Automated event reminders
- [ ] Waitlist management
- [ ] Tiered subscription levels
- [ ] Subscriber preferences center
- [ ] Integration with calendar platforms

---

## 🛠️ Development Workflow Improvements

### Needed
- [ ] Implement proper Git branch strategy
- [ ] Set up staging environment
- [ ] Add pre-commit hooks (linting, type checking)
- [ ] Implement automated testing in CI/CD
- [ ] Add error tracking (Sentry)
- [ ] Set up monitoring (Datadog, New Relic)
- [ ] Document API endpoints (OpenAPI/Swagger)

---

## 📚 Documentation Gaps

### Missing Documentation
- [ ] API endpoint documentation
- [ ] Database schema documentation
- [ ] Environment setup guide for new developers
- [ ] Deployment runbook
- [ ] Rollback procedures
- [ ] Common troubleshooting guide

---

## 🔧 Quick Wins (Easy Fixes)

1. Lock dependency versions (remove "latest")
2. Add environment variable validation
3. Remove hardcoded admin key fallback
4. Add basic API endpoint tests
5. Implement proper logging library
6. Add health check monitoring
7. Remove debug console.logs from production

---

## 📞 Notes for Senior Engineer

When the senior full-stack engineer joins:

**Priority Order:**
1. Fix CORS and security issues (Week 1)
2. Add Zod validation for critical endpoints (Week 1-2)
3. Implement test suite (Week 2-3)
4. Fix dependency versions and error handling (Week 3)
5. Add monitoring and alerting (Week 4)

**Context:**
- Project is in active use for events
- Subscribers page is critical user-facing feature
- QR code feature is being used at live events
- Event producer is main customer focus

