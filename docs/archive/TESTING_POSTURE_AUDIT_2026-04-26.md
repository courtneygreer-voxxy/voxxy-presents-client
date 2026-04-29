# Voxxy Presents Client — Testing Posture Audit

**Document purpose:** Engineering state-of-the-union on automated testing for the `voxxy-presents-client` repository.

**Audit date:** 2026-04-26  

**Baseline:** Analysis was performed on the local workspace checked out at branch **`staging`** (tracking `origin/staging`). Working tree was clean except an untracked `.env.local.backup`.  

**Branch comparison:** The branch **`feature/brand-normalization`** does **not** appear in local or remote branch lists in this clone; no second pass was possible. **`origin/main`** was fetched and compared for test inventory only: the same three `*.test.ts` paths exist on `main` as on `staging`.

**Repository scope:** This repo is a **frontend-only** Vite + React SPA. There is **no** `Gemfile`, Rails app, or server-side “controllers/models/jobs” here. Backend behavior lives in a separate API (`voxxy-presents-api`). This report assesses **client-side** testing; server-side risk is out of scope except where the client integrates with it.

---

## 1. Test Infrastructure Inventory

### Frameworks and libraries

| Tool | Role | Version (from `package.json`) |
|------|------|-------------------------------|
| **Vitest** | Unit/integration test runner | `^3.2.4` |
| **jsdom** | DOM environment for tests | `^26.1.0` |
| **@testing-library/react** | Component testing | `^16.3.0` |
| **@testing-library/jest-dom** | DOM matchers | `^6.6.4` |
| **@testing-library/user-event** | User interaction simulation | `^14.6.1` |

**Not present:** Jest, Cypress, Playwright, RSpec/Minitest, WebdriverIO.

### `package.json` scripts (testing-related)

- `test` → `vitest` (watch mode)
- `test:ui` → `vitest --ui`
- `test:run` → `vitest run` (CI-style)

### Configuration files

- **`vitest.config.ts`** — `globals: true`, `environment: 'jsdom'`, `setupFiles: './src/test/setup.ts'`, React plugin, `@` path alias aligned with Vite.
- **`src/test/setup.ts`** — Registers `@testing-library/jest-dom`, stubs `VITE_API_BASE_URL` and `VITE_ENVIRONMENT` for tests.

**No** `jest.config.*`, `.rspec`, `cypress.config.*`, or `playwright.config.*`.

### How tests are invoked today

- Locally: `npm test`, `npm run test:ui`, or `npm run test:run`.
- **Continuous integration (see §4):** **Unit tests are not invoked** in GitHub Actions; only typecheck, ESLint, and production build run.

### Coverage tooling

- **Not configured.** There is no `coverage` script, no `@vitest/coverage-v8` (or similar) dependency, and no checked-in coverage reports.
- **Recommendation:** Add `@vitest/coverage-v8`, enable `test.coverage` in `vitest.config.ts`, and run `vitest run --coverage` in CI with artifacts (e.g. upload HTML/lcov).

---

## 2. Current Test Coverage

### File counts (under `src/`)

| Metric | Count |
|--------|------:|
| TypeScript / TSX source files (`*.ts`, `*.tsx`) | **269** |
| Files matching `*.test.ts` / `*.spec.ts(x)` | **3** |

**Effective automated test modules:** **2** Vitest suites (`src/test/api.test.ts`, `src/test/eventPortalService.test.ts`). The third file is **not** a Vitest suite (see §3).

### Rough line volume

| Category | Lines (approx.) |
|----------|------------------|
| Application code under `src/` (excluding `src/test/` and excluding `*.test.*`) | **~69,900** |
| `src/test/setup.ts` | 6 |
| `src/test/api.test.ts` | 196 |
| `src/test/eventPortalService.test.ts` | 287 |
| `src/utils/emailVariables.test.ts` | 155 (demo script, not assertions) |

**Ratio (test suite lines vs app lines):** on the order of **0.7%** if counting only the two real suites (~483 lines vs ~70k). That is **far below** what teams usually target for production-critical UIs.

### Latest “coverage report”

- **None generated in this audit.** Run:

  ```bash
  npm install -D @vitest/coverage-v8
  npx vitest run --coverage
  ```

  …after fixing failing tests (below), to establish a baseline.

### `npm run test:run` result (2026-04-26, this workspace)

- **Outcome:** **Failed** (exit code 1).
- **Summary:** 3 test files collected; **1 failed as a suite** (`emailVariables.test.ts` — no `describe`/`it`); **7 tests failed** in `api.test.ts`; **13 tests passed** in `eventPortalService.test.ts`; **1 test passed** in `registrationsApi` within `api.test.ts` (14 passed / 21 total tests reported).

### Breakdown by area

#### Backend (controllers, models, services, jobs)

- **N/A in this repo.** Server logic and persistence are not present here.

#### Frontend — by directory (application file counts)

| Area | App `*.ts` / `*.tsx` files |
|------|---------------------------:|
| `src/components` | 179 |
| `src/pages` | 35 |
| `src/services` | 6 |
| `src/contexts` | 2 |
| `src/hooks` | 9 |
| `src/utils` | 20 |

**Tests touching these:** Only `api.test.ts` (API client), `eventPortalService.test.ts` (portal session + fetch), and a non-test `emailVariables.test.ts`. **No** component tests, **no** page/route tests, **no** hook tests, **no** tests for most services (e.g. `googlePlacesService.ts`).

#### Integration / end-to-end

- **None** (no Playwright/Cypress, no scripted browser flows in CI).

#### Critical user flows (auth, payments, events, vendor, RSVP)

| Flow | Coverage |
|------|----------|
| **Auth (login, JWT, protected API)** | Exercised indirectly via `api.test.ts` (mocked `fetch`); **no** `AuthContext` or route-guard tests. API expectations are **out of date** (failures). |
| **Payments / onboarding** | **No** dedicated tests (`PaymentOnboardingPage`, Stripe-related UI, etc.). |
| **Event creation / producer** | **No** UI or workflow tests; `eventsApi` tests exist but **fail** against current implementation. |
| **Vendor application** | **No** tests for `VendorApplicationForm` / related pages. |
| **Submissions / portal** | **Strongest area:** `eventPortalService` has meaningful unit tests (session, verify, fetch, errors). |
| **RSVP / registrations** | Single `registrationsApi.create` test **passes**; no end-to-end or form-level coverage. |

---

## 3. Test Quality Assessment

### Representative file 1: `src/test/eventPortalService.test.ts` — **Good**

- **Behavior vs. “runs”:** Asserts real outcomes: `localStorage` persistence, expiry, headers on `fetch`, error mapping, session cleared on 401.
- **Mocking:** `fetch` and `localStorage` are appropriately mocked; not over-mocked for this layer.
- **Structure:** Clear **Arrange / Act / Assert** per case; `beforeEach`/`afterEach` reset state — tests are **independent**.
- **Note:** Expected `console.error` noise on network-error paths; acceptable but could be silenced with `vi.spyOn(console, 'error')` if desired.

### Representative file 2: `src/test/api.test.ts` — **Intent good; currently a liability**

- **Behavior:** Tests aim to lock HTTP method, URL, body, and response parsing for `organizationsApi`, `eventsApi`, and `registrationsApi`.
- **Reality:** **Seven tests fail** because expectations reflect an **older API shape** (e.g. `/api/organizations` vs `/api/v1/presents/organizations`, `PUT` vs `PATCH`, flat body vs `{ organization: … }` / `{ event: … }`). The suite **does not match production code**, so it neither protects regressions nor signals correctness until updated.
- **Signal:** The failing `eventsApi.create` expectation shows a call to  
  `.../organizations/[object Object]/events` with `body: "{}"` — worth verifying in **`src/services/api.ts`** as a possible **real bug** (object stringified as path segment) or test misuse; either way, **tests are not aligned with the implementation**.

### Representative file 3: `src/utils/emailVariables.test.ts` — **Anti-pattern**

- **Not a test file:** No `describe` / `it`; Vitest reports **“No test suite found”** and fails the file.
- **Content:** `console.log` “demonstrations” with **no assertions**; manual “✅ Match” that can be false without failing CI (if this file were fixed to be a suite, those checks would need `expect(...)`).
- **Classification:** **Documentation / scratch script** misnamed as `*.test.ts`.

### Anti-patterns observed

- **Stale contract tests** that fail against current `api.ts` (worse than no tests if CI ever enforced them without fixing).
- **Misnamed “test” file** that breaks `vitest run`.
- **Heavy production `console.log` in `api.ts`** during tests (auth debug), increasing noise and coupling tests to logging.
- **No** snapshot-only tests found; **no** `it.skip` / `describe.skip` / `todo` in `src` (grep).
- **CI does not run tests**, so failures are **invisible** to merge pipeline today.

---

## 4. CI/CD Pipeline Analysis

### GitHub Actions

| Workflow | Triggers | Jobs / steps |
|----------|----------|----------------|
| **`.github/workflows/ci.yml`** | `pull_request` → `main`, `develop`; `push` → `develop` | Checkout → Node 18 → `npm ci` → **`tsc --noEmit`** → **`npm run lint`** → **`npm run build`** → verify `dist/` exists. **No `npm run test:run`.** |
| **`.github/workflows/deploy.yml`** | `push` → `main`; `workflow_dispatch` | Same pattern: `npm ci`, typecheck, lint, build, `dist/` check. **No tests.** Comment notes Render deploy follows. |

### Render (`render.yaml`)

- **Build:** `npm ci && npm run build` for production, staging, and develop services.
- **Tests:** Not part of the Render build command.

### Are tests required before merge?

- **Cannot be determined from the repo alone.** There is **no** workflow step that runs Vitest. Branch protection rules (required checks) live in GitHub settings, not in this tree; nothing here **proves** tests must pass.

### Pipeline duration (estimate)

- Typical GitHub-hosted run for `npm ci` + `tsc` + ESLint + Vite build for a ~70k-line `src` tree: **~4–10 minutes**, depending on cache and runner load. Adding `vitest run` with current suite size would add **on the order of seconds to low tens of seconds** once stable.

### Security / static analysis in CI

| Tool | In repo | In CI workflows |
|------|---------|------------------|
| **ESLint** | Yes (`.eslintrc.json`, `npm run lint`) | Yes |
| **TypeScript** | Yes (`tsc --noEmit`) | Yes |
| **`scripts/check-security.js`** (secret pattern scan) | Yes | **No** (not referenced in workflows reviewed) |
| **Dependabot** | No config found | — |
| **CodeQL / Snyk / npm audit** | Not in workflows | **No** |

---

## 5. Critical Gaps — Ranked by Risk

High-level: almost all user-visible and revenue-adjacent flows lack automated tests; the small API suite is **red** relative to current code.

1. **`src/services/api.ts` (monolithic API client + auth headers)**  
   - **What it does:** Central gateway to the backend; JWT attachment, error handling, and dozens of endpoints.  
   - **Risk without tests:** Silent breakage of auth, wrong URLs/bodies, or incorrect error surfacing across the entire app.  
   - **Blast radius:** **Whole product** — any screen using the API.

2. **Authentication and session (`AuthContext`, login/signup/password flows, token storage)**  
   - **What it does:** User identity and access to producer features.  
   - **Risk:** Regressions lock users out, leak unauthenticated calls, or mishandle tokens.  
   - **Blast radius:** **All authenticated users**; support and trust impact.

3. **Payment onboarding and money-adjacent UI (`PaymentOnboardingPage`, payment settings components)**  
   - **What it does:** Connects producers to payment capabilities.  
   - **Risk:** Broken flows → lost revenue, double charges, or confused users; hardest to debug without repro.  
   - **Blast radius:** **Producers and attendees** downstream of payment configuration.

4. **Event lifecycle (create/edit/publish, settings, go-live)**  
   - **What it does:** Core value of the platform.  
   - **Risk:** Bad saves, wrong validation, or broken publish paths.  
   - **Blast radius:** **Every event**; operational fire drills.

5. **Vendor application and CRM-heavy flows (`VendorApplicationForm`, invites, networking)**  
   - **What it does:** Captures vendor data and producer workflows.  
   - **Risk:** Data loss, duplicate submissions, wrong state transitions.  
   - **Blast radius:** **Vendor pipeline** and producer operations.

6. **Email system (templates, variables, sends, sequences)**  
   - **What it does:** Large surface in `components/producer/Email/*`; `emailVariables` conversion is business-critical.  
   - **Risk:** Wrong variable substitution or HTML/plain corruption → wrong emails at scale.  
   - **Blast radius:** **All email recipients**; reputational and deliverability risk.

7. **RSVP / registration flows**  
   - **What it does:** Public-facing signup and `registrationsApi`.  
   - **Risk:** Lost RSVPs, wrong counts, failed submissions.  
   - **Blast radius:** **Event attendance data** and producer planning.

8. **Location / Places integration (`googlePlacesService.ts`)**  
   - **What it does:** Address search and normalization via backend proxy.  
   - **Risk:** Broken venue capture, bad geodata, edge-case parsing.  
   - **Blast radius:** **Event and venue accuracy**; downstream maps and comms.

9. **Routing, lazy loading, and error boundaries (`App.tsx`, page-level error handling)**  
   - **What it does:** Users reach the right screen with right guards.  
   - **Risk:** Blank screens, open routes, or wrong redirects.  
   - **Blast radius:** **All users** on navigation edge cases.

10. **Vendor event portal page (`VendorEventPortalPage` + service)**  
    - **What it does:** Vendors consume producer updates and booth data.  
    - **Risk:** Service is tested; **UI integration** is not — mismatches between session and UI states.  
    - **Blast radius:** **All vendors** using the portal.

---

## 6. Recommendations — Prioritized

### Quick wins (&lt; 1 day, high impact)

1. **Add `npm run test:run` to `.github/workflows/ci.yml` and `deploy.yml`** after fixing failures — makes regressions visible immediately.
2. **Fix or delete `src/utils/emailVariables.test.ts`:** Either rename to `emailVariables.demo.ts` and exclude from Vitest, or convert to real `describe`/`it` with `expect`.
3. **Update `api.test.ts`** to match current URLs, methods, and JSON envelopes (or refactor API module for testability and snapshot stable request builders).
4. **Investigate `eventsApi.create` / `[object Object]`** in URL from failing test output — possible production bug.

### Foundational work

1. **Coverage:** Add `@vitest/coverage-v8`, set thresholds gradually, publish reports in CI.
2. **Test naming conventions:** Reserve `*.test.ts` for Vitest-only; move demos elsewhere; configure `exclude` if needed.
3. **Optional:** Run `npm run security-check` in CI (with careful false-positive tuning) or replace with secret scanning from GitHub Advanced Security if available.

### Sustained effort

1. **Component + hook tests** for: auth boundary, one “golden path” event creation, vendor application submit, payment onboarding happy path (with API mocked).
2. **Contract tests** for a small set of **stable** API helpers (or MSW against OpenAPI if the API documents contracts).
3. **Playwright (or Cypress) smoke:** login (test account), open dashboard, create draft event — nightly or on `main`.

### Cultural / process

1. **PR template** checklist: “Tests added/updated for behavior change,” “`npm run test:run` green locally.”
2. **Definition of done:** For user-facing flows, require automated test or explicit written rationale (time-boxed debt ticket).
3. **Branch protection:** Require the CI workflow that includes **typecheck + lint + build + test** as a required status check.

---

## 7. Honest Assessment

This client repo is **not** in a production-grade testing posture today. You have a **thin** automated layer: two intentional Vitest suites totaling on the order of **twenty** test cases, while the application surface is **tens of thousands of lines** across **hundreds** of modules. **Continuous integration does not run those tests**, so the merge pipeline behaves as if automated tests barely exist. When tests *are* run locally, the run **fails**: one file is misclassified as a test suite, and the API suite is **out of sync** with the real client, which is a classic sign that tests were not treated as part of the delivery contract. The **vendor portal service** tests are a bright spot — they show the team can write focused, behavior-driven unit tests — but they cover a **narrow slice** of the business. **End-to-end coverage is absent.** Overall, this is closer to **“minimal safety net with holes”** than to **“no safety net,”** because some logic is tested and TypeScript plus ESLint catch a different class of errors — but for **regressions in auth, payments, events, email, and forms**, the team is still relying primarily on **manual verification and production pain**. That is the reality to set expectations against for 2026 planning.

---

*End of report.*
