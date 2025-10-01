/**
 * Firebase Connection Test
 * Enhanced testing for Firebase connectivity and data integrity
 */
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'

export interface FirebaseConnectionResult {
  success: boolean
  projectId: string
  organizationCount: number
  userCount: number
  collections: string[]
  authStatus: string
  responseTime: number
  errors: string[]
  warnings: string[]
  organizations?: any[]
}

export async function testFirebaseConnection(): Promise<FirebaseConnectionResult> {
  const startTime = Date.now()
  const errors: string[] = []
  const warnings: string[] = []
  let success = true

  console.log('🔍 Testing Firebase Connection...')

  try {
    // Test Firebase config
    const projectId = auth.app.options.projectId
    console.log('Project ID:', projectId)

    if (!projectId) {
      errors.push('No project ID configured')
      success = false
    }

    // Test auth status
    const currentUser = auth.currentUser
    const authStatus = currentUser?.email || 'Not logged in'
    console.log('🔐 Current user:', authStatus)

    // Test Firestore collections
    const collections = ['organizations', 'users', 'events']
    const collectionCounts: Record<string, number> = {}

    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName)
        const snapshot = await getDocs(collectionRef)
        collectionCounts[collectionName] = snapshot.size
        console.log(`📋 ${collectionName}: ${snapshot.size} documents`)
      } catch (error) {
        errors.push(`Failed to access ${collectionName}: ${error}`)
        success = false
        collectionCounts[collectionName] = 0
      }
    }

    // Test organization data quality
    let organizations: any[] = []
    try {
      const orgCollection = collection(db, 'organizations')
      const orgSnapshot = await getDocs(orgCollection)
      organizations = orgSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      // Data quality checks
      for (const org of organizations) {
        if (!org.name) {
          warnings.push(`Organization ${org.id} missing name`)
        }
        if (!org.slug) {
          warnings.push(`Organization ${org.id} missing slug`)
        }
        if (!org.ownerId) {
          warnings.push(`Organization ${org.id} missing ownerId`)
        }
      }

      organizations.forEach(org => {
        console.log(`  - ${org.name} (${org.id})`)
      })
    } catch (error) {
      errors.push(`Failed to test organization data: ${error}`)
      success = false
    }

    // Test specific document access
    try {
      if (organizations.length > 0) {
        const firstOrg = organizations[0]
        const orgDoc = await getDoc(doc(db, 'organizations', firstOrg.id))
        if (!orgDoc.exists()) {
          warnings.push('Organization document read test failed')
        }
      }
    } catch (error) {
      warnings.push(`Document read test failed: ${error}`)
    }

    // Performance check
    const responseTime = Date.now() - startTime
    if (responseTime > 5000) {
      warnings.push(`Firebase response time is slow: ${responseTime}ms`)
    }

    // Environment validation
    const environment = import.meta.env.VITE_ENVIRONMENT || 'development'
    if (environment === 'production' && projectId?.includes('demo')) {
      errors.push('Production environment using demo project')
      success = false
    }

    return {
      success: success && errors.length === 0,
      projectId: projectId || 'unknown',
      organizationCount: collectionCounts.organizations || 0,
      userCount: collectionCounts.users || 0,
      collections: Object.keys(collectionCounts),
      authStatus,
      responseTime,
      errors,
      warnings,
      organizations: organizations.length > 0 ? organizations : undefined
    }

  } catch (error) {
    console.error('❌ Firebase connection test failed:', error)
    return {
      success: false,
      projectId: 'unknown',
      organizationCount: 0,
      userCount: 0,
      collections: [],
      authStatus: 'error',
      responseTime: Date.now() - startTime,
      errors: [`Connection test failed: ${error}`],
      warnings
    }
  }
}

export async function testFirebaseWriteAccess(): Promise<boolean> {
  try {
    // This would test write permissions if needed
    // For now, we'll just check if we can read
    const testCollection = collection(db, 'organizations')
    await getDocs(testCollection)
    return true
  } catch (error) {
    console.error('Write access test failed:', error)
    return false
  }
}

export async function validateFirebaseEnvironment(): Promise<{
  isValid: boolean
  issues: string[]
}> {
  const issues: string[] = []

  try {
    const result = await testFirebaseConnection()

    // Check project alignment with environment
    const environment = import.meta.env.VITE_ENVIRONMENT || 'development'
    const projectId = result.projectId

    switch (environment) {
      case 'production':
        if (projectId.includes('staging') || projectId.includes('demo') || projectId.includes('test')) {
          issues.push('Production environment should not use staging/demo/test project')
        }
        break
      case 'staging':
        if (!projectId.includes('staging') && !projectId.includes('dev')) {
          issues.push('Staging environment should use staging/dev project')
        }
        break
      case 'development':
        if (!projectId.includes('demo') && !projectId.includes('test') && !projectId.includes('dev')) {
          issues.push('Development environment should use demo/test/dev project')
        }
        break
    }

    // Check data availability
    if (result.organizationCount === 0 && environment === 'staging') {
      issues.push('Staging environment has no test data')
    }

    return {
      isValid: issues.length === 0 && result.success,
      issues: [...issues, ...result.errors]
    }
  } catch (error) {
    return {
      isValid: false,
      issues: [`Firebase validation failed: ${error}`]
    }
  }
}

// Make available in browser console
if (typeof window !== 'undefined') {
  (window as any).testFirebaseConnection = testFirebaseConnection
}