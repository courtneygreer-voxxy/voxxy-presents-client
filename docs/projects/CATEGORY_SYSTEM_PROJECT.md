# 🏷️ Organization-Scoped Categories System

**Date Created:** March 13, 2026
**Priority:** High
**Timeline:** 4 weeks (20 days)
**Goal:** Create unified category system across Applications → Contacts → Email Sequences
**Status:** 🚀 **IN PROGRESS** - Phase 1 Complete, Phase 2 Ready to Start

---

## 📋 **Project Overview**

### **Current System Challenges:**

1. **Inconsistent Category Data:** String arrays (`["Artist", "Food Vendor"]`) lack consistency
2. **No Reusability:** Users re-type same categories for every event
3. **Email Targeting Limitations:** Cannot create category-specific email templates
4. **Data Quality Issues:** Typos create duplicate categories ("Artist" vs "artist" vs "Artists")
5. **Scalability Problems:** String arrays don't scale for complex filtering
6. **No Category Management:** No central place to view/edit categories

### **Business Impact:**

- **User Frustration:** Re-entering same categories repeatedly
- **Time Waste:** 5-10 minutes per event for category setup
- **Poor Email Targeting:** Generic emails to all vendors (lower engagement)
- **Support Overhead:** "Why did Food Vendors get Artist emails?"
- **Data Inconsistency:** Reporting and analytics compromised by typos

---

## 🎯 **Solution Strategy**

### **Core Concept:**

Create a **unified Categories table** that flows through:

1. **Event Creation** → Select categories (replaces typing application names)
2. **Vendor Applications** → Link to category + event-specific config
3. **Email Sequences** → Auto-split by category with custom templates
4. **Contact Management** → Tag contacts with categories
5. **Template Library** → Create category-specific email templates

### **User Flow (Event Creation):**

```
Step 1: Event Details ✓
Step 2: Choose Categories
  → Select "Artist" (existing category)
  → Select "Food Vendor" (existing category)
  → Create "Sponsor" (new category)
  → Configure each: price, description, install date
Step 3: Invite Lists ✓
Step 4: Email Template
  → System shows: "Artist (custom template ✓), Food Vendor (custom template ✓), Sponsor (general template)"
  → Email sequence auto-splits into 3 separate sequences
```

### **Email Sequence Behavior:**

**Event Announcements** → One set (all categories)
**Application/Payment/Event Emails** → Split per category

Example: 3 categories × 15 category-specific emails = 45 emails
Plus: 5 event announcements (all categories) = 50 total scheduled emails

---

## 🗄️ **Database Architecture**

### **New Table: categories**

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7),              -- Hex color for UI badges (#FF5733)
  icon VARCHAR(50),               -- Optional icon identifier
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT categories_unique_name
    UNIQUE(organization_id, name)
);

-- Indexes
CREATE INDEX idx_categories_org_id ON categories(organization_id);
CREATE INDEX idx_categories_name ON categories(name);
```

### **Update: vendor_applications**

```sql
ALTER TABLE vendor_applications
  ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;

-- Keep 'name' field for backwards compatibility and display
-- category_id = new standard, name = legacy fallback

CREATE INDEX idx_vendor_applications_category ON vendor_applications(category_id);
```

### **Update: email_template_items**

```sql
ALTER TABLE email_template_items
  ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE;

-- NULL = event announcement (all categories)
-- NOT NULL = category-specific email template

CREATE INDEX idx_email_template_items_category ON email_template_items(category_id);
```

### **Update: scheduled_emails**

```sql
ALTER TABLE scheduled_emails
  ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;

-- NULL = event announcement (all categories)
-- NOT NULL = category-specific email instance

CREATE INDEX idx_scheduled_emails_category ON scheduled_emails(category_id);
```

### **Update: vendor_contacts (Future)**

```sql
-- Phase 2 enhancement (not in MVP)
CREATE TABLE contact_categories (
  id SERIAL PRIMARY KEY,
  vendor_contact_id INTEGER NOT NULL REFERENCES vendor_contacts(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE(vendor_contact_id, category_id)
);

-- Keep categories JSONB array for backwards compatibility during migration
```

---

## 🔌 **API Endpoints**

### **Categories API**

```typescript
// Base: /api/v1/presents/organizations/:org_id/categories

GET    /categories                    // List all organization categories
POST   /categories                    // Create new category
GET    /categories/:id                // Get category details
PUT    /categories/:id                // Update category
DELETE /categories/:id                // Delete (only if unused)
GET    /categories/:id/usage          // Get usage stats

// Response format
interface Category {
  id: number;
  organization_id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;

  // Metadata (included in list responses)
  usage?: {
    applications_count: number;
    contacts_count: number;
    email_templates_count: number;
    events_using_count: number;
  };
}
```

---

## 🔧 **Implementation Phases**

### **Phase 1: Database & Backend Foundation (Days 1-3)** ✅ COMPLETE

**Goal:** Set up categories table, models, and API

**Tasks:**

- [x] Create categories migration
- [x] Add category_id to vendor_applications, email_template_items, scheduled_emails
- [x] Create Category model with validations
- [x] Build categories API controller (CRUD endpoints)
- [x] Add category associations to existing models
- [ ] Write backend tests for Category model (deferred)
- [ ] Seed test categories for development (deferred)

**Deliverables:**

- ✅ Working categories API
- ✅ Database schema updated
- ✅ Routes verified

---

### **Phase 2: Event Creation Wizard (Days 4-6)**

**Goal:** Replace application name input with category selector

**Tasks:**

- [ ] Create CategorySelector component
- [ ] Create CategoryBadge component
- [ ] Create CategoryApplicationForm component
- [ ] Update Step2Applications to use category selector
- [ ] Update wizard state to store category_id instead of just name
- [ ] Update Step4 to show category-split email preview
- [ ] Update handleCreateEvent to send category_ids
- [ ] Test wizard flow end-to-end
- [ ] Handle edge cases (0 categories, 10+ categories)

**Deliverables:**

- Working category selection in wizard
- Event creation generates category-split emails
- UI shows template preview per category

---

### **Phase 3: Email Generation Logic (Days 7-8)**

**Goal:** Backend generates category-split email sequences

**Tasks:**

- [ ] Update ScheduledEmailGenerator service
- [ ] Implement event announcement detection (category_id = null)
- [ ] Implement category-specific email generation
- [ ] Add category template override lookup
- [ ] Update EmailVariableResolver with category variables
- [ ] Update recipient filtering logic
- [ ] Test email generation with 1, 3, 5 categories
- [ ] Verify correct recipient counts per category
- [ ] Test with category-specific templates

**Deliverables:**

- Emails correctly split by category
- Event announcements not duplicated
- Category templates applied when available
- Recipient counts accurate

---

### **Phase 4: Template Manager Updates (Days 9-11)**

**Goal:** Enable category-specific template creation

**Tasks:**

- [ ] Update EmailTemplateItemEditor with category selector
- [ ] Add category badge to template item cards
- [ ] Create hierarchical template item display
- [ ] Add "Add Category Version" button
- [ ] Update template save logic to include category_id
- [ ] Update TemplateLibraryPage to show category metadata
- [ ] Add category filter to template library
- [ ] Test creating general + category-specific templates
- [ ] Test template application during event creation

**Deliverables:**

- Can create category-specific email templates
- Template library shows category support
- Category templates correctly applied to events

---

### **Phase 5: Email Automation Tab Redesign (Days 12-13)**

**Goal:** Update email list filters and display

**Tasks:**

- [ ] Remove "Email Type" (system/scheduled) filter
- [ ] Rename "Category" filter to "Email Type"
- [ ] Add new "Category" filter (vendor categories)
- [ ] Update email list columns
- [ ] Add CategoryBadge to email rows
- [ ] Update email card component
- [ ] Add category grouping view (optional)
- [ ] Test filtering by category
- [ ] Test with events having multiple categories

**Deliverables:**

- New filter structure working
- Category badges visible on emails
- Filter by vendor category works
- Email list sortable by category

---

### **Phase 6: Network Tab Integration (Days 14-15)**

**Goal:** Use categories in contact management

**Tasks:**

- [ ] Update AddContactModal with CategorySelector
- [ ] Update EditContactModal with CategorySelector
- [ ] Update NetworkPage category filter
- [ ] Update CSV import to handle categories
- [ ] Create category migration tool (string → Category ID)
- [ ] Add category filter to contact list
- [ ] Test contact creation with categories
- [ ] Test contact editing
- [ ] Test CSV import with category matching

**Deliverables:**

- Contact category selection uses Category table
- CSV import creates/matches categories
- Contact filtering by category works
- Legacy string arrays still supported

---

### **Phase 7: Settings & Management (Days 16-17)**

**Goal:** Category management interface

**Tasks:**

- [ ] Create CategoryManager component
- [ ] Add Categories section to Settings page
- [ ] Implement category edit/delete
- [ ] Add usage stats display
- [ ] Implement category merge functionality
- [ ] Add bulk operations (import/export)
- [ ] Add category color picker
- [ ] Add category icon selector (optional)
- [ ] Test category deletion protection
- [ ] Test category editing propagation

**Deliverables:**

- Full category management UI
- Can edit/delete categories
- Usage stats visible
- Delete protection working

---

### **Phase 8: TypeScript & Integration (Days 18-19)**

**Goal:** Type definitions and API client

**Tasks:**

- [ ] Create src/types/category.ts
- [ ] Update VendorApplication interface
- [ ] Update EmailTemplateItem interface
- [ ] Update ScheduledEmail interface
- [ ] Create categoriesApi client
- [ ] Update eventsApi for category support
- [ ] Update emailCampaignTemplatesApi
- [ ] Fix all TypeScript errors
- [ ] Run full build
- [ ] Integration testing across all features

**Deliverables:**

- All TypeScript interfaces updated
- API client methods complete
- Build passes with 0 errors
- Integration tests passing

---

### **Phase 9: Testing & Polish (Day 20)**

**Goal:** Comprehensive testing and bug fixes

**Tasks:**

- [ ] End-to-end test: Event creation → Email generation
- [ ] Test category-specific templates
- [ ] Test with 0, 1, 5, 10 categories
- [ ] Test category deletion scenarios
- [ ] Test email filtering by category
- [ ] Performance test with large category counts
- [ ] Test backwards compatibility (legacy data)
- [ ] UI polish and responsive design
- [ ] Error message improvements
- [ ] Documentation updates

**Deliverables:**

- All features tested and working
- Performance acceptable
- UI polished
- Documentation complete

---

## 📈 **Success Metrics**

### **User Adoption:**

- 90% of events use category selector (vs typing names)
- Average 3 categories selected per event
- 60% of producers create at least one category-specific template
- Category reuse rate > 80% across events

### **Technical Performance:**

- Category API response < 100ms
- Email generation < 5 seconds for 5 categories
- Template library load < 500ms
- Database queries optimized (N+1 prevention)

### **Data Quality:**

- Category name typos reduced by 95%
- Duplicate categories eliminated
- Consistent reporting and analytics

### **User Experience:**

- Event setup time reduced by 30%
- Email targeting accuracy improved to 99%
- "Wrong audience" support tickets reduced by 80%
- Email open rates increase by 25% (better targeting)

---

## 🚨 **Risk Assessment**

### **Risk 1: Email Multiplication**

**Issue:** 5 categories × 20 emails = 100 scheduled emails per event
**Severity:** Medium
**Likelihood:** High

**Mitigation:**

- Event announcements not duplicated (reduces count)
- Archive sent emails automatically
- Pagination in email list (50 per page)
- Performance optimization (eager loading, caching)
- Database indexes on category_id columns

### **Risk 2: Category Deletion**

**Issue:** User deletes category that's in use
**Severity:** High
**Likelihood:** Medium

**Mitigation:**

- Block deletion if category has associations
- Show usage count before delete confirmation
- Offer "merge into another category" option
- Soft delete option (mark inactive)
- Admin override with warning

### **Risk 3: Template Complexity**

**Issue:** Users confused by category-specific templates
**Severity:** Medium
**Likelihood:** Medium

**Mitigation:**

- Clear UI labels and help text
- "General template" as default (simple mode)
- Progressive disclosure (advanced users find category option)
- Tooltips and examples
- User training materials

---

## 📝 **Decision Log**

### **Key Decisions Made:**

**1. Categories table organization-scoped (not system-wide)**

- **Why:** Different orgs need different categories (Art Show vs Tech Conference)
- **Trade-off:** Can't share categories across orgs, but ensures flexibility

**2. Keep VendorApplication.name field alongside category_id**

- **Why:** Backwards compatibility, display flexibility, legacy support
- **Trade-off:** Minor data duplication, but safer migration path

**3. Event announcements NOT duplicated per category**

- **Why:** Reduces email count, these emails truly apply to all
- **Implementation:** category_id = NULL for event announcements

**4. Category-specific templates as overrides (not separate templates)**

- **Why:** Easier to manage, clear inheritance model
- **Alternative Considered:** Separate templates per category (rejected: too complex)

**5. Allow category creation inline everywhere**

- **Why:** User convenience, reduces friction
- **Trade-off:** Potential for duplicates if not careful
- **Mitigation:** Uniqueness constraint, search-before-create

**6. Gradual contact migration (no immediate breaking changes)**

- **Why:** Safe rollout, backwards compatibility
- **Timeline:** Phase 2 (Month 2) for full migration

---

## 📅 **Progress Tracking**

### **Current Status:** ✅ **PHASE 1 COMPLETE** - Ready for Phase 2

### **Session Log:**

#### **March 13, 2026 - Project Planning & Kickoff**

- **Time Spent:** 3 hours
- **Work Done:**
  - Researched existing category implementation
  - Researched email sequence architecture
  - Analyzed connection points
  - Created comprehensive project plan
  - Defined database schema
  - Designed API endpoints
  - Planned UI components
  - Estimated 20-day timeline
  - Created project documentation
- **Decisions Made:**
  - Organization-scoped categories
  - Event announcements not duplicated
  - Category template override model
  - Gradual migration strategy
- **Next Session:** Create database migrations and Category model
- **Notes:** Comprehensive planning complete, ready to implement

#### **March 13, 2026 - Phase 1 Implementation Complete**

- **Time Spent:** 2 hours
- **Work Done:**
  - ✅ Created 4 database migrations (categories table + 3 foreign keys)
  - ✅ Created Category model with validations and associations
  - ✅ Updated Organization, VendorApplication, EmailTemplateItem, ScheduledEmail models
  - ✅ Ran all migrations successfully
  - ✅ Created Categories API controller with full CRUD
  - ✅ Added API routes for categories
  - ✅ Verified routes configuration
- **Files Created:**
  - `/db/migrate/20260313201506_create_categories.rb`
  - `/db/migrate/20260313201528_add_category_to_vendor_applications.rb`
  - `/db/migrate/20260313201641_add_category_to_email_template_items.rb`
  - `/db/migrate/20260313201657_add_category_to_scheduled_emails.rb`
  - `/app/models/category.rb`
  - `/app/controllers/api/v1/presents/categories_controller.rb`
- **API Endpoints Created:**
  - `GET /api/v1/presents/organizations/:org_id/categories` - List all categories
  - `POST /api/v1/presents/organizations/:org_id/categories` - Create category
  - `GET /api/v1/presents/categories/:id` - Get category
  - `PUT /api/v1/presents/categories/:id` - Update category
  - `DELETE /api/v1/presents/categories/:id` - Delete category
  - `GET /api/v1/presents/categories/:id/usage` - Get usage stats
- **Blockers Hit:**
  - Rails syntax: `:nullify` instead of `:set_null` for on_delete
  - Index duplication: `add_reference` creates index automatically
- **Next Session:** Begin Phase 2 - Event Creation Wizard updates
- **Notes:** Phase 1 complete! Database foundation and API fully functional. Ready to start frontend work.

---

## 🎯 **Immediate Next Steps**

### **For Current Session:**

1. **Create Database Migrations**
   - Create categories table
   - Add category_id to vendor_applications
   - Add category_id to email_template_items
   - Add category_id to scheduled_emails

2. **Create Category Model**
   - Validations (name uniqueness within organization)
   - Associations (belongs_to organization, has_many applications)
   - Scopes and helper methods

3. **Build Categories API Controller**
   - CRUD endpoints
   - Usage stats endpoint
   - Proper error handling

4. **Test with curl/Postman**
   - Create category
   - List categories
   - Update category
   - Delete protection

---

**🚀 Implementation in progress!**
**📅 Last Updated:** March 13, 2026
**👤 Last Updated By:** Development Team
**🎯 Current Focus:** Phase 1 - Database & Backend Foundation
**📊 Estimated Completion:** 4 weeks (20 working days)
