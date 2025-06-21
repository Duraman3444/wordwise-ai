import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, File, AlertCircle, X } from 'lucide-react';
import { Button } from './Button';

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  disabled?: boolean;
  className?: string;
}

const DEFAULT_ACCEPTED_TYPES = ['.docx', '.doc', '.pdf', '.txt', '.rtf'];
const DEFAULT_MAX_SIZE = 10; // 10MB

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFileSelect,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxFileSize = DEFAULT_MAX_SIZE,
  disabled = false,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      return `File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum allowed size of ${maxFileSize}MB`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type "${fileExtension}" is not supported. Supported types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFile = (file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]); // Only handle the first file
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'docx':
      case 'doc':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'pdf':
        return <File className="w-8 h-8 text-red-500" />;
      case 'txt':
      case 'rtf':
        return <FileText className="w-8 h-8 text-gray-500" />;
      default:
        return <File className="w-8 h-8 text-gray-400" />;
    }
  };

  return (
    <div className={className}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${disabled 
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
            : isDragOver
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750'
          }
        `}
      >
        {/* Upload icon and text */}
        <div className="flex flex-col items-center gap-4">
          <div className={`p-3 rounded-full ${
            isDragOver 
              ? 'bg-blue-100 dark:bg-blue-900/30' 
              : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <Upload className={`w-8 h-8 ${
              isDragOver 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-400 dark:text-gray-500'
            }`} />
          </div>
          
          <div>
            <p className={`text-lg font-medium ${
              isDragOver 
                ? 'text-blue-900 dark:text-blue-100' 
                : 'text-gray-900 dark:text-gray-100'
            }`}>
              {isDragOver ? 'Drop your file here' : 'Upload Document'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Drag and drop or <span className="text-blue-600 dark:text-blue-400 font-medium">browse files</span>
            </p>
          </div>
          
          {/* Supported formats */}
          <div className="flex flex-wrap gap-2 justify-center">
            {acceptedTypes.map(type => (
              <span
                key={type}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md"
              >
                {type.toUpperCase()}
              </span>
            ))}
          </div>
          
          {/* File size limit */}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Maximum file size: {maxFileSize}MB
          </p>
        </div>

        {/* Overlay for disabled state */}
        {disabled && (
          <div className="absolute inset-0 bg-gray-50 dark:bg-gray-800 bg-opacity-50 rounded-lg" />
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Compact version for smaller spaces
export const FileDropZoneCompact: React.FC<FileDropZoneProps> = ({
  onFileSelect,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxFileSize = DEFAULT_MAX_SIZE,
  disabled = false,
  className = ''
}) => {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      return `File too large (${fileSizeMB.toFixed(1)}MB)`;
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `Unsupported file type: ${fileExtension}`;
    }

    return null;
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setError(null);
      const validationError = validateFile(files[0]);
      if (validationError) {
        setError(validationError);
        return;
      }
      onFileSelect(files[0]);
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
      
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        variant="outline"
        size="sm"
        className="w-full justify-center gap-2"
      >
        <Upload className="w-4 h-4" />
        Import Document
      </Button>
      
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}; 