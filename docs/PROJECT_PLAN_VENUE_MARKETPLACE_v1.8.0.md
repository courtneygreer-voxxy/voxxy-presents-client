# 🏢 v1.8.0 Venue Marketplace Enhancement Project Plan

**Release Name**: v1.8.0 - Enhanced Venue Marketplace
**Start Date**: September 19, 2025
**Target Completion**: October 17, 2025
**Status**: 🚀 **IN PROGRESS**

## 🎯 **Project Overview**

Transform the venue marketplace with simplified search, club-style venue pages, and seamless integration into the club owner workflow.

### **Key Goals**
- **Simplified Search**: Reduce filters to location, capacity, paid/free, availability (coming soon)
- **Club-Style Venue Pages**: Stack components similar to organization pages with events, subscriptions, and accessibility info
- **Club Owner Integration**: Add venue search to event creation/editing workflow
- **Enhanced Details**: Add accessibility badges (handicap, LGBTQ+, 420 friendly)

## 📊 **Progress Tracking**

### **✅ COMPLETED**
- [x] **Project Planning & Analysis** (Sept 19)
  - [x] Analyzed current venue marketplace structure
  - [x] Created comprehensive technical implementation plan
  - [x] Identified all files and components needing updates
  - [x] Set up proper git workflow with release/v1.8.0-venue-marketplace branch

### **🚧 IN PROGRESS**
- [ ] **Phase 1: Simplified Search Filters** (Working in release/v1.8.0-venue-marketplace)
  - [ ] Update VenueSearchFilters type definition
  - [ ] Redesign VenueFilters component (remove venue types, amenities)
  - [ ] Add paid/free filter option
  - [ ] Gray out availability filter with "Coming Soon" badge
  - [ ] Update VenueSearchPortal to use new filters

### **⏳ PENDING**
- [ ] **Phase 2: Club-Style Venue Page Redesign**
- [ ] **Phase 3: Club Owner Integration**
- [ ] **Phase 4: Enhanced Venue Details**

---

## 🏗️ **Detailed Implementation Plan**

## **Phase 1: Simplified Search Filters** 📅 Week 1

### **1.1 Update VenueSearchFilters Type**
**File**: `/src/types/venue.ts`
**Status**: ⏳ Not Started

**Changes:**
```typescript
export interface VenueSearchFilters {
  location?: string
  capacity?: {
    min?: number
    max?: number
  }
  paidFree?: 'paid' | 'free' | 'both'
  availability?: string // Coming soon feature - grayed out
}
```

### **1.2 Redesign VenueFilters Component**
**File**: `/src/components/venue/VenueFilters.tsx`
**Status**: ⏳ Not Started

**Required Changes:**
- [ ] Remove venue type selection (bar, restaurant, etc.)
- [ ] Remove amenities checkboxes (WiFi, Parking, etc.)
- [ ] Keep location search input
- [ ] Keep capacity min/max inputs
- [ ] Add paid vs free toggle/select
- [ ] Add availability filter (grayed out with "Coming Soon" badge)
- [ ] Update component props and state management

### **1.3 Update VenueSearchPortal**
**File**: `/src/pages/VenueSearchPortal.tsx`
**Status**: ⏳ Not Started

**Required Changes:**
- [ ] Update filters state to match new VenueSearchFilters interface
- [ ] Remove filtering logic for removed filter types
- [ ] Test simplified search functionality

---

## **Phase 2: Club-Style Venue Page Redesign** 📅 Week 2

### **2.1 Add New Venue Properties**
**File**: `/src/types/venue.ts`
**Status**: ⏳ Not Started

**New Properties:**
```typescript
export interface Venue {
  // ... existing properties
  accessibility: {
    handicapAccessible: boolean
    lgbtqFriendly: boolean
    cannabisFriendly: boolean
  }
  subscriptionEnabled: boolean
  upcomingEvents?: Event[]
  pricingType?: 'paid' | 'free' | 'both'
}
```

### **2.2 Create AccessibilityBadges Component**
**File**: `/src/components/venue/AccessibilityBadges.tsx`
**Status**: ⏳ Not Started

**Features:**
- [ ] ♿ Handicap Accessible badge
- [ ] 🏳️‍🌈 LGBTQ+ Friendly badge
- [ ] 🌿 420 Friendly badge
- [ ] Consistent purple theme styling
- [ ] Tooltip explanations

### **2.3 Redesign VenueProfilePage Layout**
**File**: `/src/pages/VenueProfilePage.tsx`
**Status**: ⏳ Not Started

**New Structure (based on OrganizationPage.tsx):**
- [ ] **Venue Header Section**
  - [ ] Venue name & title
  - [ ] Description
  - [ ] Subscribe button
  - [ ] Hero image
- [ ] **Upcoming Events Section**
  - [ ] Event cards (similar to club events)
  - [ ] Event filtering/sorting
  - [ ] Empty state for no events
- [ ] **Photo Gallery Section**
  - [ ] Multiple venue images
  - [ ] Gallery modal functionality
  - [ ] Image carousel
- [ ] **Details & Accessibility Section**
  - [ ] Capacity, type, hours
  - [ ] Accessibility badges
  - [ ] Contact information

### **2.4 Add Venue Subscription System**
**File**: `/src/components/venue/VenueSubscribeButton.tsx`
**Status**: ⏳ Not Started

**Integration:**
- [ ] Integrate with existing subscription service
- [ ] Add venue subscription tracking
- [ ] Subscription confirmation flow

---

## **Phase 3: Club Owner Integration** 📅 Week 3

### **3.1 Create VenueSearchModal Component**
**File**: `/src/components/venue/VenueSearchModal.tsx`
**Status**: ⏳ Not Started

**Features:**
- [ ] Modal overlay with venue search
- [ ] Simplified filters (location, capacity, paid/free)
- [ ] Quick venue selection
- [ ] Return selected venue to parent form
- [ ] Search functionality
- [ ] Grid/list view toggle

### **3.2 Update Event Types**
**File**: `/src/types/database.ts`
**Status**: ⏳ Not Started

**Add venue integration:**
```typescript
export interface Event {
  // ... existing properties
  venueId?: string
  venue?: Venue // For populated venue data
}
```

### **3.3 Integrate Venue Search into Event Creation**
**Files**:
- `/src/pages/CreateEventPage.tsx`
- `/src/pages/EditEventPage.tsx`

**Status**: ⏳ Not Started

**Integration Points:**
- [ ] Add "Search Venues" button to event forms
- [ ] Add selected venue display section
- [ ] Add manual venue entry fallback
- [ ] Update form validation
- [ ] Update form submission to include venue data

---

## **Phase 4: Enhanced Venue Details** 📅 Week 4

### **4.1 Update Mock Data**
**File**: `/scripts/seed-dev-venues.ts`
**Status**: ⏳ Not Started

**Updates:**
- [ ] Add accessibility properties to existing venues
- [ ] Add pricing type data
- [ ] Add upcoming events mock data
- [ ] Add more diverse venue examples

### **4.2 Final Polish & Testing**
**Status**: ⏳ Not Started

**Tasks:**
- [ ] UI/UX refinements
- [ ] Cross-browser testing
- [ ] Mobile responsiveness validation
- [ ] Performance optimization
- [ ] End-to-end testing of complete flow

---

## 🔧 **Technical Notes**

### **Key Files Modified**
- `/src/types/venue.ts` - Core venue type definitions
- `/src/components/venue/VenueFilters.tsx` - Simplified search filters
- `/src/pages/VenueSearchPortal.tsx` - Main venue search page
- `/src/pages/VenueProfilePage.tsx` - Individual venue pages
- `/src/pages/CreateEventPage.tsx` - Event creation integration
- `/src/pages/EditEventPage.tsx` - Event editing integration

### **New Components Created**
- `/src/components/venue/AccessibilityBadges.tsx`
- `/src/components/venue/VenueSearchModal.tsx`
- `/src/components/venue/VenueSubscribeButton.tsx`

### **Design System Considerations**
- Maintain glass morphism aesthetic
- Use existing purple color theme
- Follow mobile-first responsive design
- Consistent with club/organization page layouts

---

## 📝 **Session Notes**

### **Sept 19, 2025 - Project Kickoff**
- Completed analysis of existing venue marketplace structure
- Found comprehensive venue system already in place
- Created detailed 4-phase implementation plan
- Ready to begin Phase 1 implementation

---

## 🌳 **Git Workflow**

**Following Established Branching Strategy** (see `/docs/development/BRANCHING_STRATEGY.md`)

### **Current Branch Structure**
```
main (production)
├── staging (pre-production testing)
├── develop (integration branch)
└── release/v1.8.0-venue-marketplace (current working branch)
```

### **Workflow Process**
1. **Development**: All features developed in `release/v1.8.0-venue-marketplace`
2. **Local Testing**: Test each feature as we implement
3. **Staging Deployment**: Merge to `staging` for comprehensive QA testing
4. **Production Release**: After QA approval, merge to `main` for production

### **Deployment Strategy**
- **Local Development**: `npm run dev` in release branch
- **Staging Testing**: Deploy batch of completed features to staging
- **Production Release**: Single coordinated release of all v1.8.0 features

### **Current Task**
Starting with **Phase 1.1**: Update VenueSearchFilters type definition in `/src/types/venue.ts`

---

## 🎯 **Next Steps**
1. Update VenueSearchFilters interface to simplified version
2. Modify VenueFilters component to match new interface
3. Test simplified search functionality locally
4. Move to venue page redesign phase
5. Deploy batch to staging for testing
6. Release to production after QA approval

**Last Updated**: September 19, 2025
**Next Review**: September 26, 2025