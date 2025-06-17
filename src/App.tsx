import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Header } from './components/layout/Header'
import { Landing } from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { Editor } from './pages/Editor'
import { Documents } from './pages/Documents'
import { Profile } from './pages/Profile'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/editor" 
                  element={
                    <ProtectedRoute>
                      <Editor />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/documents" 
                  element={
                    <ProtectedRoute>
                      <Documents />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                  border: '1px solid var(--toast-border)',
                },
                success: {
                  style: {
                    background: 'var(--toast-success-bg)',
                    color: 'var(--toast-success-color)',
                    border: '1px solid var(--toast-success-border)',
                  },
                },
                error: {
                  style: {
                    background: 'var(--toast-error-bg)',
                    color: 'var(--toast-error-color)',
                    border: '1px solid var(--toast-error-border)',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App 