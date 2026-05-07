# Voxxy Presents Client - Documentation Index

This directory contains comprehensive documentation about the Voxxy Presents React application, with a focus on authentication, application architecture, and API integration.

## Documentation Files

### Session Guide — READ EVERY SESSION

#### 0. **SESSION_GUIDE.md** — READ THIS FIRST
   - Master bootstrap document for coding sessions and AI agents
   - Rules & Learnings (growing anti-pattern list with IDs)
   - Rebase workflow and test commands (SESSION_START mode)
   - Pre-PR validation checklist (PRE_PR mode)
   - Extended doc references by topic
   - **Read this at the START of every session and BEFORE every PR**

### Core Architecture & Auth Documentation

#### 1. **ARCHITECTURE_SUMMARY.md** (19 KB) - START HERE
   - Most comprehensive guide to the entire application
   - Complete authentication flow explanation
   - Protected routes and authorization
   - Application structure and folder organization
   - State management approach
   - API integration patterns
   - Environment configuration
   - Role mapping and permissions
   - Error handling strategies
   - **Read this first for a complete understanding**

#### 2. **ARCHITECTURE_DIAGRAM.txt** (24 KB) - VISUAL REFERENCE
   - ASCII diagrams of system architecture
   - Entry point flow
   - Auth system architecture diagram
   - Routing architecture
   - Route protection components
   - Login/logout sequence diagrams
   - Component hierarchy
   - State management diagram
   - Error handling visualization
   - **Use this for visual understanding of flows**

#### 3. **AUTH_QUICK_REFERENCE.md** (10 KB) - DEVELOPER REFERENCE
   - Quick lookup guide for common auth tasks
   - Code examples for authentication methods
   - Protected route examples
   - Token management snippets
   - Component usage patterns
   - Debugging tips
   - Common patterns and examples
   - **Use this when implementing auth features**

### API & Configuration Documentation

#### 4. **API_CONFIGURATION.md** (11 KB)
   - API endpoint documentation
   - Authentication endpoints
   - Organizations API
   - Events API
   - Admin API
   - Request/response examples
   - **Reference for API calls**

#### 5. **ROLE_MAPPING.md** (3.8 KB)
   - User role definitions
   - Role-to-feature mapping
   - Permission matrix
   - **Reference for role-based access control**

### Development Guides

#### 6. **ROLE_SWITCH_DEBUG.md** (3.7 KB)
   - Debug panel usage
   - Role switching for testing
   - Debug mode instructions
   - **Use for development and testing**

#### 7. **PRODUCER_FLOW_STATUS.md** (12 KB)
   - Producer/venue owner workflows
   - Feature status
   - Implementation notes
   - **Reference for producer-specific features**

### Project Basics

#### 8. **README.md** (1.7 KB)
   - Project overview
   - Quick start instructions
   - Basic setup

### Email System Documentation

#### 9. **email-system/ Directory** - COMPLETE EMAIL SYSTEM GUIDE
   - **START HERE:** [email-system/EMAIL_DOCUMENTATION_INDEX.md](./email-system/EMAIL_DOCUMENTATION_INDEX.md)
   - Producer guide for email editor
   - Complete variable reference (48 variables)
   - System architecture and technical specs
   - Deliverability tracking (100% coverage as of April 9, 2026)
   - Email Audit Log documentation
   - **Use this for all email-related work**

**Quick Links:**
   - Producer Guide: [email-system/EMAIL_EDITOR_GUIDE.md](./email-system/EMAIL_EDITOR_GUIDE.md)
   - Developer Guide: [email-system/EMAIL_SYSTEM_GUIDE.md](./email-system/EMAIL_SYSTEM_GUIDE.md)
   - Variables Reference: [email-system/EMAIL_VARIABLES_REFERENCE.md](./email-system/EMAIL_VARIABLES_REFERENCE.md)
   - Latest Fix (April 9, 2026): [email-system/AUDIT_LOG_ACTIVE_EMAILS_FIX_APRIL_2026.md](./email-system/AUDIT_LOG_ACTIVE_EMAILS_FIX_APRIL_2026.md)

---

## Quick Navigation by Topic

### I want to understand...

**Authentication Flow**
- Start with: ARCHITECTURE_SUMMARY.md (Section 1)
- Visual reference: ARCHITECTURE_DIAGRAM.txt (Auth System Architecture)
- Code examples: AUTH_QUICK_REFERENCE.md

**How Protected Routes Work**
- Details: ARCHITECTURE_SUMMARY.md (Section 2)
- Diagrams: ARCHITECTURE_DIAGRAM.txt (Route Protection Components)
- Code: See `/src/components/auth/AdminRoute.tsx` and `ProtectedRouteV2.tsx`

**Application Structure**
- Complete overview: ARCHITECTURE_SUMMARY.md (Section 3)
- Folder layout: ARCHITECTURE_SUMMARY.md (Section 3.1)
- Component hierarchy: ARCHITECTURE_DIAGRAM.txt (Component Hierarchy)

**API Integration**
- Details: ARCHITECTURE_SUMMARY.md (Section 3.4)
- Endpoints: API_CONFIGURATION.md
- Examples: See `/src/services/api.ts`

**User Roles & Permissions**
- Role mapping: ROLE_MAPPING.md
- Context details: ARCHITECTURE_SUMMARY.md (Section 8)
- Role helpers: AUTH_QUICK_REFERENCE.md (Accessing Auth State)

**Environment Configuration**
- Details: ARCHITECTURE_SUMMARY.md (Section 4)
- Variables: AUTH_QUICK_REFERENCE.md (Environment Variables)
- Setup: See `/src/config/environments.ts`

**State Management**
- Architecture: ARCHITECTURE_SUMMARY.md (Section 3.3)
- Diagram: ARCHITECTURE_DIAGRAM.txt (State Management)
- Code: See `/src/contexts/AuthContext.tsx`

**Error Handling**
- Details: ARCHITECTURE_SUMMARY.md (Section 10)
- Strategies: ARCHITECTURE_DIAGRAM.txt (Error Handling)
- Examples: AUTH_QUICK_REFERENCE.md (Error Handling)

---

## Key Files in the Codebase

### Authentication (Most Critical)
1. `/src/contexts/AuthContext.tsx` - Auth state management
2. `/src/services/api.ts` - API calls & token management
3. `/src/App.tsx` - Router setup & route protection
4. `/src/components/auth/AdminRoute.tsx` - Admin route guard
5. `/src/components/auth/ProtectedRouteV2.tsx` - Auth page guard

### Supporting Files
6. `/src/utils/cache.ts` - User profile caching
7. `/src/config/environments.ts` - Environment configuration
8. `/src/pages/LoginPage.tsx` - Login UI
9. `/src/pages/BetaPendingPage.tsx` - Example dashboard
10. `/src/main.tsx` - Application entry point

### See ARCHITECTURE_SUMMARY.md Section 6 for complete file reference

---

## How Authentication Works (30-Second Summary)

1. **Login**: User enters credentials → API returns JWT token → Token saved to localStorage
2. **Session**: Token added to API request headers → User profile cached in localStorage (5-min TTL)
3. **Protection**: Protected routes check auth status & user role → Redirect if unauthorized
4. **Logout**: Clear token & cache → API notifies backend → User redirected home

---

## Role-Based Access Summary

| Role | Redirect | Access |
|------|----------|--------|
| producer (venue_owner) | /producer/pending | Event management, organization creation |
| vendor | /vendor/pending | Vendor applications, registration |
| consumer (guest) | /pending | Beta access pending |
| admin | /admin/dashboard | Full system access |

---

## Common Tasks

### Adding a New Protected Route
1. Create the page component
2. Wrap in `<AdminRoute>` if admin-only, or `<RedirectIfAuthenticatedV2>` if auth page
3. Add to routes in `/src/App.tsx`
4. Reference: ARCHITECTURE_SUMMARY.md Section 2 or AUTH_QUICK_REFERENCE.md

### Accessing User Data
1. Import: `import { useAuth } from '@/contexts/AuthContext'`
2. Use: `const { userProfile, isAdmin } = useAuth()`
3. Examples: AUTH_QUICK_REFERENCE.md (Accessing Auth State)

### Making API Calls
1. Use existing API methods from `/src/services/api.ts`
2. Or add new method to relevant API object (authApi, eventsApi, etc.)
3. Include Authorization header automatically
4. Reference: API_CONFIGURATION.md

### Debugging Auth Issues
1. Check localStorage in browser dev tools
2. View token: `localStorage.getItem('railsAuthToken')`
3. View cached profile: `JSON.parse(localStorage.getItem('user_profile_rails-user'))`
4. More tips: AUTH_QUICK_REFERENCE.md (Debugging Tips)

---

## File Organization

```
Documentation/
├── ARCHITECTURE_SUMMARY.md          ← START HERE
├── ARCHITECTURE_DIAGRAM.txt         ← Visual reference
├── AUTH_QUICK_REFERENCE.md          ← Developer cheatsheet
├── API_CONFIGURATION.md             ← API reference
├── ROLE_MAPPING.md                  ← Role definitions
├── ROLE_SWITCH_DEBUG.md            ← Debug guide
├── PRODUCER_FLOW_STATUS.md         ← Producer features
├── DOCUMENTATION_INDEX.md           ← This file
└── email-system/                    ← EMAIL SYSTEM DOCS
    ├── EMAIL_DOCUMENTATION_INDEX.md ← Email system start here
    ├── EMAIL_SYSTEM_GUIDE.md        ← Technical guide
    ├── EMAIL_EDITOR_GUIDE.md        ← Producer guide
    ├── EMAIL_VARIABLES_REFERENCE.md ← Variable reference
    ├── AUDIT_LOG_ACTIVE_EMAILS_FIX_APRIL_2026.md
    └── ... (complete email documentation)

Source Code Structure/
├── src/
│   ├── contexts/AuthContext.tsx    ← Auth state (READ FIRST)
│   ├── services/api.ts             ← API calls (READ SECOND)
│   ├── App.tsx                     ← Routes (READ THIRD)
│   ├── components/auth/            ← Auth components
│   ├── pages/                      ← Page components
│   ├── utils/cache.ts              ← Caching utilities
│   ├── config/environments.ts      ← Environment setup
│   └── ...
```

---

## Technologies Used

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **State Management**: React Context API (no Redux)
- **UI Components**: Shadcn UI + Radix UI
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **Validation**: Zod
- **HTTP Client**: Native Fetch API
- **Icons**: Lucide React
- **Analytics**: Mixpanel
- **Backend**: Rails (API)

---

## Version Information

- **App Version**: 0.1.2
- **React**: 18.3.1
- **TypeScript**: 5.x
- **Vite**: 6.3.6
- **Node Recommended**: 18+ (see .nvmrc)

---

## Getting Started

1. **New to the codebase?**
   - Read: ARCHITECTURE_SUMMARY.md
   - View: ARCHITECTURE_DIAGRAM.txt
   - Reference: AUTH_QUICK_REFERENCE.md

2. **Need to implement auth features?**
   - Check: AUTH_QUICK_REFERENCE.md
   - Reference: `/src/contexts/AuthContext.tsx`
   - Copy patterns from: `/src/pages/LoginPage.tsx`

3. **Working with routes?**
   - Read: ARCHITECTURE_SUMMARY.md Section 2
   - Check: `/src/App.tsx`
   - Review: ARCHITECTURE_DIAGRAM.txt (Routing Architecture)

4. **Making API calls?**
   - Reference: API_CONFIGURATION.md
   - Examples: `/src/services/api.ts`
   - Usage: ARCHITECTURE_SUMMARY.md Section 3.4

---

## Questions? Check Here

**Q: How do I check if a user is authenticated?**
A: Use `const { isAuthenticated } = useAuth()` - See AUTH_QUICK_REFERENCE.md

**Q: How do I create a protected route?**
A: Use `<AdminRoute>` or `<RedirectIfAuthenticatedV2>` - See ARCHITECTURE_SUMMARY.md Section 2

**Q: Where is the auth state stored?**
A: React Context API (AuthContext.tsx) + localStorage (token & cached profile) - See ARCHITECTURE_SUMMARY.md Section 3.3

**Q: What API endpoints are available?**
A: See API_CONFIGURATION.md or `/src/services/api.ts`

**Q: How do user roles work?**
A: See ROLE_MAPPING.md and ARCHITECTURE_SUMMARY.md Section 8

**Q: How do I debug authentication issues?**
A: See AUTH_QUICK_REFERENCE.md (Debugging Tips)

**Q: What happens on app startup?**
A: See ARCHITECTURE_SUMMARY.md Section 9 or ARCHITECTURE_DIAGRAM.txt (Entry Point Flow)

---

## Next Steps

1. Read ARCHITECTURE_SUMMARY.md for complete understanding
2. Reference ARCHITECTURE_DIAGRAM.txt for visual clarity
3. Use AUTH_QUICK_REFERENCE.md as your development guide
4. Consult API_CONFIGURATION.md for API details
5. Explore the codebase starting with `/src/contexts/AuthContext.tsx`

---

**Last Updated**: November 22, 2025
**Documentation Generated**: November 22, 2025
