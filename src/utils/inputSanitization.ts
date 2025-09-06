/**
 * Input sanitization utilities for preventing XSS and other security issues
 */

// Simple HTML entity encoding for basic XSS prevention
const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
}

/**
 * Escape HTML entities in a string
 */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"'\/]/g, (match) => htmlEntities[match] || match)
}

/**
 * Remove potentially dangerous characters and patterns
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  let sanitized = input

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')

  // Remove or escape common script injection patterns
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=/gi, '')
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim()

  // Escape remaining HTML entities
  sanitized = escapeHtml(sanitized)

  return sanitized
}

/**
 * Validate email format with additional security checks
 */
export function validateEmail(email: string): boolean {
  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    return false
  }

  // Additional security checks
  const sanitized = sanitizeInput(email.toLowerCase().trim())
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\./,  // Double dots
    /@.*@/,  // Multiple @ symbols
    /^[.-]/,  // Starting with dot or dash
    /[.-]$/,  // Ending with dot or dash
    /[<>]/,   // Angle brackets
  ]

  return !suspiciousPatterns.some(pattern => pattern.test(sanitized))
}

/**
 * Validate name input
 */
export function validateName(name: string): boolean {
  if (typeof name !== 'string' || name.trim().length < 2) {
    return false
  }

  const sanitized = sanitizeInput(name.trim())
  
  // Check length limits
  if (sanitized.length < 2 || sanitized.length > 100) {
    return false
  }

  // Only allow letters, spaces, apostrophes, and hyphens
  const nameRegex = /^[a-zA-Z\s'-]+$/
  return nameRegex.test(sanitized)
}

/**
 * Validate message content
 */
export function validateMessage(message: string): boolean {
  if (typeof message !== 'string') {
    return true // Message is optional
  }

  const sanitized = sanitizeInput(message.trim())
  
  // Check length limits
  if (sanitized.length > 500) {
    return false
  }

  // Check for excessive special characters (potential spam)
  const specialCharCount = (sanitized.match(/[!@#$%^&*(),.?":{}|<>]/g) || []).length
  const ratio = specialCharCount / sanitized.length
  
  // If more than 30% special characters, likely spam
  if (ratio > 0.3) {
    return false
  }

  return true
}

/**
 * Detect potentially malicious content patterns
 */
export function detectMaliciousContent(text: string): string[] {
  const issues: string[] = []
  const lowerText = text.toLowerCase()

  // Check for script injection attempts
  if (lowerText.includes('<script') || lowerText.includes('javascript:')) {
    issues.push('Script injection attempt detected')
  }

  // Check for SQL injection patterns
  const sqlPatterns = ['drop table', 'delete from', 'insert into', 'update set', 'union select']
  if (sqlPatterns.some(pattern => lowerText.includes(pattern))) {
    issues.push('SQL injection pattern detected')
  }

  // Check for excessive repetition (potential spam)
  const words = text.split(/\s+/)
  const wordCount = words.length
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size
  
  if (wordCount > 10 && (uniqueWords / wordCount) < 0.3) {
    issues.push('Excessive repetition detected')
  }

  // Check for suspicious URLs
  const urlRegex = /(https?:\/\/[^\s]+)/gi
  const urls = text.match(urlRegex) || []
  if (urls.length > 3) {
    issues.push('Excessive URL count')
  }

  return issues
}