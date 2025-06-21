import React from 'react';
import { ImportProgress as ImportProgressType } from '@/services/documentImport';
import { CheckCircle, FileText, Loader2, AlertCircle } from 'lucide-react';

interface ImportProgressProps {
  progress: ImportProgressType;
  fileName?: string;
  onCancel?: () => void;
}

export const ImportProgress: React.FC<ImportProgressProps> = ({
  progress,
  fileName,
  onCancel
}) => {
  const getStageIcon = () => {
    switch (progress.stage) {
      case 'complete':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'reading':
      case 'parsing':
      case 'processing':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      default:
        return <FileText className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStageColor = () => {
    switch (progress.stage) {
      case 'complete':
        return 'bg-green-500';
      case 'reading':
        return 'bg-blue-500';
      case 'parsing':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        {getStageIcon()}
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            Importing Document
          </h3>
          {fileName && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {fileName}
            </p>
          )}
        </div>
        {onCancel && progress.stage !== 'complete' && (
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {progress.message}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(progress.progress)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ease-out ${getStageColor()}`}
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>

      {/* Stage Indicators */}
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <div className={`flex items-center gap-1 ${
          ['reading', 'parsing', 'processing', 'complete'].includes(progress.stage)
            ? 'text-blue-600 dark:text-blue-400'
            : ''
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            ['reading', 'parsing', 'processing', 'complete'].includes(progress.stage)
              ? 'bg-blue-600'
              : 'bg-gray-300 dark:bg-gray-600'
          }`} />
          Reading
        </div>
        
        <div className={`flex items-center gap-1 ${
          ['parsing', 'processing', 'complete'].includes(progress.stage)
            ? 'text-yellow-600 dark:text-yellow-400'
            : ''
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            ['parsing', 'processing', 'complete'].includes(progress.stage)
              ? 'bg-yellow-600'
              : 'bg-gray-300 dark:bg-gray-600'
          }`} />
          Parsing
        </div>
        
        <div className={`flex items-center gap-1 ${
          ['processing', 'complete'].includes(progress.stage)
            ? 'text-purple-600 dark:text-purple-400'
            : ''
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            ['processing', 'complete'].includes(progress.stage)
              ? 'bg-purple-600'
              : 'bg-gray-300 dark:bg-gray-600'
          }`} />
          Processing
        </div>
        
        <div className={`flex items-center gap-1 ${
          progress.stage === 'complete'
            ? 'text-green-600 dark:text-green-400'
            : ''
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            progress.stage === 'complete'
              ? 'bg-green-600'
              : 'bg-gray-300 dark:bg-gray-600'
          }`} />
          Complete
        </div>
      </div>
      
      {progress.stage === 'complete' && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Document imported successfully!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Compact version for use in modals or smaller spaces
export const ImportProgressCompact: React.FC<ImportProgressProps> = ({
  progress,
  fileName
}) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {fileName || 'Importing document...'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {progress.message} ({Math.round(progress.progress)}%)
        </p>
      </div>
      <div className="flex-shrink-0">
        <div className="w-8 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div
            className="h-1 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}; 