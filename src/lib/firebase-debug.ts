// Temporary debug file to check environment variables
console.log('Environment Variables Debug:')
console.log('VITE_FIREBASE_API_KEY:', import.meta.env.VITE_FIREBASE_API_KEY)
console.log('VITE_FIREBASE_PROJECT_ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID)
console.log('All env vars:', import.meta.env)

export const debugEnvVars = () => {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  }
  
  console.log('Firebase config being used:', config)
  
  // Check for missing values
  Object.entries(config).forEach(([key, value]) => {
    if (!value || value === 'undefined') {
      console.error(`❌ Missing environment variable for ${key}`)
    } else {
      console.log(`✅ ${key}: ${value.substring(0, 10)}...`)
    }
  })
}