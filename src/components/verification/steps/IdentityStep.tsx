import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { IdentityData, UploadedFile } from '@/types/verification';
import { CreditCard, Shield, Camera, FileText, Car, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Sparkles } from 'lucide-react';
import { useDigiLocker } from '@/contexts/DigiLockerContext';
import { InlineDigiLockerFetcher } from '../../digilocker/InlineDigiLockerFetcher';

interface IdentityStepProps {
  data: IdentityData;
  onChange: (data: IdentityData) => void;
  onUploadDocument?: (file: File, docType: string, entryId?: string) => Promise<boolean | void>;
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
  const [expandedDoc, setExpandedDoc] = React.useState<string | null>('aadhaar');
  const { state: digiLockerState } = useDigiLocker();

  const handleFileUpload = (key: keyof IdentityData) => (file: UploadedFile, rawFile?: File): Promise<boolean | void> | void => {
    const backendDocType = key === 'voterId' ? 'voter_id' : key === 'drivingLicence' ? 'driving_licence' : key;
    if (onUploadDocument && rawFile) {
      return onUploadDocument(rawFile, backendDocType);
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
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CreditCard className="h-5.5 w-5.5 text-primary" />
          1. Identity Verification
        </h2>
        <p className="text-muted-foreground text-xs mt-1">
          Select manual upload or instant DigiLocker import. At least one document (Aadhaar or PAN) is required to proceed.
        </p>
      </div>

      <div className="space-y-3">
        {identityDocuments.map((doc) => {
          const Icon = doc.icon;
          const uploadedFile = data[doc.key];
          const isExpanded = expandedDoc === doc.key;
          const currentTab = activeTabs[doc.key] || (digiLockerState.isConnected ? 'digilocker' : 'upload');

          const toggleExpand = () => {
            setExpandedDoc(isExpanded ? null : doc.key);
          };

          const setTab = (tab: 'upload' | 'digilocker') => {
            setActiveTabs(prev => ({ ...prev, [doc.key]: tab }));
          };

          // Compute status badge
          let statusBadge = (
            <Badge variant="outline" className="text-[10px] border-muted-foreground/30 text-muted-foreground bg-muted/10 font-bold px-2 py-0.5">
              Not Uploaded
            </Badge>
          );

          if (uploadedFile) {
            if (uploadedFile.validation_status === 'verified') {
              statusBadge = (
                <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 hover:bg-emerald-50 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </Badge>
              );
            } else if (uploadedFile.validation_status === 'needs_review') {
              statusBadge = (
                <Badge className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200/50 hover:bg-amber-50 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Under Review ({uploadedFile.validation_score}%)
                </Badge>
              );
            } else if (uploadedFile.validation_status === 'rejected') {
              statusBadge = (
                <Badge className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200/50 hover:bg-red-50 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Action Required
                </Badge>
              );
            } else {
              statusBadge = (
                <Badge className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200/50 hover:bg-blue-50 text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
                  Uploaded
                </Badge>
              );
            }
          }

          return (
            <Card 
              key={doc.key} 
              className={`transition-all duration-200 border shadow-none ${
                isExpanded 
                  ? 'border-primary/40 bg-card' 
                  : 'border-border/60 bg-muted/10 hover:bg-muted/20 hover:border-border'
              }`}
            >
              {/* Collapsed Header */}
              <div 
                onClick={toggleExpand}
                className="p-4 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${
                    isExpanded ? 'bg-primary/10 text-primary' : 'bg-muted border border-border/40 text-muted-foreground'
                  }`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{doc.title}</span>
                      {doc.required && (
                        <span className="text-[10px] font-extrabold text-red-650 tracking-wide uppercase">* Required</span>
                      )}
                    </div>
                    {!isExpanded && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[280px] sm:max-w-md">
                        {uploadedFile ? `Attached: ${uploadedFile.name}` : doc.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {statusBadge}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded content area */}
              {isExpanded && (
                <CardContent className="pt-0 pb-4 px-4 border-t border-border/40 bg-card">
                  <div className="pt-4 space-y-4">
                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                    
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
                        <div className="flex p-0.5 bg-muted rounded-lg border border-border/50 max-w-xs">
                          <button
                            type="button"
                            onClick={() => setTab('upload')}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                              currentTab === 'upload'
                                ? 'bg-card text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            📤 Manual File
                          </button>
                          <button
                            type="button"
                            onClick={() => setTab('digilocker')}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 ${
                              currentTab === 'digilocker'
                                ? 'bg-card text-primary shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
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
                              onChange({ ...data });
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {!hasRequiredDocument && (
        <div className="p-4 bg-amber-50/50 border border-amber-200/50 dark:bg-amber-950/20 dark:border-amber-900/50 rounded-xl flex items-start gap-2.5">
          <AlertCircle className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed font-medium">
            Please expand and upload at least one required identity document (Aadhaar or PAN card) to enable review submission.
          </p>
        </div>
      )}
    </div>
  );
};
