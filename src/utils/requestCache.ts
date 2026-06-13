/**
 * Request Deduplication & Caching Utility
 *
 * Prevents duplicate API calls by caching in-flight promises and results.
 * Reduces unnecessary network requests and improves performance.
 */

interface CacheEntry<T> {
  promise: Promise<T>
  result?: T
  timestamp: number
  isResolved: boolean
}

const cache = new Map<string, CacheEntry<any>>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const DEBUG = import.meta.env.DEV // Only log in development

/**
 * Deduplicates requests by caching promises and results
 *
 * @param key - Unique identifier for the request
 * @param fetcher - Function that performs the actual fetch
 * @param cacheDuration - Custom cache duration in ms (default: 5 minutes)
 * @returns Promise that resolves to cached or fresh data
 *
 * @example
 * const org = await dedupeRequest(
 *   `org:${slug}`,
 *   () => organizationsApi.getBySlug(slug)
 * )
 */
export function dedupeRequest<T>(
  key: string,
  fetcher: () => Promise<T>,
  cacheDuration: number = CACHE_DURATION,
): Promise<T> {
  const now = Date.now()
  const cached = cache.get(key)

  // Return cached result if still valid
  if (cached && cached.isResolved && cached.result !== undefined) {
    const age = now - cached.timestamp
    if (age < cacheDuration) {
      if (DEBUG) {
        console.log(`🔄 Cache HIT (${key}): ${Math.round(age / 1000)}s old`)
      }
      return Promise.resolve(cached.result)
    } else {
      if (DEBUG) {
        console.log(`⏰ Cache EXPIRED (${key}): ${Math.round(age / 1000)}s old`)
      }
      cache.delete(key)
    }
  }

  // Return in-flight promise if exists
  if (cached && !cached.isResolved) {
    if (DEBUG) {
      console.log(`⏳ Request IN-FLIGHT (${key}): Reusing promise`)
    }
    return cached.promise
  }

  // Create new request
  if (DEBUG) {
    console.log(`🌐 Cache MISS (${key}): Fetching fresh data`)
  }

  const promise = fetcher().then(
    (result) => {
      // Update cache entry with result
      const entry = cache.get(key)
      if (entry) {
        entry.result = result
        entry.isResolved = true
      }
      return result
    },
    (error) => {
      // Remove failed request from cache
      cache.delete(key)
      throw error
    },
  )

  cache.set(key, {
    promise,
    timestamp: now,
    isResolved: false,
  })

  // Auto-cleanup after cache duration
  setTimeout(() => {
    const entry = cache.get(key)
    if (entry && now === entry.timestamp) {
      if (DEBUG) {
        console.log(`🗑️  Cache CLEANUP (${key})`)
      }
      cache.delete(key)
    }
  }, cacheDuration)

  return promise
}

/**
 * Manually invalidate cache for a specific key
 * Useful when data is known to have changed (e.g., after update/delete)
 *
 * @example
 * await updateOrganization(orgId, changes)
 * invalidateCache(`org:${orgSlug}`) // Force fresh fetch next time
 */
export function invalidateCache(key: string): void {
  if (DEBUG) {
    console.log(`❌ Cache INVALIDATE (${key})`)
  }
  cache.delete(key)
}

/**
 * Invalidate all cache entries matching a pattern
 *
 * @example
 * invalidateCachePattern('org:') // Clear all org caches
 */
export function invalidateCachePattern(pattern: string): void {
  let count = 0
  for (const key of cache.keys()) {
    if (key.startsWith(pattern)) {
      cache.delete(key)
      count++
    }
  }
  if (DEBUG) {
    console.log(`❌ Cache INVALIDATE PATTERN (${pattern}*): ${count} entries`)
  }
}

/**
 * Clear all cache entries
 */
export function clearCache(): void {
  const count = cache.size
  cache.clear()
  if (DEBUG) {
    console.log(`❌ Cache CLEAR ALL: ${count} entries`)
  }
}

/**
 * Get cache statistics (for debugging)
 */
export function getCacheStats() {
  const now = Date.now()
  const entries = Array.from(cache.entries())

  return {
    total: entries.length,
    resolved: entries.filter(([_, v]) => v.isResolved).length,
    pending: entries.filter(([_, v]) => !v.isResolved).length,
    expired: entries.filter(([_, v]) => now - v.timestamp > CACHE_DURATION).length,
    entries: entries.map(([key, value]) => ({
      key,
      age: Math.round((now - value.timestamp) / 1000),
      isResolved: value.isResolved,
      hasResult: value.result !== undefined,
    })),
  }
}

// Expose cache stats globally in development
if (DEBUG && typeof window !== 'undefined') {
  ;(window as any).__requestCache = {
    stats: getCacheStats,
    invalidate: invalidateCache,
    clear: clearCache,
  }
}
