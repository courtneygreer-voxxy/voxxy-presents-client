# 💰 Event Budget Calculator - MVP Project

**Date Created:** September 28, 2025
**Priority:** High
**Timeline:** Post-Beta (Day 2-7)
**Goal:** Enable organizers to plan and track event budgets with actual expense monitoring

---

## 📋 **Project Overview**

### **MVP Scope (Simplified):**
- **Event-level budget planning** integrated into existing event management
- **Expense tracking** with planned vs actual variance analysis
- **Basic financial summaries** per event
- **Integration with current organizer dashboard**

### **Post-MVP (Future Rounds):**
- ~~Organization-level analytics~~ (deferred)
- ~~Advanced scenario planning~~ (deferred)
- ~~Tax preparation tools~~ (deferred)
- ~~Cross-event financial reporting~~ (deferred)

---

## 🎯 **User Stories (MVP)**

### **As an Event Organizer:**
1. **Budget Planning:** "I want to create a budget plan for my event before it happens"
2. **Expense Tracking:** "I want to log actual expenses as they occur during event planning"
3. **Variance Analysis:** "I want to see how my actual expenses compare to my planned budget"
4. **Profit Projection:** "I want to know if my event will be profitable based on current numbers"

### **Integration Goals:**
- **Seamless workflow:** Budget feels like natural part of event management
- **No disruption:** Works with existing event creation/editing flow
- **Simple interface:** Easy to understand and use for non-financial users

---

## 🏗️ **Technical Architecture**

### **Database Schema (New Entities):**

```typescript
// Add to database-v2.ts

interface Budget {
  id: string
  eventId: string           // Links to existing Event
  organizationId: string    // Links to existing Organization
  createdBy: string         // User who created budget

  // Status tracking
  status: 'draft' | 'active' | 'completed'

  // Financial totals (calculated from line items)
  plannedRevenue: number
  plannedExpenses: number
  plannedProfit: number
  actualRevenue: number
  actualExpenses: number
  actualProfit: number

  // Metadata
  notes?: string
  createdAt: Date
  updatedAt: Date
}

interface BudgetLineItem {
  id: string
  budgetId: string

  // Categorization
  category: 'revenue' | 'expense'
  type: 'ticket_sales' | 'venue' | 'staff' | 'food' | 'equipment' | 'marketing' | 'other'
  description: string

  // Planning phase
  plannedAmount: number
  plannedQuantity?: number    // For unit-based items (tickets, staff hours)
  plannedUnitPrice?: number   // Price per unit

  // Actual tracking
  actualAmount?: number
  actualQuantity?: number
  actualUnitPrice?: number

  // Metadata
  notes?: string
  dateIncurred?: Date        // When actual expense happened
  createdAt: Date
  updatedAt: Date
}
```

### **API Endpoints Needed:**

```typescript
// Budget management
GET    /api/events/{eventId}/budget          // Get event budget
POST   /api/events/{eventId}/budget          // Create budget
PUT    /api/budgets/{budgetId}               // Update budget
DELETE /api/budgets/{budgetId}               // Delete budget

// Line items
GET    /api/budgets/{budgetId}/line-items    // Get all line items
POST   /api/budgets/{budgetId}/line-items    // Add line item
PUT    /api/line-items/{lineItemId}          // Update line item
DELETE /api/line-items/{lineItemId}          // Delete line item

// Calculations
GET    /api/budgets/{budgetId}/summary       // Get calculated totals
```

---

## 🎨 **User Interface Design**

### **Integration Point: Event Management**
**Location:** Add "Budget" tab to existing event editing interface

```
Event Page Tabs:
├── Event Details    (existing)
├── Registrations   (existing)
├── Budget          ← NEW TAB
└── Analytics       (existing)
```

### **Budget Tab Interface:**

#### **1. Budget Overview Card:**
```
┌─────────────────────────────────────────┐
│ 💰 Budget Summary                       │
│                                         │
│ Planned Revenue:     $2,500             │
│ Planned Expenses:    $1,800             │
│ Planned Profit:      $700 (28%)         │
│                                         │
│ Actual Revenue:      $2,200             │
│ Actual Expenses:     $1,950             │
│ Actual Profit:       $250 (11%)         │
│                                         │
│ Status: [Over Budget by $150]           │
└─────────────────────────────────────────┘
```

#### **2. Budget Line Items Interface:**
```
┌─────────────────────────────────────────┐
│ 📝 Revenue Items                        │
│                                         │
│ ✓ Ticket Sales    | $2,500 | $2,200    │
│ ○ Merchandise     | $200   | $0        │
│ + Add Revenue Item                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 💸 Expense Items                        │
│                                         │
│ ✓ Venue Rental    | $800   | $800      │
│ ✓ Staff Costs     | $600   | $750      │
│ ○ Equipment       | $400   | $400      │
│ + Add Expense Item                      │
└─────────────────────────────────────────┘
```

#### **3. Quick Actions:**
- **"Add Expense"** button for real-time expense logging
- **"Export Summary"** for simple PDF/CSV export
- **"Mark Complete"** when event is finished

---

## 🛠️ **Implementation Plan**

### **Phase 1: Core Budget Planning (Week 1)**
**Estimated Time:** 2-3 days
**Goal:** Basic budget creation and planning

#### **Backend Tasks:**
- [ ] Create Budget and BudgetLineItem database tables
- [ ] Build basic CRUD API endpoints
- [ ] Add budget calculation logic (totals, profit, etc.)

#### **Frontend Tasks:**
- [ ] Add "Budget" tab to event editing interface
- [ ] Build budget creation form
- [ ] Build line items management interface
- [ ] Add basic budget summary display

#### **Testing:**
- [ ] Test budget creation flow end-to-end
- [ ] Verify calculations are accurate
- [ ] Test with different event types

### **Phase 2: Expense Tracking (Week 2)**
**Estimated Time:** 2-3 days
**Goal:** Actual expense logging and variance analysis

#### **Backend Tasks:**
- [ ] Add actual expense tracking endpoints
- [ ] Build variance calculation logic
- [ ] Add budget status tracking

#### **Frontend Tasks:**
- [ ] Build expense logging interface
- [ ] Add planned vs actual comparison views
- [ ] Build variance indicators (over/under budget)
- [ ] Add quick expense entry workflow

#### **Testing:**
- [ ] Test expense logging workflow
- [ ] Verify variance calculations
- [ ] Test edge cases (no planned amount, etc.)

### **Phase 3: Polish & Integration (Week 3)**
**Estimated Time:** 1-2 days
**Goal:** Smooth integration and user experience

#### **Tasks:**
- [ ] Improve error handling and validation
- [ ] Add data export functionality
- [ ] Optimize performance and loading states
- [ ] User experience testing and refinements

---

## 🧪 **Testing Strategy**

### **Unit Testing:**
- [ ] Budget calculation functions
- [ ] Line item CRUD operations
- [ ] Variance analysis logic

### **Integration Testing:**
- [ ] Budget creation with event integration
- [ ] API endpoint functionality
- [ ] Database relationships

### **User Testing:**
- [ ] Budget planning workflow
- [ ] Expense tracking workflow
- [ ] Mobile responsiveness
- [ ] Error scenarios

---

## 📊 **Success Metrics (MVP)**

### **Adoption Metrics:**
- **Budget Creation Rate:** % of events that create budgets
- **Expense Tracking Rate:** % of budgets that log actual expenses
- **Completion Rate:** % of users who complete budget planning flow

### **User Experience Metrics:**
- **Time to Create Budget:** <5 minutes for basic budget
- **Error Rate:** <2% of budget creation attempts fail
- **User Satisfaction:** Positive feedback on budget workflow

### **Technical Metrics:**
- **API Response Time:** <300ms for budget operations
- **Calculation Accuracy:** 100% accurate financial calculations
- **Data Integrity:** No orphaned budget data

---

## 🚨 **Risk Assessment**

### **Technical Risks:**
- **Calculation Errors:** Financial calculations must be 100% accurate
- **Performance:** Complex calculations on large budgets
- **Data Consistency:** Keeping budgets in sync with events

### **User Experience Risks:**
- **Complexity:** Budget features might overwhelm simple event organizers
- **Workflow Disruption:** Changes to event editing interface
- **Learning Curve:** Financial terminology and concepts

### **Mitigation Strategies:**
- **Extensive Testing:** Particularly around financial calculations
- **Progressive Disclosure:** Hide complex features behind simple interface
- **Clear Documentation:** Help text and examples for budget concepts
- **Feature Flags:** Ability to disable features if issues arise

---

## 🔄 **Future Considerations (Post-MVP)**

### **Features to Consider Later:**
- **Budget Templates:** Pre-configured budgets for event types
- **Profit Goals:** Target profit margin tracking
- **Multi-Currency:** Support for different currencies
- **Advanced Reporting:** Charts and visualizations
- **Integration:** Connect with accounting software
- **Organization Analytics:** Cross-event financial tracking

### **User Feedback to Gather:**
- Which budget categories are most important?
- How detailed should expense tracking be?
- What financial reports would be most valuable?
- Should budgets be shareable with team members?

---

## 📞 **Team Responsibilities**

### **Development (Lead):**
- Database schema implementation
- API endpoint development
- Frontend component creation
- Integration with existing event management

### **Design/UX:**
- Budget interface design
- User flow optimization
- Mobile responsiveness
- Financial data visualization

### **Product:**
- Feature prioritization
- User story refinement
- Success metrics definition
- Feedback collection strategy

### **QA:**
- Financial calculation testing
- User workflow testing
- Cross-browser compatibility
- Data integrity validation

---

## ✅ **Ready for Implementation**

This MVP focuses on the core value proposition: **simple budget planning and expense tracking for individual events**. It integrates seamlessly with the existing platform while providing immediate value to organizers.

The approach is deliberately conservative - focusing on getting the basics right before adding complexity. Future iterations can expand based on user feedback and usage patterns.

**Next Step:** Schedule implementation for Day 2 post-beta launch.