/**
 * Clear Venue Database Script
 * Removes all existing venue data to start fresh for v2.0.0 venue owner system
 *
 * ⚠️ WARNING: This script will permanently delete all venue data!
 * Use only for transitioning to the new venue owner system.
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore'
import * as dotenv from 'dotenv'

// Load environment variables for Node.js execution
// Try .env.local first (development), then fall back to .env
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env.development' })
dotenv.config() // fallback to .env

// Firebase config from environment variables (Node.js compatible)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Validate required config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Missing required Firebase environment variables!')
  console.error('Make sure VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID are set')
  process.exit(1)
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

interface ClearStats {
  venuesDeleted: number
  errors: number
  startTime: Date
  endTime?: Date
}

/**
 * Clear all venues from the database
 */
async function clearVenueDatabase(): Promise<ClearStats> {
  const stats: ClearStats = {
    venuesDeleted: 0,
    errors: 0,
    startTime: new Date()
  }

  try {
    console.log('🗑️  Starting venue database cleanup for v2.0.0...')
    console.log('⚠️  This will permanently delete all venue data!')

    // Get all venues
    const venuesRef = collection(db, 'venues')
    const snapshot = await getDocs(venuesRef)

    console.log(`📊 Found ${snapshot.size} venues to delete`)

    if (snapshot.size === 0) {
      console.log('✅ Database already clean - no venues to delete')
      stats.endTime = new Date()
      return stats
    }

    // Batch delete for efficiency (Firestore allows max 500 operations per batch)
    const batchSize = 500
    const batches: any[] = []

    let currentBatch = writeBatch(db)
    let operationCount = 0

    snapshot.docs.forEach((docSnapshot) => {
      if (operationCount === batchSize) {
        // Start a new batch
        batches.push(currentBatch)
        currentBatch = writeBatch(db)
        operationCount = 0
      }

      currentBatch.delete(doc(db, 'venues', docSnapshot.id))
      operationCount++
    })

    // Add the last batch if it has operations
    if (operationCount > 0) {
      batches.push(currentBatch)
    }

    console.log(`🔄 Executing ${batches.length} batch(es) to delete ${snapshot.size} venues...`)

    // Execute all batches
    for (let i = 0; i < batches.length; i++) {
      try {
        await batches[i].commit()
        const deletedInBatch = Math.min(batchSize, snapshot.size - (i * batchSize))
        stats.venuesDeleted += deletedInBatch
        console.log(`✅ Batch ${i + 1}/${batches.length} complete (${deletedInBatch} venues deleted)`)
      } catch (error) {
        console.error(`❌ Error in batch ${i + 1}:`, error)
        stats.errors++
      }
    }

    stats.endTime = new Date()
    const duration = stats.endTime.getTime() - stats.startTime.getTime()

    console.log('\n📊 CLEANUP COMPLETE')
    console.log('=====================================')
    console.log(`✅ Venues deleted: ${stats.venuesDeleted}`)
    console.log(`❌ Errors: ${stats.errors}`)
    console.log(`⏱️  Duration: ${duration}ms`)
    console.log(`🕐 Started: ${stats.startTime.toISOString()}`)
    console.log(`🕑 Finished: ${stats.endTime.toISOString()}`)

    if (stats.errors === 0 && stats.venuesDeleted > 0) {
      console.log('\n🎉 Database successfully cleared for v2.0.0 venue owner system!')
      console.log('👥 Venue owners can now create venues from scratch')
      console.log('🛡️  Admin approval required for all new venues')
    } else if (stats.errors > 0) {
      console.log('\n⚠️  Cleanup completed with some errors - please review')
    }

  } catch (error) {
    console.error('💥 Critical error during venue database cleanup:', error)
    stats.errors++
    stats.endTime = new Date()
  }

  return stats
}

/**
 * Verify database is empty
 */
async function verifyDatabaseCleared(): Promise<boolean> {
  try {
    console.log('\n🔍 Verifying database is empty...')
    const venuesRef = collection(db, 'venues')
    const snapshot = await getDocs(venuesRef)

    if (snapshot.size === 0) {
      console.log('✅ Verification successful - venue database is empty')
      return true
    } else {
      console.log(`❌ Verification failed - ${snapshot.size} venues still exist`)
      return false
    }
  } catch (error) {
    console.error('❌ Error during verification:', error)
    return false
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Voxxy v2.0.0 - Venue Database Cleanup')
  console.log('=========================================\n')

  try {
    // Clear the database
    const stats = await clearVenueDatabase()

    // Verify it's empty
    const isCleared = await verifyDatabaseCleared()

    if (isCleared && stats.errors === 0) {
      console.log('\n🎯 Ready for v2.0.0 venue owner system development!')
      process.exit(0)
    } else {
      console.log('\n⚠️  Database cleanup may not be complete - please review')
      process.exit(1)
    }

  } catch (error) {
    console.error('💥 Script failed:', error)
    process.exit(1)
  }
}

// Run the script (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { clearVenueDatabase, verifyDatabaseCleared }