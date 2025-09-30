#!/usr/bin/env ts-node

/**
 * Environment Refresh Script
 * Combines cleanup and seeding for a complete environment reset
 * Perfect for staging deployments and testing
 */

import { cleanupFirebaseData } from './cleanup-firebase-data'
import { seedTestData } from './seed-test-data'

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
    await cleanupFirebaseData(env)

    console.log('\n📍 STEP 2: Seeding fresh test data')
    await seedTestData(env)

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
if (require.main === module) {
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