# Voxxy Presents

A two-sided marketplace platform connecting event producers with service vendors.

[![Deployed on Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=for-the-badge)](https://render.com)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![Powered by Vite](https://img.shields.io/badge/Powered%20by-Vite-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)

## 🚀 Live Demo

**Production**: [https://www.voxxypresents.com](https://www.voxxypresents.com)

---

## 📋 Overview

**Current Version**: 3.0
**Status**: Phase 1 In Progress (Day 1 Complete ✅)

Voxxy Presents is a marketplace platform that connects:
- **Producers** (event organizers) who create organizations, post events, and discover vendors
- **Vendors** (service providers) who browse events, apply to opportunities, and collaborate after acceptance

### 🎯 Core Features (V3.0)

- **Two-Sided Marketplace**: Producers post event needs, vendors discover and apply
- **Vendor Discovery**: Browse and save vendors across multiple categories (venues, catering, entertainment, photographers, etc.)
- **Application System**: Vendors apply to events, producers review and approve
- **Event Command Center**: Collaboration hub for accepted vendors and producers
- **Organization Management**: Custom branded pages with events and vendor coordination
- **Budget Tracking**: Producers set project budgets, track vendor spending

---

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Hooks + Context API
- **Backend**: Node.js + Express (separate repository)
- **Database**: Firebase Firestore
- **Deployment**: Render (auto-deploy from `main`)
- **Analytics**: Mixpanel

---

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Backend API    │◄──►│  Firebase DB    │
│   (Frontend)    │    │  (Cloud Run)    │    │  (Firestore)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Repositories**:
- **Client**: https://github.com/courtneygreer-voxxy/voxxy-presents-client
- **API**: https://github.com/courtneygreer-voxxy/voxxy-presents-api

---

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- NPM
- Backend API service running

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/courtneygreer-voxxy/voxxy-presents-client.git
   cd voxxy-presents-client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   npm run setup
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   Application available at `http://localhost:5173`

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base components (shadcn/ui)
│   ├── auth/           # Authentication components
│   ├── vendor/         # Vendor marketplace components
│   └── dashboard/      # Dashboard shells
├── pages/              # Page components
│   ├── VendorProfilePage.tsx
│   ├── VenueOwnerDashboardNew.tsx
│   └── OrganizationAdminEnhanced.tsx
├── services/           # API service layer
│   ├── api.ts
│   ├── authService.ts
│   └── vendorService.ts
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── types/              # TypeScript definitions
│   ├── database.ts
│   └── vendor.ts
├── lib/                # Utilities
│   ├── database.ts
│   └── analytics.ts
└── hooks/              # Custom hooks
    └── useOrganization.ts
```

---

## 🔧 Development

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Production build
npm run preview          # Preview production build
npm run setup            # Initial environment setup
npm run lint             # Run ESLint
```

### Environment Variables

```env
VITE_ENVIRONMENT=development
VITE_API_BASE_URL=http://localhost:3001/api
VITE_FIREBASE_PROJECT_ID=voxxy-presents-dev
# ... additional Firebase config
```

See `.env.example` for full configuration.

---

## 🚀 Deployment

### Auto-Deployment

- **Main Branch** → Production (automatic via Render)
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`

### Manual Deployment

```bash
npm run build
# Upload dist/ to hosting provider
```

---

## 📚 Documentation

**Full documentation is organized in [`/docs`](./docs/)**

### Quick Links

- **[V3.0 Technical Requirements](./docs/v3-migration/VOXXY_PRESENTS_MVP_TECHNICAL_REQUIREMENTS_V3.md)** - Complete project spec
- **[Phase 1 Day 1 Report](./docs/phase-reports/PHASE-1-DAY-1-COMPLETE.md)** - Latest progress
- **[Project Handoff](./docs/PROJECT_HANDOFF.md)** - Onboarding for new engineers
- **[Contributing Guide](./docs/CONTRIBUTING.md)** - Development workflow
- **[Deployment Guide](./docs/deployment/DEPLOYMENT.md)** - How to deploy

### Documentation Structure

- **[docs/v3-migration/](./docs/v3-migration/)** - V3.0 refactoring documentation
- **[docs/phase-reports/](./docs/phase-reports/)** - Daily progress reports
- **[docs/development/](./docs/development/)** - Developer guides
- **[docs/deployment/](./docs/deployment/)** - Deployment documentation
- **[docs/archive/](./docs/archive/)** - Historical documents

---

## 🌟 Recent Updates (V3.0)

### Phase 0 ✅ Complete
- Security fixes (CORS, environment validation)
- Dependency locking (33 packages)
- Production deployment verified

### Phase 1 Day 1 ✅ Complete
- Database role refactoring (`organizer`→`producer`, `venue_owner`→`vendor`)
- Profile object renaming (`organizationProfile`→`producerProfile`, `venueOwnerProfile`→`vendorProfile`)
- Beta approval logic removed
- Signup flows updated to V3.0 roles
- Production migration executed (4 users)
- Vendor dashboard bug fixes

### Current Work 🔄
- **Day 2**: Vendor discovery system
- **Day 3**: Application system
- **Day 4**: Event command center

See [Phase Reports](./docs/phase-reports/) for detailed updates.

---

## 🤝 Contributing

1. Read [Contributing Guidelines](./docs/CONTRIBUTING.md)
2. Create feature branch from `main`
3. Make changes and test locally
4. Submit Pull Request
5. Await review and merge

---

## 📄 License

Proprietary software. All rights reserved.

---

## 🆘 Support

For questions or issues:
- Review [documentation](./docs/)
- Check [phase reports](./docs/phase-reports/)
- Contact development team

---

**Built with ❤️ by the Voxxy team**
**Last Updated**: October 28, 2025
