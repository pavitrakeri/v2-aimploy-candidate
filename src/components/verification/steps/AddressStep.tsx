import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { AddressData, UploadedFile } from '@/types/verification';
import { MapPin, Home } from 'lucide-react';
import { InlineDigiLockerFetcher } from '../../digilocker/InlineDigiLockerFetcher';
import { useDigiLocker } from '@/contexts/DigiLockerContext';

interface AddressStepProps {
  data: AddressData;
  onChange: (data: AddressData) => void;
  onUploadDocument?: (file: File, docType: string) => Promise<void>;
  onDeleteDocument?: (docType: string) => Promise<void>;
  verificationId?: number;
  candidateId?: number;
}

export const AddressStep: React.FC<AddressStepProps> = ({ 
  data, 
  onChange, 
  onUploadDocument, 
  onDeleteDocument,
  verificationId,
  candidateId
}) => {
  const { state: digiLockerState } = useDigiLocker();
  const [activeTab, setActiveTab] = React.useState<'upload' | 'digilocker'>(digiLockerState.isConnected ? 'digilocker' : 'upload');

  const handleInputChange = (field: keyof AddressData, value: string | boolean) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const handleSameAsCurrentChange = (checked: boolean) => {
    const updatedData = {
      ...data,
      sameAsCurrent: checked,
      permanentAddress: checked ? data.currentAddress : data.permanentAddress,
      permanentCity: checked ? data.currentCity : data.permanentCity,
      permanentState: checked ? data.currentState : data.permanentState,
      permanentPincode: checked ? data.currentPincode : data.permanentPincode
    };
    onChange(updatedData);
  };

  const handleFileUpload = (file: UploadedFile, rawFile?: File) => {
    if (onUploadDocument && rawFile) {
      onUploadDocument(rawFile, 'address_proof');
    } else {
      onChange({
        ...data,
        addressProof: file
      });
    }
  };

  const handleFileRemove = () => {
    if (onDeleteDocument) {
      onDeleteDocument('address_proof');
    } else {
      onChange({
        ...data,
        addressProof: undefined
      });
    }
  };

  const addressProofTypes = [
    'Utility Bill (Electricity/Water/Gas)',
    'Bank Statement',
    'Rent Agreement',
    'Passport',
    'Aadhaar Card'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Address Verification</h2>
        <p className="text-muted-foreground">
          Provide your current and permanent address details along with address proof.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              Current Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentAddress">Street Address</Label>
              <Input
                id="currentAddress"
                value={data.currentAddress}
                onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                placeholder="Enter your current street address"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentCity">City</Label>
                <Input
                  id="currentCity"
                  value={data.currentCity}
                  onChange={(e) => handleInputChange('currentCity', e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="currentState">State</Label>
                <Input
                  id="currentState"
                  value={data.currentState}
                  onChange={(e) => handleInputChange('currentState', e.target.value)}
                  placeholder="State"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="currentPincode">PIN Code</Label>
              <Input
                id="currentPincode"
                value={data.currentPincode}
                onChange={(e) => handleInputChange('currentPincode', e.target.value)}
                placeholder="6-digit PIN code"
                maxLength={6}
              />
            </div>
          </CardContent>
        </Card>

        {/* Permanent Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Permanent Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sameAsCurrent"
                checked={data.sameAsCurrent}
                onCheckedChange={handleSameAsCurrentChange}
              />
              <Label htmlFor="sameAsCurrent" className="text-sm font-medium">
                Same as current address
              </Label>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="permanentAddress">Street Address</Label>
                <Input
                  id="permanentAddress"
                  value={data.permanentAddress}
                  onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
                  placeholder="Enter your permanent street address"
                  disabled={data.sameAsCurrent}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="permanentCity">City</Label>
                  <Input
                    id="permanentCity"
                    value={data.permanentCity}
                    onChange={(e) => handleInputChange('permanentCity', e.target.value)}
                    placeholder="City"
                    disabled={data.sameAsCurrent}
                  />
                </div>
                <div>
                  <Label htmlFor="permanentState">State</Label>
                  <Input
                    id="permanentState"
                    value={data.permanentState}
                    onChange={(e) => handleInputChange('permanentState', e.target.value)}
                    placeholder="State"
                    disabled={data.sameAsCurrent}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="permanentPincode">PIN Code</Label>
                <Input
                  id="permanentPincode"
                  value={data.permanentPincode}
                  onChange={(e) => handleInputChange('permanentPincode', e.target.value)}
                  placeholder="6-digit PIN code"
                  maxLength={6}
                  disabled={data.sameAsCurrent}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Address Proof */}
      <Card className="hover:shadow-lg transition-all duration-300 border border-slate-100">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-card-foreground">Address Proof Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Accepted Documents:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {addressProofTypes.map((type, index) => (
                  <span key={index} className="px-2 py-1 bg-slate-50 border border-slate-100 text-[10px] font-medium text-slate-600 rounded-md">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {data.addressProof ? (
              <FileUploadZone
                onFileUpload={handleFileUpload}
                onFileRemove={handleFileRemove}
                uploadedFile={data.addressProof}
                title="Upload Address Proof"
                description="Upload any one of the accepted documents mentioned above"
                aiChecks={['Address verification', 'Document authenticity', 'Date validation']}
                required={true}
              />
            ) : (
              <div className="space-y-4">
                {/* Tabs Header Toggle */}
                <div className="flex p-1 bg-slate-100/70 rounded-lg border border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      activeTab === 'upload'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📤 Manual File
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('digilocker')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1 ${
                      activeTab === 'digilocker'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🔐 DigiLocker
                  </button>
                </div>

                {activeTab === 'upload' ? (
                  <FileUploadZone
                    onFileUpload={handleFileUpload}
                    onFileRemove={handleFileRemove}
                    uploadedFile={data.addressProof}
                    title="Upload Address Proof"
                    description="Upload any one of the accepted documents mentioned above"
                    aiChecks={['Address verification', 'Document authenticity', 'Date validation']}
                    required={true}
                  />
                ) : (
                  <InlineDigiLockerFetcher
                    verificationId={verificationId || 0}
                    candidateId={candidateId || 0}
                    documentType="addressProof"
                    onDocumentFetched={() => {
                      // Trigger state refresh
                      onChange({ ...data });
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
