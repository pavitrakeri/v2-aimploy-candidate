import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Clock, FileText, Shield, Brain } from 'lucide-react';
import { DocumentResponse } from '@/services/verification-api';

interface DocumentValidationCardProps {
  document: DocumentResponse;
}

const DocumentValidationCard: React.FC<DocumentValidationCardProps> = ({ document }) => {
  const getValidationColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getValidationBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getValidationIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5" />;
    if (score >= 60) return <Clock className="h-5 w-5" />;
    return <AlertCircle className="h-5 w-5" />;
  };

  const getValidationText = (score: number) => {
    if (score >= 80) return 'Validated';
    if (score >= 60) return 'Needs Review';
    return 'Rejected';
  };

  const getAnalysisMethodIcon = (method?: string) => {
    switch (method) {
      case 'openai_analysis':
        return <Brain className="h-4 w-4" />;
      case 'binary_analysis':
        return <FileText className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getAnalysisMethodText = (method?: string) => {
    switch (method) {
      case 'openai_analysis':
        return 'AI Analysis';
      case 'binary_analysis':
        return 'Basic Validation';
      default:
        return 'Unknown';
    }
  };

  const validationScore = document.validation_score || 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {document.file_name}
          </CardTitle>
          <div className="flex items-center gap-2">
            {document.validation_score !== undefined && (
              <Badge 
                className={`${getValidationBgColor(validationScore)} ${getValidationColor(validationScore)}`}
              >
                {getValidationIcon(validationScore)}
                <span className="ml-1">{getValidationText(validationScore)}</span>
              </Badge>
            )}
            {document.analysis_method && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {getAnalysisMethodIcon(document.analysis_method)}
                <span>{getAnalysisMethodText(document.analysis_method)}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Type:</span>
            <p className="font-medium capitalize">{document.document_type.replace('_', ' ')}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Size:</span>
            <p className="font-medium">{(document.file_size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <div>
            <span className="text-muted-foreground">Format:</span>
            <p className="font-medium uppercase">{document.file_type}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>
            <p className="font-medium capitalize">{document.status.replace('_', ' ')}</p>
          </div>
        </div>

        {/* Validation Score */}
        {document.validation_score !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Validation Score</span>
              <span className={`text-sm font-bold ${getValidationColor(validationScore)}`}>
                {validationScore}/100
              </span>
            </div>
            <Progress value={validationScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {validationScore >= 80 && "Document passed automated validation checks"}
              {validationScore >= 60 && validationScore < 80 && "Document requires manual review"}
              {validationScore < 60 && "Document failed validation and was rejected"}
            </p>
          </div>
        )}

        {/* Validation Details */}
        {document.validation_details && Object.keys(document.validation_details).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Validation Details</h4>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              {Object.entries(document.validation_details).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
                  <span className="ml-2 text-muted-foreground">
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification Notes */}
        {document.verification_notes && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Verification Notes</h4>
            <p className="text-sm text-muted-foreground bg-blue-50 rounded-lg p-3">
              {document.verification_notes}
            </p>
          </div>
        )}

        {/* Rejection Reason */}
        {document.rejection_reason && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-600">Rejection Reason</h4>
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
              {document.rejection_reason}
            </p>
          </div>
        )}

        {/* Description */}
        {document.description && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">{document.description}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground pt-2 border-t">
          <div>
            <span>Uploaded: {new Date(document.created_at).toLocaleDateString()}</span>
          </div>
          <div>
            <span>Updated: {new Date(document.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentValidationCard;
