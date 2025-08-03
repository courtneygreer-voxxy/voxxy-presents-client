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

// Environment configurations
const environments: Record<EnvironmentType, EnvironmentConfig> = {
  development: {
    name: 'development',
    dataSource: 'firebase', // Direct Firebase for fast iteration
    firebaseConfig: {
      apiKey: "AIzaSyDZ1_PgIRsVjHc7N2unw_AgTfvdP3yuCp4",
      authDomain: "voxxy-presents-dev.firebaseapp.com",
      databaseURL: "https://voxxy-presents-dev-default-rtdb.firebaseio.com",
      projectId: "voxxy-presents-dev",
      storageBucket: "voxxy-presents-dev.firebasestorage.app",
      messagingSenderId: "21877606291",
      appId: "1:21877606291:web:4a3cf58073acd5e2d84a66",
      measurementId: "G-FTKDVEVRNK"
    },
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
    apiBaseUrl: 'https://voxxy-presents-api-staging.run.app/api', // TODO: Set up staging API
    firebaseConfig: {
      apiKey: "AIzaSyDZ1_PgIRsVjHc7N2unw_AgTfvdP3yuCp4", // Same as dev for fallback
      authDomain: "voxxy-presents-staging.firebaseapp.com",
      databaseURL: "https://voxxy-presents-staging-default-rtdb.firebaseio.com",
      projectId: "voxxy-presents-staging",
      storageBucket: "voxxy-presents-staging.firebasestorage.app",
      messagingSenderId: "21877606291",
      appId: "1:21877606291:web:4a3cf58073acd5e2d84a66",
      measurementId: "G-FTKDVEVRNK"
    },
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
    apiBaseUrl: 'https://voxxy-presents-api-dlr7d5geuq-uc.a.run.app/api',
    firebaseConfig: {
      apiKey: "AIzaSyCllC4e-OZWJLdu97cgmEyuxpq75_ln5Ms",
      authDomain: "voxxy-presents.firebaseapp.com",
      databaseURL: "https://voxxy-presents-default-rtdb.firebaseio.com",
      projectId: "voxxy-presents",
      storageBucket: "voxxy-presents.firebasestorage.app",
      messagingSenderId: "267601188129",
      appId: "1:267601188129:web:ce80873298d39444ac1a60",
      measurementId: "G-Q74Z0C9R28"
    },
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
    firebaseConfig: {
      apiKey: "AIzaSyDZ1_PgIRsVjHc7N2unw_AgTfvdP3yuCp4", // TODO: Create sandbox Firebase project
      authDomain: "voxxy-presents-sandbox.firebaseapp.com",
      databaseURL: "https://voxxy-presents-sandbox-default-rtdb.firebaseio.com",
      projectId: "voxxy-presents-sandbox",
      storageBucket: "voxxy-presents-sandbox.firebasestorage.app",
      messagingSenderId: "21877606291",
      appId: "1:21877606291:web:4a3cf58073acd5e2d84a66",
      measurementId: "G-FTKDVEVRNK"
    },
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