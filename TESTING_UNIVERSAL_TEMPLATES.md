# Universal Template Testing Guide

## ✅ Backend Status (Already Verified)
- All 6 organizations have universal templates
- Each template is marked with `is_universal: true` and `template_type: category`
- Each template has 5 emails configured

---

## 1. Frontend UI Testing

### A. Email Sequences Page (TemplateLibraryPage)
**Path:** Email → Email Sequences

**Test Cases:**
- [ ] Page loads without errors
- [ ] Three sections are visible in order:
  1. Event Sequences (top)
  2. Category Sequences (middle)
  3. Universal Category Sequence (bottom) ← NEW
- [ ] Universal section shows:
  - [ ] Purple mail icon
  - [ ] "Universal Category Sequence" header
  - [ ] Description: "Single sequence used across all vendor categories..."
  - [ ] Your universal template with purple "UNIVERSAL" badge
  - [ ] Email count (should show 5 emails)
  - [ ] "Applied to all categories" text
  - [ ] Edit, Preview, and Clone buttons
- [ ] Header description explains event creation flow correctly
- [ ] "Show Guide" button works and displays 3-column guide (Event, Category, Universal)
- [ ] NO "Email types:" badges show on main page (removed per your request)

**Actions to Test:**
- [ ] Click Edit button → Opens template builder with universal template loaded
- [ ] Click Preview button → Shows preview modal with all 5 emails
- [ ] Click Clone button → Opens clone modal, can create a copy

---

## 2. Event Creation Wizard Testing

### B. Step 4: Auto Messages (CreateEventWizard)
**Path:** Events → Create Event → Step 4 (Auto Messages)

**Test Cases:**
- [ ] Step 4 loads without errors
- [ ] Two radio button options are visible:
  - [ ] "Category-Specific Sequences" (default selected)
  - [ ] "Universal Sequence [SIMPLER]"
- [ ] When "Category-Specific Sequences" is selected:
  - [ ] Shows list of all categories with their templates
  - [ ] Each category shows edit button
- [ ] When "Universal Sequence" is selected:
  - [ ] List changes to show single universal template
  - [ ] Purple "UNIVERSAL" badge visible
  - [ ] Shows "Applied to all categories" text
  - [ ] Edit button opens universal template

**Actions to Test:**
- [ ] Toggle between both options multiple times
- [ ] UI updates correctly without flickering
- [ ] Can proceed to next step with either option selected

---

## 3. End-to-End Event Creation Testing

### C. Create Event with Category-Specific Sequences
**Expected Behavior:** Each category uses its own template

**Steps:**
1. [ ] Create new event
2. [ ] In Step 4, select "Category-Specific Sequences"
3. [ ] Complete event creation
4. [ ] Go to Event Command Center → Email tab
5. [ ] Verify:
   - [ ] Event-wide emails are created from event sequence
   - [ ] Category emails are created from each category's specific template
   - [ ] Different categories may have different email content

### D. Create Event with Universal Sequence
**Expected Behavior:** All categories use the same universal template

**Steps:**
1. [ ] Create new event
2. [ ] In Step 4, select "Universal Sequence [SIMPLER]"
3. [ ] Complete event creation
4. [ ] Go to Event Command Center → Email tab
5. [ ] Verify:
   - [ ] Event-wide emails are created from event sequence
   - [ ] ALL category emails are created from universal template
   - [ ] All vendor categories have identical email content
   - [ ] Email count per category is the same (5 emails each)

---

## 4. Database Verification (Backend Testing)

### E. Check Event Records
```bash
cd /Users/beaulazear/Desktop/voxxy-rails

# Test 1: Create event with universal mode and verify fields
bin/rails runner "
event = Event.last
puts \"Event: #{event.name}\"
puts \"use_universal_category_template: #{event.use_universal_category_template}\"
puts \"universal_category_template_id: #{event.universal_category_template_id}\"
if event.universal_category_template
  puts \"Universal Template: #{event.universal_category_template.name}\"
end
"
```

### F. Check Scheduled Emails Generation
```bash
# Test 2: Verify scheduled emails were created correctly
bin/rails runner "
event = Event.last
puts \"Event: #{event.name}\"
puts \"Using Universal: #{event.use_universal_category_template}\"
puts \"\"

scheduled_emails = event.scheduled_emails.joins(:vendor_category).group(:vendor_category_id).count
puts \"Emails per category:\"
scheduled_emails.each do |category_id, count|
  category = VendorCategory.find(category_id)
  puts \"  #{category.name}: #{count} emails\"
end
"
```

---

## 5. Edge Cases & Error Handling

### G. Test Edge Cases
- [ ] **Edit Event:** Change from category-specific to universal
  - Should update `use_universal_category_template` flag
  - May need to regenerate scheduled emails
- [ ] **Edit Event:** Change from universal to category-specific
  - Should clear universal template selection
- [ ] **New Organization:** Create a new organization
  - [ ] Verify universal template auto-created via callback
  - [ ] Check template has correct structure
- [ ] **Clone Universal Template:** Create a copy
  - [ ] Verify it's NOT marked as universal (only one per org)
  - [ ] Should work like a normal category template

---

## 6. API Endpoint Testing (Optional)

### H. Test API Responses
```bash
# Get templates (should include universal)
curl -X GET http://localhost:3000/api/v1/presents/email_campaign_templates \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create event with universal template
curl -X POST http://localhost:3000/api/v1/presents/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event": {
      "name": "Test Event",
      "use_universal_category_template": true,
      "universal_category_template_id": 19,
      ...
    }
  }'
```

---

## 7. Validation Testing

### I. Test Validation Rules
- [ ] **Universal must be category type:**
  - Try to create a generic template with `is_universal: true`
  - Should fail with validation error
- [ ] **Universal template required when enabled:**
  - Try to create event with `use_universal_category_template: true` but no template ID
  - Should fail with validation error
- [ ] **Only one universal per organization:**
  - Try to mark a second template as universal
  - System should handle this gracefully

---

## Expected Results Summary

### ✅ Success Criteria
1. All organizations have exactly one universal template
2. Universal template appears at bottom of Email Sequences page
3. Event creation wizard shows radio button selection
4. Events created with universal mode use same template for all categories
5. Events created with category-specific mode use individual templates
6. No TypeScript errors in browser console
7. No validation errors when creating events
8. Scheduled emails generate correctly in both modes

### 🚨 Known Limitations
- Only ONE universal template per organization (by design)
- Cannot delete or unmark a template as universal once created
- Universal templates cannot be generic type (must be category type)

---

## Quick Test Commands

```bash
# Check all universal templates
cd /Users/beaulazear/Desktop/voxxy-rails
bin/rails runner "
EmailCampaignTemplate.where(is_universal: true).each do |t|
  puts \"#{t.organization.name}: #{t.name} (#{t.email_template_items.count} emails)\"
end
"

# Test scheduled email generation for last event
bin/rails runner "
event = Event.last
puts event.name
puts 'Universal mode: ' + event.use_universal_category_template.to_s
"
```

---

## Troubleshooting

If you encounter issues:

1. **Universal template not showing:** Check browser console for JS errors
2. **Radio buttons not working:** Verify Step4AutoMessages props are passed correctly
3. **Scheduled emails not generating:** Check ScheduledEmailGenerator service logs
4. **Validation errors:** Check Rails logs for detailed error messages

---

## Test Status Tracker

Use this to track your testing progress:

- [ ] Frontend UI (Email Sequences page)
- [ ] Event Wizard (Radio button selection)
- [ ] E2E: Category-specific mode
- [ ] E2E: Universal mode
- [ ] Database verification
- [ ] Edge cases
- [ ] Validation rules

**Testing Date:** _______________
**Tested By:** _______________
**Staging URL:** _______________
**Result:** ⭐ PASS / ❌ FAIL / ⚠️ ISSUES FOUND
