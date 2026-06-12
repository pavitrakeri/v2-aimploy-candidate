import React, { useState, useEffect } from 'react';
import { useDigiLocker } from '../../contexts/DigiLockerContext';
import { useBGV } from '../../contexts/BGVContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Loader2, Download, FileText, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface DigiLockerDocumentFetcherProps {
  verificationId: number;
  candidateId: number;
  documentType: string;
  onDocumentFetched?: (document: any) => void;
}

interface DocumentParameter {
  name: string;
  value: string;
}

export const DigiLockerDocumentFetcher: React.FC<DigiLockerDocumentFetcherProps> = ({
  verificationId,
  candidateId,
  documentType,
  onDocumentFetched,
}) => {
  const { state: digiLockerState, actions: digiLockerActions } = useDigiLocker();
  const { actions: bgvActions } = useBGV();
  
  const [selectedDoc, setSelectedDoc] = useState<{
    doc_type: string;
    org_id: string;
    description: string;
  } | null>(null);
  
  const [parameters, setParameters] = useState<DocumentParameter[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // BGV to DigiLocker document mapping
  const bgvToDigiLockerMapping: Record<string, Array<{doc_type: string; org_id: string; description: string}>> = {
    identity: [
      { doc_type: "ADHAR", org_id: "UIDAI", description: "Aadhaar Card" },
      { doc_type: "PANCR", org_id: "INCOMETAX", description: "PAN Card" },
      { doc_type: "DRVLC", org_id: "RTO", description: "Driving License" },
      { doc_type: "PASSP", org_id: "MEA", description: "Passport" },
      { doc_type: "VOTERID", org_id: "ECI", description: "Voter ID" },
    ],
    address: [
      { doc_type: "ADHAR", org_id: "UIDAI", description: "Aadhaar Card (Address)" },
      { doc_type: "DRVLC", org_id: "RTO", description: "Driving License (Address)" },
      { doc_type: "PASSP", org_id: "MEA", description: "Passport (Address)" },
    ],
    education: [
      { doc_type: "MARKSHEET", org_id: "CBSE", description: "CBSE Mark Sheet" },
      { doc_type: "MARKSHEET", org_id: "STATEBOARD", description: "State Board Mark Sheet" },
      { doc_type: "DEGCR", org_id: "UNIVERSITY", description: "Degree Certificate" },
    ],
    employment: [
      { doc_type: "OFFER", org_id: "COMPANY", description: "Offer Letter" },
      { doc_type: "EXP", org_id: "COMPANY", description: "Experience Certificate" },
    ],
    financial: [
      { doc_type: "BANKSTMT", org_id: "BANK", description: "Bank Statement" },
      { doc_type: "ITR", org_id: "INCOMETAX", description: "Income Tax Return" },
    ],
  };

  // Parameter requirements for different document types
  const getParameterRequirements = (docType: string): Array<{name: string; label: string; placeholder: string; required?: boolean}> => {
    const requirements: Record<string, Array<{name: string; label: string; placeholder: string; required?: boolean}>> = {
      ADHAR: [], // Aadhaar doesn't require parameters
      PANCR: [], // PAN doesn't require parameters
      DRVLC: [
        { name: "DL_NUMBER", label: "Driving License Number", placeholder: "DL-XXXXXXXXXXXX", required: true }
      ],
      MARKSHEET: [
        { name: "ROLL_NUMBER", label: "Roll Number", placeholder: "Enter roll number", required: true },
        { name: "YEAR", label: "Year", placeholder: "2023", required: true }
      ],
      DEGCR: [
        { name: "CERTIFICATE_NUMBER", label: "Certificate Number", placeholder: "Enter certificate number", required: true },
        { name: "YEAR", label: "Year of Passing", placeholder: "2023", required: true }
      ],
      BANKSTMT: [
        { name: "ACCOUNT_NUMBER", label: "Account Number", placeholder: "Enter account number", required: true },
        { name: "PERIOD", label: "Period", placeholder: "Jan-Mar 2023", required: true }
      ],
      ITR: [
        { name: "PAN", label: "PAN Number", placeholder: "XXXXXXXXXX", required: true },
        { name: "ASSESSMENT_YEAR", label: "Assessment Year", placeholder: "2023-24", required: true }
      ],
    };
    
    return requirements[docType] || [];
  };

  const availableDocuments = bgvToDigiLockerMapping[documentType] || [];

  useEffect(() => {
    if (selectedDoc) {
      const requirements = getParameterRequirements(selectedDoc.doc_type);
      setParameters(
        requirements.map(req => ({
          name: req.name,
          value: ''
        }))
      );
    }
  }, [selectedDoc]);

  const handleParameterChange = (paramName: string, value: string) => {
    setParameters(prev => 
      prev.map(param => 
        param.name === paramName ? { ...param, value } : param
      )
    );
  };

  const validateParameters = (): boolean => {
    if (!selectedDoc) return false;
    
    const requirements = getParameterRequirements(selectedDoc.doc_type);
    for (const req of requirements) {
      if (req.required) {
        const param = parameters.find(p => p.name === req.name);
        if (!param || !param.value.trim()) {
          setError(`${req.label} is required`);
          return false;
        }
      }
    }
    
    setError(null);
    return true;
  };

  const handleFetchDocument = async () => {
    if (!digiLockerState.request || !selectedDoc) {
      setError('Please connect to DigiLocker and select a document type');
      return;
    }

    if (!validateParameters()) {
      return;
    }

    try {
      setIsFetching(true);
      setError(null);

      // Fetch document from DigiLocker
      const documentResponse = await digiLockerActions.fetchDocument(
        digiLockerState.request.id,
        selectedDoc.doc_type,
        selectedDoc.org_id,
        'pdf', // Default to PDF format
        parameters
      );

      // Download and store the document
      const storedDocument = await digiLockerActions.downloadDocument(
        digiLockerState.request.id,
        documentResponse.file_url,
        verificationId,
        documentType
      );

      // Add to BGV verification
      await bgvActions.uploadDocument(
        verificationId,
        new File([new Blob()], storedDocument.file_name, { type: 'application/pdf' }),
        documentType,
        `Fetched from DigiLocker: ${selectedDoc.description}`,
        true // Skip validation since DigiLocker docs are pre-verified
      );

      onDocumentFetched?.(storedDocument);
      
    } catch (error) {
      console.error('Failed to fetch document:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch document');
    } finally {
      setIsFetching(false);
    }
  };

  const handleFetchAadhaar = async () => {
    if (!digiLockerState.request) {
      setError('Please connect to DigiLocker first');
      return;
    }

    try {
      setIsFetching(true);
      setError(null);

      const aadhaarData = await digiLockerActions.fetchAadhaarData(digiLockerState.request.id);
      
      // You can process Aadhaar data here (e.g., extract address, auto-fill forms)
      console.log('Aadhaar data fetched:', aadhaarData);
      
    } catch (error) {
      console.error('Failed to fetch Aadhaar data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch Aadhaar data');
    } finally {
      setIsFetching(false);
    }
  };

  const parameterRequirements = selectedDoc ? getParameterRequirements(selectedDoc.doc_type) : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Fetch from DigiLocker</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!digiLockerState.isConnected ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <div>
              <div className="font-medium">Not Connected to DigiLocker</div>
              <div className="text-sm text-gray-600">
                Please connect to your DigiLocker account first to fetch documents.
              </div>
            </div>
          </Alert>
        ) : (
          <div className="space-y-4">
            {/* Document Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="document-type">Select Document Type</Label>
              <Select onValueChange={(value) => {
                const doc = availableDocuments.find(d => d.doc_type === value);
                setSelectedDoc(doc || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a document type" />
                </SelectTrigger>
                <SelectContent>
                  {availableDocuments.map((doc) => (
                    <SelectItem key={doc.doc_type} value={doc.doc_type}>
                      {doc.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Parameter Input */}
            {selectedDoc && parameterRequirements.length > 0 && (
              <div className="space-y-3">
                <Label>Required Information</Label>
                {parameterRequirements.map((req) => (
                  <div key={req.name} className="space-y-1">
                    <Label htmlFor={req.name}>
                      {req.label}
                      {req.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      id={req.name}
                      placeholder={req.placeholder}
                      value={parameters.find(p => p.name === req.name)?.value || ''}
                      onChange={(e) => handleParameterChange(req.name, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Aadhaar Quick Fetch */}
            {documentType === 'identity' && (
              <div className="border rounded-lg p-3 bg-blue-50">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Quick Aadhaar Fetch</span>
                </div>
                <p className="text-xs text-blue-700 mb-3">
                  Fetch your Aadhaar data directly without requiring any parameters.
                  This can help auto-fill your profile information.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFetchAadhaar}
                  disabled={isFetching}
                  className="w-full"
                >
                  {isFetching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Fetching Aadhaar...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Fetch Aadhaar Data
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Fetch Button */}
            <Button
              onClick={handleFetchDocument}
              disabled={!selectedDoc || isFetching || !digiLockerState.isConnected}
              className="w-full"
            >
              {isFetching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Fetching Document...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Fetch Document
                </>
              )}
            </Button>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <div>
                  <div className="font-medium">Error</div>
                  <div className="text-sm">{error}</div>
                </div>
              </Alert>
            )}

            {/* Success Message */}
            {digiLockerState.fetchedDocuments.length > 0 && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="text-green-800">
                  <div className="font-medium">Documents Fetched Successfully</div>
                  <div className="text-sm text-green-700">
                    {digiLockerState.fetchedDocuments.length} document(s) fetched from DigiLocker
                  </div>
                </div>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
