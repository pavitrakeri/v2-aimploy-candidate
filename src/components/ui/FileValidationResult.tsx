import React from 'react';
import { ValidationResult } from '../../services/fileValidation';
import { Alert, AlertDescription } from './alert';
import { Badge } from './badge';
import { CheckCircle, AlertTriangle, Info, FileText, Brain } from 'lucide-react';

interface FileValidationResultProps {
  validation: ValidationResult;
  documentType: string;
  onProceed?: () => void;
  onCancel?: () => void;
}

export const FileValidationResult: React.FC<FileValidationResultProps> = ({
  validation,
  documentType,
  onProceed,
  onCancel
}) => {
  const getStatusColor = (isValid: boolean) => {
    return isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50';
  };

  const getBadgeColor = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`border rounded-lg p-6 ${getStatusColor(validation.isValid)}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">File Validation Results</h3>
        <Badge className={validation.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {validation.isValid ? (
            <><CheckCircle className="w-3 h-3 mr-1" /> Valid</>
          ) : (
            <><AlertTriangle className="w-3 h-3 mr-1" /> Invalid</>
          )}
        </Badge>
      </div>

      {/* File Information */}
      <div className="mb-4 p-4 bg-white rounded border">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          File Information
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Name:</span>
            <span className="ml-2 font-medium">{validation.fileName}</span>
          </div>
          <div>
            <span className="text-gray-600">Size:</span>
            <span className="ml-2 font-medium">{formatFileSize(validation.fileSize)}</span>
          </div>
          <div>
            <span className="text-gray-600">Type:</span>
            <span className="ml-2 font-medium">{validation.fileType}</span>
          </div>
          <div>
            <span className="text-gray-600">Document:</span>
            <span className="ml-2 font-medium">{documentType}</span>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validation.errors.length > 0 && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="font-medium text-red-800 mb-2">Validation Errors:</div>
            <ul className="list-disc list-inside text-red-700 space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Warnings */}
      {validation.warnings.length > 0 && (
        <Alert className="mb-4 border-yellow-200 bg-yellow-50">
          <Info className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <div className="font-medium text-yellow-800 mb-2">Warnings:</div>
            <ul className="list-disc list-inside text-yellow-700 space-y-1">
              {validation.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* AI Content Analysis */}
      {validation.contentAnalysis && (
        <div className="mb-4 p-4 bg-blue-50 rounded border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <Brain className="w-4 h-4 mr-2" />
            AI Content Analysis
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-blue-700">Content Match:</span>
              <Badge className={
                validation.contentAnalysis.isExpectedContent 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-orange-100 text-orange-800'
              }>
                {validation.contentAnalysis.isExpectedContent ? 'Match' : 'No Match'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-700">Confidence:</span>
              <span className="font-medium text-blue-900">
                {(validation.contentAnalysis.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="text-blue-700 text-sm">
              <span className="font-medium">Analysis:</span> {validation.contentAnalysis.analysis}
            </div>
            {validation.contentAnalysis.detectedContent.length > 0 && (
              <div className="text-blue-700 text-sm">
                <span className="font-medium">Detected:</span>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {validation.contentAnalysis.detectedContent.map((content, index) => (
                    <li key={index}>{content}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-6">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        )}
        {onProceed && validation.isValid && (
          <button
            onClick={onProceed}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Proceed with Upload
          </button>
        )}
      </div>
    </div>
  );
};
