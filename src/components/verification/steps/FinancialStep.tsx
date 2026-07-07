import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { FinancialData, UploadedFile } from '@/types/verification';
import { Landmark, FileText, DollarSign, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, ShieldAlert } from 'lucide-react';

interface FinancialStepProps {
  data: FinancialData;
  onChange: (data: FinancialData) => void;
  onUploadDocument?: (file: File, docType: string) => Promise<boolean | void>;
  onDeleteDocument?: (docType: string) => Promise<void>;
}

const financialDocuments = [
  {
    key: 'bankStatement' as keyof FinancialData,
    title: 'Bank Statement',
    description: 'Recent bank statement (last 3-6 months)',
    icon: Landmark,
    aiChecks: ['Account verification', 'Transaction analysis', 'Document authenticity']
  },
  {
    key: 'salarySlip' as keyof FinancialData,
    title: 'Salary Slip',
    description: 'Recent salary slips (last 3 months)',
    icon: DollarSign,
    aiChecks: ['Company verification', 'Salary validation', 'Date verification']
  },
  {
    key: 'taxReturn' as keyof FinancialData,
    title: 'Tax Return',
    description: 'Recent income tax return documents',
    icon: FileText,
    aiChecks: ['PAN verification', 'Income validation', 'Document authenticity']
  }
];

export const FinancialStep: React.FC<FinancialStepProps> = ({ data, onChange, onUploadDocument, onDeleteDocument }) => {
  const [expandedDoc, setExpandedDoc] = React.useState<string | null>('bankStatement');

  const handleFileUpload = (key: keyof FinancialData) => (file: UploadedFile, rawFile?: File): Promise<boolean | void> | void => {
    const backendDocType = key === 'bankStatement' ? 'bank_statement' : key === 'salarySlip' ? 'salary_slip' : 'tax_return';
    if (onUploadDocument && rawFile) {
      return onUploadDocument(rawFile, backendDocType);
    } else {
      onChange({
        ...data,
        [key]: file
      });
    }
  };

  const handleFileRemove = (key: keyof FinancialData) => () => {
    const backendDocType = key === 'bankStatement' ? 'bank_statement' : key === 'salarySlip' ? 'salary_slip' : 'tax_return';
    if (onDeleteDocument) {
      onDeleteDocument(backendDocType);
    } else {
      onChange({
        ...data,
        [key]: undefined
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Landmark className="h-5.5 w-5.5 text-primary" />
          5. Financial Verification
        </h2>
        <p className="text-muted-foreground text-xs mt-1">
          Upload your financial documents for verification. These documents help verify your income and employment details.
        </p>
      </div>

      <div className="space-y-3">
        {financialDocuments.map((doc) => {
          const Icon = doc.icon;
          const uploadedFile = data[doc.key];
          const isExpanded = expandedDoc === doc.key;

          const toggleExpand = () => {
            setExpandedDoc(isExpanded ? null : doc.key);
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
                    <span className="font-semibold text-sm text-foreground">{doc.title}</span>
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

              {/* Expanded Content */}
              {isExpanded && (
                <CardContent className="pt-0 pb-4 px-4 border-t border-border/40 bg-card">
                  <div className="pt-4 space-y-4">
                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                    <FileUploadZone
                      onFileUpload={handleFileUpload(doc.key)}
                      onFileRemove={handleFileRemove(doc.key)}
                      uploadedFile={uploadedFile}
                      title={`Upload ${doc.title}`}
                      aiChecks={doc.aiChecks}
                      required={false}
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <div className="p-4 bg-blue-50/50 border border-blue-200/50 dark:bg-blue-950/20 dark:border-blue-900/50 rounded-xl flex gap-2.5">
        <ShieldAlert className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-blue-900 dark:text-blue-400 text-xs mb-1">Privacy & Security</h4>
          <ul className="text-[11px] text-blue-800 dark:text-blue-400 space-y-0.5 leading-relaxed font-medium">
            <li>• All financial documents are encrypted and stored securely</li>
            <li>• Documents are used only for verification purposes</li>
            <li>• Sensitive information is masked during processing</li>
            <li>• Documents are automatically deleted after verification</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
