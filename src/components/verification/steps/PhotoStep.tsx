import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { PhotoData, UploadedFile } from '@/types/verification';
import { Camera, CheckCircle, AlertCircle } from 'lucide-react';

interface PhotoStepProps {
  data: PhotoData;
  onChange: (data: PhotoData) => void;
  onUploadDocument?: (file: File, docType: string) => Promise<void>;
  onDeleteDocument?: (docType: string) => Promise<void>;
}

const photoGuidelines = [
  {
    icon: CheckCircle,
    text: 'Face clearly visible and centered',
    valid: true
  },
  {
    icon: CheckCircle,
    text: 'White or plain background',
    valid: true
  },
  {
    icon: CheckCircle,
    text: 'Recent photo (taken within last 6 months)',
    valid: true
  },
  {
    icon: CheckCircle,
    text: 'No filters or heavy editing',
    valid: true
  },
  {
    icon: AlertCircle,
    text: 'No sunglasses or hats (unless religious headwear)',
    valid: false
  },
  {
    icon: AlertCircle,
    text: 'File size should be less than 2MB',
    valid: false
  }
];

export const PhotoStep: React.FC<PhotoStepProps> = ({ data, onChange, onUploadDocument, onDeleteDocument }) => {
  const handleFileUpload = (file: UploadedFile, rawFile?: File) => {
    if (onUploadDocument && rawFile) {
      onUploadDocument(rawFile, 'photo');
    } else {
      onChange({
        photo: file
      });
    }
  };

  const handleFileRemove = () => {
    if (onDeleteDocument) {
      onDeleteDocument('photo');
    } else {
      onChange({
        photo: undefined
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Photo Verification</h2>
        <p className="text-muted-foreground">
          Upload a passport-sized photograph for identity verification.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Photo Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Camera className="h-5 w-5 text-primary" />
              </div>
              Upload Your Photo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploadZone
              onFileUpload={handleFileUpload}
              onFileRemove={handleFileRemove}
              uploadedFile={data.photo}
              title="Upload Passport Photo"
              description="JPG or PNG format, max 2MB"
              accept=".jpg,.jpeg,.png"
              maxSize={2 * 1024 * 1024} // 2MB
              required={true}
              aiChecks={['Face detection', 'Photo quality check', 'Background analysis']}
            />
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Photo Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-3">Requirements:</h4>
                <ul className="space-y-2">
                  {photoGuidelines.map((guideline, index) => {
                    const Icon = guideline.icon;
                    return (
                      <li key={index} className="flex items-start gap-2">
                        <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                          guideline.valid ? 'text-green-600' : 'text-amber-600'
                        }`} />
                        <span className="text-sm">{guideline.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Recommended Specifications:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Dimensions: 35mm × 45mm (2" × 2")</li>
                  <li>• Resolution: Minimum 600 DPI</li>
                  <li>• Format: JPG or PNG</li>
                  <li>• File size: Under 2MB</li>
                </ul>
              </div>

              {data.photo && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Photo Uploaded Successfully!</h4>
                  <p className="text-sm text-green-800">
                    Your photo has been uploaded and will be verified for compliance with the guidelines above.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
