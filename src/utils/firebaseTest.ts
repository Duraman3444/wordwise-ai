// Simple Firebase configuration test
export const testFirebaseConfig = () => {
  console.log('Firebase Config Test:')
  console.log('API Key:', import.meta.env.VITE_FIREBASE_API_KEY?.substring(0, 10) + '...')
  console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID)
  console.log('Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN)
  
  // Check if all required fields are present
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ]
  
  const missing = required.filter(key => !import.meta.env[key])
  
  if (missing.length > 0) {
    console.error('Missing Firebase config:', missing)
    return false
  }
  
  console.log('✅ All Firebase config variables present')
  return true
} 