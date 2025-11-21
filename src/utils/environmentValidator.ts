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
    required: [],
    optional: [
      'VITE_API_BASE_URL',
      'VITE_ENVIRONMENT',
      'VITE_APP_VERSION'
    ],
    validators: {}
  },
  staging: {
    required: [],
    optional: [
      'VITE_API_BASE_URL',
      'VITE_ENVIRONMENT',
      'VITE_APP_VERSION'
    ],
    validators: {
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
      'VITE_API_BASE_URL'
    ],
    optional: [
      'VITE_ENVIRONMENT',
      'VITE_APP_VERSION'
    ],
    validators: {
      VITE_ENVIRONMENT: (value) => {
        if (value !== 'production') {
          return 'Environment should be set to "production" for production deployment'
        }
        return null
      },
      VITE_API_BASE_URL: (value) => {
        if (!value.startsWith('https://')) {
          return 'Production API URL must use HTTPS'
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
    const apiUrl = import.meta.env.VITE_API_BASE_URL
    if (apiUrl && !apiUrl.includes('voxxyai.com')) {
      warnings.push('Staging should use voxxyai.com API')
    }
  }

  private validateDevelopmentEnvironment(errors: string[], warnings: string[]): void {
    // Development-specific validations
    if (!import.meta.env.DEV) {
      warnings.push('Expected development mode but not detected')
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