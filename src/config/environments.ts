// Environment configuration and data source routing
export type EnvironmentType = 'development' | 'staging' | 'production' | 'sandbox'
export type DataSourceType = 'firebase' | 'api' | 'hybrid'

interface EnvironmentConfig {
  name: EnvironmentType
  dataSource: DataSourceType
  apiBaseUrl?: string
  firebaseConfig: {
    apiKey: string
    authDomain: string
    databaseURL: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
    measurementId: string
  }
  features: {
    adminControls: boolean
    debugMode: boolean
    experimentalFeatures: boolean
    dataSyncFromProduction: boolean
  }
}

// Get Firebase config from environment variables
function getFirebaseConfigFromEnv() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  }
}

// Environment configurations
const environments: Record<EnvironmentType, EnvironmentConfig> = {
  development: {
    name: 'development',
    dataSource: 'firebase', // Direct Firebase for fast iteration
    firebaseConfig: getFirebaseConfigFromEnv(),
    features: {
      adminControls: true,
      debugMode: true,
      experimentalFeatures: true,
      dataSyncFromProduction: false
    }
  },

  staging: {
    name: 'staging',
    dataSource: 'api', // API with production data mirror
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://voxxy-presents-api-staging.run.app/api',
    firebaseConfig: getFirebaseConfigFromEnv(),
    features: {
      adminControls: true,
      debugMode: true,
      experimentalFeatures: false,
      dataSyncFromProduction: true // Sync data from production for testing
    }
  },

  production: {
    name: 'production',
    dataSource: 'api', // Production API
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://voxxy-presents-api-dlr7d5geuq-uc.a.run.app/api',
    firebaseConfig: getFirebaseConfigFromEnv(),
    features: {
      adminControls: true, // Controlled admin access
      debugMode: false,
      experimentalFeatures: false,
      dataSyncFromProduction: false
    }
  },

  sandbox: {
    name: 'sandbox',
    dataSource: 'firebase', // Direct Firebase for experimentation
    firebaseConfig: getFirebaseConfigFromEnv(),
    features: {
      adminControls: true,
      debugMode: true,
      experimentalFeatures: true, // All experimental features enabled
      dataSyncFromProduction: false // Independent data for experimentation
    }
  }
}

// Detect current environment
export function getCurrentEnvironment(): EnvironmentType {
  // Check for explicit environment override
  const envOverride = import.meta.env.VITE_ENVIRONMENT as EnvironmentType
  if (envOverride && environments[envOverride]) {
    return envOverride
  }

  // Detect based on hostname
  const hostname = window.location.hostname
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development'
  } else if (hostname.includes('staging') || hostname.includes('dev')) {
    return 'staging'
  } else if (hostname.includes('sandbox') || hostname.includes('experimental')) {
    return 'sandbox'
  } else {
    return 'production'
  }
}

// Get current environment configuration
export function getEnvironmentConfig(): EnvironmentConfig {
  const currentEnv = getCurrentEnvironment()
  return environments[currentEnv]
}

// Check if feature is enabled in current environment
export function isFeatureEnabled(feature: keyof EnvironmentConfig['features']): boolean {
  const config = getEnvironmentConfig()
  return config.features[feature]
}

// Get data source for current environment
export function getDataSource(): DataSourceType {
  const config = getEnvironmentConfig()
  return config.dataSource
}

// Get API URL for current environment (if using API)
export function getApiUrl(): string | undefined {
  const config = getEnvironmentConfig()
  return config.apiBaseUrl
}

// Get Firebase config for current environment
export function getFirebaseConfig() {
  const config = getEnvironmentConfig()
  return config.firebaseConfig
}