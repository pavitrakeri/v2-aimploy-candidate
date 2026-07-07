import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, CheckCircle, AlertCircle, Clock, Brain, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Progress } from './progress';
import { UploadedFile } from '@/types/verification';

interface FileUploadZoneProps {
  onFileUpload: (file: UploadedFile, rawFile: File) => Promise<boolean | void> | void;
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
  const [isUploading, setIsUploading] = useState(false);

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

    const doUpload = async () => {
      setIsUploading(true);
      try {
        await onFileUpload(uploadedFile, file);
      } catch (err: any) {
        let errorMessage = err?.message || '';
        if (errorMessage.includes("Failed to fetch") || errorMessage.includes("Network Error")) {
          setError("Upload failed: The file may be too large for the server (try under 1MB) or your connection was lost.");
        } else {
          setError(errorMessage || 'Upload failed. Please try again.');
        }
      } finally {
        setIsUploading(false);
      }
    };
    
    doUpload();
  }, [onFileUpload, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: (() => {
      const result: Record<string, string[]> = {};
      accept.split(',').forEach(ext => {
        const trimmed = ext.trim().toLowerCase();
        if (trimmed === '.pdf') {
          result['application/pdf'] = ['.pdf'];
        } else if (trimmed === '.jpg') {
          result['image/jpeg'] = result['image/jpeg'] ? [...result['image/jpeg'], '.jpg'] : ['.jpg'];
        } else if (trimmed === '.jpeg') {
          result['image/jpeg'] = result['image/jpeg'] ? [...result['image/jpeg'], '.jpeg'] : ['.jpeg'];
        } else if (trimmed === '.png') {
          result['image/png'] = ['.png'];
        } else if (trimmed === '.webp') {
          result['image/webp'] = ['.webp'];
        } else if (trimmed === '.zip') {
          result['application/zip'] = ['.zip'];
        } else if (trimmed === '.doc') {
          result['application/msword'] = ['.doc'];
        } else if (trimmed === '.docx') {
          result['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] = ['.docx'];
        } else {
          if (trimmed.includes('/')) {
            result[trimmed] = [];
          } else {
            result['application/octet-stream'] = result['application/octet-stream'] ? [...result['application/octet-stream'], trimmed] : [trimmed];
          }
        }
      });
      return result;
    })(),
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
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getValidationBgColor = (score?: number) => {
    if (!score) return 'bg-muted text-muted-foreground';
    if (score >= 80) return 'bg-green-100/80 dark:bg-green-950/40 text-green-700 dark:text-green-400';
    if (score >= 60) return 'bg-yellow-100/80 dark:bg-yellow-950/40 text-yellow-750 dark:text-yellow-400';
    return 'bg-red-100/80 dark:bg-red-950/40 text-red-700 dark:text-red-400';
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
            <div className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border ${
              uploadedFile.validation_score 
                ? uploadedFile.validation_score >= 80 
                  ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900/50'
                  : uploadedFile.validation_score >= 60
                    ? 'bg-yellow-50/50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900/50'
                    : 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50'
                : 'bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50'
            }`}>
              <div className={getValidationColor(uploadedFile.validation_score)}>
                {getValidationIcon(uploadedFile.validation_score)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate text-foreground">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
                {uploadedFile.validation_status && (
                  <p className="text-xs font-medium mt-1 text-foreground">
                    Status: {getValidationText(uploadedFile.validation_status, uploadedFile.validation_score)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                {uploadedFile.validation_score !== undefined && uploadedFile.validation_score !== null && uploadedFile.validation_status !== 'pending' && (
                  <Badge className={`${getValidationBgColor(uploadedFile.validation_score)} border-transparent`}>
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
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/35"
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>
            </div>

            {/* Validation Score Progress Bar */}
            {uploadedFile.validation_score !== undefined && uploadedFile.validation_score !== null && uploadedFile.validation_status !== 'pending' && (
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
              <div className="space-y-2 mt-4 pt-4 border-t border-border">
                <p className="text-xs font-semibold text-foreground/90">Extracted Information:</p>
                <div className="bg-secondary/35 rounded-lg p-3 text-xs space-y-2 border border-border shadow-sm">
                  {Object.entries(uploadedFile.validation_details)
                    .filter(([key]) => key !== 'score' && key !== 'clarity_score' && key !== 'improvement_suggestions' && key !== 'summary')
                    .slice(0, 5).map(([key, value]) => {
                      // Formatting the key
                      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      
                      // Formatting the value
                      let formattedValue = '';
                      if (typeof value === 'boolean') {
                        formattedValue = value ? '✅ Yes' : '❌ No';
                      } else if (typeof value === 'string' && ['value_found', 'true', 'yes', 'found', 'present'].includes(value.toLowerCase().trim())) {
                        formattedValue = '✅ Yes';
                      } else if (typeof value === 'object' && value !== null) {
                        if (Array.isArray(value)) {
                          formattedValue = value.length > 0 ? value.join(', ') : 'None';
                        } else {
                          // For nested objects like required_fields_detected
                          const truthyKeys = Object.entries(value as Record<string, any>).filter(([_, v]) => v).map(([k]) => k.replace(/_/g, ' '));
                          formattedValue = truthyKeys.length > 0 ? truthyKeys.join(', ') : 'None';
                        }
                      } else {
                        formattedValue = String(value);
                      }

                      return (
                        <div key={key} className="flex justify-between items-start border-b border-border/40 pb-1.5 last:border-0 last:pb-0">
                          <span className="font-medium text-muted-foreground">{formattedKey}</span>
                          <span className="text-foreground text-right ml-4 max-w-[60%] truncate font-medium" title={String(value)}>
                            {formattedValue}
                          </span>
                        </div>
                      );
                    })}
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
            <input {...getInputProps()} disabled={isUploading} />
            {isUploading ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative flex items-center justify-center w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
                  <Loader2 className="w-4 h-4 text-primary animate-spin absolute" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Uploading & Analysing...</p>
                  <p className="text-xs text-primary mt-1">Running AI validation</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
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
              </>
            )}
          </div>
        )}
        
        {error && (
          <div className="mt-2 p-2 bg-red-50/50 border border-red-200 rounded text-xs text-red-655 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
