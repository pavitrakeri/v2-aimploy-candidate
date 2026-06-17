import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { BackgroundCheckData } from '@/types/verification';
import { ShieldCheck, Users, Plus, Trash2, Mail, Phone, Building } from 'lucide-react';

interface BackgroundCheckStepProps {
  data: BackgroundCheckData;
  onChange: (data: BackgroundCheckData) => void;
}

export const BackgroundCheckStep: React.FC<BackgroundCheckStepProps> = ({ data, onChange }) => {
  const handleConsentChange = (checked: boolean) => {
    onChange({
      ...data,
      consentGiven: checked
    });
  };

  const handleCriminalRecordChange = (checked: boolean) => {
    onChange({
      ...data,
      noCriminalRecord: checked
    });
  };

  const handleReferenceChange = (id: string, field: string, value: string) => {
    const updatedReferences = data.references.map(ref =>
      ref.id === id ? { ...ref, [field]: value } : ref
    );
    onChange({
      ...data,
      references: updatedReferences
    });
  };

  const addReference = () => {
    const newReference = {
      id: Date.now().toString(),
      name: '',
      email: '',
      phone: '',
      relationship: '',
      company: ''
    };
    onChange({
      ...data,
      references: [...data.references, newReference]
    });
  };

  const removeReference = (id: string) => {
    if (data.references.length > 1) {
      onChange({
        ...data,
        references: data.references.filter(ref => ref.id !== id)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Background Check</h2>
        <p className="text-muted-foreground">
          Complete the background check consent and provide professional references.
        </p>
      </div>

      {/* Consent Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Consent & Declaration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="consent"
              checked={data.consentGiven}
              onCheckedChange={handleConsentChange}
            />
            <div className="space-y-1">
              <Label htmlFor="consent" className="text-sm font-medium">
                I consent to background verification
              </Label>
              <p className="text-xs text-muted-foreground">
                I authorize the company to conduct background checks including education, employment, criminal,
                and other verifications as deemed necessary for employment consideration.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="criminalRecord"
              checked={data.noCriminalRecord}
              onCheckedChange={handleCriminalRecordChange}
            />
            <div className="space-y-1">
              <Label htmlFor="criminalRecord" className="text-sm font-medium">
                I declare no criminal record
              </Label>
              <p className="text-xs text-muted-foreground">
                I declare that I have no criminal convictions or pending criminal cases against me.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* References Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              Professional References
            </CardTitle>
            <Button onClick={addReference} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Reference
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.references.map((reference, index) => (
              <div key={reference.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Reference {index + 1}</h4>
                  {data.references.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeReference(reference.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor={`name-${reference.id}`}>Full Name</Label>
                    <Input
                      id={`name-${reference.id}`}
                      value={reference.name}
                      onChange={(e) => handleReferenceChange(reference.id, 'name', e.target.value)}
                      placeholder="Enter reference name"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`relationship-${reference.id}`}>Relationship</Label>
                    <Input
                      id={`relationship-${reference.id}`}
                      value={reference.relationship}
                      onChange={(e) => handleReferenceChange(reference.id, 'relationship', e.target.value)}
                      placeholder="e.g., Manager, Colleague, Professor"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`email-${reference.id}`}>Email Address</Label>
                    <Input
                      id={`email-${reference.id}`}
                      type="email"
                      value={reference.email}
                      onChange={(e) => handleReferenceChange(reference.id, 'email', e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`phone-${reference.id}`}>Phone Number</Label>
                    <Input
                      id={`phone-${reference.id}`}
                      type="tel"
                      value={reference.phone}
                      onChange={(e) => handleReferenceChange(reference.id, 'phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor={`company-${reference.id}`}>Company/Organization</Label>
                    <Input
                      id={`company-${reference.id}`}
                      value={reference.company}
                      onChange={(e) => handleReferenceChange(reference.id, 'company', e.target.value)}
                      placeholder="Enter company or organization name"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50/50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-400 text-sm mb-2">Reference Guidelines:</h4>
            <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Provide at least one professional reference</li>
              <li>• References should be former managers, colleagues, or professors</li>
              <li>• Ensure references are aware they may be contacted</li>
              <li>• Provide current and accurate contact information</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
