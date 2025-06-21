import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDocumentImporter, ImportProgress, ImportResult } from '@/services/documentImport';
import toast from 'react-hot-toast';

interface UseDocumentImportOptions {
  onSuccess?: (documentId: string) => void;
  onError?: (error: string) => void;
  navigateToEditor?: boolean;
  saveToLocalStorage?: boolean;
}

export const useDocumentImport = (options: UseDocumentImportOptions = {}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [lastImportResult, setLastImportResult] = useState<ImportResult | null>(null);
  
  const navigate = useNavigate();
  const {
    onSuccess,
    onError,
    navigateToEditor = true,
    saveToLocalStorage = true
  } = options;

  const importDocument = useCallback(async (file: File) => {
    setIsImporting(true);
    setImportProgress(null);
    setLastImportResult(null);

    try {
      const importer = createDocumentImporter((progress: ImportProgress) => {
        setImportProgress(progress);
      });

      const result = await importer.importDocument(file, {
        preserveFormatting: true,
        convertToMarkdown: false
      });

      setLastImportResult(result);

      if (result.success && result.document) {
        if (saveToLocalStorage) {
          // Save to localStorage
          const existingDocs = JSON.parse(localStorage.getItem('documents') || '[]');
          const updatedDocs = [result.document, ...existingDocs];
          localStorage.setItem('documents', JSON.stringify(updatedDocs));
        }

        // Show success message
        toast.success(`"${result.document.title}" imported successfully!`);

        // Show warnings if any
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach((warning: string) => {
            toast(warning, { icon: '⚠️' });
          });
        }

        // Call success callback
        if (onSuccess) {
          onSuccess(result.document.id);
        }

        // Navigate to editor if requested
        if (navigateToEditor) {
          navigate(`/editor?id=${result.document.id}`);
        }

        return result.document;
      } else {
        const errorMessage = result.error || 'Failed to import document';
        toast.error(errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }
        
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during import';
      console.error('Import error:', error);
      toast.error(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      return null;
    } finally {
      setIsImporting(false);
    }
  }, [onSuccess, onError, navigateToEditor, saveToLocalStorage, navigate]);

  const resetImportState = useCallback(() => {
    setIsImporting(false);
    setImportProgress(null);
    setLastImportResult(null);
  }, []);

  return {
    importDocument,
    isImporting,
    importProgress,
    lastImportResult,
    resetImportState
  };
}; 