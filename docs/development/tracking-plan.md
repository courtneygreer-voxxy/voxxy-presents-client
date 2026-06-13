# Voxxy Presents Analytics Tracking Plan

## Overview

This document outlines the analytics tracking strategy for Voxxy Presents using Mixpanel to measure user engagement, conversion funnel performance, and GTM success metrics.

## Key Business Objectives

- Measure beta access request conversion rates
- Track user engagement across landing pages
- Identify which messaging resonates with target audience (club organizers)
- Optimize the conversion funnel from landing page → contact form → beta signup

## User Journey & Conversion Funnel

### Primary Conversion Path

1. **Landing** → User arrives at site
2. **Exploration** → User navigates between pages
3. **Interest** → User engages with content (scrolling, time on page)
4. **Intent** → User clicks CTA buttons
5. **Conversion** → User submits beta access form

## Event Tracking Schema

### Page View Events

Track all page visits to understand user flow and content performance.

```javascript
// Page View
mixpanel.track('Page Viewed', {
  page_name: string, // 'Home', 'Features', 'Pricing', etc.
  page_url: string, // Full URL
  referrer: string, // Previous page or external referrer
  user_agent: string, // Browser info
  timestamp: Date,
})
```

### Navigation Events

Track how users move through the site.

```javascript
// Navigation Link Click
mixpanel.track('Navigation Link Clicked', {
  link_text: string, // 'Features', 'Pricing', etc.
  destination_page: string, // Where the link goes
  current_page: string, // Where they clicked from
  link_position: string, // 'header', 'footer', 'inline'
})
```

### Content Engagement Events

Measure how users interact with content.

```javascript
// CTA Button Click
mixpanel.track('CTA Button Clicked', {
  button_text: string, // 'Request Beta Access', 'Get Product Updates'
  button_location: string, // 'hero', 'pricing_card', 'footer'
  page_name: string, // Current page
  is_primary_cta: boolean, // Main vs secondary CTA
})

// Scroll Depth
mixpanel.track('Page Scroll', {
  page_name: string,
  scroll_depth: number, // Percentage (25, 50, 75, 100)
  time_to_depth: number, // Seconds to reach this depth
})

// Time on Page (for engagement measurement)
mixpanel.track('Page Engagement', {
  page_name: string,
  time_spent: number, // Seconds on page
  engagement_level: string, // 'low' (<30s), 'medium' (30-120s), 'high' (>120s)
})
```

### Form Events

Critical for measuring conversion funnel performance.

```javascript
// Form Started
mixpanel.track('Form Started', {
  form_type: string, // 'beta_access', 'contact'
  page_name: string,
  form_location: string, // 'modal', 'contact_page'
})

// Form Field Completed
mixpanel.track('Form Field Completed', {
  form_type: string,
  field_name: string, // 'name', 'email', 'organization_name'
  field_order: number, // Sequence in form
  time_to_complete: number, // Seconds to fill this field
})

// Form Submitted
mixpanel.track('Form Submitted', {
  form_type: string,
  form_data: {
    event_frequency: string, // From dropdown
    typical_attendance: string, // From dropdown
    biggest_challenge: string, // From dropdown
  },
  completion_time: number, // Total time to complete form
  page_name: string,
})

// Form Error
mixpanel.track('Form Error', {
  form_type: string,
  error_field: string,
  error_message: string,
  attempt_number: number,
})
```

### Feature Interest Events

Track which features resonate most with users.

```javascript
// Feature Card View
mixpanel.track('Feature Viewed', {
  feature_name: string, // 'RSVP Management', 'Venue Coordination'
  page_name: string,
  view_method: string, // 'scroll', 'click', 'navigation'
})

// Pricing Plan Interest
mixpanel.track('Pricing Plan Viewed', {
  plan_name: string, // 'Event Infrastructure Beta'
  plan_price: string, // '$15/month'
  features_viewed: array, // List of features user saw
  time_spent_viewing: number, // Seconds looking at plan
})
```

### Email & Communication Events

Track communication touchpoints.

```javascript
// Email Link Click
mixpanel.track('Email Link Clicked', {
  link_type: string, // 'contact', 'questions'
  email_address: string, // team@voxxypresents.com
  page_name: string,
})

// External Link Click
mixpanel.track('External Link Clicked', {
  destination: string, // External URL
  link_context: string, // Where on page
  page_name: string,
})
```

## User Properties

Track important user characteristics and behavior patterns.

```javascript
// Set user properties when available
mixpanel.people.set({
  // From form submissions
  organization_name: string,
  event_frequency: string,
  typical_attendance: string,
  biggest_challenge: string,

  // Behavioral data
  first_visit_date: Date,
  pages_visited: array,
  total_sessions: number,
  most_engaged_content: string,
  conversion_stage: string, // 'visitor', 'interested', 'submitted'

  // Technical
  preferred_device: string, // 'desktop', 'mobile', 'tablet'
  browser: string,
  operating_system: string,
})
```

## Key Metrics & KPIs

### Conversion Metrics

- **Landing → Form Start**: % of visitors who begin the beta form
- **Form Start → Submit**: % completion rate of beta access form
- **Overall Conversion Rate**: % of total visitors who submit beta form
- **Page-specific Conversion**: Which pages drive most form submissions

### Engagement Metrics

- **Time on Site**: Average session duration
- **Page Views per Session**: How many pages users explore
- **Scroll Depth**: How much content users consume
- **Return Visitor Rate**: % of users who come back

### Content Performance

- **Page Popularity**: Most/least visited pages
- **CTA Performance**: Which buttons get clicked most
- **Feature Interest**: Which features generate most engagement
- **Bounce Rate**: % of single-page sessions

### GTM Metrics

- **Traffic Sources**: Where users come from
- **Campaign Performance**: If running ads/campaigns
- **Device/Browser**: Technical insights about audience
- **Geographic Distribution**: Where beta interest is highest

## Implementation Priority

### Phase 1: Core Tracking (MVP)

1. Page views and basic navigation
2. CTA button clicks
3. Form events (start, submit, errors)
4. Basic user properties

### Phase 2: Enhanced Engagement

1. Scroll depth tracking
2. Time-based engagement events
3. Feature-specific interactions
4. Advanced user segmentation

### Phase 3: Advanced Analytics

1. Funnel analysis setup
2. Cohort tracking
3. A/B testing preparation
4. Advanced behavioral triggers

## Technical Implementation Notes

### Event Naming Convention

- Use Title Case for event names
- Use snake_case for properties
- Prefix custom events with company/product context if needed
- Keep names descriptive but concise

### Data Privacy & Compliance

- Ensure GDPR/CCPA compliance
- No PII in event properties (hash if necessary)
- Respect user opt-out preferences
- Clear data retention policies

### Testing & QA

- Test all events in development environment first
- Verify event firing with Mixpanel debugger
- Validate data structure and property types
- Monitor for data quality issues post-launch

## Dashboard & Reporting Setup

### Executive Dashboard

- Total visitors, conversions, conversion rate
- Top traffic sources
- Key page performance metrics
- Weekly/monthly trends

### Product Team Dashboard

- Feature engagement metrics
- User journey analysis
- Form performance and drop-off points
- Content effectiveness

### Marketing Dashboard

- Campaign attribution
- Channel performance
- Audience insights
- Conversion funnel optimization
