/**
 * Cache utility for storing data with TTL (Time To Live) in localStorage
 * Helps improve performance by reducing redundant API/database calls
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

/**
 * Cache a value in localStorage with a TTL
 * @param key - Cache key
 * @param value - Value to cache
 * @param ttl - Time to live in milliseconds (default: 5 minutes)
 */
export function setCache<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
  try {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
    }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch (error) {
    // Handle QuotaExceededError by clearing old cache and retrying
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      try {
        // Clear expired cache entries first
        cleanupExpiredCacheSync()
        // Clear all user profile caches (they'll be refetched)
        clearCacheByPrefix('user_profile_')
        // Retry the save
        const entry: CacheEntry<T> = {
          data: value,
          timestamp: Date.now(),
          ttl,
        }
        localStorage.setItem(key, JSON.stringify(entry))
      } catch {
        // Still failed - silently give up, caching is optional
      }
    }
    // Silently fail for other errors - caching is optional
  }
}

/**
 * Synchronous version of cleanup for use in error recovery
 */
function cleanupExpiredCacheSync(): void {
  const keys = Object.keys(localStorage)
  keys.forEach((key) => {
    try {
      const item = localStorage.getItem(key)
      if (!item) return

      const entry: CacheEntry<any> = JSON.parse(item)
      if (entry.timestamp && entry.ttl) {
        const now = Date.now()
        const isExpired = now - entry.timestamp > entry.ttl
        if (isExpired) {
          localStorage.removeItem(key)
        }
      }
    } catch {
      // Skip non-cache items
    }
  })
}

/**
 * Get a cached value from localStorage
 * Returns null if not found or expired
 * @param key - Cache key
 * @returns Cached value or null
 */
export function getCache<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key)
    if (!item) return null

    const entry: CacheEntry<T> = JSON.parse(item)
    const now = Date.now()
    const isExpired = now - entry.timestamp > entry.ttl

    if (isExpired) {
      localStorage.removeItem(key)
      return null
    }

    return entry.data
  } catch (error) {
    console.warn('Failed to get cache:', error)
    return null
  }
}

/**
 * Remove a cached value
 * @param key - Cache key
 */
export function removeCache(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn('Failed to remove cache:', error)
  }
}

/**
 * Clear all cached values with a specific prefix
 * @param prefix - Key prefix to match
 */
export function clearCacheByPrefix(prefix: string): void {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.warn('Failed to clear cache by prefix:', error)
  }
}

/**
 * Clear all expired cache entries
 */
export function cleanupExpiredCache(): void {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      try {
        const item = localStorage.getItem(key)
        if (!item) return

        const entry: CacheEntry<any> = JSON.parse(item)
        if (entry.timestamp && entry.ttl) {
          const now = Date.now()
          const isExpired = now - entry.timestamp > entry.ttl
          if (isExpired) {
            localStorage.removeItem(key)
          }
        }
      } catch {
        // Skip non-cache items
      }
    })
  } catch (error) {
    console.warn('Failed to cleanup expired cache:', error)
  }
}

// User Profile Caching Helpers
const USER_PROFILE_PREFIX = 'user_profile_'
const DEFAULT_PROFILE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Cache a user profile
 * @param uid - User ID
 * @param profile - User profile data
 */
export function cacheUserProfile<T>(uid: string, profile: T): void {
  setCache(`${USER_PROFILE_PREFIX}${uid}`, profile, DEFAULT_PROFILE_TTL)
}

/**
 * Get a cached user profile
 * @param uid - User ID
 * @returns Cached profile or null
 */
export function getCachedUserProfile<T>(uid: string): T | null {
  return getCache<T>(`${USER_PROFILE_PREFIX}${uid}`)
}

/**
 * Remove a cached user profile
 * @param uid - User ID
 */
export function removeCachedUserProfile(uid: string): void {
  removeCache(`${USER_PROFILE_PREFIX}${uid}`)
}

/**
 * Clear all cached user profiles
 */
export function clearAllUserProfiles(): void {
  clearCacheByPrefix(USER_PROFILE_PREFIX)
}

// Run cleanup on module load
cleanupExpiredCache()
