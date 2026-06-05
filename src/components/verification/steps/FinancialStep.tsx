import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { FinancialData, UploadedFile } from '@/types/verification';
import { Landmark, FileText, DollarSign } from 'lucide-react';

interface FinancialStepProps {
  data: FinancialData;
  onChange: (data: FinancialData) => void;
  onUploadDocument?: (file: File, docType: string) => Promise<void>;
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
  const handleFileUpload = (key: keyof FinancialData) => (file: UploadedFile, rawFile?: File) => {
    const backendDocType = key === 'bankStatement' ? 'bank_statement' : key === 'salarySlip' ? 'salary_slip' : 'tax_return';
    if (onUploadDocument && rawFile) {
      onUploadDocument(rawFile, backendDocType);
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
      <div>
        <h2 className="text-2xl font-bold mb-2">Financial Verification</h2>
        <p className="text-muted-foreground">
          Upload your financial documents for verification. These documents help verify your income and financial stability.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {financialDocuments.map((doc) => {
          const Icon = doc.icon;
          const uploadedFile = data[doc.key];
          
          return (
            <Card key={doc.key} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
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
                  required={false}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Privacy & Security</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• All financial documents are encrypted and stored securely</li>
          <li>• Documents are used only for verification purposes</li>
          <li>• Sensitive information is masked during processing</li>
          <li>• Documents are automatically deleted after verification</li>
        </ul>
      </div>
    </div>
  );
};
