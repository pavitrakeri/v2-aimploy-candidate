import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';

interface ValidatedFileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  documentType?: string;
  disabled?: boolean;
  className?: string;
}

export const ValidatedFileUpload: React.FC<ValidatedFileUploadProps> = ({
  onFileSelect,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 5 * 1024 * 1024,
  documentType,
  disabled = false,
  className = ''
}) => {
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('');
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        setError(`File size exceeds ${(maxSize / (1024 * 1024)).toFixed(1)}MB limit`);
      } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        setError(`Invalid file type. Allowed: ${accept}`);
      } else {
        setError('File validation failed');
      }
      return;
    }
    
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Additional client-side validation
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const allowedTypes = accept.split(',').map(t => t.trim().toLowerCase());
    
    if (!allowedTypes.includes(fileExtension)) {
      setError(`Invalid file type. Allowed: ${accept}`);
      return;
    }
    
    // Clear error and pass file to parent
    setError('');
    onFileSelect(file);
  }, [onFileSelect, accept, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: false,
    disabled
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : dragActive 
              ? 'border-gray-400 bg-gray-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-2">
          {isDragActive ? (
            <>
              <Upload className="w-8 h-8 text-blue-500" />
              <p className="text-blue-600 font-medium">Drop the file here...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-gray-600 font-medium">
                  {disabled ? 'File upload disabled' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500">
                  {accept} (max {formatFileSize(maxSize)})
                </p>
                {documentType && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {documentType}
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-2 flex items-center text-red-600 text-sm">
          <AlertTriangle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};
