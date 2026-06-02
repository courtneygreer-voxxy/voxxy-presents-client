# Voxxy Presents Client

React 18 + TypeScript frontend for **Voxxy Presents** — event management and vendor coordination for venues, markets, and festivals.

## Branch Strategy

```
feature/* → dev → staging → main (production)
```

- **dev**: Integration testing (Render dev service)
- **staging**: Pre-production (Render staging service)
- **main**: Production (https://voxxypresents.com)

Always branch from `dev`. PRs to `main` require review + green CI.

## Local Development

```bash
npm install
npm run dev          # http://localhost:5173
```

Requires the Rails API backend running on port 3001. See [voxxy-rails-react](https://github.com/Voxxy-AI/voxxy-rails-react) for backend setup.

API base URLs are configured in `src/config/environments.ts`.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build**: Vite 6
- **Styling**: Tailwind CSS 3
- **UI Components**: Radix UI (shadcn/ui), Lucide Icons, Sonner (toasts)
- **Forms**: React Hook Form + Zod validation
- **Rich Text**: TipTap (email editor)
- **Auth**: JWT from Rails backend
- **Error Monitoring**: Sentry
- **Analytics**: Mixpanel (production only)
- **Testing**: Vitest 3 + @testing-library/react

## Key Directories

```
src/
  components/
    producer/           # Event management, email automation, network, payments
      Network/          # Vendor CRM, contact management, data export
      Email/            # Email campaign editor, sequences, templates
      EventSettings.tsx # Event configuration
    vendor/             # Vendor portal components
    admin/              # Admin tools (email testing, bug reports)
    auth/               # Login, signup, protected routes
    ui/                 # shadcn/Radix base components
    shared/             # Cross-role components
  services/
    api.ts              # Central API client (all backend calls)
    stripeService.ts    # Stripe payment integration
  contexts/
    AuthContext.tsx      # Auth state + role helpers
  pages/                # Route-level page components
  hooks/                # useAuth, useEmailNotifications, etc.
  types/                # TypeScript type definitions
  utils/                # Helpers (date, email variables, validation, cache)
  config/
    environments.ts     # Dev/staging/prod API URL config
```

## API Integration

All API endpoints are namespaced under `/api/v1/presents/`. The central API client is `src/services/api.ts` (~3000 lines). Auth tokens are managed via `AuthContext.tsx`.

## User Roles

- **Producer** (venue_owner): Full event management, email automation, vendor CRM
- **Vendor**: Vendor portal, application submissions
- **Admin**: All producer features + admin tools

## Commands

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run test          # Tests in watch mode
npm run test:run      # Tests once (CI mode)
npm run typecheck     # TypeScript checking
npm run lint          # ESLint
npm run preview       # Preview production build
```
