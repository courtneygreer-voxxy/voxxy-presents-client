# Voxxy Presents - Event Management Platform

**Modern event management and vendor coordination for venues, markets, and festivals.**

**Latest Updates**: Email sequence management system with template cloning, full-screen email editor with variable insertion and live preview, and email date calculation fixes (March 2026).

---

## 🚀 Deployment & Branch Strategy

### Production Environment
- **Platform:** Firebase Hosting
- **Branch:** `main`
- **URL:** https://voxxypresents.com
- **Build:** Automated via GitHub Actions on push to main
- **CI Status:** ✅ Passing (Production CI/CD workflow)

### Staging Environment
- **Branch:** `staging`
- **Testing:** Pre-production feature testing
- **Status:** Currently in sync with main and develop

### Development Environment
- **Branch:** `develop`
- **Purpose:** Active development and feature integration
- **Status:** Currently in sync with main and staging

### Branch Workflow
```
feature/branch → develop → staging → main (production)
```

**Current Branch Status (March 2026):**
- Backend upgraded to Ruby 3.3.6 and Rails 7.2.3
- Email sequence management system deployed to staging
- Last feature: Email template editor & sequence cloning (staging)
- Last staging merge: March 5, 2026
- Production deploy: Pending validation on staging

### Deployment Process
1. Develop features in `feature/*` branches
2. Merge to `develop` for integration testing
3. Merge to `staging` for pre-production validation
4. Merge to `main` for production deployment
5. GitHub Actions automatically builds and deploys to Firebase

### CI/CD Status
- **GitHub Actions:** ✅ All workflows passing
- **CodeQL Security:** ✅ Enabled and passing
- **Production Deploy:** Automatic on push to main
- **Build Time:** ~1.5 minutes average

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 4
- **Styling:** Tailwind CSS 3
- **UI Components:** Radix UI, Lucide Icons, Sonner (toasts)
- **State Management:** React Query (TanStack Query)
- **Rich Text Editing:** TipTap (email editor)
- **Date Handling:** date-fns
- **Charts:** Recharts
- **Authentication:** Firebase Auth
- **Error Monitoring:** Sentry

### Backend
- **API:** Rails 7.2.3 + Ruby 3.3.6
- **Database:** PostgreSQL 14+
- **Email:** SendGrid with automated campaigns
- **Background Jobs:** Sidekiq + Redis
- **Hosting:** Render.com (backend), Firebase Hosting (frontend)

### Development Tools
- **Linting:** ESLint
- **Type Checking:** TypeScript 5
- **Code Quality:** Prettier
- **Testing:** (TBD - Vitest/Jest)
- **CI/CD:** GitHub Actions

---

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Deploy
```bash
# Production (main branch only)
firebase deploy --only hosting
```

---

## ✨ Recent Features (March 2026)

### Email Sequence Management System
- **Template Library** - Browse and manage email campaign templates
- **Clone & Customize** - Duplicate system templates and create custom sequences
- **Full-Screen Editor** - Rich text email editor with formatting controls
- **Variable Insertion** - 30+ dynamic variables with click-to-insert
- **Live Preview** - Preview emails with sample data before sending
- **Trigger Configuration** - Set up automated email schedules
- **Filter Criteria** - Target specific vendor groups
- **Client-Side Validation** - Prevent duplicate names and invalid data

### Email Date Calculation Fixes
- Fixed timezone issues with event countdown emails
- Corrected application/payment deadline trigger calculations
- Accurate "days before/after" date calculations using `parseISO`

### UI/UX Improvements
- Replaced browser popups with styled modal dialogs
- Toast notifications for user feedback (Sonner)
- Dark-themed email preview panels
- Proper paragraph spacing and header styling in previews
- Events navigation always returns to list view

---

## 📁 Project Structure

```
src/
├── components/
│   ├── producer/
│   │   ├── Email/
│   │   │   ├── TemplateLibraryPage.tsx      # Browse/clone templates
│   │   │   ├── TemplateBuilderPage.tsx      # Create/edit sequences
│   │   │   ├── EmailTemplateEditorPage.tsx  # Full-screen editor
│   │   │   └── CommandCenter.tsx             # Event email management
│   │   ├── CreateEventWizard/
│   │   │   └── steps/
│   │   │       └── Step4AutoMessages.tsx     # Email schedule preview
│   │   ├── ProducerDashboard.tsx             # Main producer UI
│   │   └── ...
│   ├── vendor/                                # Vendor portal components
│   └── shared/                                # Reusable components
├── services/
│   ├── emailTemplateApi.ts                    # Email template API client
│   ├── api.ts                                 # Main API client
│   └── ...
├── types/
│   ├── email.ts                               # Email type definitions
│   └── ...
├── pages/                                     # Route pages
└── index.css                                  # Global styles + email preview CSS
```

---

## 🧪 Key Features

### Event Management
- Multi-step event creation wizard
- Vendor application management
- Budget tracking and line items
- Custom vendor categories
- Application deadline management

### Email Automation
- 40+ pre-built email templates
- Custom email sequence builder
- Automated trigger-based scheduling
- Variable interpolation (event, vendor, portal data)
- SendGrid delivery tracking
- Email preview with sample data

### Vendor Portal
- Unique token-based access
- Application submission
- Status tracking
- Payment integration (Stripe - planned)
- Profile management

### Producer Dashboard
- Event overview and statistics
- Vendor CRM
- Email campaign management
- Registration approval workflow
- Budget tracking

### Admin Features
- User management
- System email template management
- Organization oversight
- Platform analytics

---

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Firebase
firebase deploy --only hosting
```

---

## 🌐 API Integration

**Backend Repository:** [voxxy-rails-react](https://github.com/beaulazear/voxxy-rails-react)

**API Base URL:**
- Production: `https://www.voxxyai.com/api/v1/presents`
- Staging: `https://voxxy-rails-react.onrender.com/api/v1/presents`

**Key Endpoints:**
```
GET    /events                            # List events
POST   /events                            # Create event
GET    /events/:slug                      # Get event details
PATCH  /events/:slug                      # Update event
GET    /events/:slug/registrations        # Get vendor applications
PATCH  /registrations/:id                 # Approve/reject application
GET    /email_campaign_templates          # List email sequences
POST   /email_campaign_templates/:id/clone  # Clone template
```

---

## 📚 Documentation

- **[Email Sequence System](https://github.com/beaulazear/voxxy-rails-react/blob/main/docs/EMAIL_SEQUENCE_SYSTEM.md)** - Complete email management guide
- **[Ruby Upgrade Plan](https://github.com/beaulazear/voxxy-rails-react/blob/main/RUBY_UPGRADE_PLAN.md)** - Backend upgrade documentation
- **[Deployment Guide](README_DEPLOY.md)** - Firebase deployment instructions

---

**Built with ❤️ by the Voxxy team**

Last updated: March 5, 2026 - Email sequence management system and template editor
