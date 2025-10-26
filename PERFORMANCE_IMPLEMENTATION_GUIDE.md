# Performance Implementation Guide

**Quick Reference for Long-Term Performance Fixes**

This guide outlines the specific implementation steps for the long-term performance optimizations we're about to implement.

---

## 🎯 Implementation Overview

We're implementing these major optimizations:

1. **Loading UI States** - Eliminate "frozen" screens during auth/navigation
2. **Request Deduplication** - Prevent duplicate API calls
3. **Lazy Loading** - Load events on-demand instead of eagerly
4. **CDN Caching** - Cache public pages at the edge
5. **Performance Monitoring** - Track real-world performance

---

## 📋 Implementation Checklist

### Phase 1: Loading UI & Skeleton States

- [ ] Add loading transition screen after login
- [ ] Add skeleton loaders to dashboard
- [ ] Add skeleton loaders to public pages
- [ ] Add skeleton loaders to subscribe page
- [ ] Ensure loading states show for minimum 200ms (avoid flash)

### Phase 2: Request Optimization

- [ ] Implement request deduplication (React Query or manual)
- [ ] Make events loading lazy (scroll-triggered or on-demand)
- [ ] Parallelize organization + events loading where possible
- [ ] Add request caching layer (5-minute cache for public data)

### Phase 3: CDN & Caching

- [ ] Add cache headers to API responses for public org data
- [ ] Configure Render/Firebase Hosting CDN rules
- [ ] Implement cache invalidation strategy
- [ ] Test cache behavior (cold vs warm)

### Phase 4: Performance Monitoring

- [ ] Integrate Mixpanel performance events (or Sentry)
- [ ] Track page load times
- [ ] Track API response times
- [ ] Track user journey completion times
- [ ] Set up performance alerts

### Phase 5: Testing & Validation

- [ ] Run baseline tests
- [ ] Run final tests
- [ ] Generate comparison report
- [ ] Complete manual test cases
- [ ] Complete pre-deployment checklist

---

## 🛠️ Specific Code Changes

### 1. Add Loading Transition After Login

**File**: `src/components/auth/ProtectedRouteV2.tsx` (or similar)

**Current Problem**: After login succeeds, user sees frozen screen for 5 seconds before dashboard appears.

**Solution**: Add intermediate loading screen during role-based redirect.

```typescript
// Add new component: LoadingTransition.tsx
import { Loader } from 'lucide-react'

export function LoadingTransition({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f172a] flex items-center justify-center">
      <div className="text-center">
        <Loader className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
        <p className="text-white text-xl font-semibold">{message}</p>
        <p className="text-gray-300 text-sm mt-2">This will only take a moment...</p>
      </div>
    </div>
  )
}
```

**Usage in App.tsx**:
```typescript
// In RoleBasedDashboardRedirect component
function RoleBasedDashboardRedirect() {
  const { userProfile } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(true)

  useEffect(() => {
    // Give minimum 200ms to show loading state
    const timer = setTimeout(() => setIsRedirecting(false), 200)
    return () => clearTimeout(timer)
  }, [])

  if (!userProfile || isRedirecting) {
    return <LoadingTransition message="Taking you to your dashboard..." />
  }

  // ... rest of redirect logic
}
```

---

### 2. Add Skeleton Loaders to Dashboard

**File**: `src/components/profile/ClubsManagement.tsx`

**Current Problem**: Shows generic "Loading..." text while clubs load.

**Solution**: Replace with skeleton cards.

```typescript
// Add skeleton component
function ClubCardSkeleton() {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <div className="h-6 bg-white/20 rounded animate-pulse w-3/4 mb-2" />
        <div className="h-4 bg-white/20 rounded animate-pulse w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 bg-white/20 rounded animate-pulse w-full" />
          <div className="h-4 bg-white/20 rounded animate-pulse w-5/6" />
        </div>
      </CardContent>
    </Card>
  )
}

// In ClubsManagement component
if (isLoading) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <ClubCardSkeleton key={i} />
      ))}
    </div>
  )
}
```

---

### 3. Make Events Loading Lazy

**File**: `src/hooks/useOrganization.ts`

**Current Problem**: Events load immediately with organization, even if not needed.

**Solution**: Default to `loadEvents: false`, load on-demand.

```typescript
// Change default behavior
export function useOrganization(
  organizationSlug: string,
  options: UseOrganizationOptions = {}
) {
  const { loadEvents = false } = options  // Changed from true to false

  // ... rest of hook
}
```

**Update OrganizationPage.tsx**:
```typescript
export default function OrganizationPage({ organizationSlug }: Props) {
  const {
    organization,
    events,
    loading,
    loadEventsOnDemand
  } = useOrganization(organizationSlug, { loadEvents: false })  // Don't load events initially

  // Load events when user scrolls to events section or clicks tab
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadEventsOnDemand()  // Trigger event loading
      }
    })

    const eventsSection = document.getElementById('events-section')
    if (eventsSection) {
      observer.observe(eventsSection)
    }

    return () => observer.disconnect()
  }, [loadEventsOnDemand])

  // ... rest of component
}
```

---

### 4. Add Request Deduplication

**Option A: Manual Deduplication (Simpler)**

Create a request cache:

```typescript
// src/utils/requestCache.ts
const cache = new Map<string, { promise: Promise<any>, timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function dedupeRequest<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now()
  const cached = cache.get(key)

  // Return cached promise if still valid
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    console.log(`🔄 Using cached request: ${key}`)
    return cached.promise
  }

  // Create new request and cache it
  console.log(`🌐 New request: ${key}`)
  const promise = fetcher()
  cache.set(key, { promise, timestamp: now })

  // Clear cache entry after duration
  setTimeout(() => cache.delete(key), CACHE_DURATION)

  return promise
}
```

**Usage in useOrganization**:
```typescript
import { dedupeRequest } from '@/utils/requestCache'

const loadData = useCallback(async () => {
  const org = await dedupeRequest(
    `org:${organizationSlug}`,
    () => organizationsApi.getBySlug(organizationSlug)
  )
  setOrganization(org)
}, [organizationSlug])
```

**Option B: React Query (More Robust)**

```bash
npm install @tanstack/react-query
```

```typescript
// src/hooks/useOrganization.ts
import { useQuery } from '@tanstack/react-query'

export function useOrganization(organizationSlug: string) {
  const { data: organization, isLoading } = useQuery({
    queryKey: ['organization', organizationSlug],
    queryFn: () => organizationsApi.getBySlug(organizationSlug),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })

  return { organization, loading: isLoading }
}
```

---

### 5. Add CDN Cache Headers

**File**: `voxxy-presents-api/src/routes/organizations.ts` (API side)

**Current Problem**: Public org data has no cache headers, fetched fresh every time.

**Solution**: Add cache headers for public endpoints.

```typescript
// For GET /organizations/:slug endpoint (public data)
router.get('/organizations/:slug', async (req, res) => {
  const { slug } = req.params

  try {
    const org = await getOrganizationBySlug(slug)

    if (!org) {
      return res.status(404).json({ error: 'Organization not found' })
    }

    // Add cache headers for CDN
    res.set({
      'Cache-Control': 'public, max-age=300, s-maxage=600', // 5 min browser, 10 min CDN
      'ETag': `"${org.id}-${org.updatedAt}"`, // Enable conditional requests
      'Vary': 'Accept-Encoding'
    })

    res.json(org)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch organization' })
  }
})
```

**Configure Render CDN** (in `render.yaml` or dashboard):
```yaml
services:
  - type: web
    name: voxxy-presents-api
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    headers:
      - path: /api/organizations/*
        name: Cache-Control
        value: public, max-age=300, s-maxage=600
```

---

### 6. Add Performance Monitoring

**Option: Mixpanel (Already integrated)**

Add performance tracking to key pages:

```typescript
// src/utils/performanceTracking.ts
import { analytics } from '@/lib/analytics'

export function trackPageLoad(pageName: string, loadTime: number) {
  analytics.track('page_load_performance', {
    page: pageName,
    load_time_ms: loadTime,
    timestamp: new Date().toISOString()
  })
}

// Automatic page load tracking
export function usePageLoadTracking(pageName: string) {
  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const loadTime = performance.now() - startTime
      trackPageLoad(pageName, loadTime)
    }
  }, [pageName])
}
```

**Usage in OrganizationPage**:
```typescript
export default function OrganizationPage({ organizationSlug }: Props) {
  usePageLoadTracking(`public_org_page:${organizationSlug}`)

  // ... rest of component
}
```

**Track API calls**:
```typescript
// Wrap API calls with timing
async function fetchWithTiming<T>(
  name: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const startTime = performance.now()

  try {
    const result = await fetcher()
    const duration = performance.now() - startTime

    analytics.track('api_call_performance', {
      endpoint: name,
      duration_ms: duration,
      status: 'success'
    })

    return result
  } catch (error) {
    const duration = performance.now() - startTime

    analytics.track('api_call_performance', {
      endpoint: name,
      duration_ms: duration,
      status: 'error'
    })

    throw error
  }
}
```

---

## 🧪 Testing After Each Phase

### Quick Test Commands

```bash
# After making changes, test locally
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run Lighthouse on preview
lighthouse http://localhost:4173 --view
```

### Test Each Feature

**After Phase 1 (Loading UI)**:
- [ ] Login and verify loading screen appears
- [ ] Dashboard should show skeletons while loading clubs
- [ ] No frozen screens

**After Phase 2 (Request Deduplication)**:
- [ ] Open DevTools → Network tab
- [ ] Navigate to public page, then refresh
- [ ] Verify no duplicate requests for same resource

**After Phase 3 (Lazy Loading)**:
- [ ] Open public page
- [ ] Verify organization info loads immediately
- [ ] Verify events only load when scrolling to events section

**After Phase 4 (CDN Caching)**:
- [ ] Deploy to staging
- [ ] Check response headers include `Cache-Control`
- [ ] Second visit should be < 500ms

**After Phase 5 (Monitoring)**:
- [ ] Navigate through app
- [ ] Check Mixpanel dashboard for performance events
- [ ] Verify all key pages are tracked

---

## 📊 Success Validation

After all phases complete, run full test suite:

```bash
# 1. Capture baseline (if not done already)
./tests/scripts/run-baseline-tests.sh

# 2. Deploy optimizations

# 3. Run final tests
./tests/scripts/run-final-tests.sh

# 4. Generate comparison
node ./tests/scripts/compare-results.js

# 5. Complete manual tests
# Follow tests/manual/manual-test-cases.md

# 6. Complete pre-deployment checklist
# Follow tests/PRE_DEPLOYMENT_CHECKLIST.md
```

---

## 🚨 Rollback Plan

If performance degrades or issues arise:

```bash
# Revert to previous commit
git log --oneline  # Find last good commit
git revert <commit-hash>

# Or checkout previous version
git checkout <previous-tag>

# Redeploy
npm run build
# Deploy to Render
```

**Always test in staging first!**

---

## 📈 Expected Results

After all optimizations:

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Login → Dashboard | 5s (frozen) | < 1s (with UI) | ✅ |
| Public Page (cold) | 2-4s | < 1.5s | ✅ |
| Public Page (warm) | 2-4s | < 500ms | ✅ |
| Subscribe Page | 2-4s | < 1.5s | ✅ |
| Dashboard Clubs | 3-5s | < 800ms | ✅ |
| Lighthouse Score | ~70-80 | > 90 | ✅ |

---

## 🎓 Best Practices

1. **Test locally first** - Always verify changes work before pushing
2. **Deploy to staging** - Never deploy directly to production
3. **Monitor after deploy** - Watch error rates and performance metrics
4. **Document as you go** - Update TECH_DEBT.md with completed items
5. **Commit frequently** - Small commits are easier to debug and revert

---

## 🆘 Troubleshooting

### Issue: Skeleton loaders flicker (too fast)
**Solution**: Add minimum display time:
```typescript
const [showSkeleton, setShowSkeleton] = useState(true)

useEffect(() => {
  if (!loading) {
    setTimeout(() => setShowSkeleton(false), 200)  // Min 200ms
  }
}, [loading])
```

### Issue: Cache not working
**Solution**: Check response headers in DevTools:
```
Cache-Control: public, max-age=300
```
If missing, API not sending headers correctly.

### Issue: Duplicate requests still happening
**Solution**: Check request cache logic and console logs. Ensure cache key is consistent.

---

**Good luck! 🚀**

When you're ready to start implementation, work through each phase systematically. Test after each phase before moving to the next.
