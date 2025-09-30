#!/usr/bin/env ts-node

/**
 * Firebase Data Cleanup Script
 * Safely clears all collections for fresh deployment
 * Can be run for staging or production environments
 */

import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createInterface } from 'readline'

// Environment configuration
interface EnvironmentConfig {
  projectId: string
  serviceAccountPath: string
  collections: string[]
}

const environments: Record<string, EnvironmentConfig> = {
  development: {
    projectId: 'voxxy-presents-staging', // Use staging for dev
    serviceAccountPath: './config/voxxy-presents-staging-service-account.json',
    collections: [
      'users',
      'organizations',
      'events',
      'registrations',
      'venues',
      'beta_users',
      'admin_users'
    ]
  },
  staging: {
    projectId: 'voxxy-presents-staging',
    serviceAccountPath: './config/voxxy-presents-staging-service-account.json',
    collections: [
      'users',
      'organizations',
      'events',
      'registrations',
      'venues',
      'beta_users',
      'admin_users'
    ]
  },
  production: {
    projectId: 'voxxy-presents',
    serviceAccountPath: './config/voxxy-presents-production-service-account.json',
    collections: [
      'users',
      'organizations',
      'events',
      'registrations',
      'venues',
      'beta_users',
      'admin_users'
    ]
  }
}

/**
 * Initialize Firebase Admin SDK for specified environment
 */
function initializeFirebase(env: string): void {
  const config = environments[env]
  if (!config) {
    throw new Error(`Unknown environment: ${env}. Use 'staging' or 'production'`)
  }

  try {
    // Check if app already exists
    try {
      admin.getApp()
      console.log(`✅ Firebase already initialized for ${env} environment`)
      return
    } catch {
      // App doesn't exist, initialize it
    }

    const serviceAccountPath = resolve(config.serviceAccountPath)
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${config.projectId}-default-rtdb.firebaseio.com`
    })

    console.log(`✅ Firebase initialized for ${env} environment`)
  } catch (error) {
    console.error(`❌ Failed to initialize Firebase for ${env}:`, error)
    process.exit(1)
  }
}

/**
 * Safely delete all documents in a collection
 */
async function clearCollection(collectionName: string): Promise<void> {
  const db = admin.firestore()
  const collection = db.collection(collectionName)

  try {
    console.log(`🧹 Clearing collection: ${collectionName}`)

    const snapshot = await collection.get()
    const totalDocs = snapshot.size

    if (totalDocs === 0) {
      console.log(`   ℹ️  Collection ${collectionName} is already empty`)
      return
    }

    console.log(`   📄 Found ${totalDocs} documents to delete`)

    // Delete in batches of 500 (Firestore limit)
    const batchSize = 500
    let deletedCount = 0

    while (true) {
      const batch = db.batch()
      const docs = await collection.limit(batchSize).get()

      if (docs.empty) break

      docs.forEach(doc => {
        batch.delete(doc.ref)
      })

      await batch.commit()
      deletedCount += docs.size

      console.log(`   🗑️  Deleted ${deletedCount}/${totalDocs} documents`)
    }

    console.log(`   ✅ Successfully cleared ${collectionName} (${deletedCount} documents)`)
  } catch (error) {
    console.error(`   ❌ Failed to clear ${collectionName}:`, error)
    throw error
  }
}

/**
 * Clear all Firebase Authentication users
 */
async function clearAuthUsers(): Promise<void> {
  console.log('🧹 Clearing Firebase Authentication users')

  try {
    let nextPageToken: string | undefined
    let totalDeleted = 0

    do {
      const listResult = await admin.auth().listUsers(1000, nextPageToken)

      if (listResult.users.length === 0) {
        console.log('   ℹ️  No authentication users found')
        break
      }

      const uids = listResult.users.map(user => user.uid)

      // Delete users in batches
      const deleteResult = await admin.auth().deleteUsers(uids)

      totalDeleted += deleteResult.successCount

      if (deleteResult.failureCount > 0) {
        console.log(`   ⚠️  Failed to delete ${deleteResult.failureCount} users`)
        deleteResult.errors.forEach(err => {
          console.log(`      Error: ${err.error.message}`)
        })
      }

      console.log(`   🗑️  Deleted ${totalDeleted} authentication users`)
      nextPageToken = listResult.pageToken

    } while (nextPageToken)

    console.log(`   ✅ Successfully cleared authentication (${totalDeleted} users)`)
  } catch (error) {
    console.error('   ❌ Failed to clear authentication:', error)
    throw error
  }
}

/**
 * Confirm cleanup with user
 */
function confirmCleanup(env: string): Promise<boolean> {
  return new Promise((resolve) => {
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout
    })

    console.log(`\n⚠️  WARNING: This will permanently delete ALL data in ${env.toUpperCase()}`)
    console.log('   This includes:')
    console.log('   - All user accounts and authentication')
    console.log('   - All venues and organizations')
    console.log('   - All events and registrations')
    console.log('   - All admin and beta user data')
    console.log('')

    readline.question('Are you sure you want to continue? Type "yes" to confirm: ', (answer: string) => {
      readline.close()
      resolve(answer.toLowerCase() === 'yes')
    })
  })
}

/**
 * Main cleanup function
 */
async function cleanupFirebaseData(env: string): Promise<void> {
  console.log(`\n🧹 Firebase Data Cleanup - ${env.toUpperCase()} Environment`)
  console.log('=' .repeat(50))

  const config = environments[env]

  // Confirm with user
  const confirmed = await confirmCleanup(env)
  if (!confirmed) {
    console.log('❌ Cleanup cancelled by user')
    process.exit(0)
  }

  try {
    // Initialize Firebase
    initializeFirebase(env)

    const startTime = Date.now()

    // Clear authentication users first
    await clearAuthUsers()

    // Clear all collections
    for (const collection of config.collections) {
      await clearCollection(collection)
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.log('\n🎉 Cleanup completed successfully!')
    console.log(`⏱️  Total time: ${duration} seconds`)
    console.log(`📊 Environment: ${env.toUpperCase()}`)
    console.log(`🗑️  Collections cleared: ${config.collections.join(', ')}`)
    console.log('✨ Ready for fresh deployment!')

  } catch (error) {
    console.error('\n💥 Cleanup failed:', error)
    process.exit(1)
  }
}

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const env = process.argv[2]

  if (!env || !environments[env]) {
    console.error('Usage: npm run cleanup-data <environment>')
    console.error('Environments: staging, production')
    process.exit(1)
  }

  cleanupFirebaseData(env).catch(error => {
    console.error('Cleanup failed:', error)
    process.exit(1)
  })
}

export { cleanupFirebaseData }