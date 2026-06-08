import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { EmploymentEntry, UploadedFile } from '@/types/verification';
import { Briefcase, Plus, Trash2, Calendar } from 'lucide-react';

interface EmploymentStepProps {
  data: EmploymentEntry[];
  onChange: (data: EmploymentEntry[]) => void;
  onUploadDocument?: (file: File, docType: string, id: string) => Promise<void>;
  onDeleteDocument?: (docType: string, id: string) => Promise<void>;
}

export const EmploymentStep: React.FC<EmploymentStepProps> = ({ data, onChange, onUploadDocument, onDeleteDocument }) => {
  const handleEntryChange = (id: string, field: keyof EmploymentEntry, value: string | UploadedFile) => {
    const updatedData = data.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    );
    onChange(updatedData);
  };

  const handleFileUpload = (id: string, documentType: 'offerLetter' | 'experienceLetter' | 'payslip') => (file: UploadedFile, rawFile?: File) => {
    const backendDocType = documentType === 'offerLetter' ? 'offer_letter' : documentType === 'experienceLetter' ? 'experience_letter' : 'payslip';
    if (onUploadDocument && rawFile) {
      onUploadDocument(rawFile, backendDocType, id);
    } else {
      const updatedData = data.map(entry => 
        entry.id === id ? { ...entry, [documentType]: file } : entry
      );
      onChange(updatedData);
    }
  };

  const handleFileRemove = (id: string, documentType: 'offerLetter' | 'experienceLetter' | 'payslip') => () => {
    const backendDocType = documentType === 'offerLetter' ? 'offer_letter' : documentType === 'experienceLetter' ? 'experience_letter' : 'payslip';
    if (onDeleteDocument) {
      onDeleteDocument(backendDocType, id);
    } else {
      const updatedData = data.map(entry => 
        entry.id === id ? { ...entry, [documentType]: undefined } : entry
      );
      onChange(updatedData);
    }
  };

  const addEmploymentEntry = () => {
    const newEntry: EmploymentEntry = {
      id: Date.now().toString(),
      company: '',
      designation: '',
      fromDate: '',
      toDate: '',
      managerName: '',
      hrEmail: ''
    };
    onChange([...data, newEntry]);
  };

  const removeEmploymentEntry = (id: string) => {
    if (data.length > 1) {
      onChange(data.filter(entry => entry.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Employment Verification</h2>
          <p className="text-muted-foreground">
            Add your previous employment details and upload supporting documents.
          </p>
        </div>
        <Button onClick={addEmploymentEntry} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Employer
        </Button>
      </div>

      <div className="space-y-6">
        {data.map((entry, index) => (
          <Card key={entry.id} className="card-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <span>Employment {index + 1}</span>
                </CardTitle>
                {data.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeEmploymentEntry(entry.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor={`company-${entry.id}`}>Company Name</Label>
                  <Input
                    id={`company-${entry.id}`}
                    value={entry.company}
                    onChange={(e) => handleEntryChange(entry.id, 'company', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`designation-${entry.id}`}>Designation/Role</Label>
                  <Input
                    id={`designation-${entry.id}`}
                    value={entry.designation}
                    onChange={(e) => handleEntryChange(entry.id, 'designation', e.target.value)}
                    placeholder="Enter your designation"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`fromDate-${entry.id}`}>From Date</Label>
                  <Input
                    id={`fromDate-${entry.id}`}
                    type="month"
                    value={entry.fromDate}
                    onChange={(e) => handleEntryChange(entry.id, 'fromDate', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`toDate-${entry.id}`}>To Date</Label>
                  <Input
                    id={`toDate-${entry.id}`}
                    type="month"
                    value={entry.toDate}
                    onChange={(e) => handleEntryChange(entry.id, 'toDate', e.target.value)}
                    placeholder="Leave empty if currently working"
                  />
                </div>

                <div>
                  <Label htmlFor={`managerName-${entry.id}`}>Manager Name (Reference)</Label>
                  <Input
                    id={`managerName-${entry.id}`}
                    value={entry.managerName || ''}
                    onChange={(e) => handleEntryChange(entry.id, 'managerName', e.target.value)}
                    placeholder="Enter reporting manager's name"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`hrEmail-${entry.id}`}>HR Email (Reference)</Label>
                  <Input
                    id={`hrEmail-${entry.id}`}
                    type="email"
                    value={entry.hrEmail || ''}
                    onChange={(e) => handleEntryChange(entry.id, 'hrEmail', e.target.value)}
                    placeholder="Enter HR or manager's email"
                  />
                </div>
              </div>

              {/* Document Uploads */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Supporting Documents</Label>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <FileUploadZone
                    onFileUpload={handleFileUpload(entry.id, 'offerLetter')}
                    onFileRemove={handleFileRemove(entry.id, 'offerLetter')}
                    uploadedFile={entry.offerLetter}
                    title="Offer Letter"
                    description="Upload your offer letter"
                    aiChecks={['Company verification', 'Date validation', 'Document authenticity']}
                    required={false}
                  />
                  
                  <FileUploadZone
                    onFileUpload={handleFileUpload(entry.id, 'experienceLetter')}
                    onFileRemove={handleFileRemove(entry.id, 'experienceLetter')}
                    uploadedFile={entry.experienceLetter}
                    title="Experience Letter"
                    description="Upload your experience letter"
                    aiChecks={['Company verification', 'Duration validation', 'Document authenticity']}
                    required={false}
                  />
                  
                  <FileUploadZone
                    onFileUpload={handleFileUpload(entry.id, 'payslip')}
                    onFileRemove={handleFileRemove(entry.id, 'payslip')}
                    uploadedFile={entry.payslip}
                    title="Payslip"
                    description="Upload recent payslip"
                    aiChecks={['Company verification', 'Salary verification', 'Date validation']}
                    required={false}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Employment History Added</h3>
            <p className="text-muted-foreground mb-4">
              Add your previous employment details to complete verification
            </p>
            <Button onClick={addEmploymentEntry} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Employer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
