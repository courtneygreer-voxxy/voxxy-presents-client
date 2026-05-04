# Voxxy Presents Frontend - Quick Architecture Summary

## What This App Does

Voxxy Presents is an **event management and vendor coordination platform** that allows:
- Event producers to create events and manage vendor participation
- Vendors to apply for vendor opportunities at events
- Event organizers to curate vendor networks and send invitations

## Core User Flows

### Producer Workflow
```
Sign Up (producer role)
  → Auto-create organization
  → Create event via wizard (4 steps)
    - Basic info + dates
    - Settings (capacity, pricing)
    - Invite vendors from network
    - Review & confirm
  → Manage vendor applications
  → View submitted vendors
  → Accept/reject vendors
  → Edit vendor details (syncs with Network CRM)
```

### Vendor Workflow
```
Navigate to event page
  → View event details
  → Fill vendor application form
  → Get ticket code
  → Track application status
```

### Authentication
```
User submits contact form (beta request)
  → Backend approves
  → User gets login credentials
  → Login with email/password
  → JWT token stored in localStorage
  → Redirected to role-based dashboard
```

## Tech Stack Overview

| Category | Tech |
|----------|------|
| **Frontend** | React 18 + TypeScript |
| **Build** | Vite 6 |
| **Routing** | React Router 7 |
| **Styling** | TailwindCSS + Radix UI |
| **State** | Context API + localStorage |
| **Forms** | React Hook Form + Zod |
| **API** | Native Fetch (custom wrapper) |
| **Analytics** | Mixpanel |
| **Testing** | Vitest + React Testing Library |

## Project Structure

```
src/
├── pages/           # Route pages (33 files)
├── components/      # Reusable components
│   ├── ui/         # Radix UI wrappers
│   ├── auth/       # Login, signup, etc
│   ├── producer/   # Event wizard, dashboards
│   └── analytics/  # Analytics tracking
├── contexts/       # AuthContext for state
├── services/       # API client (api.ts)
├── hooks/          # Custom hooks
├── utils/          # Validation, cache, etc
└── config/         # Environment config
```

## Key Architectural Decisions

### 1. Authentication Pattern
- **Single Auth Context** - All auth state in one place
- **JWT in localStorage** - Persisted across sessions
- **Role-based routing** - Different dashboards for different users
- **Protected routes** - AdminRoute, ProtectedRouteV2 wrappers

### 2. API Integration
- **Centralized API service** - Single `api.ts` file with organized API objects
- **Custom fetch wrapper** - `fetchApi<T>()` handles auth, errors, serialization
- **Auto token injection** - Bearer token automatically added to requests
- **Domain organization** - authApi, eventsApi, vendorApplicationsApi, etc.

### 3. State Management
- **Minimal approach** - Context API for auth, useState for component state
- **Smart caching** - User profiles cached locally for faster load
- **No Redux** - Kept simple and maintainable

### 4. Component Organization
- **Feature-based** - Components grouped by feature (producer, auth)
- **Separation of concerns** - UI components separate from feature logic
- **Reusable primitives** - Radix UI for accessibility and consistency

## Important Files to Know

| File | Purpose |
|------|---------|
| `App.tsx` | Main router with all routes defined |
| `contexts/AuthContext.tsx` | Auth state, login, signup, logout |
| `services/api.ts` | All API endpoints (40KB) |
| `pages/ProducerDashboard.tsx` | Main producer dashboard |
| `components/producer/CreateEventWizard/` | Event creation flow |
| `components/producer/Network/` | Vendor contacts management |
| `components/producer/ApplicantsTab.tsx` | Vendors & Applicants tab with CRM merge |
| `components/producer/EditVendorDetailsModal.tsx` | Edit vendor details with bidirectional sync |
| `docs/architecture/VENDOR_CRM_BIDIRECTIONAL_SYNC.md` | Complete CRM sync architecture |

## Current Features

### MVP Features
- User authentication (login, signup, password reset)
- Producer can create events (4-step wizard)
- Producer can manage vendor contacts/network
- Vendors can apply for vendor opportunities
- Application tracking by ticket code
- Admin dashboard
- Smart CRM merge (Network ↔ Vendors bidirectional sync)

### Feature Status
- **Complete**: Auth, event creation, vendor applications, tracking, CRM sync
- **In Progress**: Event invitation system (frontend complete, awaiting backend)
- **Planned**: Email notifications, advanced analytics

## API Endpoints Summary

```
Auth:     POST /login, POST /users, DELETE /logout, GET /me
Events:   POST/GET/PATCH events, GET event details
Vendors:  POST vendor applications, GET submissions, PATCH status
Email:    POST contact form, GET contact submissions
```

All endpoints documented in `CODEBASE_ANALYSIS.md`

## Development Quick Start

```bash
# Install
npm install

# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run typecheck    # Check TypeScript
npm run lint         # Run ESLint

# Environment
.env.development    # Dev config
.env.staging        # Staging config
.env.production     # Production config
```

## Important Notes

1. **No Direct Signup Page** - Users request beta access via contact form
2. **Organization Auto-Creation** - First login auto-creates org for producer
3. **Public & Private Routes** - Some routes need auth, some don't
4. **Invitation System** - Frontend ready but needs backend API implementation
5. **Multi-environment** - Dev/staging/production configs in `config/environments.ts`

## Next Steps for Development

1. Implement event invitations API endpoints (see `docs/BACKEND_INVITATION_REQUIREMENTS.md`)
2. Add email notification system
3. Implement vendor invitation acceptance/decline flows
4. Add advanced analytics dashboard
5. Mobile app optimization

---

For detailed analysis, see `CODEBASE_ANALYSIS.md`
