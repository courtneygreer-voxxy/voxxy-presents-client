# Error notifications

Centralized user-facing errors live under `src/errors/`. No backend changes are required for the initial rollout.

## Quick reference

```ts
import { notify } from '@/errors/notify'
import { getApiErrorMessage } from '@/errors/getApiErrorMessage'
import { getMessage } from '@/errors/catalog'

// Toast (default)
notify.error({ key: 'network.deleteContactFailed' })
notify.success({ key: 'network.bulkDeleteSuccess', params: { count: 12 } })

// Inline (forms) — returns the string without showing a toast
setError(getApiErrorMessage(err, 'auth'))

// API errors with server text as fallback
notify.error({ key: 'network.saveCategoryFailed', fallback: getApiErrorMessage(err) })
```

## Modules

| Module | Role |
|--------|------|
| `src/errors/catalog/` | Message keys by domain (`global`, `auth`, `network`, `email`, …) |
| `src/errors/normalizeApiError.ts` | Maps `ApiError` + HTTP status → catalog key or pass-through text |
| `src/errors/notify.ts` | `notify.error` / `success` / `warning` via Sonner |
| `src/errors/getApiErrorMessage.ts` | String helper for inline form errors |

## When to use what

| Situation | Approach |
|-----------|----------|
| Quick action feedback (save, delete, bulk) | `notify.error` / `notify.success` |
| Login / signup inline banner | `getApiErrorMessage(err, 'auth')` |
| Rails 422 field validation | Pass-through: `normalizeApiError` uses `errors[0]` |
| React render crash | `ErrorBoundary` + `global.boundary*` keys |
| Unknown server message | `fallback: getApiErrorMessage(err)` |

## Toaster styling

`<Toaster />` lives in `src/App.tsx` (inside `AuthProvider`). Sonner CSS variable overrides in `src/index.css` align toast colors with design tokens where `theme="system"` matches the document class.

## Adding catalog entries

1. Add the string to the right file in `src/errors/catalog/` (e.g. `network.ts`).
2. Use a dotted key: `domain.actionOutcome`.
3. For interpolated copy, use a function: `(p) => \`Deleted ${p.count} contacts\``.

## Migration checklist (follow-up PRs)

- [ ] Replace remaining `alert()` call sites (~40 across 12 files)
- [ ] Route direct `toast.*` from Sonner through `notify` where copy should be cataloged
- [ ] Consolidate shadcn `useToast` usages if desired
- [ ] Expand catalogs: events, payments, vendor portal, admin

## Backend (optional later)

Stable `error_code` fields from the API would reduce fragile string matching. Until then, 422 validation messages and known server `message` values are passed through intentionally.
