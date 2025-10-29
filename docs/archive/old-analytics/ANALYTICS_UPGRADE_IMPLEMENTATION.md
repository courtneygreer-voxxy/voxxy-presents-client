# Analytics Section Tracking - Implementation Guide

## ✅ What's Been Implemented (Option A)

### New Events Added

1. **Section Engaged** - Fires when user leaves a section after spending >2 seconds
   - `section_name`: Name of the section (e.g., "Hero", "Features", "Pricing")
   - `time_in_section`: Seconds spent in that section
   - `scroll_depth_in_section`: How much they scrolled through (0-100%)
   - `interactions_in_section`: Number of clicks/interactions
   - `ctas_clicked`: Array of CTA buttons clicked in this section
   - `page_name`: Which page this happened on

2. **High Intent Detected** - Auto-fires when user shows 2+ buying signals with score >50
   - `intent_signals`: Array of signals (e.g., ["deep_scroll", "multiple_cta_clicks", "long_session"])
   - `intent_score`: 0-100 calculated score based on behavior
   - `engagement_indicators`: Boolean flags for each signal type
   - `time_to_intent`: How long before showing intent

3. **Conversion Step Completed** - Tracks user journey through conversion funnel
   - `step_name`: Name of step (e.g., "Hero Viewed", "CTA Clicked")
   - `step_number`: Order in the journey
   - `path_taken`: Full breadcrumb trail
   - `time_from_landing`: Seconds since first page load

4. **Feature Interest Shown** - Tracks specific feature engagement
   - `feature_name`: Which feature
   - `engagement_type`: "view" | "hover" | "click" | "scroll_pause"
   - `interest_duration`: How long they engaged

### Intent Signal Scoring System

The system automatically calculates intent scores based on:
- **Active Time**: 30pts max (10pts for 1min, 20pts for 2min, 30pts for 3min+)
- **Scroll Depth**: 20pts max (10pts for 50%, 15pts for 75%, 20pts for 90%+)
- **CTA Interactions**: 25pts max (10pts for 1, 15pts for 2, 25pts for 3+)
- **Form Engagement**: 20pts (started a form)
- **Multi-page Visit**: 10pts (visited 3+ pages)
- **Quick Engagement**: 5pts (interacted within 10 seconds)

**Total Possible**: 100 points

**Threshold**: Event fires when score ≥50 AND user has 2+ signals

### Intent Signals Tracked

1. `pricing_viewed` - User visited pricing page
2. `multiple_cta_clicks` - Clicked 2+ CTAs
3. `deep_scroll` - Scrolled >75% of page
4. `long_session` - Active for 2+ minutes
5. `form_started` - Began filling out a form
6. `feature_exploration` - Viewed 3+ sections/features
7. `return_visitor` - Visited multiple pages

## 📋 How to Implement Section Tracking

### Step 1: Import the Hook

```tsx
import { useSectionTracking } from '@/hooks/useSectionTracking';
```

### Step 2: Add Tracking to a Section

```tsx
export default function HomePage() {
  // Basic page tracking (already exists)
  usePageTracking('Home');

  // Add section tracking for Hero
  const { sectionRef: heroRef, trackInteraction: trackHeroInteraction } = useSectionTracking({
    pageName: 'Home',
    sectionName: 'Hero',
    threshold: 0.5, // Fire when 50% visible
    trackScrollDepth: true,
  });

  // Add section tracking for Features
  const { sectionRef: featuresRef, trackInteraction: trackFeaturesInteraction } = useSectionTracking({
    pageName: 'Home',
    sectionName: 'Features',
  });

  return (
    <div>
      {/* Attach ref to section */}
      <section ref={heroRef}>
        <h1>Your Hero Content</h1>

        {/* Track CTA clicks within section */}
        <Button
          onClick={() => {
            trackHeroInteraction('cta_click', 'Request Beta Access');
            // ... rest of click handler
          }}
        >
          Request Beta Access
        </Button>
      </section>

      <section ref={featuresRef}>
        {/* Features content */}
      </section>
    </div>
  );
}
```

### Step 3: Track Conversion Steps (Optional but Recommended)

```tsx
import { analytics } from '@/lib/analytics';

// Track when user reaches key milestones
analytics.trackConversionStep('Hero Viewed', 'Home');

// When they click a CTA
analytics.trackConversionStep('Primary CTA Clicked', 'Home');

// When they start a form
analytics.trackConversionStep('Contact Form Started', 'Contact');
```

### Step 4: Track Feature Interest (Optional)

```tsx
// When user hovers over a feature card for >2 seconds
<div
  onMouseEnter={() => startFeatureTimer('Ticketing')}
  onMouseLeave={(duration) => {
    analytics.trackFeatureInterest('Ticketing', 'Home', 'hover', duration);
  }}
>
  Feature content
</div>
```

## 🎯 Recommended Implementation Priority

### WEEK 1 (This Week - Customer Discovery Focus)

**Must-Have Pages:**
1. ✅ HomePage - Hero, Features, Social Proof sections
2. ✅ PricingPage - All pricing tiers
3. ✅ FeaturesPage - Each feature section
4. ContactPage - Form sections (start, fields, submit)

**Quick Win**: Add section tracking to these 4 pages = 80% of customer discovery insights

### WEEK 2 (Next Week - Sales Playbook)

**Should-Have Pages:**
5. VenueOwnerBenefitsPage
6. HelpPage
7. Sign-up/Login flows

## 📊 Mixpanel Views to Set Up Now

### View #1: High-Intent Users (MOST CRITICAL)
```
Filter: "High Intent Detected" event
Group by: intent_signals, highest_intent_page
Sort by: intent_score (descending)
```
**Use Case**: Daily check for warm leads to reach out to

### View #2: Section Performance
```
Event: "Section Engaged"
Metrics: Average time_in_section, interactions_in_section
Group by: section_name, page_name
```
**Use Case**: Which sections drive the most engagement?

### View #3: Conversion Funnel
```
Funnel Steps:
1. Page Viewed (any page)
2. Section Engaged (Hero OR Features)
3. CTA Button Clicked
4. Form Started
5. Form Submitted
```
**Use Case**: Where are drop-offs happening?

### View #4: Feature Interest Heatmap
```
Event: "Feature Interest Shown"
Group by: feature_name
Metrics: Count, avg interest_duration
```
**Use Case**: Which features resonate most with ICP?

### View #5: Intent Score Distribution
```
User Property: intent_score
Segmentation: 0-25 (cold), 26-50 (warm), 51-75 (hot), 76-100 (🔥)
Show: User count per segment
```
**Use Case**: How many users are sales-ready?

## 🔥 Automatic Features (No Code Needed!)

These work automatically once you add section tracking:

1. ✅ **Intent scoring** - Calculates in real-time
2. ✅ **User property updates** - Adds `intent_score` and `highest_intent_page` to user profile
3. ✅ **Conversion stage progression** - Moves users from "visitor" → "interested" → "converted"
4. ✅ **Return visit detection** - Tracks if user came back to same page

## 💡 Pro Tips

### Tip #1: Name Sections Consistently
Use clear, hierarchical names:
- ✅ "Hero"
- ✅ "Features - Overview"
- ✅ "Features - Ticketing"
- ✅ "Pricing - Plans"
- ✅ "Social Proof"
- ✅ "CTA - Final"

❌ "Section1", "div2", "bottom-part"

### Tip #2: Track CTA Clicks Within Sections
Always call `trackInteraction` when user clicks CTAs:
```tsx
const { trackInteraction } = useSectionTracking(/*...*/);

<Button onClick={() => {
  trackInteraction('cta_click', 'Request Beta Access');
  // existing click handler
}}>
```

### Tip #3: Review Intent Signals Daily
Check Mixpanel every morning for users who triggered "High Intent Detected" in last 24 hours. These are your warmest leads!

### Tip #4: A/B Test Sections
Use `section_name` + `time_in_section` to compare:
- Different hero copy
- Feature ordering
- Pricing display formats

## 🚀 Next Steps

1. **Commit these changes** to save the analytics upgrades
2. **Add section tracking to HomePage** (example code provided below)
3. **Set up Mixpanel views** (copy queries from above)
4. **Add tracking to PricingPage and FeaturesPage** (use same pattern)
5. **Wire up ContactPage forms** (hooks already added, just need event calls)

## Example: HomePage with Section Tracking

```tsx
import React, { useState } from 'react';
import { usePageTracking } from '@/hooks/usePageTracking';
import { useSectionTracking } from '@/hooks/useSectionTracking';
import { analytics } from '@/lib/analytics';

export default function HomePage() {
  usePageTracking('Home');

  // Section tracking hooks
  const { sectionRef: heroRef, trackInteraction: trackHero } = useSectionTracking({
    pageName: 'Home',
    sectionName: 'Hero',
  });

  const { sectionRef: problemsRef, trackInteraction: trackProblems } = useSectionTracking({
    pageName: 'Home',
    sectionName: 'Problems',
  });

  const { sectionRef: featuresRef, trackInteraction: trackFeatures } = useSectionTracking({
    pageName: 'Home',
    sectionName: 'Features',
  });

  return (
    <div>
      {/* Navigation... */}

      {/* Hero Section - ADD REF */}
      <section ref={heroRef} className="relative py-20 px-4">
        {/* existing hero content */}
        <TrackedButton
          onClick={() => {
            trackHero('cta_click', 'Request Beta Access');
            analytics.trackConversionStep('Primary CTA Clicked', 'Home');
          }}
          trackingData={{
            button_text: 'Request Paid Beta Access',
            button_location: 'hero',
            page_name: 'Home',
            is_primary_cta: true
          }}
        >
          Request Paid Beta Access
        </TrackedButton>
      </section>

      {/* Problems Section - ADD REF */}
      <section ref={problemsRef} className="py-20 bg-gray-800/50">
        {/* existing problems content */}
      </section>

      {/* Features Section - ADD REF */}
      <section ref={featuresRef} className="py-20">
        {/* existing features content */}
      </section>
    </div>
  );
}
```

## 📈 Expected Results

With this implementation, you'll be able to answer:

### Customer Discovery Questions
- ✅ Which sections drive the most interest?
- ✅ How long do engaged users spend on each section?
- ✅ What's the typical path of high-intent users?
- ✅ Which features get the most attention?
- ✅ Where do users drop off in the funnel?

### Sales Playbook Data
- ✅ Behavioral profile of "ready to buy" users
- ✅ Average time from landing to showing intent
- ✅ Most common intent signal combinations
- ✅ Which content sections correlate with conversions
- ✅ Optimal follow-up timing based on engagement patterns

## 🤝 Need Help?

If you see errors or tracking isn't working:
1. Check browser console for analytics errors
2. Visit `/analytics-test` page to verify Mixpanel connection
3. Use Mixpanel live view to see events in real-time
4. Verify VITE_MIXPANEL_TOKEN is set in `.env.development`
