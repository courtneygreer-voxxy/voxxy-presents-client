# Voxxy Presents - Event Management Platform

**Modern event management and vendor coordination for venues, markets, and festivals.**

**Repository:** [Voxxy-AI/voxxy-presents-client](https://github.com/Voxxy-AI/voxxy-presents-client)

---

## Deployment & Branch Strategy

### Active Branches

| Branch | Environment | URL | Auto-deploy |
|--------|-------------|-----|-------------|
| `main` | Production | https://voxxypresents.com | Yes -- on merge via Render |
| `staging` | Pre-production | Render staging service | Yes -- on merge via Render |
| `dev` | Integration testing | Render dev service | Yes -- on merge via Render |

---

## Team Swim Lanes -- How We Ship Code

Every change follows this path. **No direct pushes to `dev`, `staging`, or `main`.**

```
  Your local branch
         |
         | git push origin <branch>
         v
  Open PR -> dev
         |
         | CI must pass (typecheck + lint + test + build)
         | Self-merge allowed after green CI
         v
       dev  -->  Render dev deploy (automatic)
         |
         | Integration testing on dev environment
         | Open PR -> staging
         v
      staging  -->  Render staging deploy (automatic)
         |
         | Manual QA / smoke test on staging
         | Open PR -> main
         | Requires at least 1 review + green CI
         v
        main  -->  Render production deploy (automatic)
```

### Branch Naming Conventions

Always branch off `dev`. Use one of these prefixes:

| Prefix | When to use | Example |
|--------|-------------|---------|
| `feature/` | New functionality | `feature/email-unsubscribe-flow` |
| `fix/` | Bug fix (non-urgent) | `fix/contact-upload-validation` |
| `hotfix/` | Urgent production fix | `hotfix/broken-go-live-button` |
| `chore/` | Maintenance, refactors, tooling | `chore/remove-legacy-tests` |
| `release/` | Release preparation | `release/v2.1.0` |

### PR Rules (enforced by branch protection)

- PRs into `dev`: CI must pass. Self-merge allowed.
- PRs into `staging`: CI must pass. Self-merge allowed.
- PRs into `main`: CI must pass + minimum 1 approving review required.
- Never force-push to `dev`, `staging`, or `main`.
- Delete your branch after it merges.

---

## Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 3
- **UI Components:** Radix UI (shadcn/ui), Lucide Icons, Sonner (toasts)
- **State Management:** React Context API
- **Forms:** React Hook Form + Zod validation
- **Rich Text Editing:** TipTap (email editor)
- **Authentication:** JWT (Rails backend)
- **Error Monitoring:** Sentry
- **Analytics:** Mixpanel (production only)

### Backend (separate repo)
- **API:** Rails 7.2 + Ruby 3.3
- **Database:** PostgreSQL
- **Email:** SendGrid with automated campaigns
- **Background Jobs:** Sidekiq + Redis
- **Hosting:** Render.com

### Testing
- **Runner:** Vitest 3 + jsdom
- **Component Testing:** @testing-library/react
- **CI:** GitHub Actions (typecheck + lint + **test** + build on every PR)
- **Roadmap:** [docs/TESTING_ROADMAP.md](docs/TESTING_ROADMAP.md)

---

## Development

### Prerequisites
- Node.js 18+
- npm

### Setup
```bash
npm install
npm run dev
```

The frontend connects to the Rails API backend. For local development, the backend must be running on port 3001. See the [backend repo](https://github.com/Voxxy-AI/voxxy-rails-react) README for setup instructions. API base URLs are configured in `src/config/environments.ts`.

### Commands
```bash
npm run dev           # Start dev server (http://localhost:5173)
npm run build         # Build for production
npm run test          # Run tests in watch mode
npm run test:run      # Run tests once (CI mode)
npm run typecheck     # Type checking
npm run lint          # Linting
npm run preview       # Preview production build
```

---

## Project Structure

```
src/
  components/
    producer/       # Event mgmt, email automation, applicants, network, payments
    vendor/         # Vendor portal components
    admin/          # Email testing, sequence mgr, bug reports
    auth/           # Login, signup, protected routes
    ui/             # shadcn/Radix components
    shared/         # Cross-role components
  services/
    api.ts          # Central API client (~3000 lines)
    stripeService.ts
    eventPortalService.ts
    googlePlacesService.ts
  contexts/
    AuthContext.tsx  # Central auth state + role helpers
  pages/            # Route-level components (36+)
  hooks/            # useAuth, useEmailNotifications, etc.
  types/            # TypeScript type definitions
  utils/            # Helpers (date, email variables, validation, cache)
  test/             # Test setup and smoke tests
  config/
    environments.ts # Dev/staging/prod config
```

---

## API Integration

**Backend Repository:** [Voxxy-AI/voxxy-rails-react](https://github.com/Voxxy-AI/voxxy-rails-react)

All API endpoints are namespaced under `/api/v1/presents/`.

---

## Documentation

- [Testing Roadmap](docs/TESTING_ROADMAP.md) -- testing strategy and progress
- [Architecture](docs/architecture/) -- system design, API config, role mapping
- [Deployment](docs/deployment/) -- Render config, environment setup
- [Email System](docs/email-system/) -- templates, variables, automation pipeline
- [Development](docs/development/) -- branching strategy, runbook, tracking plan
- [Design](docs/design/) -- styling guide, design system

---

Last updated: June 2, 2026
