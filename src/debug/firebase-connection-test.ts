/**
 * Firebase Connection Test
 * Use this to debug which Firebase project the app is connecting to
 */
import { db, auth } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export async function testFirebaseConnection() {
  console.log('🔍 Testing Firebase Connection...')

  // Test Firebase config
  console.log('Firebase Auth:', auth.app.options)
  console.log('Project ID:', auth.app.options.projectId)

  try {
    // Test Firestore connection
    const orgCollection = collection(db, 'organizations')
    const orgSnapshot = await getDocs(orgCollection)
    console.log(`📋 Found ${orgSnapshot.size} organizations in database`)

    orgSnapshot.forEach(doc => {
      console.log(`  - ${doc.data().name} (${doc.id})`)
    })

    // Test auth connection
    const currentUser = auth.currentUser
    console.log('🔐 Current user:', currentUser?.email || 'Not logged in')

    return {
      projectId: auth.app.options.projectId,
      organizationCount: orgSnapshot.size,
      organizations: orgSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    }

  } catch (error) {
    console.error('❌ Firebase connection test failed:', error)
    throw error
  }
}

// Make available in browser console
if (typeof window !== 'undefined') {
  (window as any).testFirebaseConnection = testFirebaseConnection
}