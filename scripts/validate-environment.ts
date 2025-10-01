#!/usr/bin/env tsx
/**
 * Node.js compatible environment validation script
 */

import { readFileSync, existsSync } from 'fs'
import { config } from 'dotenv'

// Load environment variables
config()

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  environment: string
}

class NodeEnvironmentValidator {
  private env: string

  constructor() {
    this.env = process.env.VITE_ENVIRONMENT || process.env.NODE_ENV || 'development'
  }

  validate(): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check required variables
    const requiredVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID'
    ]

    for (const varName of requiredVars) {
      const value = process.env[varName]

      if (!value) {
        errors.push(`Missing required environment variable: ${varName}`)
        continue
      }

      // Basic validation
      if (value.includes('placeholder') || value.includes('your-')) {
        errors.push(`${varName} appears to contain placeholder values`)
      }

      if (varName === 'VITE_FIREBASE_API_KEY' && value.length < 20) {
        warnings.push(`${varName} appears to be too short`)
      }
    }

    // Environment-specific checks
    if (this.env === 'production') {
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID
      if (projectId && (projectId.includes('demo') || projectId.includes('staging') || projectId.includes('test'))) {
        errors.push('Production should not use demo/staging/test Firebase project')
      }

      if (process.env.VITE_JWT_SECRET) {
        warnings.push('JWT_SECRET should not be exposed in production frontend')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      environment: this.env
    }
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

    if (!result.isValid) {
      process.exit(1)
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new NodeEnvironmentValidator()
  const result = validator.validate()
  NodeEnvironmentValidator.logValidationResults(result)
}

export { NodeEnvironmentValidator }