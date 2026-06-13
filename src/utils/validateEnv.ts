/**
 * Environment Variable Validation
 * Validates required environment variables on app startup
 * Throws errors in development, logs warnings in production
 */

interface EnvConfig {
  // API Config (required for production)
  VITE_API_BASE_URL: string

  // Optional
  VITE_ENVIRONMENT?: string
}

const REQUIRED_ENV_VARS: (keyof EnvConfig)[] = ['VITE_API_BASE_URL']

const RECOMMENDED_ENV_VARS: (keyof EnvConfig)[] = ['VITE_ENVIRONMENT']

export function validateEnv(): void {
  const missing: string[] = []
  const warnings: string[] = []

  // Check required variables
  for (const varName of REQUIRED_ENV_VARS) {
    const value = import.meta.env[varName]
    if (!value || value === '' || value === 'undefined') {
      missing.push(varName)
    }
  }

  // Check recommended variables
  for (const varName of RECOMMENDED_ENV_VARS) {
    const value = import.meta.env[varName]
    if (!value || value === '' || value === 'undefined') {
      warnings.push(varName)
    }
  }

  // Report missing required variables
  if (missing.length > 0) {
    const errorMessage = `
🚨 MISSING REQUIRED ENVIRONMENT VARIABLES:

${missing.map((v) => `  - ${v}`).join('\n')}

Please create a .env file with these variables.
See .env.example for reference.
    `
    console.error(errorMessage)

    if (import.meta.env.MODE === 'development') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    } else {
      // In production, log error but don't crash (allow partial functionality)
      console.error('❌ App may not function correctly without required env vars')
    }
  }

  // Report missing recommended variables
  if (warnings.length > 0) {
    console.warn(`
⚠️ MISSING RECOMMENDED ENVIRONMENT VARIABLES:

${warnings.map((v) => `  - ${v}`).join('\n')}

Some features may not work correctly.
    `)
  }

  // Success message
  if (missing.length === 0 && warnings.length === 0) {
    console.log('✅ All environment variables validated successfully')
  } else if (missing.length === 0) {
    console.log('✅ Required environment variables validated successfully')
  }
}

/**
 * Get environment display name
 */
export function getEnvironmentName(): string {
  const env = import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE
  return env.charAt(0).toUpperCase() + env.slice(1)
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return import.meta.env.PROD || import.meta.env.VITE_ENVIRONMENT === 'production'
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV || import.meta.env.VITE_ENVIRONMENT === 'development'
}
