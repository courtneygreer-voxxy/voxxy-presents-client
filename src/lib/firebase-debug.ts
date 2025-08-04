// Temporary debug file to check environment variables
// SECURITY: Removed API key logging - was exposing sensitive data in production console

export const debugEnvVars = () => {
  // SECURITY: Disabled - was logging sensitive API keys to production console
  // Only enable in development if needed for debugging
  if (import.meta.env.DEV) {
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '***CONFIGURED***' : 'MISSING',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '***CONFIGURED***' : 'MISSING',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '***CONFIGURED***' : 'MISSING',
    }
    
    console.log('Firebase config status:', config)
  }
}