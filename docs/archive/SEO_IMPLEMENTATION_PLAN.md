# SEO Implementation Plan - Event Producer Focus

**Last Updated:** 2025-01-10
**Status:** Ready to Execute

---

## Overview

This plan updates the Voxxy Presents SEO strategy to focus on the new **event producer** and **vendor coordination** positioning (vs. the old "club organizer" positioning).

---

## Phase 1: Foundation (Week 1) - CRITICAL

### 1. Install React Helmet Async

```bash
npm install react-helmet-async
```

Update `src/main.tsx`:

```tsx
import { HelmetProvider } from 'react-helmet-async'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
)
```

### 2. Add SEO Meta Tags to Each Page

#### HomePage (`/`)

**Target Keywords:** "recurring event producer tools", "vendor coordination software", "event vendor management"

```tsx
import { Helmet } from 'react-helmet-async'
;<Helmet>
  <title>Voxxy Presents - Vendor Coordination Software for Event Producers</title>
  <meta
    name="description"
    content="Stop coordinating, start producing. Unified vendor communication, fast application review, and automated logistics for recurring event producers. Manage vendors, not spreadsheets."
  />
  <meta
    name="keywords"
    content="event producer tools, vendor coordination software, event vendor management, vendor CRM, application review, recurring events, market coordination"
  />
  <link rel="canonical" href="https://www.voxxypresents.com/" />

  {/* Open Graph */}
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.voxxypresents.com/" />
  <meta property="og:title" content="Voxxy Presents - Vendor Coordination for Event Producers" />
  <meta
    property="og:description"
    content="Unified vendor communication, fast application review, automated logistics. Built for recurring event producers."
  />
  <meta property="og:image" content="https://www.voxxypresents.com/og-home.jpg" />
</Helmet>
```

#### FeaturesPage (`/features`)

**Target Keywords:** "vendor CRM for events", "application review software", "vendor communication hub"

```tsx
<Helmet>
  <title>Features - Event Vendor Management Tools | Voxxy Presents</title>
  <meta
    name="description"
    content="Unified vendor communication hub, vendor CRM across events, side-by-side application review, and email automation. Everything event producers need to scale."
  />
  <meta
    name="keywords"
    content="vendor CRM, application review software, vendor communication, email automation, event producer tools, vendor management platform"
  />
  <link rel="canonical" href="https://www.voxxypresents.com/features" />

  <meta property="og:title" content="Event Vendor Management Features | Voxxy Presents" />
  <meta
    property="og:description"
    content="Vendor CRM, application review, unified communication, and automation. Built for event producers."
  />
  <meta property="og:image" content="https://www.voxxypresents.com/og-features.jpg" />
</Helmet>
```

#### ContactPage (`/contact`)

**Target Keywords:** "event producer software demo", "vendor management platform trial"

```tsx
<Helmet>
  <title>Request Pilot Access - Event Producer Software | Voxxy Presents</title>
  <meta
    name="description"
    content="Join 5 event producers in our pilot program. $15/month for years 1-2. Vendor coordination tools, CRM, and automation. Limited spots available."
  />
  <meta
    name="keywords"
    content="event producer software, vendor management platform, event coordination demo, pilot program, vendor CRM trial"
  />
  <link rel="canonical" href="https://www.voxxypresents.com/contact" />
</Helmet>
```

#### HelpPage (`/help`)

**Target Keywords:** "event producer support", "vendor coordination help", "how to use voxxy"

```tsx
<Helmet>
  <title>Help Center - Event Producer Support | Voxxy Presents</title>
  <meta
    name="description"
    content="Get help with vendor coordination, application review, and event logistics. 24-48 hour response time. We're accepting 5 producers into our pilot program."
  />
  <meta
    name="keywords"
    content="event producer support, vendor coordination help, voxxy help center, event management tutorials"
  />
  <link rel="canonical" href="https://www.voxxypresents.com/help" />
</Helmet>
```

### 3. Update Sitemap.xml

**Location:** `/public/sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.voxxypresents.com/</loc>
    <lastmod>2025-01-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.voxxypresents.com/features</loc>
    <lastmod>2025-01-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.voxxypresents.com/contact</loc>
    <lastmod>2025-01-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.voxxypresents.com/help</loc>
    <lastmod>2025-01-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

**NOTE:** Removed `/pricing` page (no longer exists)

### 4. Verify Robots.txt Exists

**Location:** `/public/robots.txt`

```txt
# Allow all bots
User-agent: *
Allow: /

# Block private pages
Disallow: /admin/
Disallow: /profile/
Disallow: /dashboard/
Disallow: /organizer/
Disallow: /vendor/
Disallow: /beta-pending

# Sitemap location
Sitemap: https://www.voxxypresents.com/sitemap.xml
```

### 5. Submit to Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Verify ownership of `voxxypresents.com`
3. Submit sitemap: `https://www.voxxypresents.com/sitemap.xml`
4. Monitor indexing status

---

## Phase 2: Structured Data (Week 2)

### Add JSON-LD Schema to HomePage

```tsx
<Helmet>
  <script type="application/ld+json">
    {JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Voxxy Presents',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'Vendor coordination software for recurring event producers. Unified communication hub, vendor CRM, application review, and email automation.',
      url: 'https://www.voxxypresents.com',
      offers: {
        '@type': 'Offer',
        price: '15',
        priceCurrency: 'USD',
        priceValidUntil: '2027-01-10',
        availability: 'https://schema.org/LimitedAvailability',
        description: 'Pilot program pricing - locked in for years 1-2',
      },
      featureList: [
        'Unified vendor communication hub',
        'Vendor CRM across all events',
        'Fast application review',
        'Email automation',
        'CSV import for vendor lists',
      ],
    })}
  </script>

  <script type="application/ld+json">
    {JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Voxxy, Inc.',
      url: 'https://www.voxxypresents.com',
      logo: 'https://www.voxxypresents.com/voxxy-logo.png',
      description:
        'Event infrastructure for recurring event producers. We handle vendor coordination so you can focus on creating experiences.',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'team@voxxypresents.com',
        contactType: 'Customer Service',
        areaServed: 'US',
        availableLanguage: 'English',
      },
    })}
  </script>
</Helmet>
```

---

## Phase 3: Content & Optimization (Weeks 3-4)

### 1. Add Alt Text to All Images

Audit all `<img>` tags and add descriptive alt text:

```tsx
{
  /* Example: Hero image */
}
;<img
  src="/hero-vendor-coordination.jpg"
  alt="Event producer reviewing vendor applications in Voxxy Presents dashboard"
  loading="lazy"
/>

{
  /* Example: Feature image */
}
;<img
  src="/feature-communication-hub.jpg"
  alt="Unified vendor communication hub showing message threads from multiple vendors"
  loading="lazy"
/>
```

### 2. Create Initial Blog Posts

**Target 3 posts in Month 1:**

1. **"Stop Using Spreadsheets for Vendor Coordination"**
   - Keywords: vendor coordination software, vendor management spreadsheet alternative
   - Target: Event producers frustrated with manual work
   - Include: Screenshots of Voxxy vendor CRM

2. **"How to Review 200+ Vendor Applications in Hours, Not Days"**
   - Keywords: vendor application review, side-by-side portfolio comparison
   - Target: Market organizers drowning in applications
   - Include: Tips + Voxxy fast review feature

3. **"The Hidden Cost of Scattered Vendor Communication"**
   - Keywords: vendor communication chaos, unified messaging for events
   - Target: Producers juggling texts, emails, DMs
   - Include: ROI of centralized communication

### 3. Run Page Speed Test

1. Visit [PageSpeed Insights](https://pagespeed.web.dev/)
2. Test: `https://www.voxxypresents.com`
3. **Target:** 90+ score on mobile and desktop
4. Fix critical issues (if any):
   - Optimize images (convert to WebP)
   - Enable lazy loading
   - Reduce bundle size

---

## Phase 4: Marketing & Growth (Month 2+)

### Target Keywords (Priority Order)

**Primary (High Competition):**

1. "event producer tools" - 1,600 searches/mo
2. "vendor management software" - 3,200 searches/mo
3. "recurring event management" - 890 searches/mo

**Secondary (Medium Competition):**

1. "vendor CRM for events" - 320 searches/mo
2. "application review software" - 480 searches/mo
3. "vendor coordination platform" - 210 searches/mo

**Long-Tail (Low Competition - Easy Wins):**

1. "how to manage vendor applications for markets" - 140 searches/mo
2. "vendor communication tools for events" - 95 searches/mo
3. "event vendor database software" - 70 searches/mo
4. "Brooklyn market vendor coordination" - 30 searches/mo

### Content Calendar (Month 2-4)

**Week 1:** "5 Signs You've Outgrown Spreadsheets for Vendor Management"
**Week 2:** "Vendor CRM vs. Spreadsheets: ROI Calculator"
**Week 3:** "How Top Market Producers Screen 500+ Vendor Applications"
**Week 4:** Case Study - "How [Producer Name] Cut Vendor Coordination Time by 80%"

### Link Building Strategy

**Month 2-3:**

1. **Event industry directories** - Submit to EventMB, Eventbrite alternatives lists
2. **SaaS review sites** - Capterra, G2, Software Advice (free listings)
3. **Guest posts** - Reach out to event planning blogs
4. **Partner mentions** - Cross-promotion with venue software

**Month 4-6:**

1. **Press outreach** - TechCrunch, ProductHunt launch
2. **Podcast appearances** - Event industry podcasts
3. **Community building** - Reddit (r/events), Facebook groups for producers

### Local SEO (Brooklyn/NYC Focus)

**Create location pages:**

- `/markets/brooklyn` - "Brooklyn Market Vendor Management"
- `/markets/nyc` - "NYC Recurring Event Coordination"
- `/markets/queens` - "Queens Market Producer Tools"

**Google Business Profile:**

- Set up for "Voxxy, Inc."
- Category: "Software Company" + "Event Management Company"
- Service areas: Brooklyn, Manhattan, Queens
- Photos: Team, events, product screenshots

---

## Success Metrics

### Month 1 Goals:

- ✅ Meta tags on all pages
- ✅ Sitemap submitted to Google
- ✅ 3 blog posts published
- 📊 Target: 50-100 impressions in Search Console

### Month 3 Goals:

- 📊 Target: 500+ impressions/month
- 📊 Target: 50-100 clicks/month
- 📊 Rank for 5+ long-tail keywords (page 1-3)
- ✅ 10+ blog posts published

### Month 6 Goals:

- 📊 Target: 2,000+ impressions/month
- 📊 Target: 200-300 clicks/month
- 📊 Rank for "vendor CRM for events" (page 2-3)
- 📊 Rank for 3+ secondary keywords (page 1-2)
- ✅ 5-10 quality backlinks

---

## Tools to Use

**Free:**

- Google Search Console - Track rankings
- Google Analytics - Track traffic
- PageSpeed Insights - Test performance
- Ubersuggest - Keyword research (limited free)

**Paid (Recommended):**

- Ahrefs ($99/mo) - Keyword research, backlinks, competitor analysis
- Grammarly ($12/mo) - Blog content quality

---

## Quick Reference: Updated Positioning

### OLD (Before Refresh):

- Target: "Club organizers", "community builders"
- Keywords: "club event software", "community management"
- Pain points: RSVPs, venue coordination, member engagement

### NEW (After Refresh):

- Target: "Event producers", "market organizers"
- Keywords: "vendor coordination", "vendor CRM", "application review"
- Pain points: Vendor communication chaos, application bottleneck, manual work

---

## Next Steps

1. **Week 1:** Install React Helmet, add meta tags, update sitemap
2. **Week 2:** Add structured data, test page speed, fix issues
3. **Week 3-4:** Write 3 blog posts, add image alt text
4. **Month 2:** Start link building, create location pages

---

**Status:** Ready to execute. Prioritize Phase 1 (Week 1) for immediate impact on search visibility.
