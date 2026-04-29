# Testing Roadmap

**Purpose:** Living task tracker for improving the Voxxy Presents frontend testing posture. Derived from the [April 2026 testing audit](archive/TESTING_POSTURE_AUDIT_2026-04-26.md).

**Target:** End of Q3 2026

**Principle:** Test what hurts when it breaks. Auth, payments, event creation, email sending, vendor flows, RSVPs.

---

## Current State (updated April 28, 2026)

| Metric | Value |
|--------|-------|
| Source files (`src/**/*.ts(x)`) | ~269 |
| Test files | 3 (smoke, auth, api error handling) |
| Tests | 19 |
| Suite runtime | <400ms |
| CI runs tests | Yes (as of this PR) |
| Coverage reporting | Not yet configured |
| E2E tests | None |

---

## Phase 1: Foundation (May 2026)

Goal: Every PR runs tests. First real coverage on highest-risk code.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Restore vitest + jsdom + setup file | Done | `vitest.config.ts`, `src/test/setup.ts` |
| 1.2 | Smoke test proving pipeline works | Done | `src/test/smoke.test.ts` |
| 1.3 | Add `npm run test:run` to CI | Done | `.github/workflows/ci.yml` |
| 1.4 | Auth token tests (save/get/clear lifecycle) | Done | `src/services/auth.test.ts` (8 tests) |
| 1.5 | API error handling tests (fetchApi behavior) | Done | `src/services/api.test.ts` (9 tests) |
| 1.6 | Add coverage reporting (`@vitest/coverage-v8`) | Todo | Install package, add `--coverage` to CI, set baseline threshold |
| 1.7 | Fix hardcoded `localStorage.getItem('authToken')` in EventSettings.tsx | Todo | Lines 216, 268 use wrong key (`authToken` vs `railsAuthToken`) |
| 1.8 | Add 401 interceptor to fetchApi | Todo | Auto-logout on expired token; prevents "zombie session" state |

---

## Phase 2: Critical Flow Coverage (June 2026)

Goal: Happy-path tests for every revenue and trust-adjacent flow.

| # | Task | Status | Priority | Notes |
|---|------|--------|----------|-------|
| 2.1 | AuthContext tests (login, logout, role helpers, token expiry) | Todo | Critical | Currently untested; exercises protected route logic |
| 2.2 | Event creation wizard validation (Steps 1-4) | Todo | Critical | Steps 3-4 are placeholder `return true` |
| 2.3 | Vendor application form (submit, prefill, error handling) | Todo | High | Silent prefill failure at VendorApplicationForm.tsx:199 |
| 2.4 | Payment success/cancel page behavior | Todo | High | No webhook verification on frontend |
| 2.5 | Email variable resolution | Todo | High | Business-critical; old demo script was deleted |
| 2.6 | CSV import validation flow | Todo | Medium | Two-phase validate-then-import |
| 2.7 | Registration/RSVP submission | Todo | Medium | Single test existed before; needs rebuild |

---

## Phase 3: Infrastructure Hardening (July 2026)

Goal: Coverage is measured, security scanning runs, CI is fast and reliable.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | Set coverage threshold (start at 10%, raise quarterly) | Todo | Fail CI if coverage drops below threshold |
| 3.2 | Add `npm audit` to CI | Todo | Catch vulnerable dependencies before merge |
| 3.3 | Add secret scanning to CI | Todo | Prevent accidental credential commits |
| 3.4 | Add Dependabot for npm dependencies | Todo | `.github/dependabot.yml` |
| 3.5 | PR template with testing checklist | Todo | "Tests added/updated," "test:run green locally" |
| 3.6 | CODEOWNERS file for high-risk paths | Todo | `src/services/api.ts`, `src/contexts/AuthContext.tsx`, etc. |

---

## Phase 4: E2E and Regression (August-September 2026)

Goal: Real user flows are tested end-to-end. Production bugs get regression tests.

| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Choose E2E framework (Playwright recommended) | Todo | Evaluate against project needs |
| 4.2 | E2E: Login and reach dashboard | Todo | First E2E test, validates auth + routing |
| 4.3 | E2E: Create event happy path | Todo | Wizard steps 1-4, verify event appears |
| 4.4 | E2E: Vendor application submit | Todo | Public form, verify confirmation |
| 4.5 | E2E: Payment checkout redirect | Todo | Verify Stripe redirect works |
| 4.6 | Regression test process documented | Todo | "Bug found in prod -> write test -> then fix" |
| 4.7 | CI under 10 minutes with full suite | Todo | Monitor and optimize as suite grows |

---

## Risk Map (from audit)

What breaks if we don't test it, ranked by blast radius:

1. **Critical:** Stripe webhook bugs cause double charges or wrong subscription states
2. **Critical:** Auth regression locks out producers or leaks data between organizations
3. **Critical:** Event creation fails silently -- producer doesn't know until customer calls
4. **High:** Email system sends wrong event details to thousands of vendors
5. **High:** Vendor application form silently fails -- vendors think they applied
6. **High:** Cross-organization data leak through unguarded API endpoint
7. **Medium:** RSVP counts wrong due to frontend regression
8. **Medium:** Google Places integration breaks venue capture
9. **Low:** Routing edge cases produce blank screens

---

## Definition of Done (for features going forward)

- [ ] Happy-path test exists for the new behavior
- [ ] `npm run test:run` passes locally
- [ ] PR description mentions what was tested
- [ ] If fixing a production bug: regression test written before the fix

---

## Resources

- [Original audit (April 26, 2026)](archive/TESTING_POSTURE_AUDIT_2026-04-26.md)
- [Infrastructure audit](archive/INFRA_AUDIT.md)
- Test tooling: Vitest 3.2, jsdom 26, @testing-library/react 16, @testing-library/user-event 14
- CI: GitHub Actions (`.github/workflows/ci.yml`)
