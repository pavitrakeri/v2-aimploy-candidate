import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, CheckCircle, AlertCircle, Clock, Brain } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Progress } from './progress';
import { UploadedFile } from '@/types/verification';

interface FileUploadZoneProps {
  onFileUpload: (file: UploadedFile, rawFile: File) => void;
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

    onFileUpload(uploadedFile, file);
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

  const getValidationColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getValidationBgColor = (score?: number) => {
    if (!score) return 'bg-gray-100';
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getValidationIcon = (score?: number) => {
    if (!score) return <Clock className="h-4 w-4" />;
    if (score >= 80) return <CheckCircle className="h-4 w-4" />;
    if (score >= 60) return <AlertCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const getValidationText = (status?: string, score?: number) => {
    if (status === 'pending') return 'Analyzing...';
    if (status === 'verified' || (score && score >= 80)) return 'Validated';
    if (status === 'needs_review' || (score && score >= 60)) return 'Needs Review';
    if (status === 'rejected' || (score && score < 60)) return 'Rejected';
    return 'Pending';
  };

  const getAnalysisMethodIcon = (method?: string) => {
    switch (method) {
      case 'openai_analysis':
        return <Brain className="h-3 w-3" />;
      case 'binary_analysis':
        return <FileText className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <Card className="border-dashed border-2 hover:border-primary/30 transition-colors">
      <CardContent className="p-6">
        {uploadedFile ? (
          <div className="space-y-4">
            <div className={`flex items-center gap-3 p-4 rounded-lg border ${
              uploadedFile.validation_score 
                ? uploadedFile.validation_score >= 80 
                  ? 'bg-green-50 border-green-200'
                  : uploadedFile.validation_score >= 60
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className={getValidationColor(uploadedFile.validation_score)}>
                {getValidationIcon(uploadedFile.validation_score)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
                {uploadedFile.validation_status && (
                  <p className="text-xs font-medium mt-1">
                    Status: {getValidationText(uploadedFile.validation_status, uploadedFile.validation_score)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {uploadedFile.validation_score !== undefined && (
                  <Badge className={`${getValidationBgColor(uploadedFile.validation_score)} ${getValidationColor(uploadedFile.validation_score)}`}>
                    {uploadedFile.validation_score}/100
                  </Badge>
                )}
                {uploadedFile.analysis_method && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {getAnalysisMethodIcon(uploadedFile.analysis_method)}
                  </div>
                )}
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
            </div>

            {/* Validation Score Progress Bar */}
            {uploadedFile.validation_score !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Validation Score</span>
                  <span className={`font-bold ${getValidationColor(uploadedFile.validation_score)}`}>
                    {uploadedFile.validation_score}/100
                  </span>
                </div>
                <Progress value={uploadedFile.validation_score} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {uploadedFile.validation_score >= 80 && "✅ Document passed automated validation"}
                  {uploadedFile.validation_score >= 60 && uploadedFile.validation_score < 80 && "⚠️ Document requires manual review"}
                  {uploadedFile.validation_score < 60 && "❌ Document failed validation"}
                </p>
              </div>
            )}
            
            {/* AI Checks */}
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

            {/* Validation Details */}
            {uploadedFile.validation_details && Object.keys(uploadedFile.validation_details).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Validation Details:</p>
                <div className="bg-gray-50 rounded p-2 text-xs space-y-1">
                  {Object.entries(uploadedFile.validation_details).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace('_', ' ')}:</span>
                      <span className="text-muted-foreground truncate ml-2">
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </span>
                    </div>
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
