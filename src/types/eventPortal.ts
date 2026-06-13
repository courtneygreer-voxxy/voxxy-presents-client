// Types for Vendor Event Portal feature
import type { Bulletin } from './bulletin'

export interface EventPortalData {
  id: number
  view_count: number
  last_viewed_at: string | null
  event: EventDetails
  vendor_categories: VendorCategory[]
  producer_updates: Bulletin[]
  registration?: {
    id: number
    status: string
    email: string
    name?: string
    vendor_category?: string
    payment_status?: string
  }
}

export interface EventDetails {
  id: number
  title: string
  slug: string
  description: string
  /** Event poster / hero image URL when provided by API or mocks */
  poster_url?: string | null
  status?: string
  dates: {
    event_date: string
    event_end_date: string | null
    start_time: string | null
    end_time: string | null
  }
  venue: string
  location: string
  age_restriction: string | null
  ticket_url: string | null
  application_deadline: string | null
  payment_deadline: string | null
  organization: Organization | null
}

export interface Organization {
  id: number
  name: string
  slug: string
  email?: string
}

export interface VendorCategory {
  id: number
  name: string
  description: string
  categories: string[]
  booth_price: number | null
  payment_link: string | null
  install: {
    install_date: string | null
    install_start_time: string | null
    install_end_time: string | null
  }
  application_tags: string[]
}

export interface ProducerUpdate {
  id: number
  message: string
  importance: 'low' | 'medium' | 'high'
  created_at: string
  author: string
}

// API Request/Response types
export interface VerifyAccessRequest {
  event_slug?: string // Optional for legacy slug-based access
  access_token?: string // Optional for new token-based access
  email: string
}

export interface VerifyAccessResponse {
  access_granted: boolean
  portal_token?: string
  event_slug?: string
  access_token?: string // New: returns portal access token
  error?: string
}

export interface PortalApiResponse {
  data: EventPortalData
}

// Portal session management
export interface PortalSession {
  token: string
  eventSlug: string
  email: string
  expiresAt: number
}

export interface VendorApplicationFormData {
  name?: string
  first_name: string
  last_name: string
  email: string
  phone: string
  business_name?: string
  vendor_category?: string
  instagram_handle?: string
  tiktok_handle?: string
  facebook_handle?: string
  twitter_handle?: string
  website?: string
  note_to_host?: string
  agreed_to_terms: boolean
  subscribed: boolean
  affiliation?: string
}

export interface VendorApplicationSubmit {
  name: string
  email: string
  phone: string
  business_name?: string
  vendor_category?: string
  vendor_application_id: number
  subscribed?: boolean
  instagram_handle?: string
  tiktok_handle?: string
  website?: string
  note_to_host?: string
  //to-do: backend change to accept this
  affiliation?: string
}
