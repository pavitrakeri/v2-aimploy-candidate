import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { EducationEntry, UploadedFile } from '@/types/verification';
import { GraduationCap, Award } from 'lucide-react';

interface EducationStepProps {
  data: EducationEntry[];
  onChange: (data: EducationEntry[]) => void;
  onUploadDocument?: (file: File, docType: string, id: string) => Promise<boolean | void>;
  onDeleteDocument?: (docType: string, id: string) => Promise<void>;
}

const educationLevels = [
  { 
    id: '10th', 
    level: '10th' as const, 
    title: '10th Standard',
    description: 'Secondary education',
    icon: Award
  },
  { 
    id: '12th', 
    level: '12th / Diploma' as const, 
    title: '12th Standard / Diploma',
    description: 'Higher secondary or diploma',
    icon: GraduationCap
  },
  { 
    id: 'degree', 
    level: 'Degree' as const, 
    title: 'Graduation',
    description: 'Bachelor\'s degree',
    icon: GraduationCap
  },
  { 
    id: 'pg', 
    level: 'Post Graduation' as const, 
    title: 'Post Graduation',
    description: 'Master\'s degree or higher',
    icon: Award
  }
];

export const EducationStep: React.FC<EducationStepProps> = ({ data, onChange, onUploadDocument, onDeleteDocument }) => {
  const handleEntryChange = (id: string, field: keyof EducationEntry, value: string | UploadedFile) => {
    const updatedData = data.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    );
    onChange(updatedData);
  };

  const handleFileUpload = (id: string) => (file: UploadedFile, rawFile?: File): Promise<boolean | void> | void => {
    if (onUploadDocument && rawFile) {
      return onUploadDocument(rawFile, 'education_certificate', id);
    } else {
      handleEntryChange(id, 'document', file);
    }
  };

  const handleFileRemove = (id: string) => () => {
    if (onDeleteDocument) {
      onDeleteDocument('education_certificate', id);
    } else {
      handleEntryChange(id, 'document', undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Education Verification</h2>
        <p className="text-muted-foreground">
          Provide your educational qualifications for each level. Upload supporting documents where available.
        </p>
      </div>

      <div className="grid gap-6">
        {educationLevels.map((eduLevel) => {
          const entry = data.find(e => e.id === eduLevel.id) || {
            id: eduLevel.id,
            level: eduLevel.level,
            institution: '',
            board: '',
            year: '',
            percentage: ''
          };
          
          const Icon = eduLevel.icon;
          const hasDocument = !!entry.document;
          
          return (
            <Card key={eduLevel.id} className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {eduLevel.title}
                      {hasDocument && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Document Uploaded
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-normal">
                      {eduLevel.description}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor={`${eduLevel.id}-institution`}>
                      Institution/School Name
                    </Label>
                    <Input
                      id={`${eduLevel.id}-institution`}
                      value={entry.institution}
                      onChange={(e) => handleEntryChange(eduLevel.id, 'institution', e.target.value)}
                      placeholder="Enter institution name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`${eduLevel.id}-board`}>
                      {eduLevel.level === 'Degree' || eduLevel.level === 'Post Graduation' ? 'University' : 'Board/University'}
                    </Label>
                    <Input
                      id={`${eduLevel.id}-board`}
                      value={entry.board}
                      onChange={(e) => handleEntryChange(eduLevel.id, 'board', e.target.value)}
                      placeholder={eduLevel.level === 'Degree' || eduLevel.level === 'Post Graduation' ? 'Enter university name' : 'Enter board name'}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`${eduLevel.id}-year`}>
                      Year of Completion
                    </Label>
                    <Input
                      id={`${eduLevel.id}-year`}
                      value={entry.year}
                      onChange={(e) => handleEntryChange(eduLevel.id, 'year', e.target.value)}
                      placeholder="e.g., 2020"
                      maxLength={4}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`${eduLevel.id}-percentage`}>
                      Percentage/CGPA
                    </Label>
                    <Input
                      id={`${eduLevel.id}-percentage`}
                      value={entry.percentage}
                      onChange={(e) => handleEntryChange(eduLevel.id, 'percentage', e.target.value)}
                      placeholder="e.g., 85% or 8.5 CGPA"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <FileUploadZone
                    onFileUpload={handleFileUpload(eduLevel.id)}
                    onFileRemove={handleFileRemove(eduLevel.id)}
                    uploadedFile={entry.document}
                    title={`Upload ${eduLevel.title} Document`}
                    description="Upload marksheet, certificate, or degree"
                    aiChecks={['Document verification', 'Institution validation', 'Grade verification']}
                    required={false}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
