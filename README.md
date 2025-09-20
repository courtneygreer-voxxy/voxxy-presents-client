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
- **Venue Marketplace**: Complete venue discovery and booking platform with glass morphism UI
- **Design Customization**: Background color, text color, and button color personalization
- **Admin Dashboard**: Full-featured management interface for organization owners
- **Smart Event Creation**: Dedicated flows for one-time events vs. recurring series with improved page-based workflows
- **Dynamic Event Management**: Support for free events, paid tickets, and presale systems
- **Registration Workflows**: RSVP tracking with calendar integration, subscription management, and external ticketing integration
- **Series & Recurring Events**: Advanced management with individual event customization
- **Image Management**: File upload system with automatic compression and carousel display
- **Club Creation Wizard**: Streamlined guided setup for new organizations
- **Real-time Data**: Live event updates and registration management
- **Multi-Environment Support**: Development, staging, production, and sandbox environments
- **Glass Morphism Design**: Modern UI with translucent components and backdrop blur effects
- **Venue Discovery**: Advanced search and filtering system for event venues
- **Peerspace-Inspired Layout**: Optimized venue profiles with image-first approach

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

## ✨ RSVP System Features

The platform includes a comprehensive RSVP management system:

### Public RSVP Flow
- **RSVP Modal**: Public users can RSVP "Going" or "Maybe" for published events
- **Calendar Integration**: Auto-generates .ics files and Google/Outlook calendar links
- **Simple Captcha**: Math-based verification to prevent spam
- **Subscription Option**: Users can subscribe to organization updates

### Admin Management Interface
- **RSVP Dashboard**: View all registrations with Going/Maybe/Total counts
- **CSV Export**: Download registration data for external processing
- **Real-time Updates**: Live registration counts and attendee information
- **Shareable Links**: Generate public links for venue owners to view RSVPs

### Technical Implementation
- **Frontend**: React modals with TypeScript, glass morphism UI design
- **Backend**: Firebase integration with real-time data sync
- **API**: RESTful endpoints for registration management
- **Validation**: Server-side validation with duplicate detection

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── OrganizationPage.tsx     # Reusable organization template
│   ├── OrganizationEditForm.tsx # Admin form component
│   ├── RSVPModal.tsx            # Public RSVP interface with calendar integration
│   ├── RSVPListModal.tsx        # Admin RSVP management dashboard
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
│   ├── SharedRSVPPage.tsx       # Public RSVP view for venue owners
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

**Recent Enhancement (v1.6.0)**: Complete glass morphism design system implementation with consistent translucent backgrounds, backdrop blur effects, and white text visibility. Enhanced UI components with explicit styling for reliable cross-component consistency.

### Image Carousel System
Rich visual storytelling for organization about sections:
- **Multiple Image Support**: Upload up to 5 images per organization
- **File Upload Interface**: Direct image upload with automatic compression
- **Carousel Navigation**: Click-through gallery with arrows, dots, and counter
- **Storage Optimization**: Aggressive compression (150KB per image) to stay within database limits
- **Backwards Compatibility**: Seamless upgrade from single image to carousel

### Club Creation Wizard
Complete streamlined guided setup for new organizations:
- **Basic Information**: Name, description, contact details with auto-generated URL slugs
- **Branding Customization**: Logo upload and color scheme selection (header images removed for improved performance)
- **Social Integration**: Connect Instagram, website, and other platforms
- **Location Setup**: Default venue information for recurring events
- **Story & Offerings**: Rich about section with custom content

**Recent Enhancement (v1.6.0)**: Streamlined creation flow with combined name/description step, removed tagline field, and simplified branding options for faster onboarding.

## 🚀 MVP v1.6.0 Release Highlights

### Glass Morphism Design System
Complete visual overhaul with modern design principles:
- **Consistent Translucent UI**: All modals, forms, and components use `bg-white/15 backdrop-blur-md border-white/30` styling
- **Improved Text Visibility**: White text with proper contrast across all glass components
- **Enhanced User Experience**: Share button popups, login/signup forms, and contact forms now use glass morphism
- **Cross-Component Reliability**: Explicit Tailwind classes override global CSS for consistent styling

### Streamlined Event Creation
- **Page-Based Workflow**: Converted create event from problematic popup to dedicated page at `/{orgSlug}/create-event`
- **Improved Mobile Experience**: Better responsive design and user interaction on mobile devices
- **Protected Routes**: Authentication-required access with proper organization context

### Simplified Club Creation
- **Combined Steps**: Name and description now on same page for faster setup
- **Removed Complexity**: Eliminated tagline field and header photo uploads for streamlined onboarding
- **Better Preview**: Club preview now matches actual public page structure with correct component ordering

### Platform Integration Removal
As part of startup pivot strategy, completely removed all third-party platform integration features:
- **Eventbrite Integration**: Removed all import/sync functionality and related components
- **Platform Management**: Cleaned up admin dashboard and settings pages
- **Codebase Optimization**: Removed 15+ platform-related files and components for improved performance
- **Feature Flags**: Updated environment configuration to remove deprecated platform options

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

## 🎯 Latest Release: v1.8.0 Venue Marketplace

**🚀 Now Live**: Complete venue discovery platform with modern glass morphism UI design

### What's New in v1.8.0:
- ✨ **Venue Marketplace**: Full-featured venue search and discovery platform
- 🎨 **Glass Morphism Design**: Modern translucent UI with backdrop blur effects
- 🏢 **Peerspace-Inspired Layout**: Image-first venue profiles for better visualization
- 🔍 **Advanced Search**: Location, capacity, and amenity-based filtering
- 📱 **Responsive Design**: Optimized for all device sizes
- 🌟 **Contact Integration**: Streamlined venue inquiry system

---

## 📚 Documentation

**🚀 Quick Links:**
- [Contributing Guidelines](CONTRIBUTING.md) - Development workflow
- [Operations Runbook](docs/development/RUNBOOK.md) - Emergency procedures
- [Deployment Guide](docs/deployment/DEPLOYMENT.md) - Staging → Production workflow
- [Branching Strategy](docs/development/BRANCHING_STRATEGY.md) - Git workflow
- [Firebase Security](docs/development/FIREBASE_SECURITY.md) - Database security

**📋 Release Notes:**
- [v1.8.0 - Venue Marketplace](docs/PROJECT_PLAN_VENUE_MARKETPLACE_v1.8.0.md) - Complete venue platform
- [v1.6.0 - MVP Release](docs/releases/RELEASE_NOTES_v1.6.0.md) - Glass morphism UI and streamlined workflows
- [v1.5.0 - Project Cool](docs/releases/v1.5.0.md) - Background customization system

**🎨 Design System:**
- [Glass Morphism Components](docs/design/GLASS_MODAL_DESIGN_SYSTEM.md) - UI component guidelines
- [Styling Guidelines](docs/design/STYLING_UPDATE_SESSION.md) - Design system documentation

---

Built with ❤️ by the Voxxy team
