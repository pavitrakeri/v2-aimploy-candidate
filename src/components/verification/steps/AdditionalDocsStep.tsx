import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { AdditionalDoc, UploadedFile } from '@/types/verification';
import { FolderPlus, Plus, Trash2, FileText } from 'lucide-react';

interface AdditionalDocsStepProps {
  data: AdditionalDoc[];
  onChange: (data: AdditionalDoc[]) => void;
  onUploadDocument?: (file: File, docType: string, id: string) => Promise<void>;
  onDeleteDocument?: (docType: string, id: string) => Promise<void>;
}

export const AdditionalDocsStep: React.FC<AdditionalDocsStepProps> = ({ data, onChange, onUploadDocument, onDeleteDocument }) => {
  const addDocument = () => {
    const newDoc: AdditionalDoc = {
      id: Date.now().toString(),
      label: '',
      file: undefined
    };
    onChange([...data, newDoc]);
  };

  const removeDocument = (id: string) => {
    onChange(data.filter(doc => doc.id !== id));
  };

  const handleLabelChange = (id: string, label: string) => {
    const updatedDocs = data.map(doc =>
      doc.id === id ? { ...doc, label } : doc
    );
    onChange(updatedDocs);
  };

  const handleFileUpload = (id: string) => (file: UploadedFile, rawFile?: File) => {
    if (onUploadDocument && rawFile) {
      onUploadDocument(rawFile, 'other', id);
    } else {
      const updatedDocs = data.map(doc =>
        doc.id === id ? { ...doc, file } : doc
      );
      onChange(updatedDocs);
    }
  };

  const handleFileRemove = (id: string) => () => {
    if (onDeleteDocument) {
      onDeleteDocument('other', id);
    } else {
      const updatedDocs = data.map(doc =>
        doc.id === id ? { ...doc, file: undefined } : doc
      );
      onChange(updatedDocs);
    }
  };

  const suggestedDocuments = [
    'Portfolio',
    'Certification',
    'Achievement Certificate',
    'Project Report',
    'Training Certificate',
    'Other'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Additional Documents</h2>
          <p className="text-muted-foreground">
            Upload any additional documents that support your verification process.
          </p>
        </div>
        <Button onClick={addDocument} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Document
        </Button>
      </div>

      {data.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center">
            <FolderPlus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Additional Documents</h3>
            <p className="text-muted-foreground mb-4">
              Add any additional documents that support your verification
            </p>
            <Button onClick={addDocument} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((doc, index) => (
            <Card key={doc.id} className="card-hover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <span>Document {index + 1}</span>
                    {doc.file && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Uploaded
                      </span>
                    )}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeDocument(doc.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={`label-${doc.id}`}>Document Label</Label>
                  <Input
                    id={`label-${doc.id}`}
                    value={doc.label}
                    onChange={(e) => handleLabelChange(doc.id, e.target.value)}
                    placeholder="Enter document label (e.g., Portfolio, Certification)"
                  />
                  {!doc.label && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-xs text-muted-foreground">Suggestions:</span>
                      {suggestedDocuments.map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          onClick={() => handleLabelChange(doc.id, suggestion)}
                          className="text-xs h-6 px-2"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <FileUploadZone
                  onFileUpload={handleFileUpload(doc.id)}
                  onFileRemove={handleFileRemove(doc.id)}
                  uploadedFile={doc.file}
                  title={doc.label || 'Upload Document'}
                  description="Upload any supporting document"
                  aiChecks={['Document verification', 'Content analysis', 'Format validation']}
                  required={false}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h4 className="font-medium text-amber-900 mb-2">Tips for Additional Documents:</h4>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Upload documents that showcase your skills and achievements</li>
          <li>• Include certifications relevant to your field</li>
          <li>• Ensure documents are clear and readable</li>
          <li>• Use descriptive labels for easy identification</li>
          <li>• Maximum file size: 5MB per document</li>
        </ul>
      </div>
    </div>
  );
};
