import { GlobalWorkerOptions } from 'pdfjs-dist';

// Configure PDF.js worker
export function configurePDFWorker() {
  // Use the CDN worker for browser compatibility
  GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  
  console.log('📚 PDF.js worker configured');
}

// Initialize the worker when this module is imported
configurePDFWorker(); 