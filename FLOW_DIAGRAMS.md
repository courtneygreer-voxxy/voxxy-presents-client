# Voxxy Presents - Flow Diagrams

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│  Contact Form│ (Public - No Auth)
│  /contact    │
└──────┬───────┘
       │ User requests beta access
       ↓
┌──────────────────┐
│ Backend approves │
│ & sends login    │
│ credentials      │
└──────┬───────────┘
       │ User receives email with credentials
       ↓
┌──────────────┐      POST /login       ┌─────────────┐
│  /login      │ ───────────────────→ │  Rails API  │
│  Page        │ (email, password)     │  Returns:   │
│              │ ←───────────────────  │  - JWT token│
└──────┬───────┘                       │  - User ID  │
       │                               └─────────────┘
       │ Token saved to localStorage (railsAuthToken)
       ↓
┌──────────────────┐      GET /me         ┌─────────────┐
│ Fetch Current    │ ───────────────────→ │  Rails API  │
│ User Profile     │ (Bearer token)       │  Returns:   │
│                  │ ←───────────────────  │  Full user  │
└──────┬───────────┘                      │  profile    │
       │                                   └─────────────┘
       │ Profile cached in localStorage
       ↓
┌──────────────────────────┐
│ RoleBasedDashboardRedirect
│                          │
│  isProducer? → /producer/pending
│  isVendor?   → /vendor/pending
│  isAdmin?    → /admin/dashboard
│  else?       → /pending
└──────────────────────────┘
```

## Producer Event Creation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│           PRODUCER EVENT CREATION (4-STEP WIZARD)               │
└─────────────────────────────────────────────────────────────────┘

Producer Dashboard
       ↓
   ┌───────────────────────────────────────────┐
   │  STEP 1: Basic Event Info                 │
   │  • Title, date, location                  │
   │  • Stored in wizardState                  │
   └───────────────────────────────────────────┘
       ↓
   ┌───────────────────────────────────────────┐
   │  STEP 2: Event Settings                   │
   │  • Capacity, pricing, deadlines           │
   │  • Status (draft/published)               │
   │  • Application deadline                   │
   └───────────────────────────────────────────┘
       ↓
   ┌───────────────────────────────────────────┐
   │  STEP 3: Vendor Invitations               │
   │  • Load vendor contacts from network      │
   │  • Multi-select vendors to invite         │
   │  • Store contact IDs in wizardState       │
   │  • [TODO] Create invitations when backend │
   │           endpoints ready                 │
   └───────────────────────────────────────────┘
       ↓
   ┌───────────────────────────────────────────┐
   │  STEP 4: Review & Confirm                 │
   │  • Show all entered data                  │
   │  • User confirms creation                 │
   └───────────────────────────────────────────┘
       ↓
   ┌──────────────────────────────────┐
   │ POST /events (via eventsApi)     │
   │ {                                │
   │   event: {                       │
   │     title, description, dates... │
   │   }                              │
   │ }                                │
   └──────────┬───────────────────────┘
              │
              ↓ Success
   ┌─────────────────────────────────────────────┐
   │  Event created in database                  │
   │  wizardState.inviteList.invitedContactIds   │
   │  logged to console                          │
   │  [TODO] Create batch invitations here       │
   │         POST /events/:slug/invitations/batch│
   └─────────────────────────────────────────────┘
```

## Vendor Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              PUBLIC VENDOR APPLICATION FLOW                      │
└─────────────────────────────────────────────────────────────────┘

Public User (No Auth)
       ↓
┌──────────────────────────────────┐
│ GET /events/:slug                │
│ (PublicEventDetailPage)          │
│ • View event details             │
│ • See "Apply as Vendor" button   │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│ GET /events/:slug/vendor_apps    │
│ • Load vendor application form   │
│ • Show categories, requirements  │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│ VendorApplicationForm            │
│ • Contact name                   │
│ • Email                          │
│ • Phone                          │
│ • Business name                  │
│ • Category (dropdown)            │
│ • Subscribe checkbox             │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────────┐
│ POST /events/:slug/registrations     │
│ {                                    │
│   registration: {                    │
│     name, email, phone,              │
│     business_name,                   │
│     vendor_category,                 │
│     vendor_application_id,           │
│     subscribed                       │
│   }                                  │
│ }                                    │
└──────────┬───────────────────────────┘
           │
           ↓ Success
┌──────────────────────────────────────┐
│ Response includes: ticket_code       │
│ Example: ABC123XYZ                   │
└──────────┬───────────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│ ApplicationConfirmationPage      │
│ • Show success message           │
│ • Display ticket code            │
│ • Instructions to track status   │
└──────────┬───────────────────────┘
           │
           ↓ User bookmarks or saves ticket code
┌──────────────────────────────────┐
│ Later: Track Status              │
│ GET /applications/track/:code    │
│ • No auth required               │
│ • Shows current status           │
│ • pending → approved → ready     │
└──────────────────────────────────┘
```

## Producer Application Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│         PRODUCER: MANAGE VENDOR APPLICATIONS                    │
└─────────────────────────────────────────────────────────────────┘

Producer Dashboard > Command Center
       ↓
┌──────────────────────────────┐
│ Load Event Data              │
│ • GET /events/:slug          │
│ • GET /vendor_applications   │
│ • GET /registrations/event   │
└──────────┬───────────────────┘
           │
           ↓
   ┌────────────────────────────────┐
   │   TABS: Applications, Vendors   │
   │                                │
   │  ApplicationsTab:              │
   │  • List all applications       │
   │  • Count by status             │
   │  • View submission details     │
   │  • Click to view full details  │
   │                                │
   │  VendorsTab:                   │
   │  • List vendor submissions     │
   │  • View vendor contact info    │
   │  • View responses to app form  │
   │  • Update status (approve...)  │
   └────────────┬───────────────────┘
                │
                ↓ Producer selects vendor
    ┌───────────────────────────────┐
    │ ViewApplicationSubmissions    │
    │ • Show detailed application   │
    │ • Show submission answers     │
    │ • Option to approve/reject    │
    └────────────┬──────────────────┘
                 │
                 ↓ Producer clicks approve/reject
    ┌───────────────────────────────┐
    │ PATCH /registrations/:id      │
    │ {                             │
    │   registration: {             │
    │     status: "approved"        │
    │   }                           │
    │ }                             │
    └───────────────────────────────┘
```

## Route Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                      ROUTE STRUCTURE                            │
└─────────────────────────────────────────────────────────────────┘

PUBLIC ROUTES (No Auth Required)
├─ /                          → HomePage
├─ /features                  → FeaturesPage
├─ /pricing                   → PricingPage
├─ /help                      → HelpPage
├─ /contact                   → ContactPage (Beta Request)
├─ /about                     → AboutPage
├─ /privacy                   → PrivacyPolicyPage
├─ /terms                     → TermsOfServicePage
├─ /events/:slug              → PublicEventDetailPage
├─ /events/:slug/apply        → VendorApplicationForm
├─ /applications/success      → ApplicationConfirmationPage
├─ /applications/track/:code  → ApplicationTrackingPage
└─ /apply/:code               → ShortLinkRedirectPage

AUTH ROUTES (Redirect if authenticated)
├─ /login                     → LoginPage (Unified)
├─ /forgot-password           → ForgotPasswordPage
├─ /reset-password            → ResetPasswordPage
└─ /verify-email              → EmailVerificationPage

DASHBOARD ROUTES (Role-based redirect)
├─ /pending                   → BetaPendingPage (Consumer)
├─ /producer/pending          → ProducerDashboard
├─ /vendor/pending            → VendorDashboard
└─ /admin/dashboard           → AdminDashboard (Admin only)

CATCH-ALL
└─ /                          → Redirect to home
```

## State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATE ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────┘

AuthContext (Global)
├─ currentUser: User | null
├─ userProfile: User | null
├─ loading: boolean
├─ error: string | null
├─ isAuthenticated: boolean
├─ isEmailVerified: boolean
├─ isAdmin: boolean
├─ isProducer: boolean
├─ isVendor: boolean
├─ signUp(): Promise<void>
├─ signIn(): Promise<void>
├─ signOut(): Promise<void>
└─ ... other auth methods

LocalStorage Cache
├─ railsAuthToken (JWT)
└─ rails-user (cached profile)

Component State (useState)
├─ ProducerDashboard
│  ├─ organization
│  ├─ events[]
│  ├─ eventsView (list|create|edit|command-center)
│  └─ selectedEvent
├─ CreateEventWizard
│  ├─ wizardState (step, formData, inviteList)
│  └─ currentStep
└─ Other component-local state
```

## API Service Organization

```
┌─────────────────────────────────────────────────────────────────┐
│                    API SERVICE STRUCTURE                        │
└─────────────────────────────────────────────────────────────────┘

api.ts (40KB)
│
├─ authApi
│  ├─ login()
│  ├─ signup()
│  ├─ logout()
│  ├─ getCurrentUser()
│  ├─ updateUser()
│  ├─ requestPasswordReset()
│  ├─ resetPasswordWithToken()
│  ├─ verifyEmailCode()
│  └─ resendVerificationEmail()
│
├─ organizationsApi
│  ├─ getAll()
│  ├─ getMine()
│  ├─ getBySlug()
│  ├─ create()
│  ├─ update()
│  └─ delete()
│
├─ eventsApi
│  ├─ getById()
│  ├─ getByOrganization()
│  ├─ getAll()
│  ├─ create()
│  ├─ update()
│  └─ delete()
│
├─ registrationsApi
│  ├─ create()
│  ├─ getByEvent()
│  ├─ submitVendorApplication()
│  ├─ trackByTicketCode()
│  └─ updateStatus()
│
├─ vendorApplicationsApi
│  ├─ getByEvent()
│  ├─ getById()
│  ├─ create()
│  ├─ update()
│  ├─ delete()
│  ├─ getSubmissions()
│  └─ lookupByCode()
│
├─ emailApi
│  ├─ submitContactForm()
│  ├─ getContactSubmissions()
│  ├─ sendEmail()
│  ├─ getEmailTemplates()
│  └─ getEmailThreads()
│
└─ venuesApi
   ├─ create()
   ├─ getAll()
   ├─ getBySlug()
   └─ getById()

Base Utilities
├─ fetchApi<T>() - Wrapper with auth, error handling
├─ ApiError - Custom error class
├─ Token management (get, save, clear)
└─ Environment detection
```

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                 COMPONENT HIERARCHY                             │
└─────────────────────────────────────────────────────────────────┘

App
│
├─ Router
│  └─ AuthProvider
│     ├─ DebugPanel (dev only)
│     └─ Routes
│        ├─ HomePage
│        ├─ LoginPage
│        │  └─ UnifiedLoginForm
│        ├─ ProducerDashboard
│        │  ├─ Navigation
│        │  ├─ EventsList
│        │  │  └─ EventCard[]
│        │  ├─ CreateEventWizard
│        │  │  ├─ Step1BasicInfo
│        │  │  ├─ Step2Settings
│        │  │  ├─ Step3InviteList
│        │  │  ├─ Step4Review
│        │  │  ├─ WizardProgress
│        │  │  └─ WizardNavigation
│        │  ├─ CommandCenter
│        │  │  ├─ ApplicationsTab
│        │  │  ├─ VendorsTab
│        │  │  └─ MessageBoard
│        │  ├─ NetworkPage
│        │  │  ├─ VendorContactsList
│        │  │  └─ AddVendorForm
│        │  └─ SettingsPage
│        │
│        ├─ VendorApplicationForm
│        │  └─ Form
│        │     ├─ Input (name, email, phone)
│        │     ├─ Input (business_name)
│        │     ├─ Select (category)
│        │     └─ Checkbox (subscribe)
│        │
│        ├─ PublicEventDetailPage
│        │  └─ Event display with vendor app button
│        │
│        └─ AdminDashboard
│           └─ Admin controls
│
└─ Protected by AdminRoute wrapper
```

---

For more details, see CODEBASE_ANALYSIS.md
