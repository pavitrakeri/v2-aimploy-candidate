import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { UploadedFile } from '@/types/verification';
import { CheckCircle, AlertCircle, Clock, Brain } from 'lucide-react';

const ValidationDemo: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | undefined>();

  // Mock validation function for demonstration
  const simulateValidation = (file: File): UploadedFile => {
    const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
    const validationStatus = score >= 80 ? 'verified' : score >= 60 ? 'needs_review' : 'rejected';
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      validation_score: score,
      validation_status: validationStatus,
      analysis_method: 'openai_analysis',
      validation_details: {
        'document_authenticity': score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low',
        'photo_quality': score >= 70 ? 'Clear' : 'Blurry',
        'text_clarity': score >= 75 ? 'Readable' : 'Partially readable',
        'format_compliance': score >= 80 ? 'Compliant' : 'Non-compliant'
      }
    };
  };

  const handleFileUpload = (file: UploadedFile) => {
    // Simulate validation delay
    setTimeout(() => {
      const mockFile = simulateValidation(file as any);
      setUploadedFile(mockFile);
    }, 1500);
  };

  const handleFileRemove = () => {
    setUploadedFile(undefined);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            OpenAI Document Validation Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Upload any document to see how the OpenAI validation system works. The system will analyze the document and provide a validation score.
          </p>
          
          <div className="grid gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Upload Document</h3>
              <FileUploadZone
                onFileUpload={handleFileUpload}
                onFileRemove={handleFileRemove}
                uploadedFile={uploadedFile}
                title="Upload any document for validation"
                aiChecks={[
                  'Document authenticity',
                  'Photo verification', 
                  'Text clarity',
                  'Format compliance',
                  'Content analysis'
                ]}
              />
            </div>
          </div>

          {uploadedFile && uploadedFile.validation_score && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-3">Validation Results:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Score:</span>
                  <Badge className={
                    uploadedFile.validation_score >= 80 ? 'bg-green-100 text-green-600' :
                    uploadedFile.validation_score >= 60 ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }>
                    {uploadedFile.validation_score}/100
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={
                    uploadedFile.validation_score >= 80 ? 'text-green-600' :
                    uploadedFile.validation_score >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }>
                    {uploadedFile.validation_score >= 80 ? '✅ Validated' :
                     uploadedFile.validation_score >= 60 ? '⚠️ Needs Review' :
                     '❌ Rejected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Analysis Method:</span>
                  <span className="flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    OpenAI Analysis
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-2">How it works:</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Document is uploaded to the server</li>
              <li>OpenAI analyzes the document content</li>
              <li>Validation score is generated (0-100)</li>
              <li>Status is assigned based on score</li>
              <li>Results are displayed in real-time</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ValidationDemo;
