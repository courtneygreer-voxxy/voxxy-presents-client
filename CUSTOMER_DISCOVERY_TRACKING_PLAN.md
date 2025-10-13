# Voxxy Presents - Customer Discovery & Attribution Tracking Plan

**Version:** 2.0
**Phase:** Private Beta - Customer Discovery & Channel Validation
**Date:** January 2025
**Owner:** Product & Growth Team

---

## 🎯 Phase Objectives

### Primary Goals
1. **Identify ICP (Ideal Customer Profile)** - Understand who our best customers are
2. **Validate Marketing Channels** - Determine which channels bring qualified leads
3. **Build Sales Playbook** - Document behavioral patterns of converting users
4. **Optimize Conversion Funnel** - Find and fix drop-off points

### Key Questions to Answer
- Which marketing channels bring the highest-intent leads?
- What customer profiles convert best? (club type, event scale, venue type)
- What's the typical user journey from landing to conversion?
- Which features/messaging resonate with different customer segments?
- What demographic signals indicate high purchase intent?

---

## 📊 Event Catalog

### 1. User Acquisition & Attribution Events

#### **First Visit**
**When Fired:** User's first visit to site (tracked via localStorage)

**Purpose:** Capture initial attribution and profile signals

**Properties:**
- `traffic_source` - 'direct' | 'organic' | 'social' | 'email' | 'paid' | 'referral'
- `referrer_domain` - Domain of referring site
- `referrer_url` - Full referring URL
- `landing_page` - First page user landed on
- `utm_source` - Marketing campaign source (e.g., "facebook", "google", "newsletter")
- `utm_medium` - Marketing medium (e.g., "cpc", "email", "social")
- `utm_campaign` - Campaign name (e.g., "club-owners-q1", "venue-owners-nyc")
- `utm_term` - Keyword (e.g., "recurring events", "music venue")
- `utm_content` - Ad variant (e.g., "banner-a", "text-ad-1")
- `campaign_id` - Internal campaign ID from SendGrid/platform
- `affiliate_id` - Affiliate/partner ID if applicable
- `sendgrid_campaign` - SendGrid campaign identifier
- `customer_profile` - Detected profile: 'club_organizer' | 'venue_owner' | 'event_planner' | 'artist' | 'promoter' | 'unknown'
- `profile_confidence` - 'low' | 'medium' | 'high'
- `profile_signals` - Array of signals used to detect profile (e.g., ["campaign_club_targeted", "navigated_to_club_pages"])
- `club_type` - Detected club type (e.g., "music", "art", "social")
- `venue_type` - Detected venue type (e.g., "bar", "gallery", "theater")
- `event_scale` - Detected scale: 'small' | 'medium' | 'large'
- `preferred_device` - 'desktop' | 'mobile' | 'tablet'
- `browser` - User's browser
- `operating_system` - User's OS

**Calculations:**
- `profile_confidence` = 'high' if 2+ signals, 'medium' if 1 signal, 'low' if 0 signals

**Use Cases:**
- Attribution reporting: Which channels bring what types of customers?
- ICP identification: What profiles convert vs. bounce?
- Campaign ROI: Which campaigns bring qualified leads?

---

#### **Page Viewed**
**When Fired:** User navigates to any page

**Purpose:** Track user navigation and content consumption

**Properties:**
- `page_name` - Name of page (e.g., "Home", "Pricing", "Features")
- `page_url` - Full URL including query params
- `referrer` - Previous page URL
- `viewport_width` - Browser width
- `viewport_height` - Browser height
- `is_return_visit` - Boolean, if user has visited this page before
- `session_id` - Unique session identifier

**Use Cases:**
- Content performance: Which pages drive engagement?
- User journey mapping: What path do users take?
- Device optimization: What screen sizes are common?

---

### 2. Engagement & Intent Events

#### **Section Engaged**
**When Fired:** User scrolls away from a section after spending >2 seconds

**Purpose:** Measure content engagement at section level

**Properties:**
- `section_name` - Name of section (e.g., "Hero", "Pricing Card", "Features - RSVP Management")
- `page_name` - Parent page
- `time_in_section` - Seconds spent in section
- `scroll_depth_in_section` - Percentage scrolled through section (0-100%)
- `interactions_in_section` - Number of clicks/interactions
- `ctas_clicked` - Array of CTA button texts clicked in section
- `section_visible_percentage` - How much of section was visible at exit
- `entry_time` - Timestamp when entered section
- `exit_time` - Timestamp when exited section

**Calculations:**
- `time_in_section` = (exit_time - entry_time) / 1000 seconds
- `scroll_depth_in_section` = (pixels_scrolled / section_height) * 100

**Use Cases:**
- Content optimization: Which sections engage users most?
- A/B testing: Compare section variants
- Message refinement: What content resonates with ICP?

---

#### **High Intent Detected**
**When Fired:** User exhibits 2+ buying signals AND intent_score ≥50

**Purpose:** Identify sales-ready leads in real-time

**Properties:**
- `intent_score` - Calculated score 0-100
- `intent_signals` - Array of signals triggered (e.g., ["deep_scroll", "multiple_cta_clicks", "long_session"])
- `time_to_intent` - Seconds from landing to showing intent
- `page_name` - Page where intent was detected
- `engagement_indicators` - Object with boolean flags:
  - `pricing_viewed` - Visited pricing page
  - `multiple_cta_clicks` - Clicked 2+ CTAs
  - `deep_scroll` - Scrolled >75% of page
  - `long_session` - Active >2 minutes
  - `form_started` - Began filling form
  - `feature_exploration` - Viewed 3+ sections
  - `return_visitor` - Visited multiple pages

**Calculations:**
```
intent_score =
  + active_time_points (0-30pts: 10 for 1min, 20 for 2min, 30 for 3min+)
  + scroll_points (0-20pts: 10 for 50%, 15 for 75%, 20 for 90%+)
  + cta_points (0-25pts: 10 for 1, 15 for 2, 25 for 3+)
  + form_points (20pts if started)
  + multi_page_points (10pts if 3+ pages)
  + quick_engage_points (5pts if first interaction <10s)
  = Total (capped at 100)
```

**Use Cases:**
- **CRITICAL:** Daily sales outreach to high-intent users
- Lead scoring and prioritization
- Sales playbook: What behavior = "ready to buy"?
- Retargeting: Re-engage users who showed intent but didn't convert

---

#### **Feature Interest Shown**
**When Fired:** User engages with a specific feature (hover >2s, click, or scroll pause)

**Purpose:** Understand which features drive interest

**Properties:**
- `feature_name` - Feature name (e.g., "RSVP Management", "Budget Tools", "Venue Marketplace")
- `page_name` - Where feature was viewed
- `engagement_type` - 'view' | 'hover' | 'click' | 'scroll_pause'
- `interest_duration` - Seconds of engagement (if applicable)
- `timestamp` - When interest was shown

**Use Cases:**
- Feature prioritization: Which features resonate most?
- Messaging optimization: Highlight features users care about
- Product roadmap: What features drive conversions?

---

### 3. Conversion & Form Events

#### **Form Started**
**When Fired:** User types in first form field

**Purpose:** Track form initiation and drop-off points

**Properties:**
- `form_type` - 'beta_request' | 'contact' | 'signup'
- `page_name` - Page containing form
- `form_location` - Location on page (e.g., "hero_form", "footer_form")
- `session_id` - Unique session ID

**Use Cases:**
- Conversion funnel: How many start vs. complete?
- Form optimization: Where do users drop off?
- Intent measurement: Form starts indicate high interest

---

#### **Form Field Completed**
**When Fired:** User completes a form field (blur event)

**Purpose:** Track field-level completion rates

**Properties:**
- `form_type` - Form identifier
- `page_name` - Page name
- `field_name` - Field identifier (e.g., "email", "organization_name")
- `field_order` - Order in form (1, 2, 3...)
- `time_to_complete` - Seconds to complete this field

**Use Cases:**
- Identify problem fields (high drop-off)
- Optimize field ordering
- Reduce form friction

---

#### **Form Submitted**
**When Fired:** User successfully submits form

**Purpose:** Track successful conversions and capture customer data

**Properties:**
- `form_type` - Form identifier
- `page_name` - Page name
- `completion_time` - Total seconds to complete form
- `form_data` - Object containing:
  - `event_frequency` - How often they run events
  - `typical_attendance` - Event size
  - `biggest_challenge` - Main pain point

**Use Cases:**
- **CRITICAL:** Conversion tracking
- Lead qualification: Prioritize based on form data
- Sales enablement: Context for outreach
- ICP refinement: What types of users convert?

---

#### **Form Error**
**When Fired:** User encounters form validation error

**Purpose:** Track and reduce form errors

**Properties:**
- `form_type` - Form identifier
- `page_name` - Page name
- `error_field` - Field with error
- `error_message` - Error message shown
- `attempt_number` - Which submission attempt (1, 2, 3...)

**Use Cases:**
- Identify common errors
- Improve error messaging
- Reduce abandonment

---

#### **Conversion Step Completed**
**When Fired:** User reaches key milestones in conversion funnel

**Purpose:** Track user journey through conversion path

**Properties:**
- `step_name` - Name of step (e.g., "Hero Viewed", "CTA Clicked", "Form Started", "Form Submitted")
- `step_number` - Order in journey (1, 2, 3...)
- `time_from_landing` - Seconds since first page load
- `path_taken` - Array of all steps taken (breadcrumb trail)
- `previous_step` - Previous step name
- `page_name` - Current page

**Use Cases:**
- Funnel visualization: Where do users drop off?
- Average time to convert
- Compare paths of converters vs. non-converters

---

### 4. CTA & Navigation Events

#### **CTA Button Clicked**
**When Fired:** User clicks any call-to-action button

**Purpose:** Measure CTA effectiveness

**Properties:**
- `button_text` - Text on button (e.g., "Request Pilot Access")
- `button_location` - Location (e.g., "hero", "pricing_card", "footer")
- `page_name` - Page name
- `is_primary_cta` - Boolean, if this is primary CTA
- `action_type` - Type of action (e.g., "form", "navigation", "external")
- `destination_page` - Where button leads
- `current_page` - Current page
- `button_position` - Position on page (e.g., "above_fold", "below_fold")

**Use Cases:**
- CTA optimization: Which CTAs convert best?
- Placement testing: Above vs. below fold
- Messaging testing: Which copy drives clicks?

---

#### **Navigation Link Clicked**
**When Fired:** User clicks internal navigation link

**Purpose:** Track site navigation patterns

**Properties:**
- `link_text` - Link text
- `destination_page` - Destination
- `current_page` - Current page
- `link_position` - 'header' | 'footer' | 'inline' | 'hero'

**Use Cases:**
- Navigation optimization
- User journey mapping
- Content discovery patterns

---

### 5. Authentication & Account Events

#### **Sign Up Form Submitted**
**When Fired:** User submits signup form

**Purpose:** Track signup attempts

**Properties:**
- `page_name` - Signup page name (e.g., "Club Owner Sign Up")
- `user_type` - 'club_owner' | 'venue_owner'
- `session_id` - Session ID

**Use Cases:**
- Signup funnel tracking
- Compare attempt vs. completion rates
- Identify friction in signup

---

#### **Sign Up Completed**
**When Fired:** Account successfully created

**Purpose:** Track successful account creation

**Properties:**
- `page_name` - Signup page
- `user_role` - 'organizer' | 'venue_owner'
- `user_id` - New user ID
- `email` - User email

**Use Cases:**
- **CRITICAL:** Conversion tracking
- User role distribution
- Growth metrics

---

#### **Sign Up Error**
**When Fired:** Signup fails

**Purpose:** Track and reduce signup errors

**Properties:**
- `page_name` - Signup page
- `error_type` - Type of error (e.g., "submission_failed")
- `error_message` - Error details

**Use Cases:**
- Identify technical issues
- Reduce abandonment
- Improve error handling

---

#### **User Signed In**
**When Fired:** Existing user logs in

**Purpose:** Track returning user sessions

**Properties:**
- `user_email` - User email
- `user_role` - User role
- `sign_in_method` - 'email_password' | 'google' | etc.

**Use Cases:**
- Retention tracking
- Active user counts
- Role distribution

---

### 6. Product Usage Events (Post-Auth)

#### **Club Created**
**When Fired:** User creates a club/organization

**Purpose:** Track product activation

**Properties:**
- `club_name` - Name of club
- `user_id` - Creator ID

**Use Cases:**
- Activation rate (signup → club creation)
- Time to value
- Product engagement

---

#### **Venue Listed**
**When Fired:** Venue owner creates venue listing

**Purpose:** Track venue owner activation

**Properties:**
- `venue_name` - Name of venue
- `user_id` - Owner ID

**Use Cases:**
- Venue owner activation rate
- Supply-side growth
- Marketplace liquidity

---

#### **Event Created**
**When Fired:** User creates an event

**Purpose:** Track core product usage

**Properties:**
- `event_title` - Event name
- `event_type` - Type of event
- `user_id` - Creator ID

**Use Cases:**
- Product engagement
- Event creation frequency
- Platform activity

---

#### **RSVP Made**
**When Fired:** User RSVPs to event

**Purpose:** Track demand-side engagement

**Properties:**
- `event_id` - Event ID
- `rsvp_type` - RSVP status
- `user_id` - User ID

**Use Cases:**
- Demand-side activity
- Event popularity
- User engagement

---

## 👤 User Properties (Profile Data)

### Automatically Tracked
- `first_visit_date` - When user first visited
- `total_sessions` - Number of sessions
- `preferred_device` - 'desktop' | 'mobile' | 'tablet'
- `browser` - Browser name
- `operating_system` - OS name

### Attribution Properties
- `traffic_source` - 'direct' | 'organic' | 'social' | 'email' | 'paid' | 'referral'
- `utm_source` - Campaign source
- `utm_medium` - Campaign medium
- `utm_campaign` - Campaign name
- `utm_term` - Campaign keyword
- `utm_content` - Ad variant
- `campaign_id` - Internal campaign ID
- `affiliate_id` - Affiliate/partner ID
- `sendgrid_campaign` - SendGrid campaign ID
- `referrer_domain` - Referring domain
- `landing_page` - First page visited

### Customer Profile Properties
- `customer_profile` - 'club_organizer' | 'venue_owner' | 'event_planner' | 'artist' | 'promoter' | 'unknown'
- `profile_confidence` - 'low' | 'medium' | 'high'
- `profile_signals` - Array of signals that determined profile
- `club_type` - 'music' | 'art' | 'social' | 'fitness' | 'comedy' | 'food' | 'networking' | 'cultural'
- `venue_type` - 'bar' | 'gallery' | 'outdoor' | 'theater' | 'restaurant' | 'warehouse' | 'rooftop' | 'studio'
- `event_scale` - 'small' (10-50) | 'medium' (50-200) | 'large' (200+)

### Form-Captured Properties
- `organization_name` - From contact form
- `event_frequency` - How often they run events
- `typical_attendance` - Event size
- `biggest_challenge` - Main pain point

### Engagement Properties
- `conversion_stage` - 'visitor' | 'interested' | 'submitted' | 'converted'
- `intent_score` - 0-100 calculated score
- `highest_intent_page` - Page where they showed highest intent
- `most_engaged_content` - Content they engaged with most
- `pages_visited` - Array of page names visited

### Product Usage Properties (Post-Auth)
- `user_id` - Unique user ID
- `email` - User email
- `user_role` - 'admin' | 'organizer' | 'venue_owner' | 'user'
- `clubs_created` - Number of clubs created
- `venues_listed` - Number of venues listed
- `events_created` - Number of events created
- `rsvps_made` - Number of RSVPs made

---

## 🧮 Calculations & Formulas

### Intent Score (0-100)
```
Intent Score =
  Active Time Points (0-30):
    - 1-2 minutes: 10pts
    - 2-3 minutes: 20pts
    - 3+ minutes: 30pts

  + Scroll Depth Points (0-20):
    - 50%: 10pts
    - 75%: 15pts
    - 90%+: 20pts

  + CTA Interaction Points (0-25):
    - 1 click: 10pts
    - 2 clicks: 15pts
    - 3+ clicks: 25pts

  + Form Engagement Points (0-20):
    - Started form: 20pts

  + Multi-Page Visit Points (0-10):
    - 3+ pages: 10pts

  + Quick Engagement Points (0-5):
    - First interaction <10s: 5pts

Maximum Total: 100 points
```

### Profile Confidence
```
Profile Confidence =
  - HIGH: 2+ signals detected
  - MEDIUM: 1 signal detected
  - LOW: 0 signals detected

  Upgraded to HIGH if user submits form (explicit data)
```

### Event Scale (from form data)
```
Event Scale =
  - SMALL: attendance includes "10-50" or "small"
  - MEDIUM: attendance includes "50-200" or "medium"
  - LARGE: attendance includes "200+" or "large"
```

### Profile Detection Logic
```
Customer Profile =
  IF (campaign contains "club" OR campaign contains "organizer" OR navigated to /club pages):
    → club_organizer

  ELSE IF (campaign contains "venue" OR navigated to /venue pages):
    → venue_owner

  ELSE IF (campaign contains "artist"):
    → artist

  ELSE IF (campaign contains "promoter"):
    → promoter

  ELSE:
    → unknown
```

---

## 🎯 Marketing Campaign URL Structure

### Recommended URL Parameters

**For Email Campaigns (SendGrid):**
```
https://voxxypresents.com?
  utm_source=email&
  utm_medium=newsletter&
  utm_campaign=club-owners-q1-2025&
  utm_content=music-clubs&
  sg_campaign=SENDGRID_CAMPAIGN_ID
```

**For Social Media Ads:**
```
https://voxxypresents.com?
  utm_source=facebook&
  utm_medium=paid-social&
  utm_campaign=venue-owners-nyc&
  utm_content=gallery-owners&
  utm_term=art-gallery-events
```

**For Affiliate Partners:**
```
https://voxxypresents.com?
  utm_source=partner&
  utm_medium=referral&
  utm_campaign=partner-name-q1&
  affiliate_id=PARTNER123&
  utm_content=club-organizers
```

### Parameter Naming Conventions

#### utm_campaign Naming
Format: `{audience}-{location}-{time period}`

Examples:
- `club-owners-nyc-q1`
- `music-venues-sf-jan2025`
- `art-galleries-national-winter`

**Include audience keywords:**
- For club organizers: `club`, `organizer`, `music`, `art`, `social`
- For venue owners: `venue`, `gallery`, `bar`, `theater`
- For scale: `small`, `medium`, `large`, `startup`, `enterprise`

#### utm_content Naming
Use to specify sub-segments or ad variants:
- `music-clubs` (club type)
- `small-venues` (size)
- `banner-a` (ad variant)
- `art-gallery-owners` (specific niche)

#### utm_term Naming
Use for keywords and detailed targeting:
- `recurring-events`
- `event-management-software`
- `music-venue-booking`

---

## 📈 Key Metrics & Dashboards

### Dashboard 1: Marketing Attribution & Channel Performance

**Purpose:** Understand which channels bring qualified leads

**Metrics:**
- **Traffic by Source:**
  - Sessions by `traffic_source`
  - Visitors by `utm_source`
  - Top `utm_campaign` by volume

- **Lead Quality by Channel:**
  - Avg `intent_score` by `traffic_source`
  - High-intent % by `utm_campaign` (intent_score ≥50)
  - Form submission rate by `utm_source`

- **Cost per Qualified Lead (if cost data available):**
  - Cost / (High Intent + Form Submissions)

**Goal:** Identify which channels to invest in

---

### Dashboard 2: Customer Profile & ICP Analysis

**Purpose:** Understand who our ideal customers are

**Metrics:**
- **Profile Distribution:**
  - Count by `customer_profile`
  - Confidence levels (`profile_confidence`)
  - Top `profile_signals`

- **Demographics:**
  - `club_type` distribution
  - `venue_type` distribution
  - `event_scale` distribution

- **Conversion by Profile:**
  - Conversion rate by `customer_profile`
  - Avg `intent_score` by profile
  - Time to convert by profile

- **Channel-Profile Match:**
  - Which `utm_campaign` brings which profiles?
  - Profile confidence by traffic source

**Goal:** Define ICP and target marketing accordingly

---

### Dashboard 3: High-Intent Lead Pipeline

**Purpose:** Daily sales outreach prioritization

**Metrics:**
- **New High-Intent Users (Last 24 hours):**
  - Event: "High Intent Detected"
  - Sort by: `intent_score` DESC
  - Show: `customer_profile`, `intent_signals`, `pages_visited`, `utm_campaign`

- **High-Intent Users Who Haven't Converted:**
  - Filter: `intent_score` ≥50 AND `conversion_stage` != 'submitted'
  - Days since intent: (today - intent_detected_date)

- **Form Started But Not Submitted:**
  - Event: "Form Started" but no "Form Submitted"
  - Show: Contact info if available, `customer_profile`

**Goal:** Prioritize daily sales outreach

---

### Dashboard 4: Conversion Funnel & Drop-Off Analysis

**Purpose:** Identify and fix friction points

**Funnel Steps:**
1. Landing (Page Viewed)
2. Content Engagement (Section Engaged ≥1)
3. High Intent (High Intent Detected)
4. Form Started
5. Form Submitted
6. Sign Up Completed (if applicable)

**Metrics per Step:**
- Count of users
- Drop-off rate
- Avg time to next step
- Top drop-off reasons (if identifiable)

**Segment By:**
- `customer_profile`
- `traffic_source`
- `utm_campaign`
- `landing_page`

**Goal:** Optimize conversion rate at each step

---

### Dashboard 5: Content & Feature Performance

**Purpose:** Understand what content resonates

**Metrics:**
- **Section Engagement:**
  - Avg `time_in_section` by `section_name`
  - `scroll_depth_in_section` by section
  - `interactions_in_section` by section

- **Feature Interest:**
  - Count of "Feature Interest Shown" by `feature_name`
  - Avg `interest_duration` by feature
  - Feature interest by `customer_profile`

- **CTA Performance:**
  - Click-through rate by `button_text`
  - Conversion rate by `button_location`
  - Best performing CTAs by `customer_profile`

**Goal:** Optimize content and messaging

---

### Dashboard 6: Campaign-Specific Performance

**Purpose:** Measure individual campaign ROI

**Create separate reports for each campaign:**

**Filter:** `utm_campaign` = "specific-campaign-name"

**Metrics:**
- Total visitors
- Profile distribution
- Avg intent score
- Form submissions
- Signups
- Cost per conversion (if cost data)

**Compare:**
- Campaign A vs. Campaign B performance
- Same campaign across different channels

**Goal:** Optimize campaign spend and creative

---

## 🎯 Phase Goals & Success Criteria

### Week 1-2: Channel Validation
**Goal:** Identify top 3 marketing channels

**Success Metrics:**
- High-intent rate >15% for at least one channel
- Form submission rate >5% for at least one channel
- Clear leader in `intent_score` by `utm_source`

**Actions:**
- Run small tests across 5+ channels
- Daily review of high-intent leads
- Tag all campaigns properly

---

### Week 3-4: ICP Definition
**Goal:** Define 2-3 customer personas with confidence

**Success Metrics:**
- ≥50 data points per profile type
- Clear correlation between profile and conversion
- Documented behavioral patterns per profile

**Actions:**
- Analyze `customer_profile` conversion rates
- Interview high-intent leads
- Document `club_type` and `venue_type` patterns

---

### Week 5-6: Sales Playbook Creation
**Goal:** Document repeatable sales process

**Success Metrics:**
- Conversion rate improves by 20%+
- Sales cycle time defined
- Outreach templates created per profile

**Actions:**
- Track "High Intent Detected" → conversion time
- Identify common objections from form data
- Create profile-specific outreach sequences

---

### Week 7-8: Funnel Optimization
**Goal:** Reduce drop-off by 30%

**Success Metrics:**
- Each funnel step improves by ≥10%
- Form completion rate >60%
- Section engagement time increases

**Actions:**
- A/B test high drop-off sections
- Simplify form if needed
- Optimize CTA placement

---

## 🚨 Daily Checklist for Customer Discovery Phase

### Every Morning (9:00 AM)
- [ ] Check "High Intent Detected" events from last 24 hours
- [ ] Review new form submissions
- [ ] Check which campaigns drove high-intent users yesterday
- [ ] Update ICP notes based on new signals

### Every Day (Before Lunch)
- [ ] Outreach to high-intent users from yesterday (email/call)
- [ ] Review attribution for converting users
- [ ] Update campaign performance spreadsheet

### End of Week (Friday)
- [ ] Review all dashboards
- [ ] Calculate channel ROI
- [ ] Document ICP learnings
- [ ] Plan next week's tests

---

## 🔍 Customer Signals to Watch

### 🔥 **HOT SIGNALS** (Immediate Outreach)
- `intent_score` ≥75
- "Form Started" + "High Intent Detected" within same session
- Multiple page visits in short time (≤10 mins)
- `customer_profile` with high confidence + pricing page viewed
- Return visitor with increasing intent score

### 🌡️ **WARM SIGNALS** (Nurture Campaign)
- `intent_score` 50-74
- "Form Started" but not completed
- Clicked multiple CTAs
- Deep scroll on key pages
- `customer_profile` matches ICP

### ❄️ **COLD SIGNALS** (Retargeting)
- `intent_score` <50
- Bounced from landing page
- Low scroll depth
- `customer_profile` = 'unknown'
- Single page visit

---

## 🧪 Recommended Tests

### Test 1: Landing Page by Profile
**Hypothesis:** Personalized landing pages increase conversion

**Test:**
- Create separate landing pages for club_organizer vs. venue_owner
- Route traffic based on `utm_campaign`
- Compare `intent_score` and conversion rates

### Test 2: CTA Messaging
**Hypothesis:** Specific benefits outperform generic CTAs

**Test:**
- Variant A: "Request Access"
- Variant B: "Start Your Free Pilot"
- Variant C: "Join 100+ Organizers"
- Measure click-through and conversion rates

### Test 3: Form Length
**Hypothesis:** Shorter forms increase completion

**Test:**
- Variant A: Current form (7 fields)
- Variant B: Short form (3 fields: name, email, role)
- Measure completion rate and lead quality

### Test 4: Social Proof Placement
**Hypothesis:** Social proof increases trust

**Test:**
- Variant A: No social proof
- Variant B: Social proof in hero
- Variant C: Social proof before form
- Measure `intent_score` and form submissions

---

## 📝 Implementation Notes

### Campaign Setup Checklist
When launching a new campaign:
- [ ] Define target `customer_profile`
- [ ] Set `utm_campaign` name following convention
- [ ] Include profile keywords in `utm_content` or `utm_term`
- [ ] Add `campaign_id` for tracking
- [ ] Add `affiliate_id` if partner campaign
- [ ] Document campaign in tracking spreadsheet
- [ ] Set up Mixpanel notification for high-intent events from this campaign

### Data Quality Checks
Weekly verification:
- [ ] All campaigns have proper UTM tags
- [ ] `customer_profile` detection working (check "First Visit" events)
- [ ] No gaps in event tracking (pages without tracking)
- [ ] Intent score calculations appear accurate
- [ ] Form events firing correctly

---

## 📞 Questions This Tracking Plan Answers

✅ **Marketing & Attribution:**
- Which channels bring the most qualified leads?
- What's the ROI of each marketing campaign?
- Which affiliate partners drive conversions?
- What's the cost per high-intent lead?

✅ **Customer Discovery:**
- Who is our ICP? (profile, demographics)
- What club types convert best?
- What event scale should we target?
- Do music clubs behave differently than art galleries?

✅ **Product & Messaging:**
- Which features drive interest?
- What messaging resonates with each profile?
- Which CTAs perform best?
- What content sections engage users?

✅ **Sales Enablement:**
- What behavior indicates "ready to buy"?
- How long from first visit to high intent?
- What's the typical conversion path?
- What objections appear in form data?

✅ **Optimization:**
- Where do users drop off?
- Which form fields cause friction?
- What's the optimal form length?
- How does mobile vs. desktop convert?

---

## 🎉 Success = Data-Driven Decisions

With this tracking plan, you can answer with confidence:
- **"Should we invest more in Facebook ads?"** → Check intent score and conversion rate by utm_source=facebook
- **"Are music clubs a better fit than art galleries?"** → Compare conversion by club_type
- **"What should our sales pitch emphasize?"** → Look at highest-engaged sections and features
- **"Which campaign should we scale?"** → Review high-intent % and cost per conversion by utm_campaign

**Every decision backed by data, not guesses.** 🚀

---

**Last Updated:** January 2025
**Next Review:** After 100 conversions or 4 weeks, whichever comes first
