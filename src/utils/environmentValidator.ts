/**
 * Environment validation utilities
 * Ensures all required environment variables are properly configured
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  environment: string
}

export interface EnvironmentConfig {
  required: string[]
  optional: string[]
  validators?: {
    [key: string]: (value: string) => string | null
  }
}

const ENVIRONMENT_CONFIGS: Record<string, EnvironmentConfig> = {
  development: {
    required: [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID'
    ],
    optional: [
      'VITE_API_BASE_URL',
      'VITE_ENVIRONMENT',
      'VITE_APP_VERSION'
    ],
    validators: {
      VITE_FIREBASE_PROJECT_ID: (value) => {
        if (value.includes('demo-') || value.includes('test-')) {
          return null // OK for development
        }
        return value.length > 0 ? null : 'Project ID cannot be empty'
      },
      VITE_FIREBASE_API_KEY: (value) => {
        if (value.length < 20) {
          return 'API key appears to be too short'
        }
        if (value.includes('placeholder') || value.includes('your-')) {
          return 'API key appears to be a placeholder'
        }
        return null
      }
    }
  },
  staging: {
    required: [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID',
      'VITE_ENVIRONMENT'
    ],
    optional: [
      'VITE_API_BASE_URL',
      'VITE_APP_VERSION'
    ],
    validators: {
      VITE_FIREBASE_PROJECT_ID: (value) => {
        if (value.includes('demo-') || value.includes('test-')) {
          return null // OK for staging
        }
        if (!value.includes('staging') && !value.includes('dev')) {
          return 'Staging should use a staging/dev Firebase project'
        }
        return null
      },
      VITE_ENVIRONMENT: (value) => {
        if (value !== 'staging') {
          return 'Environment should be set to "staging" for staging deployment'
        }
        return null
      }
    }
  },
  production: {
    required: [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID',
      'VITE_ENVIRONMENT'
    ],
    optional: [
      'VITE_API_BASE_URL',
      'VITE_APP_VERSION'
    ],
    validators: {
      VITE_FIREBASE_PROJECT_ID: (value) => {
        if (value.includes('demo-') || value.includes('test-') || value.includes('staging')) {
          return 'Production should not use demo, test, or staging project IDs'
        }
        return null
      },
      VITE_ENVIRONMENT: (value) => {
        if (value !== 'production') {
          return 'Environment should be set to "production" for production deployment'
        }
        return null
      },
      VITE_FIREBASE_API_KEY: (value) => {
        if (value.length < 30) {
          return 'Production API key appears to be too short'
        }
        if (value.includes('placeholder') || value.includes('your-') || value.includes('test')) {
          return 'Production API key appears to be invalid'
        }
        return null
      }
    }
  }
}

export class EnvironmentValidator {
  private env: string

  constructor(environment?: string) {
    this.env = environment || import.meta.env.VITE_ENVIRONMENT || 'development'
  }

  validate(): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    const config = ENVIRONMENT_CONFIGS[this.env]
    if (!config) {
      errors.push(`Unknown environment: ${this.env}`)
      return {
        isValid: false,
        errors,
        warnings,
        environment: this.env
      }
    }

    // Check required variables
    for (const varName of config.required) {
      const value = import.meta.env[varName]

      if (!value) {
        errors.push(`Missing required environment variable: ${varName}`)
        continue
      }

      // Run custom validator if available
      const validator = config.validators?.[varName]
      if (validator) {
        const validationError = validator(value)
        if (validationError) {
          errors.push(`${varName}: ${validationError}`)
        }
      }
    }

    // Check optional variables
    for (const varName of config.optional) {
      const value = import.meta.env[varName]

      if (value) {
        // Run custom validator if available
        const validator = config.validators?.[varName]
        if (validator) {
          const validationError = validator(value)
          if (validationError) {
            warnings.push(`${varName}: ${validationError}`)
          }
        }
      } else {
        warnings.push(`Optional environment variable not set: ${varName}`)
      }
    }

    // Environment-specific checks
    this.runEnvironmentSpecificChecks(errors, warnings)

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      environment: this.env
    }
  }

  private runEnvironmentSpecificChecks(errors: string[], warnings: string[]): void {
    switch (this.env) {
      case 'production':
        this.validateProductionEnvironment(errors, warnings)
        break
      case 'staging':
        this.validateStagingEnvironment(errors, warnings)
        break
      case 'development':
        this.validateDevelopmentEnvironment(errors, warnings)
        break
    }
  }

  private validateProductionEnvironment(errors: string[], warnings: string[]): void {
    // Production-specific validations
    if (import.meta.env.DEV) {
      errors.push('Cannot deploy development build to production')
    }

    // Check for debug features
    if (import.meta.env.VITE_DEBUG === 'true') {
      errors.push('Debug mode should not be enabled in production')
    }

    // Ensure HTTPS
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:') {
      errors.push('Production must use HTTPS')
    }
  }

  private validateStagingEnvironment(errors: string[], warnings: string[]): void {
    // Staging-specific validations
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID?.includes('staging') &&
        !import.meta.env.VITE_FIREBASE_PROJECT_ID?.includes('dev')) {
      warnings.push('Staging should typically use a staging/dev Firebase project')
    }

    // Check for production URLs in staging
    const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
    if (authDomain && !authDomain.includes('staging') && !authDomain.includes('dev')) {
      warnings.push('Staging should use staging/dev Firebase domain')
    }
  }

  private validateDevelopmentEnvironment(errors: string[], warnings: string[]): void {
    // Development-specific validations
    if (!import.meta.env.DEV) {
      warnings.push('Expected development mode but not detected')
    }

    // Check for production values in development
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
    if (projectId && !projectId.includes('demo-') && !projectId.includes('test-') && !projectId.includes('dev')) {
      warnings.push('Development should use demo/test Firebase project')
    }
  }

  static validateCurrentEnvironment(): ValidationResult {
    const validator = new EnvironmentValidator()
    return validator.validate()
  }

  static logValidationResults(result: ValidationResult): void {
    console.log(`\n🔍 Environment Validation (${result.environment})`)
    console.log('='.repeat(50))

    if (result.isValid) {
      console.log('✅ Environment configuration is valid')
    } else {
      console.log('❌ Environment configuration has errors')
    }

    if (result.errors.length > 0) {
      console.log('\n🚨 Errors:')
      result.errors.forEach(error => console.log(`   ❌ ${error}`))
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:')
      result.warnings.forEach(warning => console.log(`   ⚠️  ${warning}`))
    }

    console.log('')
  }
}

// Auto-validate on import in development (only in browser)
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  const result = EnvironmentValidator.validateCurrentEnvironment()
  if (!result.isValid || result.warnings.length > 0) {
    EnvironmentValidator.logValidationResults(result)
  }
}

export { EnvironmentValidator as default }