import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // PDF.js configuration for browser compatibility
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  define: {
    // Required for PDF.js worker
    global: 'globalThis',
  },
  server: {
    // Configure headers for PDF files
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin'
    },
    fs: {
      // Allow serving PDF files from src/data
      allow: ['..', './src/data']
    }
  },
  // Handle PDF file imports
  assetsInclude: ['**/*.pdf']
}) 