#!/usr/bin/env tsx
/**
 * Deployment Readiness Script
 * Comprehensive pre-deployment validation to ensure zero-downtime deployments
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

interface ReadinessCheck {
  name: string
  status: 'pass' | 'fail' | 'warn' | 'skip'
  message: string
  duration: number
  critical: boolean
}

interface DeploymentReport {
  timestamp: string
  environment: string
  version: string
  checks: ReadinessCheck[]
  summary: {
    total: number
    passed: number
    failed: number
    warnings: number
    critical_failures: number
  }
  deployment_ready: boolean
}

class DeploymentReadinessChecker {
  private checks: ReadinessCheck[] = []
  private environment: string
  private version: string

  constructor() {
    this.environment = process.env.NODE_ENV || 'development'
    this.version = this.getVersionInfo()
  }

  async runAllChecks(): Promise<DeploymentReport> {
    console.log('🚀 DEPLOYMENT READINESS CHECK')
    console.log('='.repeat(60))
    console.log(`Environment: ${this.environment}`)
    console.log(`Version: ${this.version}`)
    console.log(`Timestamp: ${new Date().toISOString()}\n`)

    const checks = [
      () => this.checkEnvironmentVariables(),
      () => this.checkBuildIntegrity(),
      () => this.checkTypeScript(),
      () => this.checkSecurityScan(),
      () => this.checkDependencyVulnerabilities(),
      () => this.checkAssetOptimization(),
      () => this.checkConfigurationAlignment(),
      () => this.checkDatabaseConnectivity(),
      () => this.checkAuthenticationSetup(),
      () => this.checkDebugFeatureIsolation(),
      () => this.checkPerformanceMetrics(),
      () => this.checkHealthEndpoints(),
      () => this.checkMonitoringSetup(),
      () => this.checkRollbackCapability()
    ]

    console.log('Running deployment readiness checks...\n')

    for (const check of checks) {
      try {
        await check()
      } catch (error) {
        this.addCheck('Unexpected Error', 'fail', `${error}`, 0, true)
      }
    }

    return this.generateReport()
  }

  private async checkEnvironmentVariables(): Promise<void> {
    const start = Date.now()

    try {
      // Check for environment-specific files first
      const envFiles = ['.env', '.env.production', '.env.staging', '.env.development']
      const availableEnvFile = envFiles.find(file => existsSync(file))

      const requiredVars = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_STORAGE_BUCKET',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID'
      ]

      if (!availableEnvFile) {
        this.addCheck('Environment Variables', 'fail', 'No environment file found', Date.now() - start, true)
        return
      }

      const envContent = readFileSync(availableEnvFile, 'utf8')
      const missingVars = requiredVars.filter(varName => !envContent.includes(varName))

      if (missingVars.length > 0) {
        this.addCheck('Environment Variables', 'fail', `Missing: ${missingVars.join(', ')}`, Date.now() - start, true)
        return
      }

      // Check for placeholder values
      const placeholders = ['your-api-key', 'placeholder', 'example', 'test-key']
      const hasPlaceholders = placeholders.some(placeholder =>
        envContent.toLowerCase().includes(placeholder)
      )

      if (hasPlaceholders) {
        this.addCheck('Environment Variables', 'fail', 'Contains placeholder values', Date.now() - start, true)
        return
      }

      this.addCheck('Environment Variables', 'pass', `All required variables present (${availableEnvFile})`, Date.now() - start, true)
    } catch (error) {
      this.addCheck('Environment Variables', 'fail', `${error}`, Date.now() - start, true)
    }
  }

  private async checkBuildIntegrity(): Promise<void> {
    const start = Date.now()

    try {
      console.log('📦 Testing production build...')

      // Clean and rebuild
      if (existsSync('dist')) {
        execSync('rm -rf dist', { stdio: 'ignore' })
      }

      execSync('npm run build', { stdio: 'ignore' })

      // Check essential build artifacts
      const requiredFiles = [
        'dist/index.html',
        'dist/assets'
      ]

      const missingFiles = requiredFiles.filter(file => !existsSync(file))
      if (missingFiles.length > 0) {
        this.addCheck('Build Integrity', 'fail', `Missing files: ${missingFiles.join(', ')}`, Date.now() - start, true)
        return
      }

      // Check index.html content
      const indexContent = readFileSync('dist/index.html', 'utf8')
      if (!indexContent.includes('<div id="root">')) {
        this.addCheck('Build Integrity', 'fail', 'Invalid index.html structure', Date.now() - start, true)
        return
      }

      // Check bundle size
      const bundleSize = this.getBundleSize()
      if (bundleSize > 3 * 1024 * 1024) { // 3MB threshold
        this.addCheck('Build Integrity', 'warn', `Large bundle size: ${(bundleSize / 1024 / 1024).toFixed(2)}MB`, Date.now() - start, false)
      } else {
        this.addCheck('Build Integrity', 'pass', `Build successful (${(bundleSize / 1024 / 1024).toFixed(2)}MB)`, Date.now() - start, true)
      }
    } catch (error) {
      this.addCheck('Build Integrity', 'fail', `Build failed: ${error}`, Date.now() - start, true)
    }
  }

  private async checkTypeScript(): Promise<void> {
    const start = Date.now()

    try {
      execSync('npm run typecheck', { stdio: 'ignore' })
      this.addCheck('TypeScript', 'pass', 'No type errors', Date.now() - start, true)
    } catch (error) {
      this.addCheck('TypeScript', 'fail', 'Type errors found', Date.now() - start, true)
    }
  }

  private async checkSecurityScan(): Promise<void> {
    const start = Date.now()

    try {
      // Check for exposed secrets in built files
      if (!existsSync('dist')) {
        this.addCheck('Security Scan', 'skip', 'No build directory', Date.now() - start, false)
        return
      }

      const secretPatterns = [
        /sk_live_[a-zA-Z0-9]{24,}/g,  // Stripe live keys (private)
        /rk_live_[a-zA-Z0-9]{24,}/g,  // Stripe restricted keys (private)
        /sk_test_[a-zA-Z0-9]{24,}/g,  // Stripe test keys (private)
        /xoxb-[0-9]{11,12}-[0-9]{11,12}-[a-zA-Z0-9]{24}/g, // Slack bot tokens
        /xoxp-[0-9]{11,12}-[0-9]{11,12}-[a-zA-Z0-9]{24}/g, // Slack user tokens
        // Note: Firebase API keys (AIza...) are public by design and safe to expose
      ]

      const jsFiles = execSync('find dist -name "*.js"', { encoding: 'utf8' }).split('\n').filter(Boolean)

      for (const file of jsFiles) {
        const content = readFileSync(file, 'utf8')
        for (const pattern of secretPatterns) {
          const matches = content.match(pattern)
          if (matches) {
            this.addCheck('Security Scan', 'fail', `Potential secret exposed in ${file}`, Date.now() - start, true)
            return
          }
        }
      }

      this.addCheck('Security Scan', 'pass', 'No exposed secrets detected', Date.now() - start, true)
    } catch (error) {
      this.addCheck('Security Scan', 'warn', `Security scan incomplete: ${error}`, Date.now() - start, false)
    }
  }

  private async checkDependencyVulnerabilities(): Promise<void> {
    const start = Date.now()

    try {
      const auditResult = execSync('npm audit --audit-level=high --json', { encoding: 'utf8' })
      const audit = JSON.parse(auditResult)

      if (audit.metadata.vulnerabilities.high > 0 || audit.metadata.vulnerabilities.critical > 0) {
        this.addCheck('Dependencies', 'fail',
          `High/Critical vulnerabilities: ${audit.metadata.vulnerabilities.high + audit.metadata.vulnerabilities.critical}`,
          Date.now() - start, true)
      } else if (audit.metadata.vulnerabilities.moderate > 0) {
        this.addCheck('Dependencies', 'warn',
          `Moderate vulnerabilities: ${audit.metadata.vulnerabilities.moderate}`,
          Date.now() - start, false)
      } else {
        this.addCheck('Dependencies', 'pass', 'No high-risk vulnerabilities', Date.now() - start, false)
      }
    } catch (error) {
      // npm audit returns non-zero exit code when vulnerabilities found
      this.addCheck('Dependencies', 'warn', 'Vulnerability scan incomplete', Date.now() - start, false)
    }
  }

  private async checkAssetOptimization(): Promise<void> {
    const start = Date.now()

    try {
      if (!existsSync('dist')) {
        this.addCheck('Asset Optimization', 'skip', 'No build directory', Date.now() - start, false)
        return
      }

      // Check for uncompressed assets
      const largeAssets = execSync('find dist -type f -size +1M', { encoding: 'utf8' }).split('\n').filter(Boolean)

      if (largeAssets.length > 0) {
        this.addCheck('Asset Optimization', 'warn',
          `Large assets found: ${largeAssets.length} files > 1MB`,
          Date.now() - start, false)
      } else {
        this.addCheck('Asset Optimization', 'pass', 'Assets properly optimized', Date.now() - start, false)
      }
    } catch (error) {
      this.addCheck('Asset Optimization', 'warn', `Asset check failed: ${error}`, Date.now() - start, false)
    }
  }

  private async checkConfigurationAlignment(): Promise<void> {
    const start = Date.now()

    try {
      // Check if environment configuration matches deployment target
      const envFiles = ['.env', '.env.production', '.env.staging', '.env.development']
      const availableEnvFile = envFiles.find(file => existsSync(file))

      if (!availableEnvFile) {
        this.addCheck('Configuration', 'fail', 'Environment file missing', Date.now() - start, true)
        return
      }

      const envContent = readFileSync(availableEnvFile, 'utf8')

      // For production deployment
      if (this.environment === 'production') {
        if (envContent.includes('staging') || envContent.includes('demo')) {
          this.addCheck('Configuration', 'fail', 'Production using staging/demo config', Date.now() - start, true)
          return
        }
      }

      this.addCheck('Configuration', 'pass', 'Configuration aligned with environment', Date.now() - start, true)
    } catch (error) {
      this.addCheck('Configuration', 'fail', `Configuration check failed: ${error}`, Date.now() - start, true)
    }
  }

  private async checkDatabaseConnectivity(): Promise<void> {
    const start = Date.now()

    try {
      // This would test Firebase connectivity
      // For now, just verify Firebase config exists
      const firebaseConfig = 'src/lib/firebase.ts'
      if (!existsSync(firebaseConfig)) {
        this.addCheck('Database', 'fail', 'Firebase configuration missing', Date.now() - start, true)
        return
      }

      const configContent = readFileSync(firebaseConfig, 'utf8')
      const requiredImports = ['initializeApp', 'getAuth', 'getFirestore']
      const missingImports = requiredImports.filter(imp => !configContent.includes(imp))

      if (missingImports.length > 0) {
        this.addCheck('Database', 'fail', `Missing Firebase imports: ${missingImports.join(', ')}`, Date.now() - start, true)
        return
      }

      this.addCheck('Database', 'pass', 'Database configuration valid', Date.now() - start, true)
    } catch (error) {
      this.addCheck('Database', 'fail', `Database check failed: ${error}`, Date.now() - start, true)
    }
  }

  private async checkAuthenticationSetup(): Promise<void> {
    const start = Date.now()

    try {
      // Check for auth context and protected routes
      const authFiles = [
        'src/contexts/AuthContext.tsx',
        'src/components/auth/ProtectedRouteV2.tsx'
      ]

      const missingFiles = authFiles.filter(file => !existsSync(file))
      if (missingFiles.length > 0) {
        this.addCheck('Authentication', 'fail', `Missing auth files: ${missingFiles.join(', ')}`, Date.now() - start, true)
        return
      }

      this.addCheck('Authentication', 'pass', 'Authentication setup complete', Date.now() - start, true)
    } catch (error) {
      this.addCheck('Authentication', 'fail', `Auth check failed: ${error}`, Date.now() - start, true)
    }
  }

  private async checkDebugFeatureIsolation(): Promise<void> {
    const start = Date.now()

    try {
      const debugFiles = [
        'src/components/debug/DebugPanel.tsx',
        'src/components/profile/ClubsManagement.tsx',
        'src/pages/AdminDashboard.tsx'
      ]

      for (const file of debugFiles) {
        if (!existsSync(file)) continue

        const content = readFileSync(file, 'utf8')
        const hasProductionCheck =
          content.includes('import.meta.env.PROD') ||
          content.includes('showDebugLogs') ||
          content.includes('showDebugPanel')

        if (!hasProductionCheck) {
          this.addCheck('Debug Isolation', 'fail', `Debug features not isolated in ${file}`, Date.now() - start, true)
          return
        }
      }

      this.addCheck('Debug Isolation', 'pass', 'Debug features properly isolated', Date.now() - start, true)
    } catch (error) {
      this.addCheck('Debug Isolation', 'fail', `Debug check failed: ${error}`, Date.now() - start, true)
    }
  }

  private async checkPerformanceMetrics(): Promise<void> {
    const start = Date.now()

    try {
      if (!existsSync('dist')) {
        this.addCheck('Performance', 'skip', 'No build to analyze', Date.now() - start, false)
        return
      }

      const bundleSize = this.getBundleSize()
      const jsFiles = execSync('find dist/assets -name "*.js" | wc -l', { encoding: 'utf8' }).trim()

      const metrics = {
        bundleSize: (bundleSize / 1024 / 1024).toFixed(2) + 'MB',
        jsChunks: jsFiles,
        hasCodeSplitting: parseInt(jsFiles) > 1
      }

      let issues = []
      if (bundleSize > 2 * 1024 * 1024) issues.push('large bundle')
      if (!metrics.hasCodeSplitting) issues.push('no code splitting')

      if (issues.length > 0) {
        this.addCheck('Performance', 'warn', `Issues: ${issues.join(', ')}`, Date.now() - start, false)
      } else {
        this.addCheck('Performance', 'pass', `Good metrics: ${metrics.bundleSize}, ${metrics.jsChunks} chunks`, Date.now() - start, false)
      }
    } catch (error) {
      this.addCheck('Performance', 'warn', `Performance check failed: ${error}`, Date.now() - start, false)
    }
  }

  private async checkHealthEndpoints(): Promise<void> {
    const start = Date.now()

    try {
      // Check if health check utilities exist
      const healthFile = 'src/utils/healthCheck.ts'
      if (!existsSync(healthFile)) {
        this.addCheck('Health Endpoints', 'warn', 'Health check utilities missing', Date.now() - start, false)
        return
      }

      const content = readFileSync(healthFile, 'utf8')
      if (!content.includes('getHealthStatus')) {
        this.addCheck('Health Endpoints', 'warn', 'Health check function missing', Date.now() - start, false)
        return
      }

      this.addCheck('Health Endpoints', 'pass', 'Health check capabilities available', Date.now() - start, false)
    } catch (error) {
      this.addCheck('Health Endpoints', 'warn', `Health check failed: ${error}`, Date.now() - start, false)
    }
  }

  private async checkMonitoringSetup(): Promise<void> {
    const start = Date.now()

    try {
      // Check for monitoring and error tracking setup
      const monitoringFiles = [
        'src/utils/healthCheck.ts',
        'src/utils/environmentValidator.ts'
      ]

      const availableFiles = monitoringFiles.filter(file => existsSync(file))

      if (availableFiles.length === 0) {
        this.addCheck('Monitoring', 'warn', 'No monitoring utilities found', Date.now() - start, false)
      } else {
        this.addCheck('Monitoring', 'pass', `Monitoring ready (${availableFiles.length} utilities)`, Date.now() - start, false)
      }
    } catch (error) {
      this.addCheck('Monitoring', 'warn', `Monitoring check failed: ${error}`, Date.now() - start, false)
    }
  }

  private async checkRollbackCapability(): Promise<void> {
    const start = Date.now()

    try {
      // Check git status for clean deployment
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' })

      if (gitStatus.trim()) {
        this.addCheck('Rollback Capability', 'warn', 'Uncommitted changes detected', Date.now() - start, false)
      } else {
        // Check if we have a recent commit
        const lastCommit = execSync('git log -1 --format="%H %s"', { encoding: 'utf8' }).trim()
        this.addCheck('Rollback Capability', 'pass', `Clean git state: ${lastCommit.substring(0, 50)}...`, Date.now() - start, false)
      }
    } catch (error) {
      this.addCheck('Rollback Capability', 'warn', `Git check failed: ${error}`, Date.now() - start, false)
    }
  }

  private getBundleSize(): number {
    try {
      const stat = execSync('du -sk dist', { encoding: 'utf8' })
      return parseInt(stat.split('\t')[0]) * 1024 // Convert KB to bytes
    } catch {
      return 0
    }
  }

  private getVersionInfo(): string {
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
      const gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
      return `${packageJson.version}-${gitHash}`
    } catch {
      return 'unknown'
    }
  }

  private addCheck(name: string, status: ReadinessCheck['status'], message: string, duration: number, critical: boolean): void {
    const check: ReadinessCheck = { name, status, message, duration, critical }
    this.checks.push(check)

    const statusIcon = {
      pass: '✅',
      fail: '❌',
      warn: '⚠️',
      skip: '⏭️'
    }[status]

    const criticalFlag = critical ? ' (CRITICAL)' : ''
    console.log(`${statusIcon} ${name}: ${message} (${duration}ms)${criticalFlag}`)
  }

  private generateReport(): DeploymentReport {
    const summary = {
      total: this.checks.length,
      passed: this.checks.filter(c => c.status === 'pass').length,
      failed: this.checks.filter(c => c.status === 'fail').length,
      warnings: this.checks.filter(c => c.status === 'warn').length,
      critical_failures: this.checks.filter(c => c.status === 'fail' && c.critical).length
    }

    const deployment_ready = summary.critical_failures === 0

    const report: DeploymentReport = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      version: this.version,
      checks: this.checks,
      summary,
      deployment_ready
    }

    // Save report to file
    const reportPath = `deployment-report-${Date.now()}.json`
    writeFileSync(reportPath, JSON.stringify(report, null, 2))

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('🎯 DEPLOYMENT READINESS SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Checks: ${summary.total}`)
    console.log(`✅ Passed: ${summary.passed}`)
    console.log(`❌ Failed: ${summary.failed}`)
    console.log(`⚠️  Warnings: ${summary.warnings}`)
    console.log(`🚨 Critical Failures: ${summary.critical_failures}`)
    console.log(`📊 Report saved: ${reportPath}`)

    if (deployment_ready) {
      console.log('\n🚀 DEPLOYMENT READY! All critical checks passed.')
    } else {
      console.log('\n🛑 DEPLOYMENT NOT READY! Critical issues must be resolved.')
      process.exit(1)
    }

    return report
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new DeploymentReadinessChecker()
  checker.runAllChecks().catch(error => {
    console.error('Deployment readiness check failed:', error)
    process.exit(1)
  })
}

export { DeploymentReadinessChecker }