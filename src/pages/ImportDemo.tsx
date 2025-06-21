import React, { useState } from 'react';
import { useDocumentImport } from '@/hooks/useDocumentImport';
import { FileDropZone } from '@/components/ui/FileDropZone';
import { ImportProgress, ImportProgressCompact } from '@/components/ui/ImportProgress';
import { Button } from '@/components/ui/Button';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Upload,
  Book,
  FileSpreadsheet
} from 'lucide-react';

export const ImportDemo: React.FC = () => {
  const [showFullProgress, setShowFullProgress] = useState(false);
  
  const { 
    importDocument, 
    isImporting, 
    importProgress, 
    lastImportResult,
    resetImportState 
  } = useDocumentImport({
    navigateToEditor: false, // Stay on demo page
    onSuccess: (documentId) => {
      console.log('Document imported successfully:', documentId);
    }
  });

  const handleFileSelect = async (file: File) => {
    setShowFullProgress(true);
    await importDocument(file);
  };

  const supportedFormats = [
    {
      extension: '.docx',
      name: 'Word Document',
      description: 'Microsoft Word 2007+ format with full formatting support',
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      support: 'Full Support'
    },
    {
      extension: '.doc',
      name: 'Word Document (Legacy)',
      description: 'Legacy Microsoft Word format (limited support)',
      icon: <FileText className="w-5 h-5 text-orange-500" />,
      support: 'Limited Support'
    },
    {
      extension: '.pdf',
      name: 'PDF Document',
      description: 'Portable Document Format with text extraction',
      icon: <Book className="w-5 h-5 text-red-500" />,
      support: 'Text Only'
    },
    {
      extension: '.txt',
      name: 'Plain Text',
      description: 'Simple text files',
      icon: <FileSpreadsheet className="w-5 h-5 text-gray-500" />,
      support: 'Full Support'
    },
    {
      extension: '.rtf',
      name: 'Rich Text Format',
      description: 'Rich Text Format with basic formatting',
      icon: <FileText className="w-5 h-5 text-purple-500" />,
      support: 'Basic Formatting'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Document Import Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Test our advanced document import system. Upload Word documents, PDFs, and text files 
            to see how they're parsed and imported into WordWise AI.
          </p>
        </div>

        {/* Main Import Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Upload className="w-6 h-6 text-blue-500" />
                Upload Document
              </h2>
              
              <FileDropZone
                onFileSelect={handleFileSelect}
                disabled={isImporting}
                maxFileSize={25} // 25MB for demo
              />
              
              {isImporting && importProgress && showFullProgress && (
                <div className="mt-6">
                  <ImportProgress
                    progress={importProgress}
                    onCancel={() => {
                      resetImportState();
                      setShowFullProgress(false);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Results */}
            {lastImportResult && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  {lastImportResult.success ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Import Successful
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      Import Failed
                    </>
                  )}
                </h3>

                {lastImportResult.success && lastImportResult.document ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Title:</p>
                      <p className="text-gray-900 dark:text-white">{lastImportResult.document.title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Word Count:</p>
                      <p className="text-gray-900 dark:text-white">{lastImportResult.document.metadata.wordCount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Reading Time:</p>
                      <p className="text-gray-900 dark:text-white">{lastImportResult.document.metadata.readingTime} minutes</p>
                    </div>
                    {lastImportResult.document.content && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 max-h-48 overflow-y-auto">
                          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                            {lastImportResult.document.content.substring(0, 500)}
                            {lastImportResult.document.content.length > 500 && '...'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200">{lastImportResult.error}</p>
                  </div>
                )}

                {lastImportResult.warnings && lastImportResult.warnings.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">Warnings:</p>
                    <ul className="space-y-1">
                      {lastImportResult.warnings.map((warning, index) => (
                        <li key={index} className="text-sm text-amber-600 dark:text-amber-400 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Supported Formats */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Supported Formats
              </h2>
              
              <div className="space-y-4">
                {supportedFormats.map((format) => (
                  <div 
                    key={format.extension}
                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      {format.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {format.name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          format.support === 'Full Support' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : format.support === 'Limited Support'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                        }`}>
                          {format.support}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {format.extension}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                Pro Tips
              </h3>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  For best results with Word documents, use .docx format
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  PDF import works best with text-based documents
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Large files are processed in chunks to ensure smooth operation
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Original formatting is preserved when possible
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <Button
            onClick={() => {
              resetImportState();
              setShowFullProgress(false);
            }}
            variant="outline"
            className="mr-4"
          >
            Reset Demo
          </Button>
          <Button
            onClick={() => window.location.href = '/documents'}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Go to Documents
          </Button>
        </div>
      </div>
    </div>
  );
}; 