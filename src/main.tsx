import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Initialize PDF worker for PDF parsing
import './utils/pdfWorker'
// Test PDF parsing in development
import './utils/testPDFParsing'
// Test grammar fixes
// import './utils/testGrammarFixes' // Removed for security update

// Error boundary for development
if (import.meta.env.DEV) {
  window.addEventListener('error', (event) => {
    // Filter out Chrome extension errors
    if (event.filename?.includes('chrome-extension://')) {
      event.preventDefault()
      return false
    }
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    // Filter out Chrome extension promise rejections
    if (event.reason?.message?.includes('chrome-extension://')) {
      event.preventDefault()
      return false
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 