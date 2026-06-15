/**
 * Environment-aware logger utility
 *
 * Production: Only errors are logged
 * Development: Errors + info logs
 *
 * Usage:
 *   logger.error('Failed to save', { id: 123, error })  // Always logged
 *   logger.info('Email sent', { count: 5 })              // Dev only
 */

const isDev = import.meta.env.DEV

export const logger = {
  /**
   * Log errors (always logged in all environments)
   * Use for: API failures, exceptions, critical issues
   */
  error: (message: string, data?: Record<string, any>) => {
    if (data) {
      console.error(`[ERROR] ${message}`, data)
    } else {
      console.error(`[ERROR] ${message}`)
    }
  },

  /**
   * Log important events (dev only)
   * Use for: Email sent, saved, published - key business events
   */
  info: (message: string, data?: Record<string, any>) => {
    if (isDev) {
      if (data) {
        console.log(`[INFO] ${message}`, data)
      } else {
        console.log(`[INFO] ${message}`)
      }
    }
  },

  /**
   * Debug logging (dev only)
   * Use sparingly for temporary debugging
   */
  debug: (message: string, data?: Record<string, any>) => {
    if (isDev) {
      if (data) {
        console.log(`[DEBUG] ${message}`, data)
      } else {
        console.log(`[DEBUG] ${message}`)
      }
    }
  },
}
