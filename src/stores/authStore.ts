import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService, AuthUser, LoginCredentials, RegisterCredentials } from '../services/auth'

interface AuthStore {
  // State
  user: AuthUser | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  clearError: () => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial State
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          const user = await authService.login(credentials)
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false, 
            error: null 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false 
          })
          throw error
        }
      },

      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          const user = await authService.register(credentials)
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false, 
            error: null 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false 
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        
        try {
          await authService.logout()
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: null 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Logout failed',
            isLoading: false 
          })
          throw error
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null })
        
        try {
          await authService.resetPassword(email)
          set({ isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Password reset failed',
            isLoading: false 
          })
          throw error
        }
      },

      clearError: () => {
        set({ error: null })
      },

      initialize: async () => {
        set({ isLoading: true })
        
        try {
          // Set up auth state listener
          const unsubscribe = authService.onAuthStateChange((user) => {
            set({ 
              user, 
              isAuthenticated: user !== null,
              isLoading: false 
            })
          })

          // Get initial user state
          const currentUser = await authService.getCurrentUser()
          set({ 
            user: currentUser, 
            isAuthenticated: currentUser !== null,
            isLoading: false 
          })

          // Store unsubscribe function for cleanup if needed
          // In a real app, you'd want to call this when the app unmounts
          ;(window as any).__authUnsubscribe = unsubscribe
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Initialization failed',
            isLoading: false 
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      // Only persist non-sensitive state
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated
      })
    }
  )
) 