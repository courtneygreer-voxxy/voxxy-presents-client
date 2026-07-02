// =============================================================================
// Artist Portal — Mock Data & TypeScript Interfaces
// Types mirror future API response shapes (ArtistProfileSerializer, etc.)
// =============================================================================

// --- Types -------------------------------------------------------------------

export interface ArtistProfile {
  id: number
  user_id: number
  slug: string
  name: string
  email: string
  phone: string
  business_name: string
  bio: string
  instagram_handle: string
  tiktok_handle: string
  website: string
  location: string
  city: string
  state: string
  profile_pic_url: string | null
  public: boolean
  views_count: number
  claimed_at: string
  created_at: string
  updated_at: string
}

export interface ArtistShow {
  id: number
  event_id: number
  event_title: string
  event_date: string
  event_end_date?: string
  event_image_url: string | null
  venue_name: string
  venue_address: string
  city: string
  state: string
  organization_name: string
  organization_logo_url: string | null
  vendor_category: string
  status: 'invited' | 'pending' | 'approved' | 'rejected' | 'waitlist'
  payment_status: 'not_required' | 'pending' | 'paid' | 'overdue'
  booth_price: number | null
  payment_deadline: string | null
  application_deadline: string | null
  install_date: string | null
  install_time: string | null
  event_description: string
  producer_contact_email: string
  applied_at: string
  is_past: boolean
}

export type NotificationType =
  | 'invitation_received'
  | 'application_confirmed'
  | 'status_approved'
  | 'status_rejected'
  | 'payment_received'
  | 'event_update'
  | 'bulletin'
  | 'reminder'

export interface ArtistNotification {
  id: number
  type: NotificationType
  title: string
  message: string
  event_title: string
  organization_name: string
  timestamp: string
  read: boolean
  action_url?: string
  action_label?: string
}

export interface Resource {
  id: number
  title: string
  description: string
  category: 'getting_started' | 'online_class' | 'workshop' | 'partner'
  image_url: string | null
  location: string
  url: string
  is_free: boolean
  date?: string
}

// --- Mock Data ---------------------------------------------------------------

export const mockArtistProfile: ArtistProfile = {
  id: 1,
  user_id: 101,
  slug: 'jane-doe-art',
  name: 'Jane Doe',
  email: 'jane@janedoeart.com',
  phone: '(917) 555-0142',
  business_name: 'Jane Doe Art',
  bio: 'Mixed media artist based in Brooklyn. I create large-scale abstract paintings and immersive installations that explore the intersection of nature and urban landscapes. Featured at Pancakes & Booze, Art Basel Miami, and Brooklyn Art Walk.',
  instagram_handle: 'janedoeart',
  tiktok_handle: 'janedoeart',
  website: 'https://janedoeart.com',
  location: 'Brooklyn, NY',
  city: 'Brooklyn',
  state: 'NY',
  profile_pic_url: null,
  public: true,
  views_count: 247,
  claimed_at: '2026-06-15T14:30:00Z',
  created_at: '2026-06-15T14:30:00Z',
  updated_at: '2026-06-28T09:15:00Z',
}

export const mockShows: ArtistShow[] = [
  {
    id: 1,
    event_id: 201,
    event_title: 'Pancakes & Booze — Brooklyn Summer Show',
    event_date: '2026-08-15T18:00:00Z',
    event_end_date: '2026-08-15T23:00:00Z',
    event_image_url: null,
    venue_name: 'Brooklyn Steel',
    venue_address: '319 Frost St, Brooklyn, NY 11222',
    city: 'Brooklyn',
    state: 'NY',
    organization_name: 'Pancakes & Booze',
    organization_logo_url: null,
    vendor_category: 'Painter',
    status: 'approved',
    payment_status: 'paid',
    booth_price: 200,
    payment_deadline: '2026-08-01T23:59:59Z',
    application_deadline: '2026-07-15T23:59:59Z',
    install_date: '2026-08-15',
    install_time: '3:00 PM',
    event_description: 'Brooklyn\'s biggest art party returns! 80+ artists, live music, free pancakes, and an open bar. All mediums welcome — painters, sculptors, photographers, digital artists, and more.',
    producer_contact_email: 'events@pancakesandbooze.com',
    applied_at: '2026-06-20T10:00:00Z',
    is_past: false,
  },
  {
    id: 2,
    event_id: 202,
    event_title: 'Williamsburg Art Walk',
    event_date: '2026-09-12T12:00:00Z',
    event_end_date: '2026-09-12T20:00:00Z',
    event_image_url: null,
    venue_name: 'Williamsburg Waterfront',
    venue_address: '50 Kent Ave, Brooklyn, NY 11249',
    city: 'Brooklyn',
    state: 'NY',
    organization_name: 'Brooklyn Arts Collective',
    organization_logo_url: null,
    vendor_category: 'Mixed Media',
    status: 'pending',
    payment_status: 'not_required',
    booth_price: 150,
    payment_deadline: null,
    application_deadline: '2026-08-20T23:59:59Z',
    install_date: '2026-09-12',
    install_time: '9:00 AM',
    event_description: 'An open-air art walk along the Williamsburg waterfront featuring emerging Brooklyn artists. Free for attendees, vendor booths available.',
    producer_contact_email: 'info@brooklynartsco.com',
    applied_at: '2026-06-28T14:30:00Z',
    is_past: false,
  },
  {
    id: 3,
    event_id: 203,
    event_title: 'Art After Dark — Manhattan',
    event_date: '2026-07-25T20:00:00Z',
    event_end_date: '2026-07-26T02:00:00Z',
    event_image_url: null,
    venue_name: 'The Bowery Ballroom',
    venue_address: '6 Delancey St, New York, NY 10002',
    city: 'New York',
    state: 'NY',
    organization_name: 'Pancakes & Booze',
    organization_logo_url: null,
    vendor_category: 'Painter',
    status: 'invited',
    payment_status: 'not_required',
    booth_price: 250,
    payment_deadline: '2026-07-18T23:59:59Z',
    application_deadline: null,
    install_date: '2026-07-25',
    install_time: '5:00 PM',
    event_description: 'An intimate evening showcase in the heart of the Lower East Side. Curated selection of 30 artists with live DJ sets and cocktail bar.',
    producer_contact_email: 'events@pancakesandbooze.com',
    applied_at: '2026-07-01T09:00:00Z',
    is_past: false,
  },
  {
    id: 4,
    event_id: 204,
    event_title: 'Pancakes & Booze — Spring Showcase',
    event_date: '2026-04-20T18:00:00Z',
    event_end_date: '2026-04-20T23:00:00Z',
    event_image_url: null,
    venue_name: 'Brooklyn Steel',
    venue_address: '319 Frost St, Brooklyn, NY 11222',
    city: 'Brooklyn',
    state: 'NY',
    organization_name: 'Pancakes & Booze',
    organization_logo_url: null,
    vendor_category: 'Painter',
    status: 'approved',
    payment_status: 'paid',
    booth_price: 200,
    payment_deadline: '2026-04-10T23:59:59Z',
    application_deadline: '2026-03-30T23:59:59Z',
    install_date: '2026-04-20',
    install_time: '3:00 PM',
    event_description: 'Spring edition of Brooklyn\'s favorite art party. 70+ artists across all mediums.',
    producer_contact_email: 'events@pancakesandbooze.com',
    applied_at: '2026-03-10T08:00:00Z',
    is_past: true,
  },
  {
    id: 5,
    event_id: 205,
    event_title: 'LIC Arts Open — Queens',
    event_date: '2026-05-10T11:00:00Z',
    event_end_date: '2026-05-11T18:00:00Z',
    event_image_url: null,
    venue_name: 'MoMA PS1 Courtyard',
    venue_address: '22-25 Jackson Ave, Long Island City, NY 11101',
    city: 'Long Island City',
    state: 'NY',
    organization_name: 'LIC Arts Open',
    organization_logo_url: null,
    vendor_category: 'Installation',
    status: 'rejected',
    payment_status: 'not_required',
    booth_price: null,
    payment_deadline: null,
    application_deadline: '2026-04-15T23:59:59Z',
    install_date: null,
    install_time: null,
    event_description: 'Annual studio crawl and art fair across Long Island City. Juried selection process.',
    producer_contact_email: 'submissions@licartsopen.org',
    applied_at: '2026-04-01T16:45:00Z',
    is_past: true,
  },
]

export const mockNotifications: ArtistNotification[] = [
  {
    id: 1,
    type: 'invitation_received',
    title: 'You\'ve been invited to apply',
    message: 'Pancakes & Booze has invited you to apply for Art After Dark — Manhattan on Jul 25, 2026.',
    event_title: 'Art After Dark — Manhattan',
    organization_name: 'Pancakes & Booze',
    timestamp: '2026-07-01T09:00:00Z',
    read: false,
    action_url: '/artist/dashboard',
    action_label: 'View Invitation',
  },
  {
    id: 2,
    type: 'status_approved',
    title: 'Application Approved',
    message: 'Congratulations! Your application as a Painter has been approved for Pancakes & Booze — Brooklyn Summer Show.',
    event_title: 'Pancakes & Booze — Brooklyn Summer Show',
    organization_name: 'Pancakes & Booze',
    timestamp: '2026-06-28T14:15:00Z',
    read: false,
    action_url: '/artist/dashboard',
    action_label: 'View Show',
  },
  {
    id: 3,
    type: 'payment_received',
    title: 'Payment Confirmed',
    message: 'Your payment of $200.00 for Pancakes & Booze — Brooklyn Summer Show has been received. You\'re all set!',
    event_title: 'Pancakes & Booze — Brooklyn Summer Show',
    organization_name: 'Pancakes & Booze',
    timestamp: '2026-06-27T11:30:00Z',
    read: true,
    action_url: '/artist/dashboard',
    action_label: 'View Receipt',
  },
  {
    id: 4,
    type: 'application_confirmed',
    title: 'Application Received',
    message: 'Your application to Williamsburg Art Walk as a Mixed Media artist has been received. You\'ll be notified when the organizer reviews it.',
    event_title: 'Williamsburg Art Walk',
    organization_name: 'Brooklyn Arts Collective',
    timestamp: '2026-06-28T14:30:00Z',
    read: true,
    action_url: '/artist/dashboard',
    action_label: 'View Application',
  },
  {
    id: 5,
    type: 'reminder',
    title: 'Payment Deadline Approaching',
    message: 'Your booth payment of $200.00 for Brooklyn Summer Show is due by Aug 1, 2026. Pay now to secure your spot.',
    event_title: 'Pancakes & Booze — Brooklyn Summer Show',
    organization_name: 'Pancakes & Booze',
    timestamp: '2026-06-25T08:00:00Z',
    read: true,
    action_url: '/artist/dashboard',
    action_label: 'Pay Now',
  },
  {
    id: 6,
    type: 'event_update',
    title: 'Event Details Updated',
    message: 'The install time for Brooklyn Summer Show has been updated to 3:00 PM. Please review the updated event details.',
    event_title: 'Pancakes & Booze — Brooklyn Summer Show',
    organization_name: 'Pancakes & Booze',
    timestamp: '2026-06-22T16:00:00Z',
    read: true,
  },
  {
    id: 7,
    type: 'status_rejected',
    title: 'Application Not Accepted',
    message: 'Unfortunately, your application to LIC Arts Open — Queens was not accepted this year. We encourage you to apply again next year.',
    event_title: 'LIC Arts Open — Queens',
    organization_name: 'LIC Arts Open',
    timestamp: '2026-04-25T10:00:00Z',
    read: true,
  },
  {
    id: 8,
    type: 'bulletin',
    title: 'New Update from Producer',
    message: 'Pancakes & Booze posted: "Excited to announce our Spring Showcase lineup! Check out the full artist list on our website."',
    event_title: 'Pancakes & Booze — Spring Showcase',
    organization_name: 'Pancakes & Booze',
    timestamp: '2026-04-15T12:00:00Z',
    read: true,
    action_url: '/artist/dashboard',
    action_label: 'View Update',
  },
]

export const mockResources: Resource[] = [
  // Getting Started
  {
    id: 1,
    title: 'How to Prepare for Your First Art Show',
    description: 'Everything you need to know — from booth setup to pricing your work and engaging with buyers.',
    category: 'getting_started',
    image_url: null,
    location: 'Online',
    url: '#',
    is_free: true,
  },
  {
    id: 2,
    title: 'Setting Up Your Voxxy Artist Profile',
    description: 'A quick guide to creating a profile that stands out to producers and gets you more invitations.',
    category: 'getting_started',
    image_url: null,
    location: 'Online',
    url: '#',
    is_free: true,
  },
  {
    id: 3,
    title: 'Understanding Application Statuses',
    description: 'What each status means and what to expect at every stage of the application process.',
    category: 'getting_started',
    image_url: null,
    location: 'Online',
    url: '#',
    is_free: true,
  },
  // Online Classes
  {
    id: 4,
    title: 'Portfolio Photography for Artists',
    description: 'Learn how to photograph your work like a pro — lighting, angles, and editing tips for 2D and 3D art.',
    category: 'online_class',
    image_url: null,
    location: 'Online',
    url: '#',
    is_free: false,
  },
  {
    id: 5,
    title: 'Pricing Your Art: A Business Guide',
    description: 'Stop guessing. Learn formulas and strategies for pricing original art, prints, and commissions.',
    category: 'online_class',
    image_url: null,
    location: 'Online',
    url: '#',
    is_free: false,
  },
  {
    id: 6,
    title: 'Social Media Marketing for Artists',
    description: 'Build a following that converts to collectors. Instagram, TikTok, and email list strategies.',
    category: 'online_class',
    image_url: null,
    location: 'Online',
    url: '#',
    is_free: true,
  },
  // Workshops
  {
    id: 7,
    title: 'Brooklyn Artist Meetup — July 2026',
    description: 'Monthly networking event for Brooklyn-based artists. Share work, get feedback, find collaborators.',
    category: 'workshop',
    image_url: null,
    location: 'Brooklyn, NY',
    url: '#',
    is_free: true,
    date: '2026-07-15T19:00:00Z',
  },
  {
    id: 8,
    title: 'Booth Design Workshop',
    description: 'Hands-on workshop on designing an eye-catching booth for art fairs and pop-up shows.',
    category: 'workshop',
    image_url: null,
    location: 'Manhattan, NY',
    url: '#',
    is_free: false,
    date: '2026-07-22T14:00:00Z',
  },
  {
    id: 9,
    title: 'Screen Printing 101',
    description: 'Intro to screen printing for fine artists looking to create prints and merchandise.',
    category: 'workshop',
    image_url: null,
    location: 'Bushwick, NY',
    url: '#',
    is_free: false,
    date: '2026-08-05T11:00:00Z',
  },
  // Partners & Opportunities
  {
    id: 10,
    title: 'Open Call: Summer Group Show',
    description: 'Seeking emerging artists for a curated group exhibition at a Chelsea gallery. All mediums.',
    category: 'partner',
    image_url: null,
    location: 'Chelsea, NY',
    url: '#',
    is_free: true,
    date: '2026-08-01T23:59:59Z',
  },
  {
    id: 11,
    title: 'Artist Residency — Fire Island',
    description: '2-week artist residency with housing and studio space. Application deadline Aug 15.',
    category: 'partner',
    image_url: null,
    location: 'Fire Island, NY',
    url: '#',
    is_free: true,
    date: '2026-08-15T23:59:59Z',
  },
  {
    id: 12,
    title: 'Blick Art Materials — 15% Artist Discount',
    description: 'Exclusive discount for Voxxy artists on all supplies at Blick Art Materials stores and online.',
    category: 'partner',
    image_url: null,
    location: 'Online + In-Store',
    url: '#',
    is_free: true,
  },
]

// --- Helpers -----------------------------------------------------------------

export const RESOURCE_CATEGORIES = {
  getting_started: { label: 'Getting Started', icon: 'BookOpen' },
  online_class: { label: 'Online Classes', icon: 'Video' },
  workshop: { label: 'Workshops & Events', icon: 'MapPin' },
  partner: { label: 'Partners & Opportunities', icon: 'Handshake' },
} as const

export const NOTIFICATION_CONFIG: Record<
  NotificationType,
  { color: string; icon: string; bgClass: string }
> = {
  invitation_received: { color: 'text-purple-400', icon: 'Mail', bgClass: 'bg-purple-500/10' },
  application_confirmed: { color: 'text-blue-400', icon: 'CheckCircle', bgClass: 'bg-blue-500/10' },
  status_approved: { color: 'text-green-400', icon: 'CheckCircle', bgClass: 'bg-green-500/10' },
  status_rejected: { color: 'text-red-400', icon: 'XCircle', bgClass: 'bg-red-500/10' },
  payment_received: { color: 'text-emerald-400', icon: 'DollarSign', bgClass: 'bg-emerald-500/10' },
  event_update: { color: 'text-yellow-400', icon: 'Bell', bgClass: 'bg-yellow-500/10' },
  bulletin: { color: 'text-cyan-400', icon: 'Megaphone', bgClass: 'bg-cyan-500/10' },
  reminder: { color: 'text-orange-400', icon: 'AlertCircle', bgClass: 'bg-orange-500/10' },
} as const

export const SHOW_STATUS_BADGE: Record<
  ArtistShow['status'],
  { label: string; variant: string }
> = {
  invited: { label: 'Invited', variant: 'tintPurple' },
  pending: { label: 'Pending Review', variant: 'tintYellow' },
  approved: { label: 'Approved', variant: 'tintGreen' },
  rejected: { label: 'Not Accepted', variant: 'tintRed' },
  waitlist: { label: 'Waitlisted', variant: 'tintOrange' },
} as const

export const PAYMENT_STATUS_BADGE: Record<
  ArtistShow['payment_status'],
  { label: string; variant: string }
> = {
  not_required: { label: 'N/A', variant: 'tintMuted' },
  pending: { label: 'Payment Due', variant: 'tintYellowSoft' },
  paid: { label: 'Paid', variant: 'tintGreenDeep' },
  overdue: { label: 'Overdue', variant: 'tintRedSoft' },
} as const
