import React, { useState, useEffect } from 'react';
import { useBGV } from '../../contexts/BGVContext';
import { useDigiLocker, DigiLockerProvider } from '../../contexts/DigiLockerContext';
import { bgvApi } from '../../services/bgv-api';
import { ValidatedFileUpload } from '../../components/ui/ValidatedFileUpload';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Alert } from '../../components/ui/alert';
import { Progress } from '../../components/ui/progress';
import { FileValidationResult } from '../../components/ui/FileValidationResult';
import { DigiLockerConnect } from '../../components/digilocker/DigiLockerConnect';
import { DigiLockerDocumentFetcher } from '../../components/digilocker/DigiLockerDocumentFetcher';
import { CheckCircle, AlertCircle, Wifi, WifiOff, Info, FileText, Download } from 'lucide-react';
import { ValidationResult } from '../../services/fileValidation';
import { fileValidationService } from '../../services/fileValidation';

// Type for combined documents (uploaded + pending)
interface CombinedDocument {
  id: number | string;
  verification_id: number;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size: number;
  validation_score?: number;
  validation_status?: 'pending' | 'processing' | 'approved' | 'rejected' | string;
  validation_details?: any;
  description?: string;
  uploaded_at?: string;
  created_at: string;
  updated_at: string;
  is_pending?: boolean;
}

interface BGVVerificationProps {
  candidateId: number;
  candidateName?: string;
}

export const BGVVerification: React.FC<BGVVerificationProps> = ({ candidateId, candidateName }) => {
  return (
    <DigiLockerProvider>
      <BGVVerificationInner candidateId={candidateId} candidateName={candidateName} />
    </DigiLockerProvider>
  );
};

const BGVVerificationInner: React.FC<BGVVerificationProps> = ({ candidateId, candidateName }) => {
  const { state, actions } = useBGV();
  const { state: digiLockerState } = useDigiLocker();
  const [employmentForm, setEmploymentForm] = useState({
    company_declared: '',
    designation_declared: '',
    joining_date_declared: '',
    leaving_date_declared: '',
    is_current_employer: false,
    hr_email: '',
    manager_name: '',
  });
  const [showEmploymentModal, setShowEmploymentModal] = useState(false);
  const [activeUploadFile, setActiveUploadFile] = useState<{ file: File; documentType: string } | null>(null);
  const [hrStatus, setHrStatus] = useState<any>(null);

  const [selectedVerificationTypes, setSelectedVerificationTypes] = useState<string[]>([]);
  const [referenceForm, setReferenceForm] = useState({
    reference_name: '',
    reference_email: '',
    reference_phone: '',
    relationship: '',
    company: '',
    position: '',
    is_current: false,
  });
  const [showReferenceForm, setShowReferenceForm] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Validation states
  const [pendingValidation, setPendingValidation] = useState<ValidationResult | null>(null);
  const [validatingFile, setValidatingFile] = useState<{ file: File; documentType: string } | null>(null);

  const verificationTypes = [
    { id: 'identity', label: 'Identity Verification', description: 'Government ID verification' },
    { id: 'address', label: 'Address Verification', description: 'Current and permanent address' },
    { id: 'education', label: 'Education Verification', description: 'Degree and institution verification' },
    { id: 'employment', label: 'Employment Verification', description: 'Previous employment history' },
    { id: 'criminal', label: 'Criminal Background Check', description: 'Criminal record verification' },
    { id: 'reference', label: 'Reference Check', description: 'Professional reference verification' },
  ];

  const documentTypes = [
    { 
      id: 'identity', 
      label: 'Identity Document', 
      required: true,
      accept: '.pdf,.jpg,.jpeg,.png',
      maxSize: 5 * 1024 * 1024 // 5MB
    },
    { 
      id: 'address_proof', 
      label: 'Address Proof', 
      required: false,
      accept: '.pdf,.jpg,.jpeg,.png',
      maxSize: 3 * 1024 * 1024 // 3MB
    },
    { 
      id: 'education_certificate', 
      label: 'Education Certificate', 
      required: false,
      accept: '.pdf,.jpg,.jpeg,.png',
      maxSize: 5 * 1024 * 1024 // 5MB
    },
    { 
      id: 'offer_letter', 
      label: 'Offer Letter', 
      required: false,
      accept: '.pdf,.jpg,.jpeg,.png',
      maxSize: 3 * 1024 * 1024 // 3MB
    },
    { 
      id: 'experience_letter', 
      label: 'Experience Letter', 
      required: false,
      accept: '.pdf,.jpg,.jpeg,.png',
      maxSize: 3 * 1024 * 1024 // 3MB
    },
    { 
      id: 'salary_slip', 
      label: 'Salary Slip', 
      required: false,
      accept: '.pdf,.jpg,.jpeg,.png',
      maxSize: 2 * 1024 * 1024 // 2MB
    },
  ];

  const handleSyncPendingUploads = async () => {
    const result = await actions.syncPendingUploads();
    if (result.successful > 0) {
      alert(`Successfully synced ${result.successful} files`);
    }
    if (result.failed > 0) {
      alert(`Failed to sync ${result.failed} files`);
    }
  };

  // Check for pending uploads
  const getPendingUploads = () => {
    try {
      const pending = JSON.parse(localStorage.getItem('bgv_pending_uploads') || '[]');
      return pending.filter((doc: any) => doc.is_pending && doc.verification_id === state.verification?.id);
    } catch {
      return [];
    }
  };

  // Combine uploaded docs and pending docs for display
  const getAllDocuments = (): CombinedDocument[] => {
    console.log('State documents:', state.documents);
    console.log('Pending uploads:', pendingUploads);
    
    const allDocs: CombinedDocument[] = [...state.documents];
    
    // Add pending docs that aren't already in the uploaded docs
    pendingUploads.forEach((pendingDoc: any) => {
      const exists = allDocs.find(doc => doc.document_type === pendingDoc.document_type);
      console.log(`Checking pending doc ${pendingDoc.document_type}: exists=${!!exists}`);
      if (!exists) {
        const combinedDoc = {
          ...pendingDoc,
          validation_status: 'pending',
          file_url: pendingDoc.file_data,
          file_name: pendingDoc.file_name,
          file_size: pendingDoc.file_size,
          is_pending: true
        } as CombinedDocument;
        console.log('Adding combined doc:', combinedDoc);
        allDocs.push(combinedDoc);
      }
    });
    
    console.log('Final all docs:', allDocs);
    return allDocs;
  };

  const pendingUploads = getPendingUploads();

  useEffect(() => {
    if (candidateId) {
      actions.getCandidateStatus(candidateId);
    }
  }, [candidateId]);

  useEffect(() => {
    const fetchHRStatus = async () => {
      if (state.verification && state.verification.status !== 'pending') {
        try {
          const res = await actions.getHRVerificationStatus(state.verification.id);
          setHrStatus(res);
        } catch (err) {
          console.error("Failed to fetch HR status:", err);
        }
      }
    };
    fetchHRStatus();
  }, [state.verification?.id, state.verification?.status]);

  // Refresh component when pending uploads change
  useEffect(() => {
    // This will trigger re-render when pending uploads are added/removed
    console.log('Pending uploads changed, refreshing...');
  }, [pendingUploads.length]);

  // Force refresh when state changes
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [state.documents, state.error]);

  const handleStartVerification = async () => {
    if (selectedVerificationTypes.length === 0) {
      alert('Please select at least one verification type');
      return;
    }

    await actions.startVerification(candidateId, selectedVerificationTypes, notes);
    setSelectedVerificationTypes([]);
    setNotes('');
  };

  const handleDocumentUpload = async (file: File, documentType: string) => {
    if (!state.verification) {
      alert('Please start verification first');
      return;
    }

    try {
      // First validate the file
      setValidatingFile({ file, documentType });
      const validation = await actions.validateDocument(file, documentType);
      
      console.log('Validation results:', validation);
      
      if (!validation.isValid) {
        console.log('Validation failed, showing errors:', validation.errors);
        // Show validation results for invalid files
        setPendingValidation(validation);
        return;
      }
      
      // Show warnings if any but proceed
      if (validation.warnings.length > 0) {
        const proceedWithWarnings = confirm(
          `File has warnings:\n${validation.warnings.join('\n')}\n\nProceed anyway?`
        );
        if (!proceedWithWarnings) {
          return;
        }
      }
      
      const EMPLOYMENT_DOC_TYPES = ['experience_letter', 'offer_letter', 'relieving_letter', 'employment_certificate', 'salary_slip'];
      if (EMPLOYMENT_DOC_TYPES.includes(documentType)) {
        setActiveUploadFile({ file, documentType });
        setShowEmploymentModal(true);
      } else {
        console.log('Validation passed, uploading file...');
        // Upload the file
        await actions.uploadDocument(
          state.verification.id,
          file,
          documentType,
          `Uploaded ${documentType} document`
        );
        console.log('File uploaded successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setValidatingFile(null);
    }
  };

  const handleEmploymentSubmit = async () => {
    if (!activeUploadFile || !state.verification) return;
    
    if (!employmentForm.company_declared) {
      alert('Company Name is required');
      return;
    }
    if (!employmentForm.designation_declared) {
      alert('Designation is required');
      return;
    }
    if (!employmentForm.hr_email) {
      alert('HR Email is required for verification');
      return;
    }

    try {
      setValidatingFile(activeUploadFile);
      setShowEmploymentModal(false);
      
      const metadata = {
        company_declared: employmentForm.company_declared,
        designation_declared: employmentForm.designation_declared,
        joining_date_declared: employmentForm.joining_date_declared || null,
        leaving_date_declared: employmentForm.leaving_date_declared || null,
        is_current_employer: employmentForm.is_current_employer,
        hr_email: employmentForm.hr_email,
        manager_name: employmentForm.manager_name || null,
      };

      await actions.uploadDocument(
        state.verification.id,
        activeUploadFile.file,
        activeUploadFile.documentType,
        `Uploaded ${activeUploadFile.documentType} - ${employmentForm.company_declared}`,
        true, // skip validation
        metadata
      );

      // Reset Form
      setEmploymentForm({
        company_declared: '',
        designation_declared: '',
        joining_date_declared: '',
        leaving_date_declared: '',
        is_current_employer: false,
        hr_email: '',
        manager_name: '',
      });
      setActiveUploadFile(null);
    } catch (error) {
      console.error('Employment upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setValidatingFile(null);
    }
  };

  const handleValidationProceed = async () => {
    if (pendingValidation && validatingFile) {
      // Skip validation and upload anyway
      await actions.uploadDocument(
        state.verification!.id,
        validatingFile.file,
        validatingFile.documentType,
        `Uploaded ${validatingFile.documentType} document`
      );
      
      setPendingValidation(null);
      setValidatingFile(null);
    }
  };

  const handleValidationCancel = () => {
    setPendingValidation(null);
    setValidatingFile(null);
  };

  // Simple upload function for testing (bypasses validation)
  const handleSimpleUpload = async (file: File, documentType: string) => {
    console.log('Simple upload test - bypassing validation');
    
    if (!state.verification) {
      alert('Please start verification first');
      return;
    }

    try {
      setValidatingFile({ file, documentType });
      
      // Skip validation and go directly to upload
      await actions.uploadDocument(
        state.verification.id,
        file,
        documentType,
        `Test upload ${documentType} document`,
        true // skip validation
      );
      
      console.log('Simple upload completed');
      
    } catch (error) {
      console.error('Simple upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setValidatingFile(null);
    }
  };

  const getValidationRules = (documentType: string) => {
    const config = fileValidationService.getValidationRules(documentType);
    if (!config) return null;
    
    return {
      allowedTypes: config.allowedTypes.join(', '),
      maxSize: `${(config.maxSize / (1024 * 1024)).toFixed(1)}MB`,
      namePatterns: config.namePatterns.map(p => p.source).join(', '),
      expectedContent: config.expectedContent.join(', ')
    };
  };

  const handleAddReference = async () => {
    if (!state.verification) {
      alert('Please start verification first');
      return;
    }

    await actions.addReference(state.verification.id, referenceForm);
    setReferenceForm({
      reference_name: '',
      reference_email: '',
      reference_phone: '',
      relationship: '',
      company: '',
      position: '',
      is_current: false,
    });
    setShowReferenceForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = () => {
    if (!state.overallStatus) return 0;
    return state.overallStatus.completion_percentage;
  };

  if (state.loading && !state.verification) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Background Verification</h1>
        <p className="text-gray-600">Complete your background verification process</p>
        
        {state.overallStatus && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Overall Status</h3>
              <Badge className={getStatusColor(state.overallStatus.overall_status)}>
                {state.overallStatus.overall_status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Submit BGV Banner */}
      {state.verification && state.verification.status === 'pending' && (
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-amber-900 flex items-center">
                  📝 Verification Draft Mode
                </h3>
                <p className="text-sm text-amber-800">
                  You have uploaded draft documents. Please click **Submit Background Verification** below to finalise and trigger verification checks (including HR emails to your former employers).
                </p>
              </div>
              <Button
                onClick={async () => {
                  if (confirm("Are you sure you want to submit your background verification? This will send verification emails to the HR contacts you provided.")) {
                    try {
                      await actions.submitVerification(state.verification!.id, candidateName || "Candidate");
                      alert("Background verification submitted successfully!");
                    } catch (err) {
                      alert(`Submission failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
                    }
                  }
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-6 shadow-sm whitespace-nowrap self-start md:self-center"
              >
                Submit Verification
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employment Metadata Modal */}
      {showEmploymentModal && activeUploadFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl text-left">
            <h3 className="text-lg font-bold text-gray-900">
              💼 Employment Details for {activeUploadFile.documentType.replace('_', ' ').toUpperCase()}
            </h3>
            <p className="text-sm text-gray-500">
              Please enter details about your employment. This information will be used to send an automated verification request to the HR contact.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase">Company Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Google India"
                  value={employmentForm.company_declared}
                  onChange={(e) => setEmploymentForm({...employmentForm, company_declared: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase">Designation *</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer"
                  value={employmentForm.designation_declared}
                  onChange={(e) => setEmploymentForm({...employmentForm, designation_declared: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase">Joining Date</label>
                  <input
                    type="date"
                    value={employmentForm.joining_date_declared}
                    onChange={(e) => setEmploymentForm({...employmentForm, joining_date_declared: e.target.value})}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase">Leaving Date</label>
                  <input
                    type="date"
                    disabled={employmentForm.is_current_employer}
                    value={employmentForm.is_current_employer ? '' : employmentForm.leaving_date_declared}
                    onChange={(e) => setEmploymentForm({...employmentForm, leaving_date_declared: e.target.value})}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_current_employer"
                  checked={employmentForm.is_current_employer}
                  onChange={(e) => setEmploymentForm({...employmentForm, is_current_employer: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_current_employer" className="text-sm text-gray-700">
                  This is my current employer
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase">HR Contact Email *</label>
                <input
                  type="email"
                  placeholder="hr@company.com (for verification request)"
                  value={employmentForm.hr_email}
                  onChange={(e) => setEmploymentForm({...employmentForm, hr_email: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase">Reporting Manager Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={employmentForm.manager_name}
                  onChange={(e) => setEmploymentForm({...employmentForm, manager_name: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <Button onClick={handleEmploymentSubmit} className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
                Upload & Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEmploymentModal(false);
                  setActiveUploadFile(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {state.error && (
        <Alert variant="destructive">
          {state.error}
        </Alert>
      )}

      {/* Validation Result Modal */}
      {pendingValidation && validatingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <FileValidationResult
              validation={pendingValidation}
              documentType={validatingFile.documentType}
              onProceed={handleValidationProceed}
              onCancel={handleValidationCancel}
            />
          </div>
        </div>
      )}

      {/* Loading overlay for validation */}
      {validatingFile && !pendingValidation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700">Validating file...</p>
            <p className="text-sm text-gray-500 mt-2">{validatingFile.file.name}</p>
          </div>
        </div>
      )}

      {/* Start Verification Section */}
      {!state.verification && (
        <Card>
          <CardHeader>
            <CardTitle>Start Background Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Verification Types
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {verificationTypes.map((type) => (
                  <label
                    key={type.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedVerificationTypes.includes(type.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVerificationTypes([...selectedVerificationTypes, type.id]);
                        } else {
                          setSelectedVerificationTypes(selectedVerificationTypes.filter(t => t !== type.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-500">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* DigiLocker Option - Prominent */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Wifi className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    🚀 Quick Start with DigiLocker
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Connect your DigiLocker account to instantly fetch verified government documents. 
                    No manual uploads required for Aadhaar, PAN, Passport, and more.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      ✓ Instant Verification
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      ✓ 70+ Document Types
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                      ✓ Government Verified
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-3">
                <Button
                  onClick={() => {
                    // Start verification with DigiLocker enabled
                    setSelectedVerificationTypes(['identity', 'address', 'education', 'employment', 'financial']);
                    handleStartVerification();
                  }}
                  disabled={state.loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Wifi className="w-4 h-4 mr-2" />
                  Start with DigiLocker
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Scroll to learn more section
                    const element = document.querySelector('#digilocker-info');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Learn More
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional information or special requirements..."
              />
            </div>

            <Button
              onClick={handleStartVerification}
              disabled={state.loading || selectedVerificationTypes.length === 0}
              className="w-full"
            >
              {state.loading ? 'Starting...' : 'Start Verification'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* DigiLocker Information Section */}
      <Card id="digilocker-info">
        <CardHeader>
          <CardTitle>🔐 About DigiLocker Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📄 Available Documents</h3>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Identity Documents</div>
                    <div className="text-sm text-gray-600">Aadhaar Card, PAN Card, Passport, Driving License, Voter ID</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Address Proof</div>
                    <div className="text-sm text-gray-600">Aadhaar Address, Driving License Address, Passport Address</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Education Certificates</div>
                    <div className="text-sm text-gray-600">Mark Sheets, Degree Certificates, Diplomas</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Employment Documents</div>
                    <div className="text-sm text-gray-600">Offer Letters, Experience Certificates, Salary Slips</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🚀 Benefits</h3>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <div className="font-medium">70% Faster</div>
                    <div className="text-sm text-gray-600">Document collection and verification process</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div>
                    <div className="font-medium">40% Higher Accuracy</div>
                    <div className="text-sm text-gray-600">Government-verified documents reduce errors</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div>
                    <div className="font-medium">Zero Manual Uploads</div>
                    <div className="text-sm text-gray-600">Documents fetched directly from DigiLocker</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <div>
                    <div className="font-medium">Enhanced Security</div>
                    <div className="text-sm text-gray-600">Digital signatures and tamper-proof documents</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <div>
              <div className="font-medium">How It Works</div>
              <div className="text-sm text-gray-600 mt-1">
                1. Click "Start with DigiLocker" → 2. Connect your DigiLocker account → 3. Select documents to fetch → 4. Documents automatically added to your verification
              </div>
            </div>
          </Alert>
        </CardContent>
      </Card>

      {/* Verification Status */}
      {state.verification && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Documents Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Documents</span>
                {pendingUploads.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSyncPendingUploads}
                    disabled={state.loading}
                  >
                    <Wifi className="w-3 h-3 mr-1" />
                    Sync
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* DigiLocker Integration - Show even before verification starts */}
              <div className="space-y-4">
                <Alert>
                  <Wifi className="h-4 w-4" />
                  <div>
                    <div className="font-medium">DigiLocker Integration Available</div>
                    <div className="text-sm text-gray-600">
                      Connect your DigiLocker account to fetch verified government documents instantly.
                      {state.verification ? ' Documents will be automatically added to your verification.' : ' Start verification first to enable document fetching.'}
                    </div>
                  </div>
                </Alert>
                
                {state.verification ? (
                  <>
                    <DigiLockerConnect
                      verificationId={state.verification.id}
                      candidateId={candidateId}
                      onConnected={(userDetails) => {
                        console.log('DigiLocker connected:', userDetails);
                      }}
                      onDocumentFetched={(document) => {
                        console.log('Document fetched:', document);
                      }}
                    />
                    
                    {digiLockerState.isConnected && (
                      <DigiLockerDocumentFetcher
                        verificationId={state.verification.id}
                        candidateId={candidateId}
                        documentType="identity"
                        onDocumentFetched={(document) => {
                          console.log('Document fetched:', document);
                        }}
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Wifi className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Start Verification to Use DigiLocker</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Begin your background verification process to enable DigiLocker document fetching.
                    </p>
                    <Button
                      onClick={() => {
                        // Scroll to verification start section
                        const element = document.querySelector('[data-verification-start]');
                        element?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      variant="outline"
                    >
                      Start Verification
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Document Types */}
              {documentTypes.map((docType) => {
                const allDocs = getAllDocuments();
                const uploadedDoc = allDocs.find(doc => doc.document_type === docType.id);
                const isPending = uploadedDoc?.is_pending;
                const rules = getValidationRules(docType.id);
                
                return (
                  <div key={docType.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{docType.label}</h4>
                        {docType.required && (
                          <span className="text-xs text-red-600">Required</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {uploadedDoc && (
                          <Badge className={
                            isPending 
                              ? 'text-orange-600 border-orange-600 bg-orange-50' 
                              : getStatusColor(uploadedDoc.validation_status || 'pending')
                          }>
                            {isPending ? (
                              <>
                                <WifiOff className="w-3 h-3 mr-1" />
                                Saved Locally
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {uploadedDoc.validation_status || 'pending'}
                              </>
                            )}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Validation Rules */}
                    {rules && (
                      <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="flex items-center text-blue-800 text-sm font-medium mb-2">
                          <Info className="w-4 h-4 mr-1" />
                          Validation Requirements:
                        </div>
                        <div className="text-xs text-blue-700 space-y-1">
                          <div><strong>File Types:</strong> {rules.allowedTypes}</div>
                          <div><strong>Max Size:</strong> {rules.maxSize}</div>
                          <div><strong>Expected Names:</strong> {rules.namePatterns}</div>
                          <div><strong>Content:</strong> {rules.expectedContent}</div>
                        </div>
                      </div>
                    )}
                    
                    {uploadedDoc ? (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          <div>File: {uploadedDoc.file_name}</div>
                          <div>Size: {(uploadedDoc.file_size / 1024).toFixed(1)} KB</div>
                          {uploadedDoc.validation_score && (
                            <div>Validation Score: {uploadedDoc.validation_score}%</div>
                          )}
                          {isPending && (
                            <div className="flex items-center text-orange-600">
                              <WifiOff className="w-3 h-3 mr-1" />
                              Saved locally (will sync when connection is restored)
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {isPending && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleSyncPendingUploads}
                              disabled={state.loading}
                            >
                              <Wifi className="w-3 h-3 mr-1" />
                              Sync Now
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (isPending) {
                                // Remove from pending uploads
                                const pending = JSON.parse(localStorage.getItem('bgv_pending_uploads') || '[]');
                                const updated = pending.filter((p: any) => p.document_type !== docType.id);
                                localStorage.setItem('bgv_pending_uploads', JSON.stringify(updated));
                                window.location.reload();
                              } else {
                                // Only uploaded docs have numeric IDs
                                if (typeof uploadedDoc.id === 'number') {
                                  actions.deleteDocument(uploadedDoc.id);
                                }
                              }
                            }}
                            disabled={state.loading}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <ValidatedFileUpload
                          onFileSelect={(file) => handleDocumentUpload(file, docType.id)}
                          accept={docType.accept}
                          maxSize={docType.maxSize}
                          documentType={docType.id}
                          disabled={state.loading}
                        />
                        {/* Debug button to bypass validation */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            console.log('Debug: Testing simple upload without validation');
                            const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
                            handleSimpleUpload(testFile, docType.id);
                          }}
                          disabled={state.loading}
                        >
                          Debug Upload Test
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* References Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>References</CardTitle>
                <Button
                  onClick={() => setShowReferenceForm(!showReferenceForm)}
                  variant="outline"
                  size="sm"
                >
                  Add Reference
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showReferenceForm && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Reference Name"
                      value={referenceForm.reference_name}
                      onChange={(e) => setReferenceForm({...referenceForm, reference_name: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      placeholder="Reference Email"
                      value={referenceForm.reference_email}
                      onChange={(e) => setReferenceForm({...referenceForm, reference_email: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      placeholder="Reference Phone"
                      value={referenceForm.reference_phone}
                      onChange={(e) => setReferenceForm({...referenceForm, reference_phone: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Relationship"
                      value={referenceForm.relationship}
                      onChange={(e) => setReferenceForm({...referenceForm, relationship: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={referenceForm.company}
                      onChange={(e) => setReferenceForm({...referenceForm, company: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Position"
                      value={referenceForm.position}
                      onChange={(e) => setReferenceForm({...referenceForm, position: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_current"
                      checked={referenceForm.is_current}
                      onChange={(e) => setReferenceForm({...referenceForm, is_current: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="is_current" className="text-sm text-gray-700">
                      Current employer/supervisor
                    </label>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleAddReference} disabled={state.loading}>
                      Add Reference
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowReferenceForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {state.references.length === 0 && !showReferenceForm ? (
                <div className="text-center py-8 text-gray-500">
                  No references added yet. Click "Add Reference" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {state.references.map((reference) => (
                    <div key={reference.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{reference.name}</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Email: {reference.email}</div>
                            {reference.phone && (
                              <div>Phone: {reference.phone}</div>
                            )}
                            <div>Relationship: {reference.relationship}</div>
                            {reference.company && <div>Company: {reference.company}</div>}
                            {reference.designation && <div>Position: {reference.designation}</div>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className={getStatusColor(reference.status)}>
                            {reference.status}
                          </Badge>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => actions.deleteReference(reference.id)}
                            disabled={state.loading}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* HR Status Section */}
          {hrStatus && hrStatus.requests && hrStatus.requests.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Employer HR Verifications</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    Status: {hrStatus.employment_verification_status?.replace('_', ' ').toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hrStatus.requests.map((req: any) => (
                    <div key={req.id || req.hr_email} className="border rounded-lg p-4 space-y-2 bg-gray-50 text-left">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{req.company}</h4>
                          <p className="text-xs text-gray-500">{req.designation}</p>
                        </div>
                        <Badge className={
                          req.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          req.status === 'disputed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {req.status?.toUpperCase() || 'PENDING'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div><span className="text-gray-400">HR Email:</span> {req.hr_email}</div>
                        {req.manager_name && <div><span className="text-gray-400">Manager:</span> {req.manager_name}</div>}
                        {req.response_date && <div><span className="text-gray-400">Responded:</span> {new Date(req.response_date).toLocaleDateString()}</div>}
                        {req.notes && <div><span className="text-gray-400">Notes:</span> "{req.notes}"</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Refresh Button */}
      {state.verification && (
        <div className="flex justify-center">
          <Button
            onClick={actions.refreshData}
            disabled={state.loading}
            variant="outline"
          >
            {state.loading ? 'Refreshing...' : 'Refresh Status'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BGVVerification;
