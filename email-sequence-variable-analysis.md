# Email Sequence Variable Analysis

## Variables Found in Default Email Sequence

### ✅ **EXISTING Variables** (Already in EMAIL_VARIABLES):
1. `[firstName]` - ✅ Exists
2. `[eventName]` - ✅ Exists
3. `[eventVenue]` - ✅ Exists
4. `[eventDate]` - ✅ Exists
5. `[organizationName]` - ✅ Exists
6. `[unsubscribeLink]` - ✅ Exists
7. `[paymentDueDate]` - ✅ Exists
8. `[applicationDeadline]` - ✅ Exists
9. `[installStartTime]` - ✅ Exists
10. `[vendorCategory]` - ✅ Exists

### ❌ **MISSING Variables** (Need to add to EMAIL_VARIABLES):

1. **`[applicationLink]`** - CRITICAL MISSING
   - Description: "Category-specific application link" (per HTML subtitle)
   - Used in: Invitation, 3-day deadline, 1-day deadline, deadline-day emails
   - Example usage: Line 164, 375, 418, 459
   - **This is essential for pre-application emails!**

2. **`[eventOptOutLink]`** - MISSING
   - Description: "Link to opt out of this specific event"
   - Used in: Invitation, 3-day deadline, 1-day deadline, deadline-day emails
   - Example usage: Line 168, 379, 422, 463
   - **Allows vendors to decline invitation**

3. **`[applicationCode]`** - MISSING
   - Description: "Unique application reference code"
   - Used in: Application received email
   - Example usage: Lines 192, 205
   - **Important for vendor to reference their application**

4. **`[eventPortalLink]`** - CRITICAL MISSING
   - Description: "Universal vendor portal link" (per HTML subtitle)
   - Used in: Acceptance, payment confirmed, 1-week-out, 1-day-before, day-of, bulletin, category-changed, event-updated emails
   - Example usage: Lines 252, 625, 668, 711, 754, 834, 875, 914
   - **Most frequently used link - replaces individual links**

5. **`[category.paymentLink]`** - SPECIAL FORMAT - MISSING
   - Description: "Category-specific payment link" (per HTML subtitle)
   - Used in: Acceptance, payment emails
   - Example usage: Lines 248, 502, 543, 584
   - **Note: Uses dot notation `[category.paymentLink]` not `[paymentLink]`**
   - **Our current `[paymentLink]` doesn't match this format!**

### ⚠️ **CONFLICTING Variables**:

1. **`[category.paymentLink]` vs `[paymentLink]`**
   - HTML uses: `[category.paymentLink]`
   - Our EMAIL_VARIABLES has: `[paymentLink]`
   - **These are DIFFERENT - need to clarify which to use**

### 📊 **Summary**:

- **Total variables in HTML:** 15
- **✅ Exist in EMAIL_VARIABLES:** 10
- **❌ Missing from EMAIL_VARIABLES:** 5
- **⚠️ Format conflicts:** 1

### 🚨 **Action Required**:

**Must add these 5 variables to EMAIL_VARIABLES before updating default template:**

```typescript
{
  label: 'Application Link',
  frontendVar: '[applicationLink]',
  backendVar: '{{application_link}}',
  category: 'computed',
  description: 'Category-specific application link',
  example: 'https://voxxy.io/events/summer-market/apply/food-vendor',
  worksInInvitations: true // Works in pre-application emails!
},
{
  label: 'Event Opt-Out Link',
  frontendVar: '[eventOptOutLink]',
  backendVar: '{{event_opt_out_link}}',
  category: 'computed',
  description: 'Link to decline invitation for this event',
  example: 'https://voxxy.io/events/summer-market/opt-out',
  worksInInvitations: true
},
{
  label: 'Application Code',
  frontendVar: '[applicationCode]',
  backendVar: '{{application_code}}',
  category: 'vendor',
  description: 'Unique application reference code',
  example: 'APP-2024-12345',
  worksInInvitations: false // Only available after application
},
{
  label: 'Event Portal Link',
  frontendVar: '[eventPortalLink]',
  backendVar: '{{event_portal_link}}',
  category: 'computed',
  description: 'Universal vendor portal link',
  example: 'https://voxxy.io/vendor/events/summer-market',
  worksInInvitations: false // Only for registered vendors
},
// Note: category.paymentLink uses different format - needs backend clarification
```

### ❓ **Questions for Backend:**

1. Should we use `[category.paymentLink]` or `[paymentLink]`?
2. Does the backend support dot notation (`category.`) for variables?
3. Are `[applicationLink]`, `[eventOptOutLink]`, `[applicationCode]`, `[eventPortalLink]` already implemented in the backend EmailVariableResolver?
