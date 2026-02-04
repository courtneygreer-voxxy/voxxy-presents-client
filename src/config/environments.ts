// Environment configuration and data source routing
export type EnvironmentType = 'development' | 'staging' | 'production'
export type DataSourceType = 'api'

interface EnvironmentConfig {
  name: EnvironmentType
  dataSource: DataSourceType
  apiBaseUrl: string
  features: {
    adminControls: boolean
    debugMode: boolean
    experimentalFeatures: boolean
    dataSyncFromProduction: boolean
  }
}


// Environment configurations
const environments: Record<EnvironmentType, EnvironmentConfig> = {
  development: {
    name: 'development',
    dataSource: 'api',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    features: {
      adminControls: true,
      debugMode: true,
      experimentalFeatures: true,
      dataSyncFromProduction: false
    }
  },

  staging: {
    name: 'staging',
    dataSource: 'api',
    apiBaseUrl: 'https://www.voxxyai.com/api',
    features: {
      adminControls: true,
      debugMode: true,
      experimentalFeatures: false,
      dataSyncFromProduction: true
    }
  },

  production: {
    name: 'production',
    dataSource: 'api',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://www.heyvoxxy.com/api',
    features: {
      adminControls: true,
      debugMode: false,
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

// Get API URL for current environment
export function getApiUrl(): string {
  const config = getEnvironmentConfig()
  return config.apiBaseUrl
}

// Check if we're in development or staging (for dev tools)
export function isDevOrStaging(): boolean {
  const env = getCurrentEnvironment()
  return env === 'development' || env === 'staging'
}