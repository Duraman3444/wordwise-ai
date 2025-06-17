import React, { useState, useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import { EditorEnhanced } from './pages/EditorEnhanced'
import { testFirebaseConfig } from './utils/firebaseTest'

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'editor'>('landing')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  
  // Auth state and actions
  const { 
    user, 
    isLoading, 
    error, 
    isAuthenticated, 
    login, 
    register, 
    logout, 
    clearError, 
    initialize 
  } = useAuthStore()

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ 
    email: '', 
    password: '', 
    displayName: '' 
  })

  // Initialize auth on app start
  useEffect(() => {
    // Test Firebase configuration
    testFirebaseConfig()
    initialize()
  }, [initialize])

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(loginForm)
      setShowLoginModal(false)
      setLoginForm({ email: '', password: '' })
    } catch (error) {
      // Error is handled by the store
    }
  }

  // Handle register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(registerForm)
      setShowRegisterModal(false)
      setRegisterForm({ email: '', password: '', displayName: '' })
    } catch (error) {
      // Error is handled by the store
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      // Stay in current view after logout
    } catch (error) {
      // Error is handled by the store
    }
  }

  // Show editor view
  if (currentView === 'editor') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentView('landing')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Home
                </button>
                <h1 className="text-xl font-semibold text-gray-900">WordWise Editor</h1>
              </div>
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <span className="text-sm text-gray-600">
                      Welcome, {user?.displayName || user?.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-600">
                      Using local storage
                    </span>
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
        <EditorEnhanced />
      </div>
    )
  }

  // Landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">WordWise AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">
                    Welcome, {user?.displayName || user?.email}
                  </span>
                  <button
                    onClick={() => setCurrentView('editor')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Open Editor
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Write with Confidence.
            <span className="text-blue-600 block">Edit with Intelligence.</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your writing with AI-powered grammar checking, style suggestions, 
            and vocabulary enhancement designed specifically for English language learners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentView('editor')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Try Editor Now - Free
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => setShowRegisterModal(true)}
                className="bg-white text-gray-800 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg border"
              >
                Sign Up for Cloud Storage
              </button>
            )}
          </div>
          
          {!isAuthenticated && (
            <p className="text-sm text-gray-500 mt-4">
              No signup required! Try the editor instantly. Sign up later to save your work to the cloud.
            </p>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powerful Features for Better Writing
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Grammar Check",
                description: "Advanced AI detects grammar mistakes, punctuation errors, and suggests corrections tailored for ESL learners.",
                icon: "✓"
              },
              {
                title: "Vocabulary Enhancement",
                description: "Replace inappropriate words with professional alternatives and expand your vocabulary with contextual suggestions.",
                icon: "📚"
              },
              {
                title: "Style & Tone",
                description: "Improve sentence structure, eliminate redundancy, and maintain consistent tone throughout your writing.",
                icon: "✨"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">Perfect for ESL Students</h3>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            {[
              "Real-time error detection and correction",
              "Context-aware vocabulary suggestions", 
              "Professional writing style recommendations",
              "Works offline - no account required",
              "Optional cloud storage with sign-up",
              "Export your documents anytime"
            ].map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-green-500 font-bold">✓</span>
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Sign In to WordWise</h3>
              <button
                onClick={() => {
                  setShowLoginModal(false)
                  clearError()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowLoginModal(false)
                  setShowRegisterModal(true)
                  clearError()
                }}
                className="text-blue-600 hover:underline"
              >
                Don't have an account? Sign up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create Your Account</h3>
              <button
                onClick={() => {
                  setShowRegisterModal(false)
                  clearError()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={registerForm.displayName}
                  onChange={(e) => setRegisterForm({ ...registerForm, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowRegisterModal(false)
                  setShowLoginModal(true)
                  clearError()
                }}
                className="text-blue-600 hover:underline"
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App 