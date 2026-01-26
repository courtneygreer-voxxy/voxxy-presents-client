# Email Overdue Detection - Frontend Integration

**Date:** January 25, 2026
**Status:** ✅ Implemented

---

## Overview

The email automation system now detects when scheduled emails are late (overdue) and displays visual warnings in the UI. This helps producers identify when emails haven't been sent on time due to system issues.

---

## Backend API Changes

The `/api/v1/presents/events/:event_slug/scheduled_emails` endpoint now returns three additional fields for each scheduled email:

```typescript
interface ScheduledEmail {
  // ... existing fields

  // NEW: Overdue detection
  overdue?: boolean;              // true if email is more than 10 minutes late
  minutes_overdue?: number;       // How many minutes late (can be negative)
  overdue_message?: string | null; // Human-readable message: "45 minutes late"
}
```

**Example Response:**
```json
{
  "id": 123,
  "name": "1 Day Before Payment Due",
  "status": "scheduled",
  "scheduled_for": "2026-01-25T14:00:00.000Z",
  "overdue": true,
  "minutes_overdue": 45,
  "overdue_message": "45 minutes late"
}
```

---

## Frontend Implementation

### 1. Type Updates

**File:** `src/types/email.ts`

```typescript
export interface ScheduledEmail {
  // ... existing fields

  // Overdue detection (for scheduled emails that are late)
  overdue?: boolean;
  minutes_overdue?: number;
  overdue_message?: string | null; // e.g., "45 minutes late"

  // ... other fields
}
```

### 2. Component Updates

#### ScheduledEmailCard Component
**File:** `src/components/producer/Email/ScheduledEmailCard.tsx`

Displays a prominent red warning banner when an email is overdue:

```tsx
{email.overdue && email.overdue_message && (
  <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg bg-red-500/10 border border-red-500/30">
    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
    <span className="text-sm font-semibold text-red-400">
      {email.overdue_message}
    </span>
  </div>
)}
```

**Visual Result:**
- Red banner appears below email name
- Shows message like "45 minutes late" or "2.5 hours late"
- AlertTriangle icon for visual emphasis

#### EmailRow Component (Table View)
**File:** `src/components/producer/Email/EmailRow.tsx`

Shows an alert icon next to the email name with a tooltip:

```tsx
{email.overdue && email.overdue_message && (
  <Tooltip.Provider delayDuration={200}>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <div className="flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-red-400" />
        </div>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="z-50 bg-red-900/90 text-white px-3 py-2 rounded-lg shadow-xl border border-red-500/30">
          <div className="text-xs font-semibold">Overdue: {email.overdue_message}</div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
)}
```

**Visual Result:**
- Red AlertTriangle icon appears before email name
- Email name text turns red
- Hover tooltip shows "Overdue: 45 minutes late"

#### EmailPreviewModal Component
**File:** `src/components/producer/Email/EmailPreviewModal.tsx`

Displays overdue warning in the email info section:

```tsx
{email.overdue && email.overdue_message && (
  <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg bg-red-500/10 border border-red-500/30">
    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
    <span className="text-sm font-semibold text-red-400">
      Overdue: {email.overdue_message}
    </span>
  </div>
)}
```

---

## Grace Period

Emails are **not** flagged as overdue until **10 minutes** after their scheduled time. This prevents false alarms because:
- The backend worker runs every **5 minutes**
- 10 minutes allows **2 processing cycles** before alerting
- Protects against minor delays or processing time

---

## User Experience

### Card View (ScheduledEmailCard)
```
┌─────────────────────────────────────────┐
│ Payment Reminder Email          [Sent]  │
│                                          │
│ ⚠ 45 minutes late                       │ ← Red warning banner
│                                          │
│ Payment due today for Summer Market...  │
│ 📅 Jan 25, 2026  🕐 9:00 AM  👥 12      │
└─────────────────────────────────────────┘
```

### Table View (EmailRow)
```
┌────────────────────────────────────────────────────┐
│ ⚠ Payment Reminder  │ Payment due... │ Jan 25... │ ← Red icon + text
└────────────────────────────────────────────────────┘
    ↑ Hover shows tooltip: "Overdue: 45 minutes late"
```

### Preview Modal (EmailPreviewModal)
```
┌────────────────────────────────────┐
│ Email Preview                       │
├────────────────────────────────────┤
│ Payment Reminder Email              │
│                                     │
│ ⚠ Overdue: 45 minutes late         │ ← Warning banner
│                                     │
│ 📅 Sends: Jan 25, 9:00 AM          │
│ 👥 12 recipients                    │
└────────────────────────────────────┘
```

---

## Testing

### Manual Testing

1. **Create a test event with scheduled emails**
   ```bash
   # Backend
   rails email_testing:setup
   ```

2. **Check for overdue emails**
   ```bash
   rails email_schedule:debug
   ```

3. **View in UI**
   - Navigate to Email Automation tab
   - Look for red warning indicators on overdue emails

### Example Overdue Messages

| Minutes Late | Display Message |
|--------------|----------------|
| 15           | "15 minutes late" |
| 45           | "45 minutes late" |
| 90           | "1.5 hours late" |
| 180          | "3.0 hours late" |
| 2880         | "2.0 days late" |

---

## Troubleshooting

### Email shows as overdue but was just created

**Cause:** Event dates are in the past, so email scheduled times are also in the past.

**Solution:** This is expected. Update event dates to the future, or delete/regenerate emails.

### Overdue indicator not showing

**Possible causes:**
1. Backend not returning the new fields - check API response in Network tab
2. TypeScript types not updated - check `src/types/email.ts`
3. Component not re-rendering - check React DevTools

**Debug:**
```javascript
// In browser console
const email = // ... your email object
console.log('Overdue?', email.overdue);
console.log('Message:', email.overdue_message);
console.log('Minutes:', email.minutes_overdue);
```

---

## Related Documentation

- **Backend Implementation:** `/Users/beaulazear/Desktop/voxxy-rails/docs/email/EMAIL_OVERDUE_DETECTION_SYSTEM.md`
- **API Endpoint:** `GET /api/v1/presents/events/:event_slug/scheduled_emails`
- **Email Master Reference:** `VOXXY_PRESENTS_EMAIL_MASTER_REFERENCE.md`

---

## Summary

✅ **TypeScript types updated** - Added `overdue`, `minutes_overdue`, `overdue_message`
✅ **ScheduledEmailCard updated** - Red warning banner
✅ **EmailRow updated** - Red icon + tooltip
✅ **EmailPreviewModal updated** - Warning in preview header
✅ **10-minute grace period** - Prevents false positives
✅ **Human-readable messages** - "45 minutes late" vs raw timestamps

---

**Last Updated:** January 25, 2026
**Author:** Claude Code
**Status:** ✅ Production Ready
