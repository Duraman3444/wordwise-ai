import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Function to get initial theme immediately
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light'
  
  const savedTheme = localStorage.getItem('wordwise-theme') as Theme
  if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
    return savedTheme
  }
  
  // Check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const initialTheme = getInitialTheme()
    // Apply theme immediately to prevent flash
    if (typeof window !== 'undefined') {
      document.documentElement.className = initialTheme
    }
    return initialTheme
  })

  // Update document class and localStorage when theme changes
  useEffect(() => {
    document.documentElement.className = theme
    localStorage.setItem('wordwise-theme', theme)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    setThemeState(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  const value = {
    theme,
    toggleTheme,
    setTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
} 