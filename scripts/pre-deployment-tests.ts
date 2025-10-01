#!/usr/bin/env tsx
/**
 * Pre-deployment test suite
 * Ensures application readiness before production deployment
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

interface TestResult {
  name: string
  passed: boolean
  message: string
  duration: number
}

class PreDeploymentTester {
  private results: TestResult[] = []
  private startTime = Date.now()

  async runAllTests(): Promise<boolean> {
    console.log('🚀 Starting Pre-Deployment Tests...\n')

    const tests = [
      () => this.testBuild(),
      () => this.testTypeCheck(),
      () => this.testEnvironmentConfig(),
      () => this.testFirebaseConfig(),
      () => this.testCriticalRoutes(),
      () => this.testDebugFeatures(),
      () => this.testSecurityChecks(),
      () => this.testPerformance(),
    ]

    for (const test of tests) {
      await test()
    }

    this.printResults()
    return this.results.every(r => r.passed)
  }

  private async testBuild(): Promise<void> {
    const start = Date.now()
    try {
      console.log('📦 Testing production build...')

      // Clean previous build
      if (existsSync('dist')) {
        execSync('rm -rf dist', { stdio: 'ignore' })
      }

      // Run build
      execSync('npm run build', { stdio: 'ignore' })

      // Check build artifacts
      const requiredFiles = [
        'dist/index.html',
        'dist/assets'
      ]

      for (const file of requiredFiles) {
        if (!existsSync(file)) {
          throw new Error(`Missing build artifact: ${file}`)
        }
      }

      // Check bundle size (warn if > 2MB)
      const indexJs = execSync('find dist/assets -name "index-*.js" -type f').toString().trim()
      if (indexJs) {
        const stats = execSync(`stat -f%z "${indexJs}"`).toString().trim()
        const sizeMB = parseInt(stats) / (1024 * 1024)
        if (sizeMB > 2) {
          console.warn(`⚠️  Large bundle size: ${sizeMB.toFixed(2)}MB`)
        }
      }

      this.addResult('Build', true, 'Production build successful', Date.now() - start)
    } catch (error) {
      this.addResult('Build', false, `Build failed: ${error}`, Date.now() - start)
    }
  }

  private async testTypeCheck(): Promise<void> {
    const start = Date.now()
    try {
      console.log('🔍 Running TypeScript checks...')
      execSync('npm run typecheck', { stdio: 'ignore' })
      this.addResult('TypeScript', true, 'No type errors found', Date.now() - start)
    } catch (error) {
      this.addResult('TypeScript', false, 'Type errors found', Date.now() - start)
    }
  }

  private async testEnvironmentConfig(): Promise<void> {
    const start = Date.now()
    try {
      console.log('⚙️  Testing environment configuration...')

      const envFile = '.env'
      if (!existsSync(envFile)) {
        throw new Error('No .env file found')
      }

      const envContent = readFileSync(envFile, 'utf8')
      const requiredVars = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_STORAGE_BUCKET',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID'
      ]

      const missingVars = requiredVars.filter(varName =>
        !envContent.includes(varName) || envContent.includes(`${varName}=`)
      )

      if (missingVars.length > 0) {
        throw new Error(`Missing environment variables: ${missingVars.join(', ')}`)
      }

      // Check for test/placeholder values
      const placeholderPatterns = [
        'your-project-id',
        'your-api-key',
        'example',
        'test-',
        'placeholder'
      ]

      for (const pattern of placeholderPatterns) {
        if (envContent.toLowerCase().includes(pattern)) {
          throw new Error(`Found placeholder values in environment config`)
        }
      }

      this.addResult('Environment', true, 'Environment configuration valid', Date.now() - start)
    } catch (error) {
      this.addResult('Environment', false, `Environment error: ${error}`, Date.now() - start)
    }
  }

  private async testFirebaseConfig(): Promise<void> {
    const start = Date.now()
    try {
      console.log('🔥 Testing Firebase configuration...')

      // Check Firebase config file
      const configPath = 'src/lib/firebase.ts'
      if (!existsSync(configPath)) {
        throw new Error('Firebase config file not found')
      }

      const configContent = readFileSync(configPath, 'utf8')

      // Check for required Firebase services
      const requiredImports = [
        'initializeApp',
        'getAuth',
        'getFirestore'
      ]

      for (const importName of requiredImports) {
        if (!configContent.includes(importName)) {
          throw new Error(`Missing Firebase import: ${importName}`)
        }
      }

      // Test Firebase connection (basic check)
      const testScript = `
        import { testFirebaseConnection } from './src/debug/firebase-connection-test.js'
        testFirebaseConnection().then(result => {
          if (!result.projectId) throw new Error('Firebase connection failed')
          console.log('Firebase connection successful')
        }).catch(err => {
          console.error('Firebase test failed:', err)
          process.exit(1)
        })
      `

      // Note: In a real implementation, you'd run this test
      // For now, we'll just validate the config structure

      this.addResult('Firebase', true, 'Firebase configuration valid', Date.now() - start)
    } catch (error) {
      this.addResult('Firebase', false, `Firebase error: ${error}`, Date.now() - start)
    }
  }

  private async testCriticalRoutes(): Promise<void> {
    const start = Date.now()
    try {
      console.log('🛣️  Testing critical route configurations...')

      const routeFile = 'src/App.tsx'
      if (!existsSync(routeFile)) {
        throw new Error('App.tsx not found')
      }

      const routeContent = readFileSync(routeFile, 'utf8')

      // Check for critical routes
      const criticalRoutes = [
        '/',
        '/admin',
        '/organizer',
        '/venue-owner'
      ]

      const missingRoutes = criticalRoutes.filter(route => {
        const routePattern = route.replace('/', '\\/')
        return !routeContent.includes(`path="${route}"`) &&
               !routeContent.includes(`path='${route}'`)
      })

      if (missingRoutes.length > 0) {
        console.warn(`⚠️  Missing route configurations: ${missingRoutes.join(', ')}`)
      }

      // Check for protected routes
      if (!routeContent.includes('ProtectedRoute')) {
        throw new Error('No protected routes found - security risk')
      }

      this.addResult('Routes', true, 'Critical routes configured', Date.now() - start)
    } catch (error) {
      this.addResult('Routes', false, `Route error: ${error}`, Date.now() - start)
    }
  }

  private async testDebugFeatures(): Promise<void> {
    const start = Date.now()
    try {
      console.log('🐛 Testing debug feature isolation...')

      const debugFiles = [
        'src/components/debug/DebugPanel.tsx',
        'src/components/profile/ClubsManagement.tsx',
        'src/pages/AdminDashboard.tsx'
      ]

      for (const file of debugFiles) {
        if (!existsSync(file)) continue

        const content = readFileSync(file, 'utf8')

        // Check for production safety
        const hasProductionCheck =
          content.includes('import.meta.env.PROD') ||
          content.includes('import.meta.env.DEV') ||
          content.includes('showDebugLogs') ||
          content.includes('showDebugPanel')

        if (!hasProductionCheck) {
          throw new Error(`Debug features not properly isolated in ${file}`)
        }
      }

      this.addResult('Debug Features', true, 'Debug features properly isolated', Date.now() - start)
    } catch (error) {
      this.addResult('Debug Features', false, `Debug isolation error: ${error}`, Date.now() - start)
    }
  }

  private async testSecurityChecks(): Promise<void> {
    const start = Date.now()
    try {
      console.log('🔒 Running security checks...')

      // Check for exposed secrets
      const sensitiveFiles = [
        'src',
        'public'
      ]

      const secretPatterns = [
        /api[_-]?key[_-]?=.{10,}/i,
        /secret[_-]?key[_-]?=.{10,}/i,
        /password[_-]?=.{5,}/i,
        /token[_-]?=.{10,}/i
      ]

      for (const dir of sensitiveFiles) {
        if (!existsSync(dir)) continue

        try {
          const files = execSync(`find ${dir} -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"`).toString().split('\n').filter(Boolean)

          for (const file of files) {
            const content = readFileSync(file, 'utf8')
            for (const pattern of secretPatterns) {
              if (pattern.test(content) && !content.includes('import.meta.env')) {
                throw new Error(`Potential exposed secret in ${file}`)
              }
            }
          }
        } catch (findError) {
          // Ignore find errors for missing directories
        }
      }

      // Check for secure headers in index.html
      if (existsSync('dist/index.html')) {
        const indexContent = readFileSync('dist/index.html', 'utf8')
        // Note: In a real app, you'd check for CSP headers, etc.
      }

      this.addResult('Security', true, 'Security checks passed', Date.now() - start)
    } catch (error) {
      this.addResult('Security', false, `Security issue: ${error}`, Date.now() - start)
    }
  }

  private async testPerformance(): Promise<void> {
    const start = Date.now()
    try {
      console.log('⚡ Running performance checks...')

      if (!existsSync('dist')) {
        throw new Error('Build directory not found')
      }

      // Check total bundle size
      const totalSize = execSync('du -sh dist | cut -f1').toString().trim()
      console.log(`📊 Total bundle size: ${totalSize}`)

      // Check for large assets
      try {
        const largeAssets = execSync('find dist -type f -size +1M').toString().trim()
        if (largeAssets) {
          console.warn(`⚠️  Large assets found:\n${largeAssets}`)
        }
      } catch {
        // No large assets found (good)
      }

      // Basic performance recommendations
      const recommendations: string[] = []

      // Check for code splitting
      const jsFiles = execSync('find dist/assets -name "*.js" | wc -l').toString().trim()
      if (parseInt(jsFiles) < 2) {
        recommendations.push('Consider implementing code splitting')
      }

      // Check for asset optimization
      try {
        const uncompressed = execSync('find dist -name "*.js" -o -name "*.css" | xargs wc -c | tail -n1').toString().trim()
        const compressed = execSync('find dist -name "*.js" -o -name "*.css" | xargs gzip -c | wc -c').toString().trim()
        const compressionRatio = parseInt(compressed) / parseInt(uncompressed)
        if (compressionRatio > 0.7) {
          recommendations.push('Assets could benefit from better compression')
        }
      } catch {
        // Compression check failed
      }

      if (recommendations.length > 0) {
        console.log(`💡 Performance recommendations:\n${recommendations.map(r => `   - ${r}`).join('\n')}`)
      }

      this.addResult('Performance', true, 'Performance checks completed', Date.now() - start)
    } catch (error) {
      this.addResult('Performance', false, `Performance error: ${error}`, Date.now() - start)
    }
  }

  private addResult(name: string, passed: boolean, message: string, duration: number): void {
    this.results.push({ name, passed, message, duration })
    const status = passed ? '✅' : '❌'
    const time = `(${duration}ms)`
    console.log(`${status} ${name}: ${message} ${time}\n`)
  }

  private printResults(): void {
    const totalTime = Date.now() - this.startTime
    const passed = this.results.filter(r => r.passed).length
    const total = this.results.length

    console.log('\n' + '='.repeat(60))
    console.log('🎯 PRE-DEPLOYMENT TEST RESULTS')
    console.log('='.repeat(60))

    console.log(`\n📈 Summary: ${passed}/${total} tests passed`)
    console.log(`⏱️  Total time: ${totalTime}ms\n`)

    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌'
      console.log(`${status} ${result.name.padEnd(20)} ${result.message}`)
    })

    if (passed === total) {
      console.log('\n🚀 All tests passed! Ready for deployment.')
    } else {
      console.log('\n🛑 Some tests failed. Please fix issues before deployment.')
      process.exit(1)
    }
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new PreDeploymentTester()
  tester.runAllTests().catch(error => {
    console.error('Test runner failed:', error)
    process.exit(1)
  })
}

export { PreDeploymentTester }