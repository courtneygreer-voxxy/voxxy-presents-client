# Email Scheduling Timezone Fix - April 30, 2026

## Executive Summary

Fixed critical timezone bugs in email scheduling system that caused:

1. **Date Calculation Bug**: "3 days before" and "4 days before" triggers calculating same scheduled date
2. **Timezone Mismatch Bug**: Emails sending at wrong times for organizations outside Eastern timezone
3. **Double Conversion Bug**: Frontend and backend both converting timezones, causing 5-hour offsets

## Bug Reports

### Bug #1: Duplicate Scheduled Dates

**Symptom**: "Added a reminder for 4 days somehow had the same scheduled date as 3 days away reminder"

**Root Cause**: Frontend used `date-fns` library (not timezone-aware) for date arithmetic instead of Luxon

**Impact**: Different trigger values could calculate to the same datetime when combined with DST transitions

### Bug #2: Wrong Send Times for Non-Eastern Organizations

**Symptom**: Emails sending at incorrect times

**Root Cause**: Backend hardcoded `"America/New_York"` timezone despite organizations having configurable `timezone` field (default: `"America/Los_Angeles"`)

**Impact**: Pacific timezone organizations received emails 3 hours early (5 AM Pacific instead of 8 AM Pacific)

### Bug #3: Double Timezone Conversion

**Symptom**: Emails sending 5 hours off from intended time

**Root Cause**:

- Frontend converted "8:00 AM" local time → UTC before sending to API
- Backend received UTC time and converted again from Eastern → UTC
- Result: Double conversion caused massive time offset

**Impact**: Pacific users wanting 8 AM emails got them at 1 PM Pacific (9 PM UTC)

---

## Fixes Implemented

### Frontend Fixes (voxxy-presents-client)

**Branch**: `fix/email-scheduling-date-calculation`

#### Fix 1: Replace date-fns with Luxon for Date Arithmetic

**Files Modified**:

- `src/components/producer/Email/EditScheduledEmailModal.tsx`
- `src/components/producer/Email/EmailEditorPage.tsx`

**Changes**:

```typescript
// BEFORE (❌ Buggy - date-fns is not timezone-aware)
import { format, addDays, subDays, parseISO } from 'date-fns'

baseDate = parseISO(eventData.dates.start) // Parses as local midnight
scheduledDate = subDays(baseDate, days) // Timezone-naive arithmetic

// AFTER (✅ Fixed - Luxon is timezone-aware)
import { DateTime } from 'luxon'

// Parse as UTC to match backend behavior for date-only fields
baseDate = DateTime.fromISO(eventData.dates.start, { zone: 'utc' })
scheduledDate = baseDate.minus({ days }) // Timezone-safe arithmetic
```

**Why This Works**:

- Luxon explicitly handles timezones
- Parsing as UTC prevents timezone shifting for date-only fields
- Arithmetic is consistent regardless of browser timezone or DST

#### Fix 2: Stop Converting Trigger Time to UTC

**Files Modified**:

- `src/components/producer/Email/EditScheduledEmailModal.tsx` (line 346)
- `src/components/producer/Email/EmailEditorPage.tsx` (line 542)

**Changes**:

```typescript
// BEFORE (❌ Double conversion bug)
const triggerTimeUtc = getEightAmLocalAsUTC();  // "08:00" PST → "16:00" UTC
trigger_time: triggerTimeUtc,                    // Sends "16:00" to backend

// AFTER (✅ Send plain time)
const triggerTime = "08:00";                     // Plain "08:00"
trigger_time: triggerTime,                       // Backend handles timezone
```

**Why This Works**:

- Backend knows organization's timezone setting
- Backend converts "08:00" in org timezone → UTC for storage
- No double conversion

#### Fix 3: Update UI Text

**File**: `src/components/producer/Email/EditScheduledEmailModal.tsx`

**Changes**:

- Changed "8:00 AM in your timezone" → "8:00 AM in your organization's timezone"
- Removed browser timezone detection from UI (no longer relevant)
- Updated comments to reflect backend handles timezone conversion

---

### Backend Fixes (voxxy-rails)

**Branch**: (create new branch)

#### Fix: Use Organization Timezone Instead of Hardcoded Eastern

**File Modified**:

- `app/services/email_schedule_calculator.rb` (lines 141-146)

**Changes**:

```ruby
# BEFORE (❌ Hardcoded Eastern timezone)
Time.use_zone("America/New_York") do
  Time.zone.local(date.year, date.month, date.day, hour, minute, 0)
end

# AFTER (✅ Use organization's timezone)
org_timezone = event.organization.timezone || "America/New_York"

Time.use_zone(org_timezone) do
  Time.zone.local(date.year, date.month, date.day, hour, minute, 0)
end
```

**Why This Works**:

- Organizations have `timezone` field in database (default: "America/Los_Angeles")
- Respects each organization's configured timezone
- Falls back to Eastern if timezone not set (backwards compatible)
- Rails automatically converts to UTC for database storage

---

## Technical Details

### Date/Time Flow (Before Fix)

```
User (Pacific timezone) creates email
    ↓
Event date: "2025-06-15" (date-only string)
    ↓
Frontend parseISO() → 2025-06-15T00:00:00-07:00 (midnight Pacific)
    ↓
Frontend subDays(baseDate, 3) → June 12 (but time preserved)
    ↓
Frontend getEightAmLocalAsUTC() → "16:00" UTC
    ↓
API receives: trigger_time = "16:00"
    ↓
Backend interprets "16:00" as 4:00 PM Eastern
    ↓
Backend converts to UTC: 21:00 UTC (9 PM UTC)
    ↓
Database stores: scheduled_for = "2025-06-12 21:00:00 UTC"
    ↓
Email sends at: 9 PM UTC = 1 PM Pacific (5 hours late!)
```

### Date/Time Flow (After Fix)

```
User (Pacific timezone) creates email
    ↓
Event date: "2025-06-15" (date-only string)
    ↓
Frontend DateTime.fromISO(date, { zone: 'utc' }) → 2025-06-15T00:00:00Z (UTC)
    ↓
Frontend baseDate.minus({ days: 3 }) → 2025-06-12T00:00:00Z (UTC)
    ↓
Frontend sends: trigger_time = "08:00" (plain string)
    ↓
API receives: trigger_time = "08:00"
    ↓
Backend reads org timezone: "America/Los_Angeles"
    ↓
Backend: Time.use_zone("America/Los_Angeles") { Time.zone.local(2025, 6, 12, 8, 0, 0) }
    ↓
Backend result: 2025-06-12 08:00:00 PDT
    ↓
Rails converts to UTC: 2025-06-12 15:00:00 UTC (8 AM PDT = 3 PM UTC)
    ↓
Database stores: scheduled_for = "2025-06-12 15:00:00 UTC"
    ↓
Email sends at: 3 PM UTC = 8 AM Pacific (correct!)
```

---

## Testing Examples

### Test Case 1: Pacific Timezone Organization

**Setup**:

- Organization timezone: "America/Los_Angeles" (Pacific)
- Event date: June 15, 2025
- Create email: "3 days before event at 08:00"

**Expected Calculation**:

- Scheduled date: June 12, 2025
- Scheduled time: 8:00 AM Pacific
- Database value: `2025-06-12 15:00:00 UTC` (8 AM PDT in summer)

**Verification**:

```sql
SELECT id, name, scheduled_for, trigger_type, trigger_value
FROM scheduled_emails
WHERE event_id = <event_id>;

-- Expected result:
-- scheduled_for: 2025-06-12 15:00:00 (UTC)
-- In Pacific time: 2025-06-12 08:00:00 PDT
```

### Test Case 2: Eastern Timezone Organization

**Setup**:

- Organization timezone: "America/New_York" (Eastern)
- Event date: June 15, 2025
- Create email: "3 days before event at 08:00"

**Expected Calculation**:

- Scheduled date: June 12, 2025
- Scheduled time: 8:00 AM Eastern
- Database value: `2025-06-12 12:00:00 UTC` (8 AM EDT in summer)

### Test Case 3: Daylight Saving Time Boundary

**Setup**:

- Organization timezone: "America/Los_Angeles"
- Event date: March 15, 2025 (after DST starts)
- Create email: "3 days before event at 08:00"

**Expected Calculation**:

- Scheduled date: March 12, 2025
- Scheduled time: 8:00 AM PDT (Pacific Daylight Time)
- Database value: `2025-03-12 15:00:00 UTC` (PDT = UTC-7)

**Contrast with Winter**:

- If event in January: 8:00 AM PST = UTC-8 → `16:00:00 UTC`
- If event in June: 8:00 AM PDT = UTC-7 → `15:00:00 UTC`
- System handles DST automatically via timezone libraries

### Test Case 4: Different Trigger Values

**Setup**:

- Organization timezone: "America/Los_Angeles"
- Event date: June 15, 2025

**Create two emails**:

1. "3 days before event at 08:00"
2. "4 days before event at 08:00"

**Expected Results**:

- Email 1: `2025-06-12 15:00:00 UTC` (June 12 at 8 AM Pacific)
- Email 2: `2025-06-11 15:00:00 UTC` (June 11 at 8 AM Pacific)

**Verification**: scheduled_for values should differ by exactly 24 hours (86400 seconds)

---

## Database Schema Reference

### scheduled_emails Table

```ruby
create_table "scheduled_emails" do |t|
  t.bigint "event_id", null: false
  t.string "trigger_type"         # "days_before_event", etc.
  t.integer "trigger_value"        # Number of days (can be 0)
  t.time "trigger_time"            # Time of day (e.g., "08:00")
  t.datetime "scheduled_for"        # Calculated send time (stored in UTC)
  # ...
end
```

### events Table

```ruby
create_table "events" do |t|
  t.datetime "event_date"            # Event start date/time
  t.datetime "application_deadline"  # Application deadline
  t.date "payment_deadline"          # Payment deadline (date only)
  # ...
end
```

### organizations Table

```ruby
create_table "organizations" do |t|
  t.string "timezone", default: "America/Los_Angeles"
  # ...
  t.index ["timezone"], name: "index_organizations_on_timezone"
end
```

---

## Verification Steps

### Frontend Verification

1. **TypeScript compilation**:

   ```bash
   cd /Users/beaulazear/Desktop/voxxy-presents-client
   npm run typecheck
   ```

   Expected: No errors (✅ Verified)

2. **Luxon import check**:

   ```bash
   grep -r "import.*DateTime.*from.*luxon" src/components/producer/Email/
   ```

   Expected: Found in EditScheduledEmailModal.tsx and EmailEditorPage.tsx

3. **No UTC conversion**:
   ```bash
   grep -r "getEightAmLocalAsUTC" src/components/producer/Email/
   ```
   Expected: No results (removed from email components)

### Backend Verification

1. **Ruby syntax check**:

   ```bash
   cd /Users/beaulazear/Desktop/voxxy-rails
   ruby -c app/services/email_schedule_calculator.rb
   ```

   Expected: "Syntax OK" (✅ Verified)

2. **Organization timezone usage**:

   ```bash
   grep "org_timezone" app/services/email_schedule_calculator.rb
   ```

   Expected: Found in combine_date_and_time method

3. **No hardcoded Eastern**:
   ```bash
   grep "America/New_York" app/services/email_schedule_calculator.rb
   ```
   Expected: Only in fallback (|| "America/New_York")

---

## Migration Notes

### No Database Migration Required

✅ **No schema changes needed**

- Existing scheduled_emails records remain valid
- Backend change only affects **new calculations**
- Organizations already have timezone field

### Existing Scheduled Emails

**Behavior for existing records**:

- Already-sent emails (status='sent'): No impact
- Pending emails (status='scheduled'):
  - Calculated with old logic (hardcoded Eastern)
  - Will send at originally scheduled UTC time
  - **May be incorrect for non-Eastern orgs**

**Recommendation**:
Consider regenerating pending scheduled emails for affected events:

```ruby
# Rails console
Event.where("event_date > ?", Date.current).find_each do |event|
  # Only for non-Eastern orgs with pending emails
  if event.organization.timezone != "America/New_York"
    # Regenerate scheduled emails
    ScheduledEmailGenerator.new(event).generate(regenerate: true)
  end
end
```

---

## Rollback Plan

### If Issues Discovered in Production

**Frontend Rollback**:

```bash
cd /Users/beaulazear/Desktop/voxxy-presents-client
git revert <commit-hash>
git push origin main
```

**Backend Rollback**:

```ruby
# Restore hardcoded Eastern timezone
Time.use_zone("America/New_York") do
  Time.zone.local(date.year, date.month, date.day, hour, minute, 0)
end
```

**Impact of Rollback**:

- Returns to old behavior (hardcoded Eastern)
- Date calculation bug returns (date-fns issue)
- Organizations get emails at Eastern time again

---

## Additional Backend Issues Discovered

While investigating, we discovered additional timezone issues in the Rails backend:

### Issue 1: Date.today Usage (Should Use Date.current)

**Files**:

- `app/controllers/admin_controller.rb:290`
- `app/models/activity.rb:84`

**Fix Needed**:

```ruby
# BEFORE
today = Date.today

# AFTER
today = Date.current
```

### Issue 2: DateTime.parse Without Timezone

**File**: `app/models/activity.rb:43`

**Fix Needed**:

```ruby
# BEFORE
activity_datetime = DateTime.parse("#{date_day} #{time_part}")

# AFTER
activity_datetime = Time.zone.parse("#{date_day} #{time_part}")
```

### Issue 3: Missing Rails Timezone Configuration

**File**: `config/application.rb`

**Recommendation**:

```ruby
config.time_zone = "UTC"  # Explicit default
config.active_record.default_timezone = :local
```

**Note**: These issues are **not critical** for email scheduling but should be addressed for overall system consistency.

---

## Files Modified

### Frontend (voxxy-presents-client)

**Branch**: `fix/email-scheduling-date-calculation`

1. `src/components/producer/Email/EditScheduledEmailModal.tsx`
   - Replaced date-fns with Luxon
   - Removed UTC conversion for trigger_time
   - Updated UI text and comments

2. `src/components/producer/Email/EmailEditorPage.tsx`
   - Replaced date-fns with Luxon for date calculations
   - Removed UTC conversion for trigger_time

### Backend (voxxy-rails)

**Branch**: (to be created)

1. `app/services/email_schedule_calculator.rb`
   - Use `event.organization.timezone` instead of hardcoded "America/New_York"
   - Fallback to Eastern if timezone not set

---

## Deployment Checklist

### Frontend Deployment

- [x] TypeScript compilation passes
- [x] Branch created: `fix/email-scheduling-date-calculation`
- [ ] Code reviewed
- [ ] Merged to `staging` branch
- [ ] Deployed to staging environment
- [ ] Tested on staging with real event data
- [ ] Merged to `main` branch
- [ ] Deployed to production

### Backend Deployment

- [x] Ruby syntax check passes
- [ ] Create branch: `fix/email-scheduling-organization-timezone`
- [ ] RSpec tests pass (if any)
- [ ] Code reviewed
- [ ] Merged to staging
- [ ] Deployed to staging
- [ ] Tested on staging
- [ ] Merged to main
- [ ] Deployed to production

### Post-Deployment Verification

- [ ] Create test event in production
- [ ] Generate scheduled emails
- [ ] Verify `scheduled_for` times are correct for organization timezone
- [ ] Monitor first email sends to confirm correct timing
- [ ] Check Sentry for any new timezone-related errors

---

## Contact

**Issue Discovered**: April 30, 2026
**Fixed By**: Claude Code
**Tested By**: (pending)
**Deployed By**: (pending)

For questions about this fix, refer to:

- This document
- Backend analysis in agent logs
- Frontend timezone utilities in `src/utils/timezone.ts`
- Backend email scheduling in `app/services/email_schedule_calculator.rb`
