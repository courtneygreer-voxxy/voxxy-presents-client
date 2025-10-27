/**
 * Performance Tracking Utility
 *
 * Tracks page load times, API call durations, and user interactions
 * Sends data to Mixpanel for analysis and monitoring
 */

import { analytics } from '@/lib/analytics'

// Track performance marks
const performanceMarks = new Map<string, number>()

/**
 * Track page load performance
 * Automatically measures from navigation start to current time
 */
export function trackPageLoad(pageName: string, metadata?: Record<string, any>) {
  if (typeof performance === 'undefined') return

  const loadTime = performance.now()

  // Get navigation timing if available
  const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

  const metrics: Record<string, any> = {
    page: pageName,
    load_time_ms: Math.round(loadTime),
    timestamp: new Date().toISOString(),
    ...metadata
  }

  // Add core web vitals if available
  if (navTiming) {
    metrics.dns_time_ms = Math.round(navTiming.domainLookupEnd - navTiming.domainLookupStart)
    metrics.tcp_time_ms = Math.round(navTiming.connectEnd - navTiming.connectStart)
    metrics.request_time_ms = Math.round(navTiming.responseEnd - navTiming.requestStart)
    metrics.dom_interactive_ms = Math.round(navTiming.domInteractive)
    metrics.dom_complete_ms = Math.round(navTiming.domComplete)
    metrics.load_complete_ms = Math.round(navTiming.loadEventEnd)
  }

  analytics.track('page_load_performance', metrics)

  if (import.meta.env.DEV) {
    console.log(`📊 Page Load: ${pageName} - ${Math.round(loadTime)}ms`, metrics)
  }
}

/**
 * React hook for automatic page load tracking
 * Usage: import { usePageLoadTracking } from '@/utils/performanceTracking'
 *        usePageLoadTracking('public_org_page')
 *
 * Note: Import React's useEffect in your component, don't use this directly
 * This is just a helper function, not a real hook
 */
export function createPageLoadTracker(pageName: string, metadata?: Record<string, any>) {
  return {
    start: performance.now(),
    trackOnUnmount: () => {
      const loadTime = performance.now() - performance.now()
      trackPageLoad(pageName, { ...metadata, component_mount_time_ms: Math.round(loadTime) })
    }
  }
}

/**
 * Start measuring a custom performance metric
 * Call markEnd() to complete the measurement
 */
export function markStart(name: string): void {
  performanceMarks.set(name, performance.now())

  if (import.meta.env.DEV) {
    console.log(`⏱️  Performance Mark START: ${name}`)
  }
}

/**
 * End a performance measurement and track it
 */
export function markEnd(name: string, metadata?: Record<string, any>): number | null {
  const startTime = performanceMarks.get(name)

  if (!startTime) {
    console.warn(`Performance mark "${name}" not found. Did you call markStart()?`)
    return null
  }

  const duration = performance.now() - startTime
  performanceMarks.delete(name)

  analytics.track('custom_performance_metric', {
    metric_name: name,
    duration_ms: Math.round(duration),
    timestamp: new Date().toISOString(),
    ...metadata
  })

  if (import.meta.env.DEV) {
    console.log(`⏱️  Performance Mark END: ${name} - ${Math.round(duration)}ms`, metadata)
  }

  return duration
}

/**
 * Track API call performance
 * Wraps a fetch/axios call and measures duration
 */
export async function trackApiCall<T>(
  endpoint: string,
  fetcher: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = performance.now()

  try {
    const result = await fetcher()
    const duration = performance.now() - startTime

    analytics.track('api_call_performance', {
      endpoint,
      duration_ms: Math.round(duration),
      status: 'success',
      timestamp: new Date().toISOString(),
      ...metadata
    })

    if (import.meta.env.DEV) {
      console.log(`🌐 API Call: ${endpoint} - ${Math.round(duration)}ms [SUCCESS]`)
    }

    return result
  } catch (error) {
    const duration = performance.now() - startTime

    analytics.track('api_call_performance', {
      endpoint,
      duration_ms: Math.round(duration),
      status: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      ...metadata
    })

    if (import.meta.env.DEV) {
      console.error(`🌐 API Call: ${endpoint} - ${Math.round(duration)}ms [ERROR]`, error)
    }

    throw error
  }
}

/**
 * Track user interaction performance
 * Useful for measuring click-to-action times
 */
export function trackInteraction(
  interactionName: string,
  duration: number,
  metadata?: Record<string, any>
): void {
  analytics.track('user_interaction_performance', {
    interaction: interactionName,
    duration_ms: Math.round(duration),
    timestamp: new Date().toISOString(),
    ...metadata
  })

  if (import.meta.env.DEV) {
    console.log(`👆 Interaction: ${interactionName} - ${Math.round(duration)}ms`)
  }
}

/**
 * Track Core Web Vitals using browser APIs
 * Automatically captures FCP, LCP, FID, CLS when available
 */
export function trackCoreWebVitals(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return
  }

  try {
    // First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        analytics.track('core_web_vital', {
          metric: 'FCP',
          value: Math.round(entry.startTime),
          timestamp: new Date().toISOString()
        })

        if (import.meta.env.DEV) {
          console.log(`📈 FCP: ${Math.round(entry.startTime)}ms`)
        }
      }
    })
    fcpObserver.observe({ entryTypes: ['paint'] })

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]

      analytics.track('core_web_vital', {
        metric: 'LCP',
        value: Math.round(lastEntry.startTime),
        timestamp: new Date().toISOString()
      })

      if (import.meta.env.DEV) {
        console.log(`📈 LCP: ${Math.round(lastEntry.startTime)}ms`)
      }
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      }
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })

    // Report CLS on page hide
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        analytics.track('core_web_vital', {
          metric: 'CLS',
          value: clsValue,
          timestamp: new Date().toISOString()
        })

        if (import.meta.env.DEV) {
          console.log(`📈 CLS: ${clsValue.toFixed(3)}`)
        }
      }
    }, { once: true })
  } catch (error) {
    console.error('Error tracking Core Web Vitals:', error)
  }
}

/**
 * Initialize performance tracking
 * Call this once on app startup
 *
 * NOTE: Currently DISABLED in production to avoid cluttering Mixpanel reports
 * These technical metrics are useful for development but not for business analytics
 */
export function initPerformanceTracking(): void {
  // Only track performance in development mode
  if (!import.meta.env.DEV) {
    console.log('📊 Performance tracking disabled in production')
    return
  }

  // Track core web vitals
  trackCoreWebVitals()

  // Track initial page load
  if (document.readyState === 'complete') {
    trackPageLoad('app_init')
  } else {
    window.addEventListener('load', () => trackPageLoad('app_init'), { once: true })
  }

  console.log('📊 Performance tracking initialized (DEV mode only)')
}

// Only auto-initialize in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  initPerformanceTracking()
}
