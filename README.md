# Voxxy Presents

A modern event management platform that simplifies recurring community events with custom organization pages, automated registration systems, and seamless messaging to keep communities connected.

[![Deployed on Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=for-the-badge)](https://render.com)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![Powered by Vite](https://img.shields.io/badge/Powered%20by-Vite-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)

## 🚀 Live Demo

**Production**: [https://www.voxxypresents.com](https://www.voxxypresents.com)

## 📋 Overview

Voxxy Presents is a comprehensive event management solution designed for creative communities, clubs, and recurring event organizers. The platform provides:

- **Custom Organization Pages**: Branded landing pages with image carousels and rich content
- **Design Customization**: Background color, text color, and button color personalization
- **Admin Dashboard**: Full-featured management interface for organization owners
- **Smart Event Creation**: Dedicated flows for one-time events vs. recurring series
- **Dynamic Event Management**: Support for free events, paid tickets, and presale systems
- **Registration Workflows**: RSVP tracking, presale requests, and external ticketing integration
- **Series & Recurring Events**: Advanced management with individual event customization
- **Image Management**: File upload system with automatic compression and carousel display
- **Club Creation Wizard**: Guided 7-step setup for new organizations
- **Real-time Data**: Live event updates and registration management
- **Multi-Environment Support**: Development, staging, production, and sandbox environments

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Hooks
- **API Integration**: REST API with custom service layer
- **Deployment**: Render
- **Database**: Firebase Firestore (via backend API)

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Backend API    │◄──►│  Firebase DB    │
│   (Frontend)    │    │  (Cloud Run)    │    │  (Firestore)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- NPM or Yarn
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
   
   Run the automated setup script:
   ```bash
   npm run setup
   ```
   
   This will create all necessary environment files from examples. Alternatively, manually configure:
   ```env
   # Development uses Firebase directly (no API URL needed)
   VITE_ENVIRONMENT=development
   VITE_FIREBASE_PROJECT_ID=voxxy-presents-dev
   # ... other Firebase config variables
   ```

4. **Seed Development Data**
   ```bash
   npm run seed:dev
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── OrganizationPage.tsx     # Reusable organization template
│   ├── OrganizationEditForm.tsx # Admin form component
│   └── EventRegistration.tsx
├── config/             # Environment configuration
│   └── environments.ts # Multi-environment setup
├── hooks/              # Custom React hooks
│   ├── useOrganization.ts       # Generic organization hook
│   └── useBrooklynHeartsClub.ts
├── pages/              # Page components
│   ├── HomePage.tsx
│   ├── BrooklynHeartsClub.tsx
│   ├── VoxxyPresentsNYC.tsx
│   ├── OrganizationAdmin.tsx    # Admin dashboard
│   └── AdminDashboard.tsx
├── services/           # API service layer
│   └── api.ts
├── lib/                # Utility functions
│   ├── database.ts     # Firebase operations
│   └── utils.ts
├── types/              # TypeScript type definitions
└── styles/             # Global styles
```

## 🐛 Known Issues

### Image Upload on Organization Pages
- **Issue**: Error when trying to add images to organization about section
- **Error**: `Route /api/organizations/{id} not found` in production
- **Status**: API endpoint exists but still debugging routing issue
- **Workaround**: None currently
- **Priority**: High - blocking organization customization

---

## 🔧 Key Features

### Admin Dashboard
Full-featured management interface for organization owners:
- **Organization Management**: Edit branding, contact info, social links, and settings
- **Event Management**: View, create, and manage events with detailed controls
- **Registration Management**: Track attendee data and manage sign-ups
- **Analytics Dashboard**: Performance insights and engagement metrics
- **Real-time Updates**: Changes appear immediately on public pages
- **Multi-tab Interface**: Organized sections for different admin functions

**Access Pattern**: `/{organization-slug}/admin`
- Brooklyn Hearts Club: `/brooklyn-hearts-club/admin`
- Voxxy Presents NYC: `/voxxy-presents-nyc/admin`

### Dynamic Event Display
Events automatically display appropriate registration options based on configuration:
- **Free Events**: Direct RSVP (Yes/Maybe)
- **Presale Events**: Email collection for notification
- **Ticketed Events**: External platform integration

### Registration System
Comprehensive registration workflows supporting:
- RSVP tracking with attendance preferences
- Presale interest collection
- External ticketing platform integration
- Custom form fields and validation

### Organization Management
Multi-tenant architecture supporting:
- Custom branding and themes
- Individual organization settings
- Flexible event categorization
- Social media integration

### Event Creation Flows
Streamlined event creation with dedicated workflows:
- **One-Time Events**: Simple form for workshops, parties, and special events
- **Recurring Event Series**: Advanced management for ongoing programs with individual event customization
- **Smart Event Types**: Guided selection process to choose the right flow
- **Event Details Cards**: Individual customization for each event in a series (date, theme, description, location overrides)

### Design Customization System
Simple yet powerful branding controls for organization pages:
- **Dynamic Background Styles**: Choose from 5 curated background options (animated stars, purple gradient, sunset gradient, minimal grid, abstract waves) that work seamlessly with glass morphism design
- **Glass Morphism UI**: Modern translucent components with backdrop blur effects for depth and visual appeal
- **Text Color Control**: Customize color of key headings ("Welcome to [Club]", "Upcoming Events", "About [Club]", etc.)
- **Button Color Theming**: Custom button colors for consistent branding across public pages
- **Real-time Updates**: Changes save instantly and apply to public organization pages
- **Minimal Interface**: Clean, focused design controls without overwhelming options

**Recent Enhancement (v1.5.0)**: Replaced static header images with dynamic background selector and integrated welcome section combining profile picture, title, and organization message for improved visual hierarchy and responsive design.

### Image Carousel System
Rich visual storytelling for organization about sections:
- **Multiple Image Support**: Upload up to 5 images per organization
- **File Upload Interface**: Direct image upload with automatic compression
- **Carousel Navigation**: Click-through gallery with arrows, dots, and counter
- **Storage Optimization**: Aggressive compression (150KB per image) to stay within database limits
- **Backwards Compatibility**: Seamless upgrade from single image to carousel

### Club Creation Wizard
Complete 7-step guided setup for new organizations:
- **Basic Information**: Name, description, contact details with auto-generated URL slugs
- **Branding Customization**: Logo, header image, and color scheme selection
- **Social Integration**: Connect Instagram, website, and other platforms
- **Location Setup**: Default venue information for recurring events
- **Story & Offerings**: Rich about section with custom content

## 🌐 API Integration

The frontend connects to a backend API service for:
- Organization data management
- Event CRUD operations
- Registration handling
- Real-time data synchronization

### API Service Layer
Located in `src/services/api.ts`, provides:
- Type-safe API calls
- Error handling
- Request/response transformation
- Environment-based URL configuration

## 🚀 Deployment

### Environment Setup

The application supports multiple deployment environments:

- **Development**: Local development with hot reload
- **Staging**: Testing environment with production-like setup
- **Production**: Live deployment

### Build Process

```bash
# Production build
npm run build

# Preview production build locally
npm run preview
```

### Environment Variables

Configure the following for each environment:

```env
VITE_API_BASE_URL=https://your-api-url.com/api
VITE_FIREBASE_PROJECT_ID=your-firebase-project
# Additional Firebase configuration...
```

## 🧪 Development Workflows

### Branch Strategy
- `develop`: Main development branch
- `staging`: Pre-production testing
- `main`: Production releases

### Multi-Environment Support
Voxxy Presents supports multiple deployment environments:

- **Development**: `localhost:5173` - Firebase direct access with independent test data
- **Staging**: `staging.voxxypresents.com` - API with production data mirror for testing
- **Production**: `www.voxxypresents.com` - Live API with real customer data  
- **Sandbox**: `sandbox.voxxypresents.com` - Independent experimental environment

**Environment Commands**:
```bash
npm run setup           # Initial environment setup
npm run seed:dev        # Populate development data
npm run sync:staging    # Sync production data to staging
npm run deploy:staging  # Deploy to staging
npm run deploy:production # Deploy to production
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed environment strategy.

### Local Development
1. Run `npm run setup` for initial configuration
2. Run `npm run seed:dev` to populate test data
3. Start development server with `npm run dev`
4. Access admin dashboards at `/{org-slug}/admin`

### Testing
- **Unit Tests**: `npm run test` - Vitest with React Testing Library
- **Type Checking**: `npx tsc --noEmit` - TypeScript compilation
- **Linting**: `npm run lint` - ESLint code quality checks
- **Manual Testing**: Admin dashboards and public pages

## 🔒 Security Considerations

- Environment variables for sensitive configuration
- CORS-enabled API communication
- Input validation and sanitization
- Secure authentication workflows (future implementation)

## 📈 Future Enhancements

- User authentication and authorization
- Advanced analytics and reporting
- Mobile app development
- Multi-language support
- Payment processing integration
- Advanced event scheduling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For development questions or technical support, please refer to:
- Project documentation
- API documentation
- Development team resources

---

## 📚 Documentation

**📖 [Complete Documentation Index](docs/README.md)** - Navigate all project docs

**🚀 Quick Links:**
- [Contributing Guidelines](CONTRIBUTING.md) - Development workflow
- [Operations Runbook](RUNBOOK.md) - Emergency procedures  
- [Customer Guide](CUSTOMER-ONBOARDING.md) - Email system usage
- [Deployment Guide](DEPLOYMENT.md) - Staging → Production workflow
- [Current Status](DEVELOPMENT-STATUS.md) - Project progress

**📋 Release Notes:**
- [v1.5.0 - Project Cool](docs/releases/v1.5.0.md) - Background customization system

---
Built with ❤️ by the Voxxy team