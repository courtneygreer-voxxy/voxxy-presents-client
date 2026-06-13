import mixpanel from 'mixpanel-browser'

// Configuration
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT
const isDevelopment = import.meta.env.DEV

// Only initialize Mixpanel in production environment
const isProductionEnvironment = ENVIRONMENT === 'production'

if (MIXPANEL_TOKEN && isProductionEnvironment) {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: false,
    track_pageview: false,
    persistence: 'localStorage',
    api_host: 'https://api.mixpanel.com',
  })
}

// Types for event properties
export interface PageViewProperties {
  page_name: string
  page_url: string
  referrer?: string
  user_agent?: string
}

export interface NavigationProperties {
  link_text: string
  destination_page: string
  current_page: string
  link_position: 'header' | 'footer' | 'inline' | 'hero' | 'cta_section' | 'features_section'
}

export interface CTAClickProperties {
  button_text: string
  button_location: string
  page_name: string
  is_primary_cta?: boolean
  action_type?: string
  destination_page?: string
  current_page?: string
  button_position?: string
}

export interface ScrollProperties {
  page_name: string
  scroll_depth: number
  time_to_depth: number
}

export interface PageEngagementProperties {
  page_name: string
  time_spent: number
  engagement_level: 'low' | 'medium' | 'high'
  max_scroll_depth: number
  scroll_events_count: number
  clicks_on_page: number
  cta_interactions: number
  form_interactions: boolean
  return_to_page: boolean
  time_to_first_interaction: number
  active_time: number
  sections_viewed: string[]
  page_url: string
}

export interface FormProperties {
  form_type: 'beta_access' | 'beta_request' | 'contact'
  page_name: string
  form_location?: string
  field_name?: string
  field_order?: number
  time_to_complete?: number
  completion_time?: number
  error_field?: string
  error_message?: string
  attempt_number?: number
  form_data?: {
    event_frequency?: string
    typical_attendance?: string
    biggest_challenge?: string
  }
}

export interface FeatureProperties {
  feature_name: string
  page_name: string
  view_method: 'scroll' | 'click' | 'navigation'
}

export interface PricingProperties {
  plan_name: string
  plan_price: string
  features_viewed: string[]
  time_spent_viewing: number
}

export interface SectionEngagementProperties {
  section_name: string
  page_name: string
  time_in_section: number
  scroll_depth_in_section: number
  interactions_in_section: number
  ctas_clicked: string[]
  section_visible_percentage: number
  entry_time: number
  exit_time: number
}

export interface IntentSignalProperties {
  intent_signals: string[]
  intent_score: number
  time_to_intent: number
  page_name: string
  engagement_indicators: {
    pricing_viewed: boolean
    multiple_cta_clicks: boolean
    deep_scroll: boolean
    long_session: boolean
    form_started: boolean
    feature_exploration: boolean
    return_visitor: boolean
  }
}

export interface ConversionStepProperties {
  step_name: string
  step_number: number
  time_from_landing: number
  path_taken: string[]
  previous_step?: string
  page_name: string
}

export interface UserProperties {
  organization_name?: string
  event_frequency?: string
  typical_attendance?: string
  biggest_challenge?: string
  first_visit_date?: Date
  pages_visited?: string[]
  total_sessions?: number
  most_engaged_content?: string
  conversion_stage?: 'visitor' | 'interested' | 'submitted' | 'converted'
  preferred_device?: 'desktop' | 'mobile' | 'tablet'
  browser?: string
  operating_system?: string
  // User identification
  email?: string
  user_id?: string
  // V3.0: Support both old and new roles during migration
  user_role?:
    | 'admin'
    | 'producer'
    | 'vendor'
    | 'guest'
    | 'organizer'
    | 'venue_owner'
    | 'club_owner'
    | 'user'
  // Traffic source tracking
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  referrer_domain?: string
  traffic_source?: 'direct' | 'organic' | 'social' | 'email' | 'paid' | 'referral'
  // Marketing attribution
  campaign_id?: string
  affiliate_id?: string
  sendgrid_campaign?: string
  landing_page?: string
  // Customer profile signals
  customer_profile?:
    | 'club_organizer'
    | 'venue_owner'
    | 'event_planner'
    | 'artist'
    | 'promoter'
    | 'unknown'
  profile_confidence?: 'low' | 'medium' | 'high'
  profile_signals?: string[] // What indicated this profile
  club_type?: string // e.g., "music", "art", "social", "fitness"
  venue_type?: string // e.g., "bar", "gallery", "outdoor", "theater"
  event_scale?: 'small' | 'medium' | 'large' // Based on attendance
  // Conversion metrics
  clubs_created?: number
  venues_listed?: number
  events_created?: number
  rsvps_made?: number
  // Intent metrics
  intent_score?: number
  highest_intent_page?: string
  [key: string]: any // Allow additional properties
}

// Analytics service class
class Analytics {
  private isEnabled: boolean
  private startTime: number = Date.now()
  private scrollDepths: Set<number> = new Set()
  private maxScrollDepth: number = 0
  private scrollEventsCount: number = 0
  private clicksOnPage: number = 0
  private ctaInteractions: number = 0
  private formInteractions: boolean = false
  private firstInteractionTime: number | null = null
  private activeTime: number = 0
  private lastActiveTime: number = Date.now()
  private sectionsViewed: Set<string> = new Set()
  private isPageVisible: boolean = true
  private visitedPages: Set<string> = new Set()
  // Section tracking
  private sectionMetrics: Map<
    string,
    {
      entryTime: number
      interactions: number
      ctasClicked: string[]
      maxScroll: number
    }
  > = new Map()
  // Intent tracking
  private intentSignals: Set<string> = new Set()
  private intentCalculated: boolean = false
  // Conversion path tracking
  private conversionPath: string[] = []
  private conversionSteps: number = 0

  constructor() {
    this.isEnabled = !!MIXPANEL_TOKEN && isProductionEnvironment
    this.setupVisibilityTracking()
  }

  // Track when page is visible/hidden for active time calculation
  private setupVisibilityTracking() {
    if (typeof document === 'undefined') return

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page hidden - add active time
        this.isPageVisible = false
        this.activeTime += Date.now() - this.lastActiveTime
      } else {
        // Page visible again - reset timer
        this.isPageVisible = true
        this.lastActiveTime = Date.now()
      }
    })
  }

  // Core tracking methods
  track(eventName: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return

    try {
      const eventData = {
        ...properties,
        timestamp: new Date().toISOString(),
        session_id: this.getSessionId(),
      }

      mixpanel.track(eventName, eventData)
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }

  identify(userId: string) {
    if (!this.isEnabled) return
    mixpanel.identify(userId)
  }

  setUserProperties(properties: UserProperties) {
    if (!this.isEnabled) return

    try {
      mixpanel.people.set({
        ...properties,
        last_seen: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Analytics user properties error:', error)
    }
  }

  // Page tracking
  trackPageView(properties: PageViewProperties) {
    // Check if this is a return visit to this page
    const isReturnVisit = this.visitedPages.has(properties.page_name)
    this.visitedPages.add(properties.page_name)

    // Reset page-level metrics
    this.startTime = Date.now()
    this.lastActiveTime = Date.now()
    this.scrollDepths.clear()
    this.maxScrollDepth = 0
    this.scrollEventsCount = 0
    this.clicksOnPage = 0
    this.ctaInteractions = 0
    this.formInteractions = false
    this.firstInteractionTime = null
    this.activeTime = 0
    this.sectionsViewed.clear()
    this.isPageVisible = true

    this.track('Page Viewed', {
      ...properties,
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      is_return_visit: isReturnVisit,
    })
  }

  trackPageEngagement(pageName: string, pageUrl: string = '') {
    // Calculate final active time
    if (this.isPageVisible) {
      this.activeTime += Date.now() - this.lastActiveTime
    }

    const timeSpent = Math.round((Date.now() - this.startTime) / 1000)
    const activeTimeSeconds = Math.round(this.activeTime / 1000)

    // Engagement level based on active time and scroll depth
    let engagementLevel: 'low' | 'medium' | 'high'
    if (activeTimeSeconds < 30 || this.maxScrollDepth < 25) {
      engagementLevel = 'low'
    } else if (activeTimeSeconds < 120 || this.maxScrollDepth < 75) {
      engagementLevel = 'medium'
    } else {
      engagementLevel = 'high'
    }

    const properties: PageEngagementProperties = {
      page_name: pageName,
      page_url: pageUrl,
      time_spent: timeSpent,
      active_time: activeTimeSeconds,
      engagement_level: engagementLevel,
      max_scroll_depth: Math.round(this.maxScrollDepth),
      scroll_events_count: this.scrollEventsCount,
      clicks_on_page: this.clicksOnPage,
      cta_interactions: this.ctaInteractions,
      form_interactions: this.formInteractions,
      return_to_page: this.visitedPages.size > 1 && this.visitedPages.has(pageName),
      time_to_first_interaction: this.firstInteractionTime
        ? Math.round((this.firstInteractionTime - this.startTime) / 1000)
        : timeSpent,
      sections_viewed: Array.from(this.sectionsViewed),
    }

    this.track('Page Engagement', properties)
  }

  // Navigation tracking
  trackNavigation(properties: NavigationProperties) {
    this.track('Navigation Link Clicked', properties)
  }

  // CTA tracking
  trackCTAClick(properties: CTAClickProperties) {
    // Record first interaction
    if (this.firstInteractionTime === null) {
      this.firstInteractionTime = Date.now()
    }

    // Increment counters
    this.clicksOnPage++
    this.ctaInteractions++

    this.track('CTA Button Clicked', properties)
  }

  // Scroll tracking
  trackScroll(pageName: string, scrollPercent: number, sectionName?: string) {
    // Record first interaction
    if (this.firstInteractionTime === null) {
      this.firstInteractionTime = Date.now()
    }

    // Update max scroll depth
    if (scrollPercent > this.maxScrollDepth) {
      this.maxScrollDepth = scrollPercent
    }

    // Increment scroll events count
    this.scrollEventsCount++

    // Track section viewed if provided
    if (sectionName && !this.sectionsViewed.has(sectionName)) {
      this.sectionsViewed.add(sectionName)
    }

    // Track milestone scroll depths
    const milestone = Math.floor(scrollPercent / 25) * 25

    if (milestone > 0 && !this.scrollDepths.has(milestone)) {
      this.scrollDepths.add(milestone)

      const timeToDepth = Math.round((Date.now() - this.startTime) / 1000)

      this.track('Page Scroll', {
        page_name: pageName,
        scroll_depth: milestone,
        time_to_depth: timeToDepth,
        section_name: sectionName,
      })
    }
  }

  // Form tracking
  trackFormStart(properties: FormProperties) {
    // Record first interaction
    if (this.firstInteractionTime === null) {
      this.firstInteractionTime = Date.now()
    }

    // Mark that user interacted with a form
    this.formInteractions = true

    this.track('Form Started', properties)
  }

  trackFormFieldCompleted(properties: FormProperties) {
    this.track('Form Field Completed', properties)
  }

  trackFormSubmit(properties: FormProperties) {
    this.track('Form Submitted', properties)
  }

  trackFormError(properties: FormProperties) {
    this.track('Form Error', properties)
  }

  // Feature tracking
  trackFeatureView(properties: FeatureProperties) {
    this.track('Feature Viewed', properties)
  }

  trackPricingPlanView(properties: PricingProperties) {
    this.track('Pricing Plan Viewed', properties)
  }

  // Email and external links
  trackEmailClick(emailAddress: string, pageName: string) {
    this.track('Email Link Clicked', {
      link_type: 'contact',
      email_address: emailAddress,
      page_name: pageName,
    })
  }

  trackExternalClick(destination: string, linkContext: string, pageName: string) {
    this.track('External Link Clicked', {
      destination,
      link_context: linkContext,
      page_name: pageName,
    })
  }

  // Utility methods
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id')
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('analytics_session_id', sessionId)
    }
    return sessionId
  }

  // Device detection
  getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const width = window.innerWidth
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  // Browser detection
  getBrowser(): string {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Other'
  }

  // Initialize user properties on first visit
  initializeUser() {
    if (!this.isEnabled) return

    const isFirstVisit = !localStorage.getItem('analytics_first_visit')

    if (isFirstVisit) {
      localStorage.setItem('analytics_first_visit', new Date().toISOString())

      const trafficSource = this.getTrafficSource()
      const utmParams = this.getUTMParameters()
      const customerProfile = this.detectCustomerProfile()
      const demographics = this.extractDemographicSignals()

      this.setUserProperties({
        first_visit_date: new Date(),
        preferred_device: this.getDeviceType(),
        browser: this.getBrowser(),
        operating_system: navigator.platform,
        conversion_stage: 'visitor',
        traffic_source: trafficSource.source,
        referrer_domain: trafficSource.domain || undefined,
        landing_page: window.location.pathname + window.location.search,
        ...utmParams,
        // Customer profile signals
        customer_profile: customerProfile.profile,
        profile_confidence: customerProfile.confidence,
        profile_signals: customerProfile.signals,
        ...demographics,
      })

      // Track first visit with source information and profile
      this.track('First Visit', {
        traffic_source: trafficSource.source,
        referrer_domain: trafficSource.domain,
        referrer_url: document.referrer,
        landing_page: window.location.pathname + window.location.search,
        customer_profile: customerProfile.profile,
        profile_confidence: customerProfile.confidence,
        profile_signals: customerProfile.signals,
        ...utmParams,
        ...demographics,
      })
    } else {
      // Not first visit, but check if we can refine the profile with new signals
      const customerProfile = this.detectCustomerProfile()
      const demographics = this.extractDemographicSignals()

      // Only update if we have new signals
      if (customerProfile.signals.length > 0) {
        this.setUserProperties({
          customer_profile: customerProfile.profile,
          profile_confidence: customerProfile.confidence,
          profile_signals: customerProfile.signals,
          ...demographics,
        })
      }
    }

    // Update session properties
    const totalSessions = Number(localStorage.getItem('analytics_total_sessions') || '0') + 1
    localStorage.setItem('analytics_total_sessions', totalSessions.toString())

    this.setUserProperties({
      total_sessions: totalSessions,
    })
  }

  // Traffic source detection with enhanced direct traffic breakdown
  private getTrafficSource(): {
    source: UserProperties['traffic_source']
    domain: string | null
    direct_type?: 'bookmark' | 'typed_url' | 'mobile_app' | 'qr_code' | 'dark_social' | 'unknown'
    detail?: string
  } {
    const referrer = document.referrer
    const urlParams = new URLSearchParams(window.location.search)
    const utmSource = urlParams.get('utm_source')
    const currentUrl = window.location.href

    // Check for UTM parameters first (most reliable)
    if (utmSource) {
      if (utmSource.includes('google') || utmSource.includes('bing'))
        return { source: 'paid', domain: null, detail: utmSource }
      if (
        utmSource.includes('facebook') ||
        utmSource.includes('instagram') ||
        utmSource.includes('twitter')
      )
        return { source: 'social', domain: null, detail: utmSource }
      if (utmSource.includes('email') || utmSource.includes('newsletter'))
        return { source: 'email', domain: null, detail: utmSource }
      return { source: 'referral', domain: null, detail: utmSource }
    }

    // Check for other tracking parameters that indicate source
    const fbclid = urlParams.get('fbclid') // Facebook click ID
    const gclid = urlParams.get('gclid') // Google click ID
    const msclkid = urlParams.get('msclkid') // Microsoft click ID
    const ttclid = urlParams.get('ttclid') // TikTok click ID
    const ref = urlParams.get('ref') // Generic referral parameter

    if (fbclid) return { source: 'social', domain: 'facebook.com', detail: 'facebook_link' }
    if (gclid) return { source: 'paid', domain: 'google.com', detail: 'google_ads' }
    if (msclkid) return { source: 'paid', domain: 'bing.com', detail: 'microsoft_ads' }
    if (ttclid) return { source: 'social', domain: 'tiktok.com', detail: 'tiktok_link' }

    // Check for affiliate/referral parameters
    if (ref) return { source: 'referral', domain: null, detail: `ref_${ref}` }

    // Has referrer - analyze it
    if (referrer) {
      try {
        const referrerDomain = new URL(referrer).hostname

        // Same domain = internal navigation (not a source)
        if (referrerDomain === window.location.hostname) {
          return {
            source: 'direct',
            domain: null,
            direct_type: 'typed_url',
            detail: 'same_domain_navigation',
          }
        }

        // Social media sources
        const socialDomains = [
          'facebook.com',
          'instagram.com',
          'twitter.com',
          'linkedin.com',
          'tiktok.com',
          'youtube.com',
          'reddit.com',
          'pinterest.com',
        ]
        if (socialDomains.some((domain) => referrerDomain.includes(domain))) {
          return { source: 'social', domain: referrerDomain, detail: referrerDomain }
        }

        // Search engines
        const searchDomains = [
          'google.com',
          'bing.com',
          'yahoo.com',
          'duckduckgo.com',
          'baidu.com',
          'yandex.com',
        ]
        if (searchDomains.some((domain) => referrerDomain.includes(domain))) {
          return { source: 'organic', domain: referrerDomain, detail: referrerDomain }
        }

        // Email clients (webmail)
        const emailDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'mail.', 'protonmail.com']
        if (emailDomains.some((domain) => referrerDomain.includes(domain))) {
          return { source: 'email', domain: referrerDomain, detail: referrerDomain }
        }

        // Everything else with a referrer is external referral
        return { source: 'referral', domain: referrerDomain, detail: referrerDomain }
      } catch (e) {
        // Invalid referrer URL
        console.warn('Invalid referrer URL:', referrer)
      }
    }

    // No referrer - try to infer from context (DARK SOCIAL DETECTION)

    // Check if URL has any parameters (likely from a link share)
    const hasParams = urlParams.toString().length > 0

    // Check if landing on a deep page (not homepage)
    const isDeepPage =
      window.location.pathname !== '/' && !window.location.pathname.match(/^\/(index|home)?$/)

    // Check for mobile user agent (iOS/Android apps often strip referrer)
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /iphone|ipad|ipod|android/.test(userAgent)
    const isInAppBrowser = /fban|fbav|instagram|twitter|linkedin/.test(userAgent)

    // Check if URL contains share indicators
    const hasShareIndicators =
      currentUrl.includes('?share') ||
      currentUrl.includes('&share') ||
      urlParams.has('s') ||
      urlParams.has('share')

    // Infer dark social (shared links from messaging apps)
    if (isInAppBrowser) {
      // User is in a social media in-app browser but no referrer
      return { source: 'social', domain: null, direct_type: 'mobile_app', detail: 'in_app_browser' }
    }

    if (isMobile && (hasParams || isDeepPage)) {
      // Mobile + parameters/deep page = likely shared link
      return {
        source: 'direct',
        domain: null,
        direct_type: 'dark_social',
        detail: 'mobile_shared_link',
      }
    }

    if (hasShareIndicators) {
      // Explicit share parameters
      return {
        source: 'direct',
        domain: null,
        direct_type: 'dark_social',
        detail: 'explicit_share',
      }
    }

    if (isDeepPage && hasParams) {
      // Deep page with parameters but no referrer = likely QR code or shared link
      return {
        source: 'direct',
        domain: null,
        direct_type: 'qr_code',
        detail: 'deep_link_with_params',
      }
    }

    // Check if user came from bookmark (performance.navigation.type)
    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navEntry && navEntry.type === 'reload') {
        return { source: 'direct', domain: null, direct_type: 'bookmark', detail: 'page_reload' }
      }
    }

    // Default: truly direct (typed URL or bookmark)
    return {
      source: 'direct',
      domain: null,
      direct_type: isDeepPage ? 'unknown' : 'typed_url',
      detail: isDeepPage ? 'direct_to_deep_page' : 'homepage_direct',
    }
  }

  // Extract UTM parameters and marketing attribution
  private getUTMParameters() {
    const urlParams = new URLSearchParams(window.location.search)
    return {
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      utm_term: urlParams.get('utm_term') || undefined,
      utm_content: urlParams.get('utm_content') || undefined,
      // Marketing attribution parameters
      campaign_id: urlParams.get('campaign_id') || urlParams.get('cid') || undefined,
      affiliate_id:
        urlParams.get('affiliate_id') || urlParams.get('aff') || urlParams.get('ref') || undefined,
      sendgrid_campaign:
        urlParams.get('sg_campaign') || urlParams.get('email_campaign') || undefined,
    }
  }

  // Detect customer profile based on behavior and signals
  private detectCustomerProfile(): {
    profile: UserProperties['customer_profile']
    confidence: UserProperties['profile_confidence']
    signals: string[]
  } {
    const signals: string[] = []
    const urlParams = new URLSearchParams(window.location.search)
    const currentPath = window.location.pathname

    // Check UTM parameters for profile hints
    const utmCampaign = urlParams.get('utm_campaign')?.toLowerCase() || ''
    const utmContent = urlParams.get('utm_content')?.toLowerCase() || ''
    const utmTerm = urlParams.get('utm_term')?.toLowerCase() || ''

    // Check URL path for profile signals
    if (currentPath.includes('/club') || currentPath.includes('/organizer')) {
      signals.push('navigated_to_club_pages')
    }
    if (currentPath.includes('/venue')) {
      signals.push('navigated_to_venue_pages')
    }

    // Detect from campaign parameters
    if (
      utmCampaign.includes('club') ||
      utmCampaign.includes('organizer') ||
      utmContent.includes('club')
    ) {
      signals.push('campaign_club_targeted')
    }
    if (
      utmCampaign.includes('venue') ||
      utmCampaign.includes('venue-owner') ||
      utmContent.includes('venue')
    ) {
      signals.push('campaign_venue_targeted')
    }
    if (utmCampaign.includes('artist') || utmTerm.includes('artist')) {
      signals.push('campaign_artist_targeted')
    }
    if (utmCampaign.includes('promoter') || utmTerm.includes('promoter')) {
      signals.push('campaign_promoter_targeted')
    }

    // Check affiliate/referrer for profile hints
    const affiliateId =
      urlParams.get('affiliate_id') || urlParams.get('aff') || urlParams.get('ref')
    if (affiliateId) {
      signals.push(`affiliate_${affiliateId}`)
    }

    // Determine profile based on signals
    let profile: UserProperties['customer_profile'] = 'unknown'
    let confidence: UserProperties['profile_confidence'] = 'low'

    if (signals.some((s) => s.includes('club') || s.includes('organizer'))) {
      profile = 'club_organizer'
      confidence = signals.filter((s) => s.includes('club')).length > 1 ? 'high' : 'medium'
    } else if (signals.some((s) => s.includes('venue'))) {
      profile = 'venue_owner'
      confidence = signals.filter((s) => s.includes('venue')).length > 1 ? 'high' : 'medium'
    } else if (signals.some((s) => s.includes('artist'))) {
      profile = 'artist'
      confidence = 'medium'
    } else if (signals.some((s) => s.includes('promoter'))) {
      profile = 'promoter'
      confidence = 'medium'
    }

    return { profile, confidence, signals }
  }

  // Extract demographic signals from campaign data
  private extractDemographicSignals(): {
    club_type?: string
    venue_type?: string
    event_scale?: 'small' | 'medium' | 'large'
  } {
    const urlParams = new URLSearchParams(window.location.search)
    const utmCampaign = urlParams.get('utm_campaign')?.toLowerCase() || ''
    const utmContent = urlParams.get('utm_content')?.toLowerCase() || ''
    const utmTerm = urlParams.get('utm_term')?.toLowerCase() || ''

    const demographics: {
      club_type?: string
      venue_type?: string
      event_scale?: 'small' | 'medium' | 'large'
    } = {}

    // Detect club type from campaign parameters
    const clubTypes = [
      'music',
      'art',
      'social',
      'fitness',
      'comedy',
      'food',
      'networking',
      'cultural',
    ]
    for (const type of clubTypes) {
      if (utmCampaign.includes(type) || utmContent.includes(type) || utmTerm.includes(type)) {
        demographics.club_type = type
        break
      }
    }

    // Detect venue type from campaign parameters
    const venueTypes = [
      'bar',
      'gallery',
      'outdoor',
      'theater',
      'restaurant',
      'warehouse',
      'rooftop',
      'club',
      'studio',
    ]
    for (const type of venueTypes) {
      if (utmCampaign.includes(type) || utmContent.includes(type) || utmTerm.includes(type)) {
        demographics.venue_type = type
        break
      }
    }

    // Detect event scale from campaign parameters
    if (
      utmCampaign.includes('large') ||
      utmCampaign.includes('500+') ||
      utmCampaign.includes('enterprise')
    ) {
      demographics.event_scale = 'large'
    } else if (
      utmCampaign.includes('medium') ||
      utmCampaign.includes('100-500') ||
      utmCampaign.includes('growing')
    ) {
      demographics.event_scale = 'medium'
    } else if (
      utmCampaign.includes('small') ||
      utmCampaign.includes('startup') ||
      utmCampaign.includes('local')
    ) {
      demographics.event_scale = 'small'
    }

    return demographics
  }

  // Track user authentication
  trackUserSignIn(userEmail: string, userId: string, userRole?: string) {
    this.identify(userId)

    const userProperties: UserProperties = {
      email: userEmail,
      user_id: userId,
      conversion_stage: 'converted',
    }

    if (userRole) {
      userProperties.user_role = userRole as UserProperties['user_role']
    }

    this.setUserProperties(userProperties)

    this.track('User Signed In', {
      user_email: userEmail,
      user_role: userRole,
      sign_in_method: 'email_password',
    })
  }

  // Track conversion metrics
  trackClubCreated(clubName: string, userId?: string) {
    this.track('Club Created', {
      club_name: clubName,
      user_id: userId,
    })

    // Update user properties
    const currentClubs = Number(localStorage.getItem('analytics_clubs_created') || '0') + 1
    localStorage.setItem('analytics_clubs_created', currentClubs.toString())

    this.setUserProperties({
      clubs_created: currentClubs,
      conversion_stage: 'converted',
    })
  }

  trackVenueListed(venueName: string, userId?: string) {
    this.track('Venue Listed', {
      venue_name: venueName,
      user_id: userId,
    })

    // Update user properties
    const currentVenues = Number(localStorage.getItem('analytics_venues_listed') || '0') + 1
    localStorage.setItem('analytics_venues_listed', currentVenues.toString())

    this.setUserProperties({
      venues_listed: currentVenues,
      conversion_stage: 'converted',
    })
  }

  trackEventCreated(eventTitle: string, eventType: string, userId?: string) {
    this.track('Event Created', {
      event_title: eventTitle,
      event_type: eventType,
      user_id: userId,
    })

    // Update user properties
    const currentEvents = Number(localStorage.getItem('analytics_events_created') || '0') + 1
    localStorage.setItem('analytics_events_created', currentEvents.toString())

    this.setUserProperties({
      events_created: currentEvents,
      conversion_stage: 'converted',
    })
  }

  trackRSVPMade(eventId: string, rsvpType: string, userId?: string) {
    this.track('RSVP Made', {
      event_id: eventId,
      rsvp_type: rsvpType,
      user_id: userId,
    })

    // Update user properties
    const currentRSVPs = Number(localStorage.getItem('analytics_rsvps_made') || '0') + 1
    localStorage.setItem('analytics_rsvps_made', currentRSVPs.toString())

    this.setUserProperties({
      rsvps_made: currentRSVPs,
      conversion_stage: 'converted',
    })
  }

  // Track general click events on page elements
  trackElementClick(
    elementType: string,
    elementText: string,
    elementId?: string,
    pageName?: string,
  ) {
    // Record first interaction
    if (this.firstInteractionTime === null) {
      this.firstInteractionTime = Date.now()
    }

    // Increment click counter
    this.clicksOnPage++

    this.track('Element Clicked', {
      element_type: elementType,
      element_text: elementText,
      element_id: elementId,
      page_name: pageName,
    })
  }

  // Track specific landing page interactions
  trackLandingPageInteraction(interactionType: string, elementName: string, sectionName?: string) {
    this.track('Landing Page Interaction', {
      interaction_type: interactionType,
      element_name: elementName,
      section_name: sectionName,
      page_name: 'Home',
    })
  }

  // Section-based engagement tracking
  trackSectionEntry(sectionName: string, pageName: string) {
    if (!this.sectionMetrics.has(sectionName)) {
      this.sectionMetrics.set(sectionName, {
        entryTime: Date.now(),
        interactions: 0,
        ctasClicked: [],
        maxScroll: 0,
      })
    }
  }

  trackSectionExit(sectionName: string, pageName: string, scrollDepth: number = 100) {
    const metrics = this.sectionMetrics.get(sectionName)
    if (!metrics) return

    const timeInSection = Math.round((Date.now() - metrics.entryTime) / 1000)

    // Only track if user spent meaningful time (>2 seconds)
    if (timeInSection < 2) {
      this.sectionMetrics.delete(sectionName)
      return
    }

    const properties: SectionEngagementProperties = {
      section_name: sectionName,
      page_name: pageName,
      time_in_section: timeInSection,
      scroll_depth_in_section: Math.max(metrics.maxScroll, scrollDepth),
      interactions_in_section: metrics.interactions,
      ctas_clicked: metrics.ctasClicked,
      section_visible_percentage: scrollDepth,
      entry_time: metrics.entryTime,
      exit_time: Date.now(),
    }

    this.track('Section Engaged', properties)

    // Clean up
    this.sectionMetrics.delete(sectionName)

    // Check if this engagement triggers intent signals
    this.checkIntentSignals(pageName)
  }

  trackSectionInteraction(sectionName: string, interactionType: string, elementName?: string) {
    const metrics = this.sectionMetrics.get(sectionName)
    if (metrics) {
      metrics.interactions++
      if (interactionType === 'cta_click' && elementName) {
        metrics.ctasClicked.push(elementName)
      }
    }
  }

  updateSectionScroll(sectionName: string, scrollDepth: number) {
    const metrics = this.sectionMetrics.get(sectionName)
    if (metrics && scrollDepth > metrics.maxScroll) {
      metrics.maxScroll = scrollDepth
    }
  }

  // Intent signal detection and tracking
  private calculateIntentScore(pageName: string): number {
    let score = 0

    // Base engagement metrics
    const activeTimeSeconds = Math.round(this.activeTime / 1000)
    if (activeTimeSeconds > 180)
      score += 30 // 3+ minutes
    else if (activeTimeSeconds > 120)
      score += 20 // 2+ minutes
    else if (activeTimeSeconds > 60) score += 10 // 1+ minutes

    // Scroll depth
    if (this.maxScrollDepth > 90) score += 20
    else if (this.maxScrollDepth > 75) score += 15
    else if (this.maxScrollDepth > 50) score += 10

    // Interactions
    if (this.ctaInteractions > 2) score += 25
    else if (this.ctaInteractions > 1) score += 15
    else if (this.ctaInteractions > 0) score += 10

    // Form engagement
    if (this.formInteractions) score += 20

    // Return visitor
    if (this.visitedPages.size > 3) score += 10

    // Quick engagement
    const timeToFirstInteraction = this.firstInteractionTime
      ? (this.firstInteractionTime - this.startTime) / 1000
      : 999
    if (timeToFirstInteraction < 10) score += 5

    return Math.min(score, 100) // Cap at 100
  }

  private checkIntentSignals(pageName: string) {
    // Only calculate once per page session to avoid spam
    if (this.intentCalculated) return

    const activeTimeSeconds = Math.round(this.activeTime / 1000)

    // Define what constitutes intent signals
    const signals: string[] = []

    if (pageName.toLowerCase().includes('pricing')) {
      signals.push('pricing_viewed')
      this.intentSignals.add('pricing_viewed')
    }

    if (this.ctaInteractions > 1) {
      signals.push('multiple_cta_clicks')
      this.intentSignals.add('multiple_cta_clicks')
    }

    if (this.maxScrollDepth > 75) {
      signals.push('deep_scroll')
      this.intentSignals.add('deep_scroll')
    }

    if (activeTimeSeconds > 120) {
      signals.push('long_session')
      this.intentSignals.add('long_session')
    }

    if (this.formInteractions) {
      signals.push('form_started')
      this.intentSignals.add('form_started')
    }

    if (this.sectionsViewed.size > 3) {
      signals.push('feature_exploration')
      this.intentSignals.add('feature_exploration')
    }

    if (this.visitedPages.size > 1) {
      signals.push('return_visitor')
      this.intentSignals.add('return_visitor')
    }

    // Only fire intent event if we have meaningful signals (2+)
    if (signals.length >= 2) {
      const intentScore = this.calculateIntentScore(pageName)

      // Only track high intent (score > 50)
      if (intentScore >= 50) {
        const properties: IntentSignalProperties = {
          intent_signals: signals,
          intent_score: intentScore,
          time_to_intent: activeTimeSeconds,
          page_name: pageName,
          engagement_indicators: {
            pricing_viewed: this.intentSignals.has('pricing_viewed'),
            multiple_cta_clicks: this.intentSignals.has('multiple_cta_clicks'),
            deep_scroll: this.intentSignals.has('deep_scroll'),
            long_session: this.intentSignals.has('long_session'),
            form_started: this.intentSignals.has('form_started'),
            feature_exploration: this.intentSignals.has('feature_exploration'),
            return_visitor: this.intentSignals.has('return_visitor'),
          },
        }

        this.track('High Intent Detected', properties)

        // Update user properties
        this.setUserProperties({
          intent_score: intentScore,
          highest_intent_page: pageName,
          conversion_stage: 'interested',
        })

        this.intentCalculated = true
      }
    }
  }

  // Manual intent check (can be called when user completes key actions)
  checkAndTrackIntent(pageName: string) {
    this.checkIntentSignals(pageName)
  }

  // Conversion path tracking
  trackConversionStep(stepName: string, pageName: string) {
    this.conversionSteps++
    this.conversionPath.push(stepName)

    const timeFromLanding = Math.round((Date.now() - this.startTime) / 1000)

    const properties: ConversionStepProperties = {
      step_name: stepName,
      step_number: this.conversionSteps,
      time_from_landing: timeFromLanding,
      path_taken: [...this.conversionPath],
      previous_step:
        this.conversionPath.length > 1
          ? this.conversionPath[this.conversionPath.length - 2]
          : undefined,
      page_name: pageName,
    }

    this.track('Conversion Step Completed', properties)
  }

  // Feature interest tracking (now properly implemented)
  trackFeatureInterest(
    featureName: string,
    pageName: string,
    engagementType: 'view' | 'hover' | 'click' | 'scroll_pause',
    duration?: number,
  ) {
    this.track('Feature Interest Shown', {
      feature_name: featureName,
      page_name: pageName,
      engagement_type: engagementType,
      interest_duration: duration || 0,
      timestamp: Date.now(),
    })

    // Add to intent signals if significant engagement
    if (engagementType === 'click' || (duration && duration > 10)) {
      this.intentSignals.add('feature_exploration')
    }
  }
}

// Export singleton instance
export const analytics = new Analytics()

// React hook for analytics
export const useAnalytics = () => {
  return analytics
}

export default analytics
