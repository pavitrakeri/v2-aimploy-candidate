import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { IdentityData, UploadedFile } from '@/types/verification';
import { CreditCard, Shield, Camera, FileText, Car, DownloadCloud, Loader2 } from 'lucide-react';
import { useDigiLocker } from '@/contexts/DigiLockerContext';
import { Button } from '@/components/ui/button';

interface IdentityStepProps {
  data: IdentityData;
  onChange: (data: IdentityData) => void;
  onUploadDocument?: (file: File, documentType: string) => void;
  onDeleteDocument?: (documentType: string) => void;
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

export const IdentityStep: React.FC<IdentityStepProps> = ({ data, onChange, onUploadDocument, onDeleteDocument }) => {
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

  const { state: digiLockerState, actions: digiLockerActions } = useDigiLocker();
  const [fetchingDoc, setFetchingDoc] = React.useState<string | null>(null);

  const handleFetchFromDigiLocker = async (docKey: keyof IdentityData, backendDocType: string) => {
    if (!digiLockerState.request?.id) {
      alert("Please connect to DigiLocker first from the dashboard.");
      return;
    }
    
    try {
      setFetchingDoc(docKey);
      
      // If it's Aadhaar, we have a specific endpoint that might be better, 
      // but let's try the generic document fetch first if it's available in their issued documents
      
      if (backendDocType === 'aadhaar') {
        const aadhaarData = await digiLockerActions.fetchAadhaarData(digiLockerState.request.id);
        if (aadhaarData) {
          alert("Successfully fetched Aadhaar data from DigiLocker!");
          // Here we would ideally generate a PDF or trigger a backend sync. 
          // For now we rely on the backend to have stored it or the context to hold it.
        }
      } else {
        alert(`DigiLocker integration for ${backendDocType} requires specific document parameters (like Driving License number). This UI will be expanded in the next phase to accept these parameters.`);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to fetch from DigiLocker");
    } finally {
      setFetchingDoc(null);
    }
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
                
                {digiLockerState.isConnected && !uploadedFile && (
                  <div className="mt-4 flex justify-center">
                    <Button 
                      variant="outline" 
                      className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => handleFetchFromDigiLocker(doc.key, doc.key === 'voterId' ? 'voter_id' : doc.key === 'drivingLicence' ? 'driving_licence' : doc.key)}
                      disabled={fetchingDoc === doc.key}
                    >
                      {fetchingDoc === doc.key ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <DownloadCloud className="w-4 h-4 mr-2" />
                      )}
                      Import {doc.title} from DigiLocker
                    </Button>
                  </div>
                )}
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
