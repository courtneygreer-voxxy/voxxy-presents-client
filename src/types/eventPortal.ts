// Types for Vendor Event Portal feature

export interface EventPortalData {
  id: number;
  view_count: number;
  last_viewed_at: string | null;
  event: EventDetails;
  vendor_categories: VendorCategory[];
  producer_updates: ProducerUpdate[];
}

export interface EventDetails {
  id: number;
  title: string;
  slug: string;
  description: string;
  dates: {
    event_date: string;
    event_end_date: string | null;
    start_time: string | null;
    end_time: string | null;
  };
  venue: string;
  location: string;
  age_restriction: string | null;
  ticket_url: string | null;
  application_deadline: string | null;
  payment_deadline: string | null;
  organization: Organization | null;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
}

export interface VendorCategory {
  id: number;
  name: string;
  description: string;
  categories: string[];
  booth_price: number | null;
  payment_link: string | null;
  install: {
    install_date: string | null;
    install_start_time: string | null;
    install_end_time: string | null;
  };
  application_tags: string[];
}

export interface ProducerUpdate {
  id: number;
  message: string;
  importance: 'low' | 'medium' | 'high';
  created_at: string;
  author: string;
}

// API Request/Response types
export interface VerifyAccessRequest {
  event_slug: string;
  email: string;
}

export interface VerifyAccessResponse {
  access_granted: boolean;
  portal_token?: string;
  event_slug?: string;
  error?: string;
}

export interface PortalApiResponse {
  data: EventPortalData;
}

// Portal session management
export interface PortalSession {
  token: string;
  eventSlug: string;
  email: string;
  expiresAt: number;
}
