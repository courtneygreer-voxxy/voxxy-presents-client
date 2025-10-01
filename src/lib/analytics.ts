import mixpanel from 'mixpanel-browser';

// Configuration
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT;
const isDevelopment = import.meta.env.DEV;

// Only initialize Mixpanel in production environment
const isProductionEnvironment = ENVIRONMENT === 'production';

if (MIXPANEL_TOKEN && isProductionEnvironment) {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: false,
    track_pageview: false,
    persistence: 'localStorage',
    api_host: 'https://api.mixpanel.com',
  });
}

// Types for event properties
export interface PageViewProperties {
  page_name: string;
  page_url: string;
  referrer?: string;
  user_agent?: string;
}

export interface NavigationProperties {
  link_text: string;
  destination_page: string;
  current_page: string;
  link_position: 'header' | 'footer' | 'inline';
}

export interface CTAClickProperties {
  button_text: string;
  button_location: string;
  page_name: string;
  is_primary_cta: boolean;
}

export interface ScrollProperties {
  page_name: string;
  scroll_depth: number;
  time_to_depth: number;
}

export interface FormProperties {
  form_type: 'beta_access' | 'contact';
  page_name: string;
  form_location?: string;
  field_name?: string;
  field_order?: number;
  time_to_complete?: number;
  completion_time?: number;
  error_field?: string;
  error_message?: string;
  attempt_number?: number;
  form_data?: {
    event_frequency?: string;
    typical_attendance?: string;
    biggest_challenge?: string;
  };
}

export interface FeatureProperties {
  feature_name: string;
  page_name: string;
  view_method: 'scroll' | 'click' | 'navigation';
}

export interface PricingProperties {
  plan_name: string;
  plan_price: string;
  features_viewed: string[];
  time_spent_viewing: number;
}

export interface UserProperties {
  organization_name?: string;
  event_frequency?: string;
  typical_attendance?: string;
  biggest_challenge?: string;
  first_visit_date?: Date;
  pages_visited?: string[];
  total_sessions?: number;
  most_engaged_content?: string;
  conversion_stage?: 'visitor' | 'interested' | 'submitted' | 'converted';
  preferred_device?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  operating_system?: string;
  // User identification
  email?: string;
  user_id?: string;
  user_role?: 'admin' | 'organizer' | 'venue_owner' | 'user';
  // Traffic source tracking
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer_domain?: string;
  traffic_source?: 'direct' | 'organic' | 'social' | 'email' | 'paid' | 'referral';
  // Conversion metrics
  clubs_created?: number;
  venues_listed?: number;
  events_created?: number;
  rsvps_made?: number;
  [key: string]: any; // Allow additional properties
}

// Analytics service class
class Analytics {
  private isEnabled: boolean;
  private startTime: number = Date.now();
  private scrollDepths: Set<number> = new Set();

  constructor() {
    this.isEnabled = !!MIXPANEL_TOKEN && isProductionEnvironment;
  }

  // Core tracking methods
  track(eventName: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    try {
      const eventData = {
        ...properties,
        timestamp: new Date().toISOString(),
        session_id: this.getSessionId(),
      };

      mixpanel.track(eventName, eventData);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  identify(userId: string) {
    if (!this.isEnabled) return;
    mixpanel.identify(userId);
  }

  setUserProperties(properties: UserProperties) {
    if (!this.isEnabled) return;

    try {
      mixpanel.people.set({
        ...properties,
        last_seen: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Analytics user properties error:', error);
    }
  }

  // Page tracking
  trackPageView(properties: PageViewProperties) {
    this.startTime = Date.now();
    this.scrollDepths.clear();

    this.track('Page Viewed', {
      ...properties,
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
    });
  }

  trackPageEngagement(pageName: string) {
    const timeSpent = Math.round((Date.now() - this.startTime) / 1000);

    let engagementLevel: string;
    if (timeSpent < 30) engagementLevel = 'low';
    else if (timeSpent < 120) engagementLevel = 'medium';
    else engagementLevel = 'high';

    this.track('Page Engagement', {
      page_name: pageName,
      time_spent: timeSpent,
      engagement_level: engagementLevel,
    });
  }

  // Navigation tracking
  trackNavigation(properties: NavigationProperties) {
    this.track('Navigation Link Clicked', properties);
  }

  // CTA tracking
  trackCTAClick(properties: CTAClickProperties) {
    this.track('CTA Button Clicked', properties);
  }

  // Scroll tracking
  trackScroll(pageName: string, scrollPercent: number) {
    const milestone = Math.floor(scrollPercent / 25) * 25;

    if (milestone > 0 && !this.scrollDepths.has(milestone)) {
      this.scrollDepths.add(milestone);

      const timeToDepth = Math.round((Date.now() - this.startTime) / 1000);

      this.track('Page Scroll', {
        page_name: pageName,
        scroll_depth: milestone,
        time_to_depth: timeToDepth,
      });
    }
  }

  // Form tracking
  trackFormStart(properties: FormProperties) {
    this.track('Form Started', properties);
  }

  trackFormFieldCompleted(properties: FormProperties) {
    this.track('Form Field Completed', properties);
  }

  trackFormSubmit(properties: FormProperties) {
    this.track('Form Submitted', properties);
  }

  trackFormError(properties: FormProperties) {
    this.track('Form Error', properties);
  }

  // Feature tracking
  trackFeatureView(properties: FeatureProperties) {
    this.track('Feature Viewed', properties);
  }

  trackPricingPlanView(properties: PricingProperties) {
    this.track('Pricing Plan Viewed', properties);
  }

  // Email and external links
  trackEmailClick(emailAddress: string, pageName: string) {
    this.track('Email Link Clicked', {
      link_type: 'contact',
      email_address: emailAddress,
      page_name: pageName,
    });
  }

  trackExternalClick(destination: string, linkContext: string, pageName: string) {
    this.track('External Link Clicked', {
      destination,
      link_context: linkContext,
      page_name: pageName,
    });
  }

  // Utility methods
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  // Device detection
  getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  // Browser detection
  getBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  }

  // Initialize user properties on first visit
  initializeUser() {
    if (!this.isEnabled) return;

    const isFirstVisit = !localStorage.getItem('analytics_first_visit');

    if (isFirstVisit) {
      localStorage.setItem('analytics_first_visit', new Date().toISOString());

      const trafficSource = this.getTrafficSource();
      const utmParams = this.getUTMParameters();

      this.setUserProperties({
        first_visit_date: new Date(),
        preferred_device: this.getDeviceType(),
        browser: this.getBrowser(),
        operating_system: navigator.platform,
        conversion_stage: 'visitor',
        traffic_source: trafficSource.source,
        referrer_domain: trafficSource.domain,
        ...utmParams,
      });

      // Track first visit with source information
      this.track('First Visit', {
        traffic_source: trafficSource.source,
        referrer_domain: trafficSource.domain,
        referrer_url: document.referrer,
        ...utmParams,
      });
    }

    // Update session properties
    const totalSessions = Number(localStorage.getItem('analytics_total_sessions') || '0') + 1;
    localStorage.setItem('analytics_total_sessions', totalSessions.toString());

    this.setUserProperties({
      total_sessions: totalSessions,
    });
  }

  // Traffic source detection
  private getTrafficSource(): { source: UserProperties['traffic_source']; domain: string | null } {
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');

    // Check for UTM parameters first
    if (utmSource) {
      if (utmSource.includes('google') || utmSource.includes('bing')) return { source: 'paid', domain: null };
      if (utmSource.includes('facebook') || utmSource.includes('instagram') || utmSource.includes('twitter')) return { source: 'social', domain: null };
      if (utmSource.includes('email') || utmSource.includes('newsletter')) return { source: 'email', domain: null };
      return { source: 'referral', domain: null };
    }

    // No referrer = direct traffic
    if (!referrer) return { source: 'direct', domain: null };

    const referrerDomain = new URL(referrer).hostname;

    // Social media sources
    const socialDomains = ['facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com', 'tiktok.com', 'youtube.com'];
    if (socialDomains.some(domain => referrerDomain.includes(domain))) {
      return { source: 'social', domain: referrerDomain };
    }

    // Search engines
    const searchDomains = ['google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com'];
    if (searchDomains.some(domain => referrerDomain.includes(domain))) {
      return { source: 'organic', domain: referrerDomain };
    }

    // Email clients
    const emailDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'mail.'];
    if (emailDomains.some(domain => referrerDomain.includes(domain))) {
      return { source: 'email', domain: referrerDomain };
    }

    // Everything else is referral
    return { source: 'referral', domain: referrerDomain };
  }

  // Extract UTM parameters
  private getUTMParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      utm_term: urlParams.get('utm_term') || undefined,
      utm_content: urlParams.get('utm_content') || undefined,
    };
  }

  // Track user authentication
  trackUserSignIn(userEmail: string, userId: string, userRole?: string) {
    this.identify(userId);

    const userProperties: UserProperties = {
      email: userEmail,
      user_id: userId,
      conversion_stage: 'converted',
    };

    if (userRole) {
      userProperties.user_role = userRole as UserProperties['user_role'];
    }

    this.setUserProperties(userProperties);

    this.track('User Signed In', {
      user_email: userEmail,
      user_role: userRole,
      sign_in_method: 'email_password',
    });
  }

  // Track conversion metrics
  trackClubCreated(clubName: string, userId?: string) {
    this.track('Club Created', {
      club_name: clubName,
      user_id: userId,
    });

    // Update user properties
    const currentClubs = Number(localStorage.getItem('analytics_clubs_created') || '0') + 1;
    localStorage.setItem('analytics_clubs_created', currentClubs.toString());

    this.setUserProperties({
      clubs_created: currentClubs,
      conversion_stage: 'converted',
    });
  }

  trackVenueListed(venueName: string, userId?: string) {
    this.track('Venue Listed', {
      venue_name: venueName,
      user_id: userId,
    });

    // Update user properties
    const currentVenues = Number(localStorage.getItem('analytics_venues_listed') || '0') + 1;
    localStorage.setItem('analytics_venues_listed', currentVenues.toString());

    this.setUserProperties({
      venues_listed: currentVenues,
      conversion_stage: 'converted',
    });
  }

  trackEventCreated(eventTitle: string, eventType: string, userId?: string) {
    this.track('Event Created', {
      event_title: eventTitle,
      event_type: eventType,
      user_id: userId,
    });

    // Update user properties
    const currentEvents = Number(localStorage.getItem('analytics_events_created') || '0') + 1;
    localStorage.setItem('analytics_events_created', currentEvents.toString());

    this.setUserProperties({
      events_created: currentEvents,
      conversion_stage: 'converted',
    });
  }

  trackRSVPMade(eventId: string, rsvpType: string, userId?: string) {
    this.track('RSVP Made', {
      event_id: eventId,
      rsvp_type: rsvpType,
      user_id: userId,
    });

    // Update user properties
    const currentRSVPs = Number(localStorage.getItem('analytics_rsvps_made') || '0') + 1;
    localStorage.setItem('analytics_rsvps_made', currentRSVPs.toString());

    this.setUserProperties({
      rsvps_made: currentRSVPs,
      conversion_stage: 'converted',
    });
  }

  // Track general click events on page elements
  trackElementClick(elementType: string, elementText: string, elementId?: string, pageName?: string) {
    this.track('Element Clicked', {
      element_type: elementType,
      element_text: elementText,
      element_id: elementId,
      page_name: pageName,
    });
  }

  // Track specific landing page interactions
  trackLandingPageInteraction(interactionType: string, elementName: string, sectionName?: string) {
    this.track('Landing Page Interaction', {
      interaction_type: interactionType,
      element_name: elementName,
      section_name: sectionName,
      page_name: 'Home',
    });
  }
}

// Export singleton instance
export const analytics = new Analytics();

// React hook for analytics
export const useAnalytics = () => {
  return analytics;
};

export default analytics;