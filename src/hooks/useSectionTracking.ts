import { useEffect, useRef } from 'react';
import { analytics } from '@/lib/analytics';

interface SectionTrackingOptions {
  pageName: string;
  sectionName: string;
  threshold?: number; // Percentage of section visible to trigger entry (default 50%)
  trackScrollDepth?: boolean;
}

/**
 * Hook to automatically track section engagement using Intersection Observer
 * Tracks when users enter/exit sections and calculates engagement metrics
 */
export const useSectionTracking = (options: SectionTrackingOptions) => {
  const { pageName, sectionName, threshold = 0.5, trackScrollDepth = true } = options;
  const sectionRef = useRef<HTMLElement>(null);
  const isVisibleRef = useRef(false);
  const scrollCheckInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Create Intersection Observer to detect when section enters/exits viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisibleRef.current) {
            // Section entered viewport
            isVisibleRef.current = true;
            analytics.trackSectionEntry(sectionName, pageName);

            // Start tracking scroll depth within section if enabled
            if (trackScrollDepth) {
              scrollCheckInterval.current = setInterval(() => {
                const scrollDepth = calculateScrollDepthInSection(section);
                analytics.updateSectionScroll(sectionName, scrollDepth);
              }, 500);
            }
          } else if (!entry.isIntersecting && isVisibleRef.current) {
            // Section exited viewport
            isVisibleRef.current = false;
            const finalScrollDepth = calculateScrollDepthInSection(section);
            analytics.trackSectionExit(sectionName, pageName, finalScrollDepth);

            // Stop scroll tracking
            if (scrollCheckInterval.current) {
              clearInterval(scrollCheckInterval.current);
            }
          }
        });
      },
      {
        threshold: threshold,
        rootMargin: '0px',
      }
    );

    observer.observe(section);

    // Cleanup
    return () => {
      observer.disconnect();
      if (scrollCheckInterval.current) {
        clearInterval(scrollCheckInterval.current);
      }

      // Track exit if user was viewing when component unmounts
      if (isVisibleRef.current) {
        const finalScrollDepth = calculateScrollDepthInSection(section);
        analytics.trackSectionExit(sectionName, pageName, finalScrollDepth);
      }
    };
  }, [pageName, sectionName, threshold, trackScrollDepth]);

  // Helper to track interactions within the section
  const trackInteraction = (interactionType: string, elementName?: string) => {
    if (isVisibleRef.current) {
      analytics.trackSectionInteraction(sectionName, interactionType, elementName);
    }
  };

  return {
    sectionRef,
    trackInteraction,
  };
};

/**
 * Calculate how much of a section has been scrolled through (0-100%)
 */
function calculateScrollDepthInSection(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  const elementHeight = rect.height;
  const windowHeight = window.innerHeight;

  // If element is taller than viewport
  if (elementHeight > windowHeight) {
    if (rect.top > 0) {
      // Haven't reached element yet
      return 0;
    } else if (rect.bottom < windowHeight) {
      // Scrolled past element
      return 100;
    } else {
      // Currently scrolling through element
      const visibleHeight = Math.min(windowHeight - rect.top, elementHeight);
      return Math.round((visibleHeight / elementHeight) * 100);
    }
  } else {
    // Element is smaller than viewport
    // Consider it "scrolled" based on how much is visible
    if (rect.top < 0 && rect.bottom > windowHeight) {
      return 100; // Fully visible
    } else if (rect.top >= 0 && rect.bottom <= windowHeight) {
      return 100; // Fully visible
    } else {
      const visibleHeight = Math.min(
        rect.bottom > windowHeight ? windowHeight - rect.top : rect.bottom,
        elementHeight
      );
      return Math.round((visibleHeight / elementHeight) * 100);
    }
  }
}
