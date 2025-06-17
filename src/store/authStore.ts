import { create } from 'zustand'
import { User } from '@/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: (user: User) => {
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    })
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  updateUser: (updates: Partial<User>) => {
    const currentUser = get().user
    if (currentUser) {
      set({
        user: {
          ...currentUser,
          ...updates,
          updatedAt: new Date(),
        },
      })
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
})) 