# Voxxy — Advisor Briefing & Infrastructure / Access Audit

**Purpose:** Single document for an external CTO advisor: company context, stack, and what the repositories reveal about ownership, access, deployment, and security posture.  

**Scope:** `voxxy-presents-client` (Vite/React SPA — **this file’s primary repo**) and `voxxy-rails-react` (Rails monolith + embedded CRA client).  

**Limitation:** GitHub org settings, Render dashboard, DNS panels, and branch protection **cannot** be read from git; those are called out explicitly.

---

## Part 1 — Voxxy Context Briefing (~one page)

### Company snapshot

**Voxxy** is **B2B SaaS for recurring community event producers** — art markets, craft fairs, pop-ups, and similar in-person programming. The product helps producers run operations (events, vendors, comms, and related workflows) rather than one-off ticketing-only tools.

**Stage:** Pre-seed; **two paying customers** today (**Pancakes & Booze**, **Brooklyn Hearts Club**), with a **73-customer target by FY26** close (per leadership input — not verifiable from code).

**Team:** **CEO/CTO Courtney Greer**; **CTO/co-founder Beau Lazear** (product + engineering ownership); **two engineers** recently joining (org chart not in repo).

**Product surfaces (names to keep straight):**

| Surface | Role (plain language) |
|--------|------------------------|
| **Voxxy** | Core B2B SaaS platform |
| **Voxxy Presents** | In-person / event producer experience aligned with the modern web app |
| **Voxxy Drive** | Internal HTML sharing (referenced in briefing; not deeply traced in this audit) |
| **Voxxy Live** | Team task management (referenced in briefing; not deeply traced in this audit) |

### Stack overview

| Layer | `voxxy-presents-client` | `voxxy-rails-react` |
|--------|-------------------------|---------------------|
| **Language / framework** | **TypeScript**, **React 18**, **Vite 6** | **Ruby 3.3.6**, **Rails ~7.2** |
| **UI** | Radix UI, Tailwind, React Router 7, TipTap, React Hook Form, Zod | Rails views + Hotwire; **embedded `client/`** is **Create React App** (`react-scripts` 5) + Ant Design / Bootstrap |
| **API shape** | SPA talks to **JSON API** via `fetch` / env-based base URL | **Rails** serves HTML + **JSON API** (including `api/v1/presents/*` for Presents) |
| **Database** | None (client-only) | **PostgreSQL** (`pg` gem); `DATABASE_URL` on Render |
| **Background jobs** | N/A | **Sidekiq** (`active_job.queue_adapter = :sidekiq`); **Redis** (`REDIS_URL`) |
| **Auth** | **JWT in `localStorage`** (`railsAuthToken`); Bearer calls to Rails | **Custom JWT** (`jwt` gem, `JsonWebToken` concern, `Rails.application.credentials.secret_key_base`); **sessions/cookies** for traditional web; **Rack::Attack** rate limiting |
| **Payments** | UI calls backend **Stripe** endpoints (`stripeService` → `/v1/presents/stripe/*`) | **Stripe** gem; `config/initializers/stripe.rb` uses `ENV["STRIPE_SECRET_KEY"]` or credentials |
| **Email** | N/A (backend sends) | **SendGrid** (`sendgrid-ruby`, `VoxxyKeyAPI` in production SMTP-style config) |
| **Analytics / errors** | **Mixpanel** (`mixpanel-browser`), **Sentry** (`@sentry/react`) | **Sentry** (`sentry-ruby` / `sentry-rails`), **Mixpanel** (`mixpanel-ruby`) |
| **AI** | Not a core dependency in `package.json` | **ruby-openai** / OpenAI usage in app |
| **Maps / places** | **Google Places** via **backend proxy** (`googlePlacesService.ts` → API) | Places-related controllers/services; specs reference Google APIs |
| **Other** | QR, CSV (Papa Parse), S3 not front-and-center in client deps | **AWS S3** SDK, **icalendar**, **JWT**, **HTTParty**, **Sidekiq-Cron**, **Rack::Cors**, **Rack::Attack** |

**Architecture (mental model):** A **Rails monolith** (`voxxy-rails-react`) remains the **system of record** and **API** for much of Voxxy, with a **separate Vite SPA** (`voxxy-presents-client`) for the **Presents** web experience. Staging config points the SPA at a **Google Cloud Run**-style API host (`*.run.app`), while other env examples point at **`heyvoxxy.com` / `voxxyai.com`** — i.e. **multiple deployment targets** exist across docs and config.

### Deployment topology (from repo config + docs)

| Environment | Frontend (`voxxy-presents-client`) | Backend API |
|-------------|--------------------------------------|-------------|
| **Production** | **Render** web service: `voxxy-presents-client`, **`autoDeploy: true`**, branch **`main`**; domains **`www.voxxypresents.com`**, **`voxxypresents.com`** (`render.yaml`) | **Render** Ruby web `voxxy-rails` + worker `voxxy-sidekiq` (`render.yaml` in backend repo); links to Postgres `beaulazear`, Redis `beau-redis` |
| **Staging** | Render: `voxxy-presents-client-staging`, branch **`staging`**, **`VITE_API_BASE_URL`** → `https://voxxy-presents-api-staging.run.app/api` | **Not fully defined in the same `render.yaml`** — staging API hostname appears **GCP Cloud Run** from SPA env |
| **Dev** | Render: `voxxy-presents-client-dev`, branch **`develop`** | Per env / dashboard (not fully specified in frontend blueprint) |

**CDN / edge:** **No Cloudflare Workers / Pages config** in these repos. **Legal/marketing** copy references **Cloudflare** as a subprocessors; **email docs** mention **Cloudflare DNS** (e.g. DKIM proxy settings). **CORS** is enforced in **Rails** via `rack-cors`, not via an edge config file in-repo.

**Doc inconsistency:** `voxxy-presents-client` **README** still mentions **Firebase Hosting** for production; **`render.yaml`** and deployment docs describe **Render**. Treat README as **possibly stale**; **`render.yaml` is the structured source** for the Presents SPA hosting described there.

### Engineering practices (high level)

| Practice | `voxxy-presents-client` | `voxxy-rails-react` |
|----------|-------------------------|---------------------|
| **Tests** | **Vitest** + Testing Library; **very small** suite; **unit tests not in CI** | **RSpec** (+ empty-ish Minitest tree); **CI runs RSpec + `rails test`** |
| **CI/CD** | GitHub Actions: **typecheck, lint, build**, verify `dist/`; **no `vitest run`** | GitHub Actions: **Brakeman**, **importmap audit**, **RuboCop**, **RSpec**, **Minitest**, **client Jest** |
| **Docs** | Large **`docs/`** tree (architecture, email system, deployment, onboarding) | **`README.md`**, **`docs/`**, **`client/README.md`**, task readmes |

---

## Part 2 — Infrastructure & Access Audit

### Repository ownership and access

| Item | `voxxy-presents-client` | `voxxy-rails-react` |
|------|-------------------------|---------------------|
| **Remote (from `git remote`)** | `https://github.com/courtneygreer-voxxy/voxxy-presents-client.git` | `https://github.com/beaulazear/voxxy-rails-react.git` |
| **Implied owner** | GitHub user/org **`courtneygreer-voxxy`** | GitHub user **`beaulazear`** |
| **Public / private** | **Not discoverable from clone alone** (assume **private** for SaaS) | Same |
| **CODEOWNERS** | **None** | **None** |
| **Collaborators / teams** | **Not in repo** | **Not in repo** |

**Advisor note:** **Two different GitHub namespaces** for frontend vs backend increases **bus factor** and **permission-drift** risk unless access is mirrored and documented in a company org.

**GitHub Apps in workflows:** Standard **`actions/checkout@v4`**, **`actions/setup-node@v4`**, **`ruby/setup-ruby@v1`**, **`actions/upload-artifact@v4`** — no custom third-party apps referenced.

### Branch protection signals

| Repo | Branches implied by config/docs |
|------|----------------------------------|
| **Presents client** | **`main`** (production deploy + `deploy.yml`), **`develop`** (dev deploy + CI PR target), **`staging`** (staging deploy); feature branches in git history |
| **Rails** | **`main`** (`ci.yml` push + PRs to all branches for CI) |

**Workflow signals:**

- **Presents client:** PR CI targets **`main`** and **`develop`** only — **PRs to `staging` do not run `ci.yml`** as written. **`deploy.yml`** runs on push to **`main`** only (plus `workflow_dispatch`).
- **Rails:** CI runs on **all pull requests** and on **push to `main`**.

**Required reviews / required checks:** **No** `pull_request` types, **no** `environment:` gates, **no** `if: github.actor` patterns that prove enforcement. **Actual branch protection is only visible in GitHub Settings** — confirm required checks include the jobs you care about (especially adding **`vitest`** on the SPA if adopted).

### Deployment configuration

#### `voxxy-presents-client`

| File | Contents |
|------|----------|
| **`render.yaml`** | Three **web** services (prod / staging / dev), **Node**, `npm ci && npm run build`, `npm start` (Vite preview), **`autoDeploy: true`**, branch per env; **env var keys** include `NODE_ENV`, `VITE_SITE_*`, `VITE_ENVIRONMENT` (staging), `VITE_API_BASE_URL` (staging) |
| **Scripts** | `scripts/deploy-staging.sh`, `deploy-production.sh`, `setup-environment.sh`, `validate-environment.ts`, `deployment-readiness.ts`, `pre-deployment-tests.ts` — **review in dashboard** for secrets/API tokens |

**Deploy hooks / webhooks:** **Not defined in-repo**; Render GitHub integration lives in **Render UI**.

#### `voxxy-rails-react`

| File | Contents |
|------|----------|
| **`render.yaml`** | **`voxxy-rails`** (Ruby **web**, Puma), **`voxxy-sidekiq`** (Ruby **worker**), **`autoDeploy: true`**; **`bin/render-build.sh`** builds **CRA client into `public/`**, `bundle install`, **`assets:precompile`**, **`db:migrate`** |
| **`Dockerfile`** | Production-oriented image (comment references **Kamal** or manual run); **not necessarily** what Render uses if Render native Ruby build is selected |
| **`Procfile`** | **None** |

**Environment variable names referenced (values intentionally omitted):**

- **Render blueprint (Rails):** `DATABASE_URL`, `REDIS_URL`, `RAILS_ENV`, `RAILS_MASTER_KEY`, `VoxxyKeyAPI`, `PRIMARY_DOMAIN`, `FRONTEND_URL`, `PRESENTS_FRONTEND_URL`, `MOBILE_FRONTEND_URL`
- **Rails initializers / config:** `STRIPE_SECRET_KEY`, `SENTRY_DSN`, `REDIS_URL`, `RAILS_LOG_LEVEL`, `LOCAL_IP`, `PORT`, `RAILS_MAX_THREADS`, `PIDFILE`, `CI`, `SECRET_KEY_BASE_DUMMY` (build), plus **credentials** dig for Stripe
- **Presents SPA (Vite):** `VITE_*` family — see `.env*.example` files: `VITE_ENVIRONMENT`, `VITE_API_BASE_URL`, `VITE_MIXPANEL_TOKEN`, `VITE_DEBUG_MODE`, `VITE_EXPERIMENTAL_FEATURES`, `VITE_SENTRY_DSN`, `VITE_SITE_URL`, `VITE_SITE_NAME`, `VITE_SITE_DESCRIPTION`; code also references **`VITE_DISCORD_WEBHOOK_URL`**, **`VITE_APP_VERSION`** (validators)

### Secrets management

| Topic | Finding |
|-------|---------|
| **`.env` in git** | **Standard `.gitignore`** excludes `.env`, `.env.*.local`, etc. **Untracked locals may still exist on machines** — operational norm |
| **Example files** | **Multiple** `.env.*.example` in Presents client — good for onboarding. **⚠️** `.env.production.example` includes a **non-placeholder `VITE_MIXPANEL_TOKEN` value**; treat as **potential secret leak** — **rotate** if it is or was a real project token |
| **Hardcoded fallbacks** | **Rails `config/initializers/sentry.rb`** sets `config.dsn = ENV["SENTRY_DSN"] || "<full DSN URL>"` — **Sentry DSN committed in repo**. **Risk:** anyone with repo access gets ingest endpoint; **rotate / move to env-only** |
| **Inject at deploy** | Render: `sync: false` for secrets in `render.yaml`; **dashboard** holds real values. Vite: **`VITE_*` baked in at build time** — anyone with build logs or artifacts can recover them; **never treat `VITE_*` as server-only secrets** |

**Git history scan:** This audit did **not** run `git log -p` across history for keys; recommend **`gitleaks` / GitHub secret scanning** for assurance.

### Domain and DNS signals

**Domains referenced in code/config (non-exhaustive):**

- **Presents:** `voxxypresents.com`, `www.voxxypresents.com`; Render hosts `dev-voxxy-presents.onrender.com`, `voxxy-presents-client-staging.onrender.com`
- **Core Voxxy / marketing:** `voxxyai.com`, `www.voxxyai.com`, `heyvoxxy.com`, `www.heyvoxxy.com`, `hey-voxxy.onrender.com`
- **API (examples):** `https://www.heyvoxxy.com/api`, `https://voxxy-presents-api-staging.run.app/api`

**CORS (`config/application.rb`):** Explicit **allowlist** including localhost (3000, 5173), Voxxy/Presents domains, Render dev/staging URLs, a **LAN IP:8081** dev origin, and **`"null"`** (comment: React Native). **Credentials: true** with broad resource `*`. **Advisor flag:** `"null"` and broad methods/headers are **worth a deliberate security review** for browser vs mobile clients.

### Authentication and authorization architecture

| Aspect | Implementation (from code) |
|--------|----------------------------|
| **Token format** | **JWT** (`ruby-jwt`), payload includes `user_id`, expiry |
| **Storage** | **Rails:** cookies/session for web; **SPA:** **`localStorage`** key `railsAuthToken` |
| **Admin** | **`User#admin?`**: `role == "admin"` **or** boolean `admin` column; roles include **`consumer`, `venue_owner`, `vendor`, `admin`**; **`product_context`** derived from role |
| **Policy gems** | **No Devise / Pundit / CanCan** observed in Gemfile; authorization is **controller-level / custom** |
| **Admin routes** | **`Admin::*`**, **`api/v1/presents/*`**, **`/admin/*`** style endpoints in client `adminApi` |

### Third-party tool footprint

| Vendor | Depth | Where credentials live |
|--------|--------|------------------------|
| **Render** | Primary PaaS for SPA + Rails in-repo blueprints | Dashboard / Blueprint |
| **Google Cloud Run** | Staging API hostname in SPA env | **Not in repo** — GCP project |
| **Stripe** | Server-side charges/subscriptions; SPA uses backend API | `STRIPE_SECRET_KEY` / credentials |
| **SendGrid** | Mail delivery | `VoxxyKeyAPI`, domain `PRIMARY_DOMAIN` |
| **Sentry** | Ruby + React | `SENTRY_DSN`, `VITE_SENTRY_DSN`; **⚠️ Ruby default DSN in code** |
| **Mixpanel** | Ruby + browser | Env / `VITE_MIXPANEL_TOKEN` |
| **OpenAI** | Gem present | Env / app config (not fully traced) |
| **AWS S3** | Gem present | Env / credentials (typical) |
| **Google Places** | API usage via backend | Server-side API keys (not extracted here) |

**Twilio:** **Not observed** in backend grep — do not assume it is in use without elsewhere.

### CI/CD security posture

| Control | Presents client | Rails |
|---------|-----------------|-------|
| **Tests required for deploy** | **No** — CI does not run Vitest; Render **auto-deploys** on git push to configured branches **independent of** GitHub Actions success unless you wire checks | **Yes** in spirit — CI runs test jobs; **Render `autoDeploy`** still **does not automatically** wait for GitHub unless configured in Render |
| **SAST** | **No** Brakeman (not Ruby) | **Brakeman** in CI |
| **JS dependency audit** | **Not in CI workflow** | **`bin/importmap audit`** (Rails importmap — **not** `client/` npm) |
| **Dependabot** | **No `.github/dependabot.yml` in repo** | **Bundler + GitHub Actions** only — **`client/package-lock.json` not covered** |

### Things you should know (risks, quirks, continuity)

1. **Split GitHub ownership** (`courtneygreer-voxxy` vs `beaulazear`) — clarify **single org migration**, SSO, and **backup admin** on both.
2. **Committed Sentry DSN** (Rails initializer) — treat as **sensitive**; prefer **env-only** and rotation.
3. **Possible committed analytics token** in `.env.production.example` — **verify and rotate** if real.
4. **CORS includes `"null"` and credentials** — validate threat model (mobile vs abuse).
5. **Verbose auth/JWT logging** in Rails concerns — risk of **token leakage in logs** in production if log aggregation is broad.
6. **README vs `render.yaml`** deployment story for Presents — **reduce confusion** for new engineers and auditors.
7. **Staging API on `run.app`** vs Render Rails blueprint — suggests **multi-cloud**; **document** which env points where and who owns GCP billing.
8. **No CODEOWNERS** — reviews may be informal; **high-risk paths** (auth, Stripe, `api/v1/presents`) benefit from explicit owners.
9. **Presents SPA CI skips unit tests** — regression risk is **real** (see testing audit elsewhere).
10. **`render.yaml` references personal-sounding infra names** (`beaulazear`, `beau-redis`) — fine technically, but **plan for org-neutral naming** as team grows.

---

*Generated from repository inspection (2026-04-26). Confirm live settings in GitHub, Render, GCP, Stripe, SendGrid, Sentry, and DNS providers.*
