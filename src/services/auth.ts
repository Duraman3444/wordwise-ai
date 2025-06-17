import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  AuthError
} from 'firebase/auth'
import { auth } from '../config/firebase'

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  emailVerified: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  displayName: string
}

class AuthService {
  // Sign in with email and password
  async login({ email, password }: LoginCredentials): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return this.formatUser(userCredential.user)
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  // Register new user
  async register({ email, password, displayName }: RegisterCredentials): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update the user's display name
      await updateProfile(userCredential.user, {
        displayName: displayName
      })

      return this.formatUser(userCredential.user)
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  // Sign out
  async logout(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  // Send password reset email
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      throw this.handleAuthError(error as AuthError)
    }
  }

  // Get current user
  getCurrentUser(): Promise<AuthUser | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe()
        resolve(user ? this.formatUser(user) : null)
      })
    })
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, (user) => {
      callback(user ? this.formatUser(user) : null)
    })
  }

  // Format Firebase user to our AuthUser interface
  private formatUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified
    }
  }

  // Handle Firebase auth errors
  private handleAuthError(error: AuthError): Error {
    let message = 'An error occurred during authentication'

    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No account found with this email address'
        break
      case 'auth/wrong-password':
        message = 'Incorrect password'
        break
      case 'auth/email-already-in-use':
        message = 'An account with this email already exists'
        break
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters'
        break
      case 'auth/invalid-email':
        message = 'Invalid email address'
        break
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later'
        break
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection'
        break
      default:
        message = error.message || 'Authentication failed'
    }

    return new Error(message)
  }
}

export const authService = new AuthService()
export default authService 