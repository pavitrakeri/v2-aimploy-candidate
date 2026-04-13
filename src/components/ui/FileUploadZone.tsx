import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { UploadedFile } from '@/types/verification';

interface FileUploadZoneProps {
  onFileUpload: (file: UploadedFile) => void;
  onFileRemove?: () => void;
  uploadedFile?: UploadedFile;
  accept?: string;
  maxSize?: number;
  required?: boolean;
  title?: string;
  description?: string;
  aiChecks?: string[];
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileUpload,
  onFileRemove,
  uploadedFile,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 5 * 1024 * 1024, // 5MB
  required = false,
  title,
  description,
  aiChecks = []
}) => {
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError('');
    
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    if (file.size > maxSize) {
      setError('File size exceeds 5MB limit');
      return;
    }

    const uploadedFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type
    };

    onFileUpload(uploadedFile);
  }, [onFileUpload, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: false
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="border-dashed border-2 hover:border-primary/30 transition-colors">
      <CardContent className="p-6">
        {uploadedFile ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="text-green-600" size={20} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
              </div>
              {onFileRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFileRemove}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X size={16} />
                </Button>
              )}
            </div>
            
            {aiChecks.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">AI Checks:</p>
                <div className="flex flex-wrap gap-1">
                  {aiChecks.map((check, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {check}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`cursor-pointer text-center p-8 rounded-lg border-2 border-dashed transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/25'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isDragActive ? 'Drop your file here' : title || 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-muted-foreground">
                {description || `PDF, JPG, PNG up to ${formatFileSize(maxSize)}`}
              </p>
              {required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
