// Environment configuration and data source routing
export type EnvironmentType = 'development' | 'staging' | 'production'
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

// Validate critical environment variables (only Firebase required for initial load)
function validateCoreEnvironmentVariables(): void {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID'
    // VITE_JWT_SECRET is optional - only needed for QR code generation
  ];

  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Optional validation for JWT secret (only if provided)
  const jwtSecret = import.meta.env.VITE_JWT_SECRET;
  if (jwtSecret) {
    if (jwtSecret.length < 32) {
      console.warn('⚠️ JWT secret should be at least 32 characters for security');
    }

    if ((jwtSecret.includes('dev-') || jwtSecret.includes('staging-')) && import.meta.env.VITE_ENVIRONMENT === 'production') {
      throw new Error('🚨 Development/staging JWT secret detected in production environment!');
    }
  } else {
    console.log('ℹ️ JWT secret not provided - QR code generation features will be disabled');
  }
}

// Get Firebase config from environment variables
function getFirebaseConfigFromEnv() {
  // Only validate core Firebase variables needed for app initialization
  validateCoreEnvironmentVariables();

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
    dataSource: 'api', // Use API for budget calculator testing
    apiBaseUrl: 'https://www.voxxyai.com/api', // Development API
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
    dataSource: 'api', // Use API for budget system testing in staging
    apiBaseUrl: 'https://www.voxxyai.com/api', // Staging API
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
    dataSource: 'firebase', // Use Firebase for organizations, API for venues
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://heyvoxxy.com/api', // Production API
    firebaseConfig: getFirebaseConfigFromEnv(),
    features: {
      adminControls: true, // Controlled admin access
      debugMode: false, // Debug mode disabled
      experimentalFeatures: false,
      dataSyncFromProduction: false
    }
  }
}

// Cache environment detection to avoid repeated hostname checks
let cachedEnvironment: EnvironmentType | null = null

// Detect current environment
export function getCurrentEnvironment(): EnvironmentType {
  // Return cached result if available
  if (cachedEnvironment !== null) {
    return cachedEnvironment
  }

  // Check for explicit environment override
  const envOverride = import.meta.env.VITE_ENVIRONMENT as EnvironmentType
  if (envOverride && environments[envOverride]) {
    cachedEnvironment = envOverride
    console.log(`🔧 Environment explicitly set: ${envOverride}`)
    return envOverride
  }

  // Detect based on hostname
  const hostname = window.location.hostname

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    cachedEnvironment = 'development'
  } else if (hostname.includes('onrender.com') || (hostname.includes('staging') && !hostname.includes('herokuapp.com'))) {
    // Only consider it staging if it's on render.com OR contains staging but NOT on Heroku
    // This fixes the issue where production Heroku URLs contain 'staging' in the app name
    cachedEnvironment = 'staging'
  } else {
    cachedEnvironment = 'production'
  }

  // Log only once when first detected
  console.log(`🔧 Environment detected: ${cachedEnvironment} (${hostname})`)
  
  return cachedEnvironment
}

// Cache environment config to avoid repeated lookups
let cachedConfig: EnvironmentConfig | null = null

// Get current environment configuration
export function getEnvironmentConfig(): EnvironmentConfig {
  // Return cached config if available
  if (cachedConfig !== null) {
    return cachedConfig
  }

  const currentEnv = getCurrentEnvironment()
  const config = environments[currentEnv]
  
  // Cache the config
  cachedConfig = config
  
  return config
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

// Get venue-specific data source (venues always use API in production)
export function getVenueDataSource(): DataSourceType {
  const currentEnv = getCurrentEnvironment()

  // Venues always use API in production, regardless of general dataSource setting
  if (currentEnv === 'production') {
    return 'api'
  }

  // Use general data source for dev/staging
  return getDataSource()
}

// Get user-specific data source (users use API in production for beta status consistency)
export function getUserDataSource(): DataSourceType {
  const currentEnv = getCurrentEnvironment()

  // Users use API in production to ensure beta status sync with admin panel
  if (currentEnv === 'production') {
    return 'api'
  }

  // Use general data source for dev/staging
  return getDataSource()
}

// Get budget-specific data source (budgets always use API as there's no Firebase implementation)
export function getBudgetDataSource(): DataSourceType {
  // Budgets always use API in all environments (no Firebase implementation exists)
  return 'api'
}