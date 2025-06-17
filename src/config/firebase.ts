import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
import { getAnalytics, isSupported } from 'firebase/analytics'

// Check if we have Firebase environment variables
const hasEnvVars = !!(import.meta.env.VITE_FIREBASE_API_KEY && 
                     import.meta.env.VITE_FIREBASE_PROJECT_ID)

// Check if the API key looks real (not demo/placeholder)
const hasValidAPIKey = hasEnvVars && 
                       import.meta.env.VITE_FIREBASE_API_KEY.startsWith('AIza') &&
                       import.meta.env.VITE_FIREBASE_API_KEY.length > 20 &&
                       !import.meta.env.VITE_FIREBASE_API_KEY.includes('demo')

console.log('🔍 Firebase Environment Check:', {
  hasEnvVars,
  hasValidAPIKey,
  apiKeyPrefix: import.meta.env.VITE_FIREBASE_API_KEY?.substring(0, 10) + '...',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  isDemo: !hasValidAPIKey
})

// Firebase configuration - try production first, fallback to demo
const firebaseConfig = hasValidAPIKey ? {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
} : {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo",
  measurementId: "G-DEMO123"
}

console.log('🔥 Firebase Configuration:', {
  mode: hasValidAPIKey ? '🌐 Production Firebase' : '🧪 Demo Mode',
  reason: !hasEnvVars ? 'No environment variables' : 
          !hasValidAPIKey ? 'Invalid/placeholder API key detected' : 
          'Valid configuration found',
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
})

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app)

// Initialize Analytics only for production
let analytics = null
if (typeof window !== 'undefined' && hasValidAPIKey) {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app)
      console.log('✅ Firebase Analytics initialized')
    } else {
      console.log('ℹ️ Firebase Analytics not supported')
    }
  }).catch(error => {
    console.log('ℹ️ Analytics support check failed:', error instanceof Error ? error.message : String(error))
  })
} else if (!hasValidAPIKey) {
  console.log('🧪 Analytics disabled in demo mode')
}

// Connect to emulators in demo mode or when explicitly requested
if ((!hasValidAPIKey || import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') && typeof window !== 'undefined') {
  try {
    if (window.location.hostname === 'localhost') {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
      connectFirestoreEmulator(db, 'localhost', 8080)
      console.log('🔧 Connected to Firebase emulators')
    }
  } catch (error) {
    console.log('ℹ️ Emulator connection failed, using fallback mode:', error instanceof Error ? error.message : String(error))
  }
} else if (hasValidAPIKey) {
  console.log('🌐 Using production Firebase services')
}

export { analytics }
export const isDemoMode = !hasValidAPIKey
export const hasFirebaseCredentials = hasValidAPIKey
export default app 