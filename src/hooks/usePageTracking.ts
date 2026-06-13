import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { analytics } from '@/lib/analytics'

// Hook for automatic page view and scroll tracking
export const usePageTracking = (pageName: string) => {
  const location = useLocation()
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Track page view
    analytics.trackPageView({
      page_name: pageName,
      page_url: location.pathname + location.search,
      referrer: document.referrer,
    })

    // Track scroll depth
    const handleScroll = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100

      // Debounce scroll tracking
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      scrollTimeoutRef.current = setTimeout(() => {
        analytics.trackScroll(pageName, scrollPercent)
      }, 100)
    }

    // Track page engagement on unload
    const handleBeforeUnload = () => {
      analytics.trackPageEngagement(pageName)
    }

    // Add event listeners
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', handleBeforeUnload)

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Track engagement when component unmounts (navigation)
      analytics.trackPageEngagement(pageName)
    }
  }, [pageName, location])
}
