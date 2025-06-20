import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PenTool, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [stayLoggedIn, setStayLoggedIn] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(formData.email, formData.password, stayLoggedIn)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      
      let errorMessage = 'Login failed. Please try again.'
      
      if (error?.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.'
      } else if (error?.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.'
      } else if (error?.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.'
      } else if (error?.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.'
      } else if (error?.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.'
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    toast('Google Sign-In is coming soon! For now, please use email and password.', {
      icon: 'ℹ️',
      duration: 4000,
    })
    // TODO: Implement Google OAuth when Firebase project is properly configured
    // const provider = new GoogleAuthProvider()
    // await signInWithPopup(auth, provider)
  }

  const handleGitHubSignIn = async () => {
    toast('GitHub Sign-In is coming soon! For now, please use email and password.', {
      icon: 'ℹ️',
      duration: 4000,
    })
    // TODO: Implement GitHub OAuth when Firebase project is properly configured  
    // const provider = new GithubAuthProvider()
    // await signInWithPopup(auth, provider)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <PenTool className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Sign in to WordWise
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
          >
            Sign up here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700 transition-colors">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              name="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'relative', right: 'auto', top: 'auto', marginTop: '-2.5rem', marginRight: '0.75rem', float: 'right' }}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="stay-logged-in"
                  name="stay-logged-in"
                  type="checkbox"
                  checked={stayLoggedIn}
                  onChange={(e) => setStayLoggedIn(e.target.checked)}
                  className="h-4 w-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="stay-logged-in" className="ml-2 block text-sm text-gray-900 dark:text-gray-200 cursor-pointer">
                  Stay logged in for 30 days
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button
                type="button"
                onClick={handleGitHubSignIn}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.291 3.438 9.8 8.206 11.389.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112.017 6c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.097 8.199-11.386C24.004 5.367 18.635.001 12.017.001z"/>
                </svg>
                <span className="ml-2">GitHub</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 