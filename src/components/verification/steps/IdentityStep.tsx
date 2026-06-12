import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { IdentityData, UploadedFile } from '@/types/verification';
import { CreditCard, Shield, Camera, FileText, Car, DownloadCloud, Loader2 } from 'lucide-react';
import { useDigiLocker } from '@/contexts/DigiLockerContext';
import { Button } from '@/components/ui/button';
import { InlineDigiLockerFetcher } from '../../digilocker/InlineDigiLockerFetcher';

interface IdentityStepProps {
  data: IdentityData;
  onChange: (data: IdentityData) => void;
  onUploadDocument?: (file: File, docType: string, entryId?: string) => Promise<void>;
  onDeleteDocument?: (docType: string, entryId?: string) => Promise<void>;
  verificationId?: number;
  candidateId?: number;
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

export const IdentityStep: React.FC<IdentityStepProps> = ({ 
  data, 
  onChange, 
  onUploadDocument, 
  onDeleteDocument,
  verificationId,
  candidateId
}) => {
  const [activeTabs, setActiveTabs] = React.useState<Record<string, 'upload' | 'digilocker'>>({});
  const { state: digiLockerState } = useDigiLocker();

  const handleFileUpload = (key: keyof IdentityData) => (file: UploadedFile, rawFile?: File) => {
    const backendDocType = key === 'voterId' ? 'voter_id' : key === 'drivingLicence' ? 'driving_licence' : key;
    if (onUploadDocument && rawFile) {
      onUploadDocument(rawFile, backendDocType);
    } else {
      onChange({
        ...data,
        [key]: file
      });
    }
  };

  const handleFileRemove = (key: keyof IdentityData) => () => {
    const backendDocType = key === 'voterId' ? 'voter_id' : key === 'drivingLicence' ? 'driving_licence' : key;
    if (onDeleteDocument) {
      onDeleteDocument(backendDocType);
    } else {
      onChange({
        ...data,
        [key]: undefined
      });
    }
  };

  const hasRequiredDocument = data.aadhaar || data.pan;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">Identity Verification</h2>
        <p className="text-muted-foreground text-sm">
          Select manual upload or instant DigiLocker import. At least one document (Aadhaar or PAN) is required to proceed.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {identityDocuments.map((doc) => {
          const Icon = doc.icon;
          const uploadedFile = data[doc.key];
          
          const currentTab = activeTabs[doc.key] || (digiLockerState.isConnected ? 'digilocker' : 'upload');
          
          const setTab = (tab: 'upload' | 'digilocker') => {
            setActiveTabs(prev => ({ ...prev, [doc.key]: tab }));
          };

          return (
            <Card key={doc.key} className="hover:shadow-lg transition-all duration-300 border border-slate-100 flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-card-foreground">{doc.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                      </div>
                    </div>
                    {doc.required ? (
                      <Badge variant="destructive" className="text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                        Required
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide text-slate-500 bg-slate-50">
                        Optional
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  {uploadedFile ? (
                    <FileUploadZone
                      onFileUpload={handleFileUpload(doc.key)}
                      onFileRemove={handleFileRemove(doc.key)}
                      uploadedFile={uploadedFile}
                      title={`Upload ${doc.title}`}
                      aiChecks={doc.aiChecks}
                      required={doc.required}
                    />
                  ) : (
                    <div className="space-y-4">
                      {/* Tabs Header Toggle */}
                      <div className="flex p-1 bg-slate-100/70 rounded-lg border border-slate-200/50">
                        <button
                          type="button"
                          onClick={() => setTab('upload')}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                            currentTab === 'upload'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          📤 Manual File
                        </button>
                        <button
                          type="button"
                          onClick={() => setTab('digilocker')}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 ${
                            currentTab === 'digilocker'
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          🔐 DigiLocker
                        </button>
                      </div>

                      {currentTab === 'upload' ? (
                        <FileUploadZone
                          onFileUpload={handleFileUpload(doc.key)}
                          onFileRemove={handleFileRemove(doc.key)}
                          uploadedFile={uploadedFile}
                          title={`Upload ${doc.title}`}
                          aiChecks={doc.aiChecks}
                          required={doc.required}
                        />
                      ) : (
                        <InlineDigiLockerFetcher
                          verificationId={verificationId || 0}
                          candidateId={candidateId || 0}
                          documentType={doc.key as any}
                          onDocumentFetched={() => {
                            // Empty call simply triggers data updates
                            onChange({ ...data });
                          }}
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </div>
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
