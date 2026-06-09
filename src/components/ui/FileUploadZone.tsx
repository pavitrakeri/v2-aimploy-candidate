import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, CheckCircle, AlertCircle, Clock, Brain, Loader2 } from 'lucide-react';
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
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
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
    <Card className="border-dashed border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-white/40 backdrop-blur-md">
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
                {uploadedFile.validation_status === 'pending' ? (
                  <p className="text-xs font-medium mt-1 text-blue-600 flex items-center gap-1.5 animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Analyzing Document...
                  </p>
                ) : uploadedFile.validation_status ? (
                  <p className="text-xs font-medium mt-1">
                    Status: {getValidationText(uploadedFile.validation_status, uploadedFile.validation_score)}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                {uploadedFile.validation_score !== undefined && uploadedFile.validation_score !== null && uploadedFile.validation_status !== 'pending' && (
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

            {/* Validation Score Progress Bar with Animations */}
            {uploadedFile.validation_score !== undefined && uploadedFile.validation_score !== null && uploadedFile.validation_status !== 'pending' && (
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-700">AI Confidence Score</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-xs shadow-sm ${getValidationBgColor(uploadedFile.validation_score)} ${getValidationColor(uploadedFile.validation_score)}`}>
                    {uploadedFile.validation_score}/100
                  </span>
                </div>
                <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${
                      uploadedFile.validation_score >= 80 ? 'from-green-400 to-green-600' :
                      uploadedFile.validation_score >= 60 ? 'from-yellow-400 to-yellow-600' :
                      'from-red-400 to-red-600'
                    }`}
                    style={{ width: `${uploadedFile.validation_score}%` }}
                  />
                </div>
                <p className="text-xs font-medium text-muted-foreground pt-1 flex items-center gap-1.5">
                  {uploadedFile.validation_score >= 80 ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> :
                   uploadedFile.validation_score >= 60 ? <AlertCircle className="h-3.5 w-3.5 text-yellow-500" /> :
                   <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                  {uploadedFile.validation_score >= 80 && "Document passed automated validation successfully."}
                  {uploadedFile.validation_score >= 60 && uploadedFile.validation_score < 80 && "Document requires manual review."}
                  {uploadedFile.validation_score < 60 && "Document failed validation. Please re-upload a clearer copy."}
                </p>
              </div>
            )}
            
            {/* AI Checks Badges */}
            {aiChecks.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Required Checks</p>
                <div className="flex flex-wrap gap-2">
                  {aiChecks.map((check, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-white shadow-sm border-gray-200">
                      {check}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Details - Styled Card Layout */}
            {uploadedFile.validation_details && Object.keys(uploadedFile.validation_details).length > 0 && (
              <div className="mt-4 border rounded-xl overflow-hidden shadow-sm bg-white/50 backdrop-blur-sm transition-all hover:shadow-md">
                <details className="group">
                  <summary className="flex items-center justify-between p-3 cursor-pointer bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm font-semibold text-gray-700">Detailed AI Analysis</span>
                    </div>
                    <div className="text-gray-400 transition-transform duration-300 group-open:-rotate-180">
                      ▼
                    </div>
                  </summary>
                  <div className="p-4 border-t bg-white space-y-3">
                    {/* Only show meaningful fields, formatting them nicely */}
                    {Object.entries(uploadedFile.validation_details)
                      .filter(([key]) => !['score', 'clarity_score'].includes(key))
                      .slice(0, 5)
                      .map(([key, value]) => {
                        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        let displayValue = value;
                        let isList = false;
                        
                        if (Array.isArray(value)) {
                          isList = true;
                          displayValue = value;
                        } else if (typeof value === 'object' && value !== null) {
                          isList = true;
                          displayValue = Object.entries(value).map(([k, v]) => `${k}: ${v}`);
                        } else if (typeof value === 'boolean') {
                          displayValue = value ? 'Yes' : 'No';
                        }
                        
                        return (
                          <div key={key} className="flex flex-col sm:flex-row sm:justify-between sm:items-start pb-2 border-b border-gray-50 last:border-0 last:pb-0 gap-1">
                            <span className="text-xs font-semibold text-gray-500 min-w-32">{formattedKey}</span>
                            <div className="text-xs text-gray-800 font-medium text-left sm:text-right flex-1 break-words">
                              {isList && Array.isArray(displayValue) ? (
                                <ul className="list-disc list-inside space-y-1">
                                  {displayValue.map((item, i) => (
                                    <li key={i} className="text-gray-700">{String(item)}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span>{String(displayValue)}</span>
                              )}
                            </div>
                          </div>
                        );
                    })}
                  </div>
                </details>
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
                {description || `PDF, DOC, DOCX, JPG, PNG up to ${formatFileSize(maxSize)}`}
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
