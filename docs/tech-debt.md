# Tech Debt & Improvement Backlog

## High Priority

- **Pin UI dependency versions** — `package.json:36` defines dozens of UI packages as `"latest"`, which makes builds non-deterministic and risky for Render deployments. Lock to vetted versions or enable automated update tooling before the next release.
- **Remove fallback admin secret & gate verbose logging** — `src/services/api.ts:26` still injects `voxxy-admin-2024` whenever `VITE_ADMIN_API_KEY` is missing, and the same module logs full request payloads in production. Require the secret via env validation and hide debug logging behind `import.meta.env.DEV`.
- **Tame environment validation side effects** — `src/config/environments.ts:27` throws at import time when Firebase envs are missing and logs every detection via `console.log`. Move the validation into an explicit bootstrap check and suppress noisy logs outside dev/test.

## Medium Priority

- **Rationalize top-level routing** — `src/App.tsx:48` mixes legacy and V2 dashboards, dev-only debug panels, and verbose console logging. Split the route table into role-focused modules, lazy-load dashboards, and only mount the debug panel in non-production environments.
- **Consolidate auth error handling & guards** — `src/contexts/AuthContext.tsx:100` swallows profile-load errors and duplicates logic across `ProtectedRoute` variants. Add surfaced error state, retry/backoff, and align guard composition with the V2 architecture plan before cutting over.
- **Broaden automated tests** — Current suite stops at basic fetch mocks (`src/test/api.test.ts:1`). Add unit tests for guards/hooks, smoke tests for `App` routing, and start covering RSVP/Budget flows per the existing test plan docs.

## Low Priority

- **Resolve deployment doc duplication** — Both `docs/DEPLOYMENT.md:1` and `docs/deployment/DEPLOYMENT.md:1` describe overlapping workflows with different policies. Merge them into a single source of truth so new contributors don't follow conflicting instructions.
