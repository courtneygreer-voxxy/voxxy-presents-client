/**
 * Rate-limited fetch wrapper
 * Provides client-side rate limiting for API calls
 */

import { apiRateLimiter, formSubmissionRateLimiter } from './rateLimiter'

interface RateLimitedFetchOptions extends RequestInit {
  skipRateLimit?: boolean
  rateLimitKey?: string
  isFormSubmission?: boolean
}

/**
 * Rate-limited fetch wrapper
 */
export async function rateLimitedFetch(
  url: string | URL,
  options: RateLimitedFetchOptions = {},
): Promise<Response> {
  const { skipRateLimit, rateLimitKey, isFormSubmission, ...fetchOptions } = options

  if (!skipRateLimit) {
    const limiter = isFormSubmission ? formSubmissionRateLimiter : apiRateLimiter
    const key = rateLimitKey || `fetch:${url.toString()}`

    if (!limiter.isAllowed(key)) {
      const timeUntilReset = limiter.getTimeUntilReset(key)
      throw new Error(
        `Rate limit exceeded. Please wait ${timeUntilReset} seconds before trying again.`,
      )
    }
  }

  try {
    const response = await fetch(url, fetchOptions)
    return response
  } catch (error) {
    // If network error, don't count against rate limit
    if (error instanceof TypeError) {
      const limiter = isFormSubmission ? formSubmissionRateLimiter : apiRateLimiter
      const key = rateLimitKey || `fetch:${url.toString()}`
      limiter.reset(key) // Reset on network error
    }
    throw error
  }
}

/**
 * Rate-limited JSON fetch wrapper
 */
export async function rateLimitedFetchJson<T = any>(
  url: string | URL,
  options: RateLimitedFetchOptions = {},
): Promise<T> {
  const response = await rateLimitedFetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Rate-limited POST wrapper for form submissions
 */
export async function rateLimitedPost<T = any>(
  url: string | URL,
  data: any,
  options: RateLimitedFetchOptions = {},
): Promise<T> {
  return rateLimitedFetchJson<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
    isFormSubmission: true,
  })
}
