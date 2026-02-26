# Voxxy Presents - Event Management Platform

**Modern event management and vendor coordination for venues, markets, and festivals.**

**Latest Updates**: Error monitoring system with Sentry integration, security cleanup (Feb 26, 2026), Email automation UI improvements and category dropdown fixes (Feb 2026).

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

**Current Branch Status (Feb 2026):**
- All branches (`develop`, `staging`, `main`) are synchronized
- Last feature: Error monitoring & security cleanup (staging)
- Last staging merge: Feb 26, 2026
- Last production deploy: Feb 18, 2026 at 5:36 AM UTC

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

- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS
- **State Management:** React Query
- **Authentication:** Firebase Auth
- **Error Monitoring:** Sentry (error tracking)
- **Hosting:** Firebase Hosting
- **Backend API:** Rails API (voxxy-rails-react)

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

**Built with ❤️ by the Voxxy team**

Last updated: February 26, 2026
