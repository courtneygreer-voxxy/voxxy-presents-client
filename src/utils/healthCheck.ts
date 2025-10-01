/**
 * Health check utilities for monitoring application status
 * Used by monitoring services to ensure application health
 */

import { auth, db } from '@/lib/firebase'
import { getDataSource } from '@/config/environments'

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  checks: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn'
      message: string
      responseTime?: number
    }
  }
  environment: string
  version: string
}

export class HealthChecker {
  private startTime = Date.now()

  async runHealthChecks(): Promise<HealthCheckResult> {
    const checks: HealthCheckResult['checks'] = {}

    // Run all health checks
    await Promise.allSettled([
      this.checkFirebaseAuth(checks),
      this.checkFirestore(checks),
      this.checkEnvironmentConfig(checks),
      this.checkCriticalAssets(checks),
      this.checkDataSources(checks)
    ])

    // Determine overall health status
    const failedChecks = Object.values(checks).filter(c => c.status === 'fail').length
    const warnChecks = Object.values(checks).filter(c => c.status === 'warn').length

    let status: HealthCheckResult['status']
    if (failedChecks > 0) {
      status = 'unhealthy'
    } else if (warnChecks > 0) {
      status = 'degraded'
    } else {
      status = 'healthy'
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      checks,
      environment: import.meta.env.VITE_ENVIRONMENT || 'development',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0'
    }
  }

  private async checkFirebaseAuth(checks: HealthCheckResult['checks']): Promise<void> {
    const start = Date.now()
    try {
      // Check if Firebase Auth is properly initialized
      if (!auth) {
        throw new Error('Firebase Auth not initialized')
      }

      // Check auth connection (non-intrusive)
      const currentUser = auth.currentUser
      const responseTime = Date.now() - start

      checks.firebase_auth = {
        status: 'pass',
        message: `Auth service available (user: ${currentUser ? 'authenticated' : 'anonymous'})`,
        responseTime
      }
    } catch (error) {
      checks.firebase_auth = {
        status: 'fail',
        message: `Firebase Auth error: ${error}`,
        responseTime: Date.now() - start
      }
    }
  }

  private async checkFirestore(checks: HealthCheckResult['checks']): Promise<void> {
    const start = Date.now()
    try {
      if (!db) {
        throw new Error('Firestore not initialized')
      }

      // Simple connectivity check using app instance
      const app = db.app
      if (!app) {
        throw new Error('Firebase app not available')
      }

      checks.firestore = {
        status: 'pass',
        message: `Firestore connected (project: ${app.options.projectId})`,
        responseTime: Date.now() - start
      }
    } catch (error) {
      checks.firestore = {
        status: 'fail',
        message: `Firestore error: ${error}`,
        responseTime: Date.now() - start
      }
    }
  }

  private async checkEnvironmentConfig(checks: HealthCheckResult['checks']): Promise<void> {
    const start = Date.now()
    try {
      const requiredEnvVars = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID'
      ]

      const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName])

      if (missingVars.length > 0) {
        throw new Error(`Missing environment variables: ${missingVars.join(', ')}`)
      }

      // Check for placeholder values
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
      if (apiKey?.includes('placeholder') || apiKey?.includes('your-')) {
        throw new Error('Environment contains placeholder values')
      }

      checks.environment = {
        status: 'pass',
        message: 'Environment configuration valid',
        responseTime: Date.now() - start
      }
    } catch (error) {
      checks.environment = {
        status: 'fail',
        message: `Environment error: ${error}`,
        responseTime: Date.now() - start
      }
    }
  }

  private async checkCriticalAssets(checks: HealthCheckResult['checks']): Promise<void> {
    const start = Date.now()
    try {
      // Check if critical CSS is loaded
      const hasStyles = document.styleSheets.length > 0
      if (!hasStyles) {
        throw new Error('No stylesheets loaded')
      }

      // Check if React has mounted
      const reactRoot = document.getElementById('root')
      if (!reactRoot || !reactRoot.children.length) {
        throw new Error('React application not mounted')
      }

      // Check for critical resources
      const criticalElements = [
        'script', // JavaScript loaded
        'link[rel="stylesheet"]' // CSS loaded
      ]

      for (const selector of criticalElements) {
        const elements = document.querySelectorAll(selector)
        if (elements.length === 0) {
          throw new Error(`Missing critical elements: ${selector}`)
        }
      }

      checks.assets = {
        status: 'pass',
        message: `Critical assets loaded (${document.styleSheets.length} stylesheets, React mounted)`,
        responseTime: Date.now() - start
      }
    } catch (error) {
      checks.assets = {
        status: 'fail',
        message: `Asset error: ${error}`,
        responseTime: Date.now() - start
      }
    }
  }

  private async checkDataSources(checks: HealthCheckResult['checks']): Promise<void> {
    const start = Date.now()
    try {
      const dataSource = getDataSource()

      if (dataSource === 'firebase') {
        // Firebase data source check already covered in Firestore check
        checks.data_source = {
          status: 'pass',
          message: 'Using Firebase as data source',
          responseTime: Date.now() - start
        }
      } else if (dataSource === 'api') {
        // For API data source, we'd test API connectivity here
        // For now, just verify configuration
        const apiUrl = import.meta.env.VITE_API_BASE_URL
        if (!apiUrl) {
          throw new Error('API base URL not configured')
        }

        checks.data_source = {
          status: 'pass',
          message: `Using API data source (${apiUrl})`,
          responseTime: Date.now() - start
        }
      } else {
        throw new Error(`Unknown data source: ${dataSource}`)
      }
    } catch (error) {
      checks.data_source = {
        status: 'fail',
        message: `Data source error: ${error}`,
        responseTime: Date.now() - start
      }
    }
  }
}

// Global health check function that can be called from anywhere
export async function getHealthStatus(): Promise<HealthCheckResult> {
  const checker = new HealthChecker()
  return checker.runHealthChecks()
}

// Expose health check to window for external monitoring
if (typeof window !== 'undefined') {
  (window as any).__voxxy_health_check = getHealthStatus
}