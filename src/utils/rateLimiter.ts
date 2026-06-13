/**
 * Client-side rate limiting utility
 * Helps prevent API abuse and provides better user experience
 */

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number // Time window in milliseconds
  blockDurationMs?: number // How long to block after limit exceeded
}

interface RateLimitRecord {
  attempts: number
  windowStart: number
  blockedUntil?: number
}

export class RateLimiter {
  private storage: Map<string, RateLimitRecord> = new Map()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = {
      blockDurationMs: config.windowMs * 2, // Default: block for 2x the window
      ...config,
    }

    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000)
  }

  /**
   * Check if an action is allowed for a given key
   */
  isAllowed(key: string): boolean {
    const now = Date.now()
    const record = this.storage.get(key)

    // No previous record - allow
    if (!record) {
      this.storage.set(key, {
        attempts: 1,
        windowStart: now,
      })
      return true
    }

    // Check if currently blocked
    if (record.blockedUntil && now < record.blockedUntil) {
      return false
    }

    // Check if we're in a new time window
    if (now - record.windowStart > this.config.windowMs) {
      // Reset for new window
      this.storage.set(key, {
        attempts: 1,
        windowStart: now,
      })
      return true
    }

    // Check if within limits
    if (record.attempts < this.config.maxAttempts) {
      record.attempts++
      return true
    }

    // Limit exceeded - block
    record.blockedUntil = now + (this.config.blockDurationMs || this.config.windowMs)
    return false
  }

  /**
   * Get time remaining until next allowed attempt
   */
  getTimeUntilReset(key: string): number {
    const now = Date.now()
    const record = this.storage.get(key)

    if (!record) return 0

    // If blocked, return time until unblocked
    if (record.blockedUntil && now < record.blockedUntil) {
      return Math.ceil((record.blockedUntil - now) / 1000)
    }

    // If in current window and at limit, return time until window reset
    if (record.attempts >= this.config.maxAttempts) {
      const windowEnd = record.windowStart + this.config.windowMs
      if (now < windowEnd) {
        return Math.ceil((windowEnd - now) / 1000)
      }
    }

    return 0
  }

  /**
   * Get remaining attempts in current window
   */
  getRemainingAttempts(key: string): number {
    const record = this.storage.get(key)
    if (!record) return this.config.maxAttempts

    const now = Date.now()

    // If blocked or window expired, return max attempts
    if (
      (record.blockedUntil && now < record.blockedUntil) ||
      now - record.windowStart > this.config.windowMs
    ) {
      return 0
    }

    return Math.max(0, this.config.maxAttempts - record.attempts)
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.storage.delete(key)
  }

  /**
   * Clean up expired records
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.storage.forEach((record, key) => {
      // Remove if window expired and not blocked, or if block expired
      const windowExpired = now - record.windowStart > this.config.windowMs
      const blockExpired = !record.blockedUntil || now > record.blockedUntil

      if (windowExpired && blockExpired) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach((key) => this.storage.delete(key))
  }
}

// Pre-configured rate limiters for common use cases
export const authRateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes
})

export const apiRateLimiter = new RateLimiter({
  maxAttempts: 60,
  windowMs: 60 * 1000, // 1 minute
  blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes
})

export const emailRateLimiter = new RateLimiter({
  maxAttempts: 3,
  windowMs: 5 * 60 * 1000, // 5 minutes
  blockDurationMs: 15 * 60 * 1000, // Block for 15 minutes
})

export const formSubmissionRateLimiter = new RateLimiter({
  maxAttempts: 10,
  windowMs: 60 * 1000, // 1 minute
  blockDurationMs: 2 * 60 * 1000, // Block for 2 minutes
})

/**
 * Rate limit decorator for functions
 */
export function rateLimit(limiter: RateLimiter, keyGenerator?: (args: any[]) => string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = function (...args: any[]) {
      const key = keyGenerator ? keyGenerator(args) : `${target.constructor.name}.${propertyName}`

      if (!limiter.isAllowed(key)) {
        const timeUntilReset = limiter.getTimeUntilReset(key)
        throw new Error(`Rate limit exceeded. Try again in ${timeUntilReset} seconds.`)
      }

      return method.apply(this, args)
    }
  }
}
