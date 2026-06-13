/**
 * Form Persistence Utility
 * Auto-saves form data to localStorage to prevent data loss
 */

const STORAGE_PREFIX = 'voxxy_form_'
const AUTO_SAVE_INTERVAL = 30000 // 30 seconds

export interface FormDataToSave {
  [key: string]: any
  _timestamp?: number
  _formId?: string
}

/**
 * Save form data to localStorage
 */
export function saveFormData(formId: string, data: FormDataToSave): void {
  try {
    const storageKey = `${STORAGE_PREFIX}${formId}`
    const dataToSave = {
      ...data,
      _timestamp: Date.now(),
      _formId: formId,
    }
    localStorage.setItem(storageKey, JSON.stringify(dataToSave))
  } catch (error) {
    console.error('Failed to save form data:', error)
  }
}

/**
 * Load form data from localStorage
 */
export function loadFormData(formId: string): FormDataToSave | null {
  try {
    const storageKey = `${STORAGE_PREFIX}${formId}`
    const saved = localStorage.getItem(storageKey)

    if (!saved) return null

    const data = JSON.parse(saved)

    // Check if data is too old (older than 7 days)
    const MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days
    if (data._timestamp && Date.now() - data._timestamp > MAX_AGE) {
      clearFormData(formId)
      return null
    }

    return data
  } catch (error) {
    console.error('Failed to load form data:', error)
    return null
  }
}

/**
 * Clear saved form data
 */
export function clearFormData(formId: string): void {
  try {
    const storageKey = `${STORAGE_PREFIX}${formId}`
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.error('Failed to clear form data:', error)
  }
}

/**
 * Check if saved data exists for a form
 */
export function hasSavedData(formId: string): boolean {
  const data = loadFormData(formId)
  return data !== null
}

/**
 * Get formatted timestamp of saved data
 */
export function getSavedDataTimestamp(formId: string): string | null {
  const data = loadFormData(formId)
  if (!data || !data._timestamp) return null

  const date = new Date(data._timestamp)
  return date.toLocaleString()
}

/**
 * Hook for auto-saving form data
 * Returns a save function that should be called on form changes
 */
export function useAutoSave(formId: string, interval: number = AUTO_SAVE_INTERVAL) {
  let timeoutId: NodeJS.Timeout | null = null

  const scheduleAutoSave = (data: FormDataToSave) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      saveFormData(formId, data)
      console.log(`[AutoSave] Form data saved at ${new Date().toLocaleTimeString()}`)
    }, interval)
  }

  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }

  return { scheduleAutoSave, cleanup }
}

/**
 * Retry utility with exponential backoff
 */
export interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  onRetry?: (attempt: number, error: any) => void
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { maxAttempts = 3, baseDelay = 2000, maxDelay = 10000, onRetry } = options

  let lastError: any

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt === maxAttempts) {
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay)

      console.log(`[Retry] Attempt ${attempt} failed, retrying in ${delay}ms...`)

      if (onRetry) {
        onRetry(attempt, error)
      }

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Check if error is retryable (network error, timeout, 5xx status)
 */
export function isRetryableError(error: any): boolean {
  // Network errors
  if (!error.status && error.message) {
    const msg = error.message.toLowerCase()
    return (
      msg.includes('network') ||
      msg.includes('timeout') ||
      msg.includes('fetch') ||
      msg.includes('connection')
    )
  }

  // HTTP status codes
  if (error.status) {
    // 5xx server errors are retryable
    if (error.status >= 500 && error.status < 600) {
      return true
    }
    // 408 Request Timeout
    if (error.status === 408) {
      return true
    }
    // 429 Too Many Requests (rate limit)
    if (error.status === 429) {
      return true
    }
  }

  return false
}
