import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // PDF.js and docx configuration for browser compatibility
  optimizeDeps: {
    include: ['pdfjs-dist', 'docx', 'file-saver'],
    exclude: ['@firebase/app']
  },
  define: {
    // Required for PDF.js worker and other Node.js globals
    global: 'globalThis',
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    // Increase chunk size warnings threshold for large libraries like docx
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      external: ['../internals/define-globalThis-property', '../internals/globalThis-this'],
      output: {
        manualChunks: {
          'pdf-vendor': ['pdfjs-dist'],
          'ui-vendor': ['react', 'react-dom', 'react-router-dom'],
          'editor-vendor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-highlight', '@tiptap/extension-typography', '@tiptap/extension-underline']
        }
      }
    }
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