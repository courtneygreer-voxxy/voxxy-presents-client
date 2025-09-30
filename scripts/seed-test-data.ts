#!/usr/bin/env ts-node

/**
 * Firebase Test Data Seeding Script
 * Creates consistent test accounts and data for development/staging
 * Can be run for staging or production environments
 */

import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Environment configuration
interface EnvironmentConfig {
  projectId: string
  serviceAccountPath: string
}

const environments: Record<string, EnvironmentConfig> = {
  development: {
    projectId: 'voxxy-presents-staging', // Use staging for dev
    serviceAccountPath: './config/voxxy-presents-staging-service-account.json'
  },
  staging: {
    projectId: 'voxxy-presents-staging',
    serviceAccountPath: './config/voxxy-presents-staging-service-account.json'
  },
  production: {
    projectId: 'voxxy-presents',
    serviceAccountPath: './config/voxxy-presents-production-service-account.json'
  }
}

// Test account configurations
const testAccounts = {
  venueOwner: {
    email: 'venue-test@voxxypresents.com',
    password: 'VenueTest123!',
    displayName: 'Venue Test Owner',
    role: 'venue_owner'
  },
  organizer: {
    email: 'org-test@voxxypresents.com',
    password: 'OrgTest123!',
    displayName: 'Organization Test Owner',
    role: 'organizer'
  },
  admin: {
    email: 'admin-test@voxxypresents.com',
    password: 'AdminTest123!',
    displayName: 'Admin Test User',
    role: 'admin'
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
 * Create a test user account
 */
async function createTestUser(accountType: string, config: typeof testAccounts.venueOwner): Promise<string> {
  try {
    console.log(`👤 Creating ${accountType} test account: ${config.email}`)

    // Create authentication user
    const userRecord = await admin.auth().createUser({
      email: config.email,
      password: config.password,
      displayName: config.displayName,
      emailVerified: true
    })

    // Create user profile in Firestore
    const userProfile = {
      name: config.displayName,
      email: config.email,
      role: config.role,
      emailVerified: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      // Venue owners get simplified approval
      approvalStatus: config.role === 'venue_owner' ? 'approved' : 'approved',
      betaAccess: true,
      isTestAccount: true
    }

    await admin.firestore().collection('users').doc(userRecord.uid).set(userProfile)

    console.log(`   ✅ Created ${accountType}: ${config.email} (${userRecord.uid})`)
    return userRecord.uid

  } catch (error) {
    console.error(`   ❌ Failed to create ${accountType}:`, error)
    throw error
  }
}

/**
 * Create test venue for venue owner
 */
async function createTestVenue(ownerId: string): Promise<string> {
  try {
    console.log('🏢 Creating test venue: Brooklyn Loft')

    const venueData = {
      name: 'Brooklyn Loft',
      slug: 'brooklyn-loft',
      description: 'A modern industrial bar in the heart of Brooklyn with a beautiful back area that can host small intimate events like dinner clubs, wine tasting clubs, art meet ups, and community gatherings.',
      address: '123 Industrial Ave, Brooklyn, NY 11201',
      coordinates: {
        lat: 40.7021,
        lng: -73.9865
      },
      hours: {
        monday: { open: '17:00', close: '01:00' },
        tuesday: { open: '17:00', close: '01:00' },
        wednesday: { open: '17:00', close: '01:00' },
        thursday: { open: '17:00', close: '02:00' },
        friday: { open: '17:00', close: '02:00' },
        saturday: { open: '15:00', close: '02:00' },
        sunday: { open: '15:00', close: '00:00' }
      },
      capacity: 60,
      venueType: 'bar',
      amenities: [
        'Full Bar',
        'Kitchen',
        'Sound System',
        'WiFi',
        'ADA Accessible',
        'Outdoor Seating'
      ],
      photos: [
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
      ],
      contactInfo: {
        email: 'venue-test@voxxypresents.com',
        phone: '+1 (555) 123-4567',
        website: 'https://brooklynloft.example.com',
        instagram: '@brooklynloft'
      },
      accessibility: {
        wheelchairAccessible: true,
        lgbtqFriendly: true,
        '420Friendly': false,
        genderNeutralBathrooms: true
      },
      claimStatus: 'approved',
      ownerId: ownerId,
      pricingType: 'both',
      approvedAt: admin.firestore.Timestamp.now(),
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      isTestData: true
    }

    const venueRef = await admin.firestore().collection('venues').add(venueData)

    console.log(`   ✅ Created test venue: Brooklyn Loft (${venueRef.id})`)
    return venueRef.id

  } catch (error) {
    console.error('   ❌ Failed to create test venue:', error)
    throw error
  }
}

/**
 * Create test organization for organizer
 */
async function createTestOrganization(ownerId: string): Promise<string> {
  try {
    console.log('🏛️ Creating test organization: Test Events Co')

    const orgData = {
      name: 'Test Events Co',
      slug: 'test-events-co',
      description: 'A test organization for hosting community events, workshops, and social gatherings.',
      background: 'We organize engaging community events that bring people together for learning, networking, and fun.',
      contactEmail: 'org-test@voxxypresents.com',
      logoUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
      socialLinks: {
        website: 'https://testevents.example.com',
        instagram: '@testeventsco',
        twitter: '@testeventsco'
      },
      settings: {
        defaultLocation: 'Brooklyn, NY',
        defaultAddress: '123 Event St, Brooklyn, NY 11201',
        theme: {
          primaryColor: '#9333ea',
          backgroundColor: '#111827'
        },
        notifications: {
          emailUpdates: true,
          newEvents: true
        }
      },
      ownerId: ownerId,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      isTestData: true
    }

    const orgRef = await admin.firestore().collection('organizations').add(orgData)

    console.log(`   ✅ Created test organization: Test Events Co (${orgRef.id})`)
    return orgRef.id

  } catch (error) {
    console.error('   ❌ Failed to create test organization:', error)
    throw error
  }
}

/**
 * Create a test event
 */
async function createTestEvent(organizationId: string, venueId: string): Promise<string> {
  try {
    console.log('🎉 Creating test event: Community Wine Tasting')

    const eventDate = new Date()
    eventDate.setDate(eventDate.getDate() + 14) // 2 weeks from now
    eventDate.setHours(19, 0, 0, 0) // 7 PM

    const endDate = new Date(eventDate)
    endDate.setHours(21, 30, 0, 0) // 9:30 PM

    const eventData = {
      title: 'Community Wine Tasting',
      description: 'Join us for an intimate wine tasting experience featuring local Brooklyn wines. Learn about different varietals while meeting fellow wine enthusiasts in our cozy loft space.',
      date: admin.firestore.Timestamp.fromDate(eventDate),
      endDate: admin.firestore.Timestamp.fromDate(endDate),
      location: 'Brooklyn Loft',
      address: '123 Industrial Ave, Brooklyn, NY 11201',
      capacity: 30,
      attendeeCount: 0,
      organizationId: organizationId,
      venueId: venueId,
      ticketInfo: {
        price: 45,
        currency: 'USD',
        includesFood: true,
        includesDrinks: true
      },
      tags: ['wine', 'tasting', 'community', 'brooklyn'],
      status: 'published',
      visibility: 'public',
      requiresApproval: false,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      isTestData: true
    }

    const eventRef = await admin.firestore().collection('events').add(eventData)

    console.log(`   ✅ Created test event: Community Wine Tasting (${eventRef.id})`)
    return eventRef.id

  } catch (error) {
    console.error('   ❌ Failed to create test event:', error)
    throw error
  }
}

/**
 * Main seeding function
 */
async function seedTestData(env: string): Promise<void> {
  console.log(`\n🌱 Seeding Test Data - ${env.toUpperCase()} Environment`)
  console.log('=' .repeat(50))

  try {
    // Initialize Firebase
    initializeFirebase(env)

    const startTime = Date.now()

    // Create test users
    const venueOwnerId = await createTestUser('Venue Owner', testAccounts.venueOwner)
    const organizerId = await createTestUser('Organizer', testAccounts.organizer)
    const adminId = await createTestUser('Admin', testAccounts.admin)

    // Create test venue
    const venueId = await createTestVenue(venueOwnerId)

    // Create test organization
    const organizationId = await createTestOrganization(organizerId)

    // Create test event
    const eventId = await createTestEvent(organizationId, venueId)

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.log('\n🎉 Test data seeding completed successfully!')
    console.log(`⏱️  Total time: ${duration} seconds`)
    console.log(`📊 Environment: ${env.toUpperCase()}`)
    console.log('')
    console.log('📋 Test Accounts Created:')
    console.log(`   👤 Venue Owner: ${testAccounts.venueOwner.email} / ${testAccounts.venueOwner.password}`)
    console.log(`   👤 Organizer: ${testAccounts.organizer.email} / ${testAccounts.organizer.password}`)
    console.log(`   👤 Admin: ${testAccounts.admin.email} / ${testAccounts.admin.password}`)
    console.log('')
    console.log('📋 Test Data Created:')
    console.log(`   🏢 Venue: Brooklyn Loft (${venueId})`)
    console.log(`   🏛️ Organization: Test Events Co (${organizationId})`)
    console.log(`   🎉 Event: Community Wine Tasting (${eventId})`)
    console.log('')
    console.log('✨ Ready for testing!')

  } catch (error) {
    console.error('\n💥 Seeding failed:', error)
    process.exit(1)
  }
}

// CLI Usage
if (require.main === module) {
  const env = process.argv[2]

  if (!env || !environments[env]) {
    console.error('Usage: npm run seed-data <environment>')
    console.error('Environments: staging, production')
    process.exit(1)
  }

  seedTestData(env).catch(error => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })
}

export { seedTestData }