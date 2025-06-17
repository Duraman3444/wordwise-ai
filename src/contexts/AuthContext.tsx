import React, { createContext, useContext, useEffect } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, isDemoMode } from '../config/firebase'
import { useAuthStore } from '../store/authStore'
import { User, UserPreferences } from '../types'
import { demoAuthService, DemoUser } from '../services/demoAuth'

interface AuthContextType {
  login: (email: string, password: string, stayLoggedIn?: boolean) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper function to retry Firestore operations
const retryFirestoreOperation = async <T,>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error: any) {
      console.log(`Firestore operation attempt ${i + 1} failed:`, error.message)
      
      if (i === maxRetries - 1) throw error
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}

// Helper function to create default user preferences
const createDefaultPreferences = (): UserPreferences => ({
  targetAudience: 'students',
  writingStyle: 'academic',
  suggestions: {
    grammar: true,
    style: true,
    vocabulary: true,
    clarity: true,
    tone: true,
  },
  autoSave: true,
  theme: 'light',
})

// Helper function to check for persistent login
const checkPersistentLogin = async (login: (email: string, password: string) => Promise<void>) => {
  const stayLoggedIn = localStorage.getItem('wordwise-stay-logged-in')
  const autoLoginData = localStorage.getItem('wordwise-auto-login')
  
  if (stayLoggedIn === 'true' && autoLoginData) {
    try {
      const { email, timestamp } = JSON.parse(autoLoginData)
      const now = Date.now()
      const dayInMs = 24 * 60 * 60 * 1000
      const maxAge = 30 * dayInMs // 30 days
      
      // Check if the stored login is not too old (30 days)
      if (now - timestamp < maxAge) {
        console.log('🔄 Attempting auto-login for persistent session...')
        // We don't actually store the password for security reasons
        // Instead, we'll rely on the browser's existing session/cookies
        // This will work if the user is still authenticated with Firebase
        return true
      } else {
        console.log('⏰ Persistent login expired, clearing stored data')
        localStorage.removeItem('wordwise-stay-logged-in')
        localStorage.removeItem('wordwise-auto-login')
      }
    } catch (error) {
      console.error('Error parsing auto-login data:', error)
      localStorage.removeItem('wordwise-stay-logged-in')
      localStorage.removeItem('wordwise-auto-login')
    }
  }
  
  return false
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { login: loginStore, logout: logoutStore, setLoading } = useAuthStore()

  useEffect(() => {
    // Check for persistent login first
    const initializeAuth = async () => {
      const shouldAutoLogin = await checkPersistentLogin(login)
      
      if (isDemoMode) {
        console.log('🧪 Using demo authentication mode')
        
        // Use demo auth service
        const unsubscribe = demoAuthService.onAuthStateChange(async (demoUser: DemoUser | null) => {
          setLoading(true)
          
          if (demoUser) {
            const user: User = {
              id: demoUser.uid,
              email: demoUser.email!,
              name: demoUser.displayName || 'Demo User',
              avatar: undefined,
              preferences: createDefaultPreferences(),
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            loginStore(user)
          } else {
            logoutStore()
          }
          
          setLoading(false)
        })

        return () => unsubscribe()
      } else {
        console.log('🌐 Using Firebase authentication')
        
        // Use Firebase auth
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          setLoading(true)
          
          if (firebaseUser) {
            try {
              console.log('🔍 Checking user document for:', firebaseUser.uid)
              
              // Try to get user document from Firestore
              const userDoc = await retryFirestoreOperation(async () => {
                return await getDoc(doc(db, 'users', firebaseUser.uid))
              })
              
              if (userDoc.exists()) {
                // User document exists, load user data
                const userData = userDoc.data()
                const user: User = {
                  id: firebaseUser.uid,
                  email: firebaseUser.email!,
                  name: userData.name,
                  avatar: userData.avatar,
                  preferences: userData.preferences,
                  createdAt: userData.createdAt?.toDate() || new Date(),
                  updatedAt: userData.updatedAt?.toDate() || new Date(),
                }
                console.log('✅ User document loaded successfully')
                loginStore(user)
              } else {
                // User exists in Auth but not in Firestore - create the document
                console.log('🔧 User document not found, creating one...')
                
                // Use displayName from Firebase Auth if available, otherwise use a default
                const userName = firebaseUser.displayName || 'User'
                
                const defaultPreferences = createDefaultPreferences()
                const userData = {
                  name: userName,
                  preferences: defaultPreferences,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }
                
                await retryFirestoreOperation(async () => {
                  await setDoc(doc(db, 'users', firebaseUser.uid), userData)
                })
                
                const user: User = {
                  id: firebaseUser.uid,
                  email: firebaseUser.email!,
                  name: userData.name,
                  avatar: undefined,
                  preferences: userData.preferences,
                  createdAt: userData.createdAt,
                  updatedAt: userData.updatedAt,
                }
                
                console.log('✅ User document created and user logged in')
                loginStore(user)
              }
            } catch (error) {
              console.error('❌ Error handling user authentication:', error)
              
              // If Firestore is completely unavailable, create a temporary user
              const user: User = {
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                name: firebaseUser.displayName || 'User',
                avatar: undefined,
                preferences: createDefaultPreferences(),
                createdAt: new Date(),
                updatedAt: new Date(),
              }
              
              console.log('⚠️ Using temporary user due to Firestore error')
              loginStore(user)
            }
          } else {
            // Only log out if we're not attempting auto-login
            if (!shouldAutoLogin) {
              logoutStore()
            }
          }
          
          setLoading(false)
        })

        return () => unsubscribe()
      }
    }

    initializeAuth()
  }, [loginStore, logoutStore, setLoading])

  const login = async (email: string, password: string, stayLoggedIn?: boolean) => {
    if (isDemoMode) {
      try {
        await demoAuthService.login({ email, password })
        // User data will be loaded by the auth state listener
      } catch (error) {
        console.error('Demo login error:', error)
        throw error
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password)
        // User data will be loaded by the onAuthStateChanged listener
      } catch (error) {
        console.error('Firebase login error:', error)
        throw error
      }
    }

    // Handle stay logged in functionality
    if (stayLoggedIn) {
      localStorage.setItem('wordwise-stay-logged-in', 'true')
      localStorage.setItem('wordwise-auto-login', JSON.stringify({
        email,
        timestamp: Date.now()
      }))
    } else {
      localStorage.removeItem('wordwise-stay-logged-in')
      localStorage.removeItem('wordwise-auto-login')
    }
  }

  const register = async (email: string, password: string, name: string) => {
    if (isDemoMode) {
      try {
        console.log('🚀 Starting demo registration process...')
        
        await demoAuthService.register({ 
          email, 
          password, 
          displayName: name 
        })
        
        console.log('✅ Demo user created successfully!')
        // User data will be loaded by the auth state listener
      } catch (error: any) {
        console.error('❌ Demo registration error:', error)
        throw error
      }
    } else {
      try {
        console.log('🚀 Starting Firebase registration process...')
        
        const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
        
        console.log('✅ Firebase user created successfully:', firebaseUser.uid)
        
        // Update the user's display name in Firebase Auth
        console.log('👤 Updating user profile with name:', name)
        await updateProfile(firebaseUser, {
          displayName: name
        })
        
        // Wait a bit for auth token to propagate
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const defaultPreferences = createDefaultPreferences()

        console.log('💾 Saving user data to Firestore...')
        
        // Save user data to Firestore with retry logic
        await retryFirestoreOperation(async () => {
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            name,
            preferences: defaultPreferences,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        })

        console.log('✅ User data saved successfully!')
        
        // Note: Don't manually call loginStore here - let onAuthStateChanged handle it
        // This prevents race conditions
        
      } catch (error: any) {
        console.error('❌ Firebase registration error:', error)
        
        // Provide more specific error messages
        let errorMessage = 'Registration failed. Please try again.'
        
        if (error.code === 'auth/network-request-failed') {
          errorMessage = 'Network error. Please check your internet connection and try again.'
        } else if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'An account with this email already exists.'
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Password should be at least 6 characters long.'
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Please enter a valid email address.'
        } else if (error.code === 'permission-denied') {
          errorMessage = 'Account created but data save failed. Please try logging in.'
        } else if (error.message) {
          errorMessage = error.message
        }
        
        throw new Error(errorMessage)
      }
    }
  }

  const logout = async () => {
    // Clear persistent login data when user explicitly logs out
    localStorage.removeItem('wordwise-stay-logged-in')
    localStorage.removeItem('wordwise-auto-login')
    
    if (isDemoMode) {
      try {
        await demoAuthService.logout()
        logoutStore()
      } catch (error) {
        console.error('Demo logout error:', error)
        throw error
      }
    } else {
      try {
        await signOut(auth)
        logoutStore()
      } catch (error) {
        console.error('Firebase logout error:', error)
        throw error
      }
    }
  }

  const value = {
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 