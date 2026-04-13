import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { IdentityData, UploadedFile } from '@/types/verification';
import { CreditCard, Shield, Camera, FileText, Car } from 'lucide-react';

interface IdentityStepProps {
  data: IdentityData;
  onChange: (data: IdentityData) => void;
}

const identityDocuments = [
  {
    key: 'aadhaar' as keyof IdentityData,
    title: 'Aadhaar Card',
    description: 'Upload your Aadhaar card (front and back)',
    icon: CreditCard,
    required: true,
    aiChecks: ['Photo verification', 'QR code validation', 'Document authenticity']
  },
  {
    key: 'pan' as keyof IdentityData,
    title: 'PAN Card',
    description: 'Upload your PAN card',
    icon: FileText,
    required: true,
    aiChecks: ['Photo verification', 'Number validation', 'Document authenticity']
  },
  {
    key: 'passport' as keyof IdentityData,
    title: 'Passport',
    description: 'Upload your passport',
    icon: Shield,
    required: false,
    aiChecks: ['Photo verification', 'Number validation', 'Expiry check']
  },
  {
    key: 'voterId' as keyof IdentityData,
    title: 'Voter ID',
    description: 'Upload your Voter ID card',
    icon: FileText,
    required: false,
    aiChecks: ['Photo verification', 'Number validation', 'Document authenticity']
  },
  {
    key: 'drivingLicence' as keyof IdentityData,
    title: 'Driving Licence',
    description: 'Upload your Driving Licence',
    icon: Car,
    required: false,
    aiChecks: ['Photo verification', 'Number validation', 'Expiry check']
  }
];

export const IdentityStep: React.FC<IdentityStepProps> = ({ data, onChange }) => {
  const handleFileUpload = (key: keyof IdentityData) => (file: UploadedFile) => {
    onChange({
      ...data,
      [key]: file
    });
  };

  const handleFileRemove = (key: keyof IdentityData) => () => {
    onChange({
      ...data,
      [key]: undefined
    });
  };

  const hasRequiredDocument = data.aadhaar || data.pan;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">Identity Verification</h2>
        <p className="text-muted-foreground">
          Upload your government-issued identity documents. At least one document is required.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {identityDocuments.map((doc) => {
          const Icon = doc.icon;
          const uploadedFile = data[doc.key];
          
          return (
            <Card key={doc.key} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg text-card-foreground">{doc.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                      {doc.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                      {!doc.required && (
                        <Badge variant="secondary" className="text-xs">
                          Optional
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <FileUploadZone
                  onFileUpload={handleFileUpload(doc.key)}
                  onFileRemove={handleFileRemove(doc.key)}
                  uploadedFile={uploadedFile}
                  title={`Upload ${doc.title}`}
                  aiChecks={doc.aiChecks}
                  required={doc.required}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!hasRequiredDocument && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Please upload at least one required document (Aadhaar or PAN card) to proceed.
          </p>
        </div>
      )}
    </div>
  );
};
