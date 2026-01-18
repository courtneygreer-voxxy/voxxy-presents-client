# Voxxy Presents - Event Management Platform

**Modern event management and vendor coordination for venues, markets, and festivals.**

[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.6-purple)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-cyan)](https://tailwindcss.com/)

---

## 🎯 What is Voxxy Presents?

Voxxy Presents is a comprehensive web platform that connects **event organizers (producers)** with **vendors** to streamline the entire event lifecycle—from planning and vendor recruitment to application management and automated communications.

### Key Features

✅ **Event Creation & Management** - 4-step wizard for creating events with customizable vendor applications
✅ **Vendor Network (CRM)** - Manage vendor contacts, send invitations, track interactions
✅ **Application Management** - Review, approve, reject, or waitlist vendor applications
✅ **Automated Email System** - 40+ email templates with smart scheduling and variable interpolation
✅ **Public Application Pages** - Shareable forms for vendors to apply without accounts
✅ **Real-time Tracking** - Vendors can track application status via unique ticket codes
✅ **Admin Dashboard** - User management, role assignments, moderation tools

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18+ (see `.nvmrc`)
- **Package Manager**: npm or yarn
- **Backend API**: Rails backend running at `voxxyai.com/api`

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/voxxy-presents-client.git
cd voxxy-presents-client

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Environment Setup

Create a `.env` file:

```env
VITE_API_BASE_URL=https://www.voxxyai.com/api
VITE_MIXPANEL_TOKEN=your_mixpanel_token
```

---

## 📚 Documentation

### 🌟 Start Here

**New to the project?** Read these docs first:

1. **[CLAUDE_CONTEXT.md](./CLAUDE_CONTEXT.md)** - Complete platform overview (frontend + backend)
2. **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Navigate all documentation
3. **[ARCHITECTURE_SUMMARY.md](./ARCHITECTURE_SUMMARY.md)** - Quick architecture overview

### 📧 Email Automation System

The platform includes a comprehensive scheduled email system:

- **[SCHEDULED_EMAILS_SYSTEM.md](./SCHEDULED_EMAILS_SYSTEM.md)** ⭐ - Complete email system documentation
- **[EDIT_MODAL_SESSION_SUMMARY.md](./EDIT_MODAL_SESSION_SUMMARY.md)** - Variable system implementation
- **[EDIT_MODAL_IMPROVEMENTS.md](./EDIT_MODAL_IMPROVEMENTS.md)** - UX enhancements
- **[EMAIL_TEMPLATES.md](./EMAIL_TEMPLATES.md)** - Template library (40 templates)

### 🐛 Recent Bug Fixes (Jan 17, 2026)

- **[FINAL_BUILD_FIX.md](./FINAL_BUILD_FIX.md)** ⭐ CRITICAL - All TypeScript build errors resolved
- **[PAUSE_DELETE_FIX_SUMMARY.md](./PAUSE_DELETE_FIX_SUMMARY.md)** - Pause button HTTP method fix
- **[INVITATION_EMAIL_FIX.md](./INVITATION_EMAIL_FIX.md)** - Invitation display debugging

### 📖 Deep Dives

- **[CODEBASE_ANALYSIS.md](./CODEBASE_ANALYSIS.md)** - Detailed technical analysis
- **[FLOW_DIAGRAMS.md](./FLOW_DIAGRAMS.md)** - Visual architecture diagrams
- **[docs/](./docs/)** - Organized documentation (deployment, development, design, releases)

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18.3.1 + TypeScript 5
- **Build Tool:** Vite 6.3.6
- **Styling:** Tailwind CSS 3.4.17 + Radix UI components
- **Forms:** React Hook Form 7.61.1 + Zod 3.24.1 validation
- **Routing:** React Router DOM 7.7.1
- **State Management:** React Context API (AuthContext)
- **Icons:** Lucide React
- **Analytics:** Mixpanel (production only)
- **Date Handling:** date-fns
- **Charts:** Recharts

### Backend Integration
- **API:** Rails 7.2 REST API
- **Auth:** JWT tokens (24-hour expiration)
- **Base URL:** `https://www.voxxyai.com/api`
- **Documentation:** See [CLAUDE_CONTEXT.md](./CLAUDE_CONTEXT.md)

---

## 📂 Project Structure

```
src/
├── components/
│   ├── ui/              # 50+ Radix UI components (Button, Dialog, Card, etc.)
│   ├── producer/        # Producer dashboard components
│   │   ├── CreateEventWizard/  # 4-step event creation
│   │   ├── Email/              # Email automation (EmailAutomationTab, EditScheduledEmailModal)
│   │   └── Network/            # Vendor contact management (CRM)
│   ├── auth/            # Login/signup forms, protected routes
│   ├── admin/           # Admin dashboard components
│   └── analytics/       # Mixpanel tracking
├── pages/               # All route pages (33 screens)
│   ├── ProducerDashboard.tsx
│   ├── VendorDashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── PublicEventDetailPage.tsx
│   └── VendorApplicationForm.tsx
├── contexts/
│   └── AuthContext.tsx  # Global auth state with user profile
├── services/
│   └── api.ts           # Complete API client (2000+ lines)
├── hooks/               # useAuth, usePageTracking, etc.
├── utils/               # cache.ts, validation.ts, emailVariables.ts, etc.
├── types/               # TypeScript type definitions
└── config/
    └── environments.ts  # Environment detection
```

---

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev                  # Start dev server (localhost:5173)

# Build
npm run build                # Production build
npm run build:staging        # Staging build

# Quality Checks
npm run lint                 # ESLint
npm run typecheck            # TypeScript check (must pass before deploy)

# Preview
npm run preview              # Preview production build

# Security
npm run check:security       # Scan for exposed secrets
```

### Testing Before Deployment

```bash
# 1. Type check (CRITICAL - must pass)
npm run typecheck

# 2. Lint check
npm run lint

# 3. Build check
npm run build

# 4. Security check
npm run check:security
```

---

## 🚢 Deployment

### Build Status: ✅ Ready to Deploy

All TypeScript errors have been resolved. See [FINAL_BUILD_FIX.md](./FINAL_BUILD_FIX.md) for details.

### Deployment Checklist

- [x] All TypeScript errors resolved
- [x] Build succeeds locally
- [x] Pause/delete functionality fixed
- [x] Invitation email debugging enhanced
- [ ] Deploy to staging
- [ ] Test email automation features
- [ ] Deploy to production

### Deployment Documentation

- **[docs/deployment/DEPLOYMENT.md](./docs/deployment/DEPLOYMENT.md)** - General deployment guide
- **[docs/deployment/RENDER_DEPLOYMENT.md](./docs/deployment/RENDER_DEPLOYMENT.md)** - Render.com deployment
- **[docs/deployment/PLATFORM_INTEGRATION_DEPLOYMENT.md](./docs/deployment/PLATFORM_INTEGRATION_DEPLOYMENT.md)** - Platform integration

---

## 👥 User Roles

The platform supports multiple user roles with different access levels:

- **Admin** - Full system access, user management
- **Producer** (formerly venue_owner) - Create events, manage vendor applications
- **Vendor** - Browse events, submit applications
- **Consumer** - View public events, register
- **Guest** - Limited public access

See [CLAUDE_CONTEXT.md](./CLAUDE_CONTEXT.md) for detailed role documentation.

---

## 🔒 Authentication

- **JWT Tokens** stored in `localStorage` as `railsAuthToken`
- **24-hour expiration** (users must re-login)
- **Context API** provides auth state via `useAuth()` hook
- **Protected Routes** use `AdminRoute` and `ProtectedRouteV2` wrappers

Example:
```typescript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { userProfile, isProducer, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" />
  if (!isProducer) return <div>Access denied</div>

  return <div>Welcome {userProfile?.name}</div>
}
```

---

## 🎨 Styling & Design

- **Tailwind CSS** for utility-first styling
- **Radix UI** for accessible, headless components
- **Glass morphism** design system (see [docs/design/GLASS_MODAL_DESIGN_SYSTEM.md](./docs/design/GLASS_MODAL_DESIGN_SYSTEM.md))
- **Dark mode** via CSS variables
- **Responsive** design with mobile-first approach

---

## 🐛 Known Issues & Limitations

See [DOCUMENTATION_AUDIT_2026-01-17.md](./DOCUMENTATION_AUDIT_2026-01-17.md) for complete status.

### Recently Fixed ✅
- TypeScript build errors (9 errors resolved)
- Pause button not working (HTTP method mismatch)
- Invitation emails not displaying
- Edit modal cursor insertion issues

### Current Limitations
- No pagination on list endpoints (may cause performance issues with large datasets)
- No payment processing (Stripe integration planned)
- Limited vendor dashboard functionality
- No bulk email campaigns yet (UI exists, backend pending)

---

## 📊 Recent Updates

### January 17, 2026
- ✅ Resolved all TypeScript build errors (9 total)
- ✅ Fixed pause/resume button functionality
- ✅ Enhanced invitation email display with debugging
- ✅ Improved edit modal with clickable variables
- ✅ Added timezone-aware email scheduling
- ✅ Created comprehensive email system documentation

### January 7, 2026
- ✅ Payment deadline feature implementation
- ✅ Email automation debugging improvements

### January 4, 2026
- ✅ Email automation system complete (40 templates)
- ✅ Variable interpolation system (28 variables)
- ✅ Trigger-based scheduling

See [docs/releases/](./docs/releases/) for full release history.

---

## 🤝 Contributing

See [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) for development workflow and guidelines.

### Branching Strategy

- `main` - Production branch
- `develop` - Development branch (default)
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-description`

See [docs/development/BRANCHING_STRATEGY.md](./docs/development/BRANCHING_STRATEGY.md) for details.

---

## 📧 Support & Contact

- **Issues:** Use GitHub Issues
- **Documentation Questions:** See [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)
- **Email:** team@voxxyai.com

---

## 📄 License

Proprietary - All rights reserved

---

## 🙏 Acknowledgments

Built with:
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Last Updated:** January 17, 2026
**Version:** 2.0
**Status:** ✅ Production Ready (build errors resolved)

---

## 🔗 Quick Links

- [📚 Complete Documentation Index](./DOCUMENTATION_INDEX.md)
- [🎯 Platform Context (Claude)](./CLAUDE_CONTEXT.md)
- [📧 Email System Docs](./SCHEDULED_EMAILS_SYSTEM.md)
- [🏗️ Architecture Overview](./ARCHITECTURE_SUMMARY.md)
- [🐛 Build Fix Guide](./FINAL_BUILD_FIX.md)
- [📊 Documentation Audit](./DOCUMENTATION_AUDIT_2026-01-17.md)

**Ready to start?** Run `npm run dev` and open [http://localhost:5173](http://localhost:5173)
