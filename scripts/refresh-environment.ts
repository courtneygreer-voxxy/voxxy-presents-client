#!/usr/bin/env ts-node

/**
 * Environment Refresh Script
 * Combines cleanup and seeding for a complete environment reset
 * Perfect for staging deployments and testing
 */

import { spawn } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(spawn)

/**
 * Complete environment refresh
 */
async function refreshEnvironment(env: string): Promise<void> {
  console.log(`\n🔄 Complete Environment Refresh - ${env.toUpperCase()}`)
  console.log('=' .repeat(60))
  console.log('This will:')
  console.log('1. 🧹 Clean all existing data')
  console.log('2. 🌱 Seed fresh test accounts and data')
  console.log('3. ✨ Prepare environment for testing')
  console.log('')

  try {
    const startTime = Date.now()

    // Step 1: Cleanup
    console.log('📍 STEP 1: Cleaning existing data')
    await new Promise((resolve, reject) => {
      const cleanupProcess = spawn('bash', ['-c', `echo "yes" | npm run cleanup-data ${env}`], {
        stdio: 'inherit',
        cwd: process.cwd()
      })

      cleanupProcess.on('close', (code) => {
        if (code === 0) {
          resolve(undefined)
        } else {
          reject(new Error(`Cleanup failed with exit code ${code}`))
        }
      })
    })

    console.log('\n📍 STEP 2: Seeding fresh test data')
    await new Promise((resolve, reject) => {
      const seedProcess = spawn('npm', ['run', 'seed-data', env], {
        stdio: 'inherit',
        cwd: process.cwd()
      })

      seedProcess.on('close', (code) => {
        if (code === 0) {
          resolve(undefined)
        } else {
          reject(new Error(`Seeding failed with exit code ${code}`))
        }
      })
    })

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.log('\n🚀 ENVIRONMENT REFRESH COMPLETE!')
    console.log('=' .repeat(60))
    console.log(`⏱️  Total time: ${totalDuration} seconds`)
    console.log(`🎯 Environment: ${env.toUpperCase()}`)
    console.log('')
    console.log('🎉 Your environment is now fresh and ready for testing!')
    console.log('')
    console.log('📋 Ready-to-use test accounts:')
    console.log('   👤 Venue Owner: venue-test@voxxypresents.com / VenueTest123!')
    console.log('   👤 Organizer: org-test@voxxypresents.com / OrgTest123!')
    console.log('   👤 Admin: admin-test@voxxypresents.com / AdminTest123!')
    console.log('')
    console.log('🔗 Quick access URLs:')
    if (env === 'staging') {
      console.log('   🌐 App: https://voxxy-presents-client-staging.onrender.com')
      console.log('   👥 Admin: https://voxxy-presents-client-staging.onrender.com/admin')
    } else {
      console.log('   🌐 App: https://voxxypresents.com')
      console.log('   👥 Admin: https://voxxypresents.com/admin')
    }

  } catch (error) {
    console.error('\n💥 Environment refresh failed:', error)
    process.exit(1)
  }
}

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const env = process.argv[2]

  if (!env || !['development', 'staging', 'production'].includes(env)) {
    console.error('Usage: npm run refresh-env <environment>')
    console.error('Environments: development, staging, production')
    process.exit(1)
  }

  refreshEnvironment(env).catch(error => {
    console.error('Environment refresh failed:', error)
    process.exit(1)
  })
}

export { refreshEnvironment }