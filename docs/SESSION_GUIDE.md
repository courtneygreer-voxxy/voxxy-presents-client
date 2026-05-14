# Session Guide — Voxxy Presents (Frontend)

> **What is this?** A master context document for AI coding agents and developers.
> Read this at the START of every coding session and again BEFORE opening a PR.
>
> **Two modes:**
> 1. **SESSION_START** — Rebase, load context, run tests, produce status summary.
> 2. **PRE_PR** — Validate code against rules/style, run full test suite, produce readiness summary.
>
> **How to invoke:** Tell your agent:
> - *"Read docs/SESSION_GUIDE.md and run SESSION_START mode"*
> - *"Read docs/SESSION_GUIDE.md and run PRE_PR mode"*

**Repo locations (adjust if your layout differs):**
- Frontend: `~/Development/voxxy-presents-client`
- Backend: `~/Development/voxxy-rails-react`

---

## 1. Rules & Learnings

> **Team process:** After fixing a production bug or discovering a footgun,
> add a new rule here with the next available ID. Keep entries to 2–3 lines max.
> Reference rule IDs in PRs and commit messages (e.g. "Fixes violation of RL-003").

### Styling Rules

| ID | Rule | Source |
|------|------|--------|
| RL-001 | Never use raw hex values in `.tsx` files. Use CSS tokens or `--voxxy-*` variables. | [STYLE_GUIDE.md](./STYLE_GUIDE.md) §9 |
| RL-002 | Never add inline `style={{ backgroundImage: ... }}`. Use a `voxxy-btn-*` or `voxxy-gradient-*` class. | [STYLE_GUIDE.md](./STYLE_GUIDE.md) §9 |
| RL-003 | Never use `backdrop-blur` on cards inside an already-blurred container — it breaks `z-index` for dropdowns. | [STYLE_GUIDE.md](./STYLE_GUIDE.md) §9 |
| RL-004 | Never set `border: 1px solid transparent` on gradient-fill buttons — creates a visible tinted edge. Use `border: none`. | [STYLE_GUIDE.md](./STYLE_GUIDE.md) §9 |
| RL-005 | Always update BOTH `:root` and `.dark` blocks in `src/index.css` when adding a new CSS token. | [STYLE_GUIDE.md](./STYLE_GUIDE.md) §1 |
| RL-006 | Public pages must always force dark mode. Wrap with `<div className="dark voxxy-public-page ...">`. Never rely on `--background`/`--foreground` tokens on public pages. | [STYLE_GUIDE.md](./STYLE_GUIDE.md) §6 |

### Auth & API Rules

| ID | Rule | Source |
|------|------|--------|
| RL-007 | The auth token key is `railsAuthToken`, NOT `authToken`. Always use `getAuthToken()` from `src/services/auth.ts`. | [TESTING_ROADMAP.md](./TESTING_ROADMAP.md) §1.7 |
| RL-008 | All API calls must go through `src/services/api.ts` using `fetchApi()`. Never use raw `fetch()` with hand-built headers. | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| RL-009 | Never use TypeScript `any`. The project uses `"strict": true` in tsconfig. | [CONTRIBUTING.md](./CONTRIBUTING.md) |

### Component & Architecture Rules

| ID | Rule | Source |
|------|------|--------|
| RL-010 | All producer-app form fields must use `voxxy-input-frost` class. Do not use raw shadcn Input styling. | [STYLE_GUIDE.md](./STYLE_GUIDE.md) §5 |
| RL-011 | New Voxxy-specific CSS utility classes must be prefixed with `voxxy-` and defined in `@layer components` in `src/index.css`. | [STYLE_GUIDE.md](./STYLE_GUIDE.md) §5 |
| RL-012 | Modals should use standardised shell: `max-w-2xl max-h-[82vh]` with gradient header and scrollable body, unless a wider size is justified. | [GLASS_MODAL_DESIGN_SYSTEM.md](./design/GLASS_MODAL_DESIGN_SYSTEM.md) |
| RL-013 | When removing a duplicate guard (like fee-type dedup), check if it should be narrowed rather than fully removed. Only `early_bird_price` allows multiples. | [KNOWN_BUGS.md](./KNOWN_BUGS.md) Bug 2 |

### Backend Rules

| ID | Rule | Source |
|------|------|--------|
| RL-014 | Always run `bin/rails db:migrate` after pulling changes. Pending migrations block login and API calls. | [KNOWN_BUGS.md](./KNOWN_BUGS.md) Bug 3 |
| RL-015 | When adding a new model attribute, update BOTH `strong_params` (permit) AND the serialiser method. Missing serialiser output is a silent bug. | [KNOWN_BUGS.md](./KNOWN_BUGS.md) Bug 1 |
| RL-016 | Sidekiq workers run on a 5-minute cron cycle. Test email jobs with `EmailSenderWorker.new.perform` in rails console rather than waiting for cron. | Backend email docs |
| RL-017 | Verify SendGrid template IDs match between environments. Staging and production use different template sets. | Backend email docs |
| RL-018 | Use FactoryBot for test data in RSpec. Never create records with raw `Model.create!` in specs. | Backend TESTING.md |
| RL-019 | Database cleaner uses transaction strategy by default. System/feature specs need truncation strategy. | Backend TESTING.md |

### Git & Process Rules

| ID | Rule | Source |
|------|------|--------|
| RL-020 | Use conventional commit format: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`. | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| RL-021 | Feature branches rebase onto `staging`. Hotfix branches are based on `main`. Never merge directly to `main`. | [BRANCHING_STRATEGY.md](./development/BRANCHING_STRATEGY.md) |
| RL-022 | Use the batch release process: feature → staging → release branch → main. Do not deploy individual features to main. | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| RL-023 | Never push directly to `main`, `staging`, or `develop`. Always open a PR into active branches. Force-push is only acceptable on your own feature/fix branch to update an open PR. | SESSION_GUIDE §1 |

---

## 2. Style Guide Reference

**Full guide:** [docs/STYLE_GUIDE.md](./STYLE_GUIDE.md) (14.7 KB)

**Read the full guide if your task involves:**
- Creating or modifying UI components
- Adding new CSS tokens, gradients, or colour values
- Working on public-facing pages
- Building modals, forms, tables, or buttons

**Quick reference (do not skip the full guide for UI work):**
- **Theme:** Dark-first, class-based (`html.dark`). Tokens in `src/index.css`.
- **Buttons:** `.voxxy-btn-brand` (primary CTA), `.voxxy-btn-cta` (internal primary), `.voxxy-btn-solid` (secondary).
- **Inputs:** `.voxxy-input-frost` for producer app, `.voxxy-input-public-dark` for public pages.
- **Cards:** `.glass-card` for producer app surfaces.
- **Fonts:** DM Sans (body), Space Grotesk (display), Montserrat (wordmark only).
- **Glass layering:** body gradient → glass-card → input-frost → focus ring. Each layer must be visually distinct.

**Additional design docs:**
- [GLASS_MODAL_DESIGN_SYSTEM.md](./design/GLASS_MODAL_DESIGN_SYSTEM.md) — Modal styling standards
- [STYLING_UPDATE_SESSION.md](./design/STYLING_UPDATE_SESSION.md) — Recent styling session notes

---

## 3. SESSION_START Mode

Run this workflow at the start of every coding session.

### Step 1: Fetch and rebase

```bash
# ── Frontend ──
cd ~/Development/voxxy-presents-client

CURRENT_BRANCH=$(git branch --show-current)
git fetch origin

# Show incoming changes
echo "=== Incoming from staging ==="
git log --oneline HEAD..origin/staging 2>/dev/null | head -10
echo "=== Incoming from main ==="
git log --oneline HEAD..origin/main 2>/dev/null | head -10

# Rebase onto staging (or main for hotfix branches)
if [[ "$CURRENT_BRANCH" == hotfix/* ]]; then
  git rebase origin/main
else
  git rebase origin/staging
fi

if [ $? -eq 0 ]; then
  echo "FRONTEND REBASE: SUCCESS — $CURRENT_BRANCH is up to date."
else
  echo "FRONTEND REBASE: CONFLICT — manual resolution required."
  echo "Conflicting files:"
  git diff --name-only --diff-filter=U
  echo "Run 'git rebase --abort' to undo, or resolve conflicts and 'git rebase --continue'."
fi
```

```bash
# ── Backend (if backend work is in scope) ──
cd ~/Development/voxxy-rails-react

BACKEND_BRANCH=$(git branch --show-current)
git fetch origin

echo "=== Incoming from main ==="
git log --oneline HEAD..origin/main 2>/dev/null | head -10

git rebase origin/main

if [ $? -eq 0 ]; then
  echo "BACKEND REBASE: SUCCESS — $BACKEND_BRANCH is up to date."
else
  echo "BACKEND REBASE: CONFLICT — manual resolution required."
  git diff --name-only --diff-filter=U
fi
```

### Step 2: Run tests after rebase

```bash
# ── Frontend ──
cd ~/Development/voxxy-presents-client
npm run test:run
# Expected: 62+ tests passing (see KNOWN_BUGS.md for current count)
```

```bash
# ── Backend (if applicable) ──
cd ~/Development/voxxy-rails-react
bundle exec rspec
# Also run linting:
bin/rubocop
```

### Step 3: Load context for current task

Based on your task, read the relevant docs from the **Extended Doc References** (Section 5 below).

At minimum, always read:
- This file (you are reading it now)
- [docs/KNOWN_BUGS.md](./KNOWN_BUGS.md) — Current sprint status and known bugs

### Step 4: Produce bootstrap summary

After completing Steps 1–3, output the summary using the **SESSION_START template** in Section 7.

---

## 4. PRE_PR Mode

Run this workflow before opening a pull request.

### Step 1: Re-read Rules & Learnings (Section 1)

Scan your changed files against every rule in the tables above. Flag any violations in the summary.

### Step 2: Style guide compliance check

If your PR touches `.tsx`, `.css`, or `.ts` files in `src/components/` or `src/pages/`:
- Re-read [docs/STYLE_GUIDE.md](./STYLE_GUIDE.md)
- Verify: no raw hex values in TSX files
- Verify: no inline `style={{ backgroundImage }}`
- Verify: public pages force dark mode
- Verify: producer inputs use `voxxy-input-frost`
- Verify: new CSS classes use `voxxy-` prefix and live in `@layer components`

### Step 3: Run full validation suite

```bash
# ── Frontend ──
cd ~/Development/voxxy-presents-client

npm run typecheck     # TypeScript type check
npm run lint          # ESLint
npm run test:run      # Unit tests
npm run build         # Production build (catches tree-shaking issues)
```

```bash
# ── Backend (if PR includes backend changes) ──
cd ~/Development/voxxy-rails-react

bin/rubocop                 # Linting
bin/brakeman --no-pager     # Security scan
bundle exec rspec           # Tests
```

### Step 4: Check the HANDOFF known bugs list

Read [docs/KNOWN_BUGS.md](./KNOWN_BUGS.md) "Known Bugs" section.
- If your PR resolves any listed bug, note it in the summary and in the PR description.
- If your PR introduces changes that interact with a known bug, flag the risk.

### Step 5: Verify commit format

All commits on your branch should follow conventional commit format:
```
feat(scope): description
fix(scope): description
docs(scope): description
```

Review with:
```bash
git log --oneline staging..HEAD
```

### Step 6: Produce pre-PR summary

Output the summary using the **PRE_PR template** in Section 7.

---

## 5. Extended Doc References

Read only the docs relevant to your current task.

### By Topic

| Topic | Read These | When |
|-------|-----------|------|
| **UI / Styling** | [STYLE_GUIDE.md](./STYLE_GUIDE.md), [GLASS_MODAL_DESIGN_SYSTEM.md](./design/GLASS_MODAL_DESIGN_SYSTEM.md) | Any component or page work |
| **Architecture** | [ARCHITECTURE_SUMMARY.md](./architecture/ARCHITECTURE_SUMMARY.md), [IMPLEMENTATION_PATTERNS.md](./architecture/IMPLEMENTATION_PATTERNS.md) | New features, refactors |
| **Auth** | [ARCHITECTURE_SUMMARY.md §1](./architecture/ARCHITECTURE_SUMMARY.md), [AUTH_QUICK_REFERENCE.md](./guides/AUTH_QUICK_REFERENCE.md) | Auth changes, protected routes |
| **API** | [API_CONFIGURATION.md](./architecture/API_CONFIGURATION.md), `src/services/api.ts` | New endpoints, API changes |
| **Email System** | [EMAIL_DOCUMENTATION_INDEX.md](./email-system/EMAIL_DOCUMENTATION_INDEX.md) | Any email work |
| **Events / Wizard** | [KNOWN_BUGS.md](./KNOWN_BUGS.md), Step2/Step3 source files | Event creation changes |
| **Network / CRM** | [KNOWN_BUGS.md](./KNOWN_BUGS.md) Network section | Contact management work |
| **Payments** | [PAYMENT_DEADLINE_FEATURE.md](./features/PAYMENT_DEADLINE_FEATURE.md), [PAYMENT_SYSTEM.md](./PAYMENT_SYSTEM.md) | Payment config |
| **Testing** | [TESTING_ROADMAP.md](./TESTING_ROADMAP.md), `vitest.config.ts` | Adding tests, CI changes |
| **Git / Release** | [CONTRIBUTING.md](./CONTRIBUTING.md), [BRANCHING_STRATEGY.md](./development/BRANCHING_STRATEGY.md) | Branch management, PRs |
| **Deployment** | [DEPLOYMENT.md](./deployment/DEPLOYMENT.md), [RUNBOOK.md](./development/RUNBOOK.md) | Deployment issues |
| **Backend** | `../voxxy-rails-react/docs/README.md`, [LOCAL_DEVELOPMENT_GUIDE.md (backend)](../voxxy-rails-react/docs/development/LOCAL_DEVELOPMENT_GUIDE.md) | Backend changes |
| **Roles / Permissions** | [ROLE_MAPPING.md](./architecture/ROLE_MAPPING.md) | Role-based features |
| **Current Sprint** | [KNOWN_BUGS.md](./KNOWN_BUGS.md) | **Always read this** |

### Key Source Files

| File | When to Read |
|------|-------------|
| `src/App.tsx` | Routing changes, new pages |
| `src/contexts/AuthContext.tsx` | Auth state, role checks |
| `src/services/api.ts` | Any API integration |
| `src/index.css` | New tokens, component classes |
| `tailwind.config.ts` | Colour/font/animation config |
| `src/components/Navigation.tsx` | Nav changes |
| `src/components/producer/Network/NetworkPage.tsx` | Network/CRM work |
| `src/components/producer/CreateEventWizard/` | Wizard changes |
| `src/components/producer/Email/` | Email system UI |

---

## 6. Environment & Commands

### Frontend (`voxxy-presents-client`)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server (localhost:5173) |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run precheck` | Typecheck + lint combined |
| `npm run test:run` | Vitest — single run, CI mode |
| `npm run test` | Vitest — watch mode |
| `npm run build` | Production build |
| `npm run build:check` | tsc + production build |

### Backend (`voxxy-rails-react`)

| Command | Purpose |
|---------|---------|
| `rails s -p 3001` | Start Rails server |
| `bundle exec rspec` | Run RSpec test suite |
| `bin/rubocop` | Ruby linting |
| `bin/brakeman --no-pager` | Security scan |
| `RAILS_ENV=test rails db:test:prepare` | Prepare test database |
| `bin/rails db:migrate` | Run pending migrations |

### Combined precheck (copy-paste)

```bash
# Frontend — run all checks before a PR
cd ~/Development/voxxy-presents-client && \
  npm run typecheck && \
  npm run lint && \
  npm run test:run && \
  npm run build && \
  echo "ALL FRONTEND CHECKS PASSED" || echo "FRONTEND CHECKS FAILED"
```

```bash
# Backend — run all checks before a PR
cd ~/Development/voxxy-rails-react && \
  bin/rubocop && \
  bin/brakeman --no-pager && \
  bundle exec rspec && \
  echo "ALL BACKEND CHECKS PASSED" || echo "BACKEND CHECKS FAILED"
```

---

## 7. Summary Templates

### SESSION_START Summary

After completing SESSION_START mode, output this:

```
## Session Bootstrap Summary

**Date:** YYYY-MM-DD
**Frontend branch:** <branch-name>
**Backend branch:** <branch-name or N/A>

### Rebase Status
- Frontend: SUCCESS | CONFLICT (list files) | SKIPPED (already up to date)
- Backend: SUCCESS | CONFLICT (list files) | SKIPPED | N/A

### Incoming Changes
- Frontend: <N> new commits from origin/staging since last session
- Backend: <N> new commits from origin/main since last session

### Tests After Rebase
- Frontend: <N> passed, <N> failed | SKIPPED (conflict blocks tests)
- Backend: <N> examples passed, <N> failed | N/A

### Known Bugs (from KNOWN_BUGS.md)
- [ ] BUG 1: <one-line summary>
- [ ] BUG 2: <one-line summary>

### Context Loaded
- Read: SESSION_GUIDE.md, KNOWN_BUGS.md
- Also read: <additional docs relevant to task>

### Ready to Code
- YES | NO (reason: <conflict / test failure / etc.>)
```

### PRE_PR Summary

After completing PRE_PR mode, output this:

```
## Pre-PR Readiness Summary

**Date:** YYYY-MM-DD
**Branch:** <branch-name>
**Target:** staging

### Validation Results

| Check | Status | Notes |
|-------|--------|-------|
| TypeScript (`npm run typecheck`) | PASS/FAIL | <error count if failed> |
| ESLint (`npm run lint`) | PASS/FAIL | <warning/error count> |
| Unit Tests (`npm run test:run`) | PASS/FAIL | <N passed, N failed> |
| Build (`npm run build`) | PASS/FAIL | |
| Backend Rubocop | PASS/FAIL/N/A | |
| Backend Brakeman | PASS/FAIL/N/A | |
| Backend RSpec | PASS/FAIL/N/A | <N examples, N failures> |

### Rules & Learnings Compliance
- Violations found: NONE | <list rule IDs and files>

### Style Guide Compliance
- UI files changed: <list>
- Style issues found: NONE | <list>

### Commit Format
- All commits follow conventional format: YES / NO
- Commits on branch:
  <list of commits>

### Known Bug Interactions
- Bugs resolved by this PR: <list or NONE>
- Bugs potentially affected: <list or NONE>

### PR Ready
- YES | NO (blockers: <list>)
```

---

## 8. Document Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-07 | Initial creation with 22 rules seeded from STYLE_GUIDE, HANDOFF, TESTING_ROADMAP, CONTRIBUTING | Team |
