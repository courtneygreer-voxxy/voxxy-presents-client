import mixpanel from 'mixpanel-browser';

// Configuration
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT;
const isDevelopment = import.meta.env.DEV;

// Only initialize Mixpanel in production environment
const isProductionEnvironment = ENVIRONMENT === 'production';

if (MIXPANEL_TOKEN && isProductionEnvironment) {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: true, // Enable debug mode to see events in console
    track_pageview: false, // We'll handle this manually
    persistence: 'localStorage',
    api_host: 'https://api.mixpanel.com', // US endpoint for US-based project
  });
  console.log('🎯 Mixpanel analytics initialized for production environment');
  console.log('🔑 Token:', MIXPANEL_TOKEN);
  console.log('🌐 API Host:', 'https://api.mixpanel.com');
} else {
  if (isDevelopment) {
    console.log('Analytics disabled - development environment');
  } else if (!isProductionEnvironment) {
    console.log(`Analytics disabled - ${ENVIRONMENT || 'unknown'} environment`);
  } else {
    console.warn('Mixpanel token not found. Analytics tracking disabled.');
  }
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
  conversion_stage?: 'visitor' | 'interested' | 'submitted';
  preferred_device?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  operating_system?: string;
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
    if (!this.isEnabled) {
      console.log('🚫 Analytics disabled, skipping event:', eventName);
      return;
    }

    try {
      const eventData = {
        ...properties,
        timestamp: new Date().toISOString(),
        session_id: this.getSessionId(),
      };

      console.log('📊 Sending event:', eventName, eventData);
      mixpanel.track(eventName, eventData);
      console.log('✅ Event sent successfully');
    } catch (error) {
      console.error('❌ Analytics tracking error:', error);
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

      this.setUserProperties({
        first_visit_date: new Date(),
        preferred_device: this.getDeviceType(),
        browser: this.getBrowser(),
        operating_system: navigator.platform,
        conversion_stage: 'visitor',
      });
    }

    // Update session properties
    const totalSessions = Number(localStorage.getItem('analytics_total_sessions') || '0') + 1;
    localStorage.setItem('analytics_total_sessions', totalSessions.toString());

    this.setUserProperties({
      total_sessions: totalSessions,
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