# Voxxy Presents - Event Management Platform

**Modern event management and vendor coordination for venues, markets, and festivals.**

**Repository:** [Voxxy-AI/voxxy-presents-client](https://github.com/Voxxy-AI/voxxy-presents-client)

---

## Deployment & Branch Strategy

### Active Branches

| Branch | Environment | URL | Auto-deploy |
|--------|-------------|-----|-------------|
| `main` | Production | https://voxxypresents.com | Yes — on merge via Render |
| `staging` | Pre-production | Render staging service | Yes — on merge via Render |

> `develop` was retired in April 2026 during the org transfer to Voxxy-AI.

---

## Team Swim Lanes — How We Ship Code

Every change follows this path. **No direct pushes to `staging` or `main`.**

```
  Your local branch
         |
         | git push origin <branch>
         ↓
  Open PR → staging
         |
         | CI must pass (typecheck + lint + build)
         | Self-merge allowed after green CI
         ↓
      staging  ──→  Render staging deploy (automatic)
         |
         | Manual QA / smoke test on staging
         | Open PR → main
         | Requires at least 1 review + green CI
         ↓
        main  ──→  Render production deploy (automatic)
```

### Branch Naming Conventions

Always branch off `staging`. Use one of these prefixes:

| Prefix | When to use | Example |
|--------|-------------|---------|
| `feature/` | New functionality | `feature/email-unsubscribe-flow` |
| `fix/` | Bug fix (non-urgent) | `fix/contact-upload-validation` |
| `hotfix/` | Urgent production fix | `hotfix/broken-go-live-button` |
| `chore/` | Maintenance, refactors, tooling | `chore/remove-legacy-tests` |
| `release/` | Release preparation | `release/v2.1.0` |

### PR Rules (enforced by branch protection)

- PRs into `staging`: CI must pass. Self-merge allowed.
- PRs into `main`: CI must pass + minimum 1 approving review required.
- Never force-push to `staging` or `main`.
- Delete your branch after it merges.

### CI/CD Status

- **GitHub Actions:** Runs on every PR into `staging` and `main`
- **Checks:** TypeScript typecheck → ESLint → Vite build
- **Production Deploy:** Automatic via Render on merge to `main`
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
- **Testing:** Being rebuilt — see CI strategy docs (coming soon)
- **CI/CD:** GitHub Actions (typecheck + lint + build on every PR)

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
- **4-step event creation wizard** with:
  - Step 1: Event details (date, location, deadlines)
  - Step 2: Category selection with **smart pre-fill** from previous events
  - Step 3: Contact invitation with **immediate import** and multi-select
  - Step 4: Email sequence configuration (Universal or Category-Specific)
- Category-based vendor applications with customizable pricing
- **Smart category defaults** from organization history
- Budget tracking and line items
- Custom vendor categories with **email template assignments**
- Application and payment deadline management

### Email Automation
- 40+ pre-built email templates
- Custom email sequence builder with **visual editor**
- **Universal Sequence** option (default) - same emails for all vendor categories
- **Category-Specific Sequences** - custom templates per vendor type
- Automated trigger-based scheduling
- Variable interpolation (event, vendor, portal data)
- SendGrid delivery tracking
- Email preview with sample data
- **Email template count** display per category
- Smart send date calculations based on event dates

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

**Backend Repository:** [voxxy-rails-react](https://github.com/Voxxy-AI/voxxy-rails-react)

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

- **[Email Sequence System](https://github.com/Voxxy-AI/voxxy-rails-react/blob/main/docs/EMAIL_SEQUENCE_SYSTEM.md)** - Complete email management guide
- **[Ruby Upgrade Plan](https://github.com/Voxxy-AI/voxxy-rails-react/blob/main/RUBY_UPGRADE_PLAN.md)** - Backend upgrade documentation

---

**Built with love by the Voxxy team**

Last updated: April 28, 2026 — Org transfer to Voxxy-AI, branch strategy updated, legacy tests removed
