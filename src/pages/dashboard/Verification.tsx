import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Shield, Wifi, WifiOff, Info, FileText, Download, Landmark, Briefcase, Camera, Trash2 } from 'lucide-react';
import { VerificationHeader } from '@/components/verification/VerificationHeader';
import { StepSidebar } from '@/components/verification/StepSidebar';
import { IdentityStep } from '@/components/verification/steps/IdentityStep';
import { AddressStep } from '@/components/verification/steps/AddressStep';
import { EducationStep } from '@/components/verification/steps/EducationStep';
import { EmploymentStep } from '@/components/verification/steps/EmploymentStep';
import { FinancialStep } from '@/components/verification/steps/FinancialStep';
import { PhotoStep } from '@/components/verification/steps/PhotoStep';
import { BackgroundCheckStep } from '@/components/verification/steps/BackgroundCheckStep';
import { AdditionalDocsStep } from '@/components/verification/steps/AdditionalDocsStep';
import { ReviewStep } from '@/components/verification/steps/ReviewStep';
import { STEPS, initialState, type VerificationState, type UploadedFile, type EducationEntry, type EmploymentEntry, type AdditionalDoc } from '@/types/verification';
import { useBGV } from '../../contexts/BGVContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useDigiLocker, DigiLockerProvider } from '../../contexts/DigiLockerContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { DigiLockerConnect } from '../../components/digilocker/DigiLockerConnect';
import { DigiLockerDocumentFetcher } from '../../components/digilocker/DigiLockerDocumentFetcher';

interface VerificationProps {
  candidateId: number;
  candidateName?: string;
}

const VerificationInner: React.FC<VerificationProps> = ({ candidateId, candidateName }) => {
  const { state: bgvState, actions } = useBGV();
  const { state: digiLockerState } = useDigiLocker();
  const { setCollapsed } = useSidebar();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Local state mirroring the structure required by the step components
  const [localState, setLocalState] = useState<VerificationState>(initialState);
  const step = localState.currentStep;
  const [isEditing, setIsEditing] = useState(false);

  // Employment metadata form state
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
  const [activeUploadFile, setActiveUploadFile] = useState<{ file: File; documentType: string; entryId?: string } | null>(null);

  // Live HR email verification status from backend
  const [hrStatus, setHrStatus] = useState<any>(null);

  // Sync candidate verification details from BGVContext on mount and state changes
  useEffect(() => {
    if (candidateId) {
      actions.getCandidateStatus(candidateId);
    }
  }, [candidateId]);

  // Fetch HR email status if verification has been submitted
  useEffect(() => {
    const fetchHRStatus = async () => {
      if (bgvState.verification && bgvState.verification.status !== 'pending') {
        try {
          const res = await actions.getHRVerificationStatus(bgvState.verification.id);
          setHrStatus(res);
        } catch (err) {
          console.error("Failed to fetch HR status:", err);
        }
      }
    };
    fetchHRStatus();
  }, [bgvState.verification?.id, bgvState.verification?.status]);

  // Scroll to top on step change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  // Map server-side documents & references to the local state expected by step components
  useEffect(() => {
    if (!bgvState.verification) return;

    const docs = bgvState.documents;
    const refs = bgvState.references;

    const mapDoc = (type: string, descriptionMatch?: string): UploadedFile | undefined => {
      const doc = docs.find(d => {
        if (d.document_type !== type) return false;
        if (descriptionMatch && d.description) {
          return d.description.toLowerCase().includes(descriptionMatch.toLowerCase());
        }
        return true;
      });

      if (!doc) return undefined;
      return {
        id: doc.id.toString(),
        name: doc.file_name,
        size: doc.file_size,
        type: 'application/octet-stream',
        validation_score: doc.validation_score,
        validation_status: doc.validation_status === 'processing'
          ? 'pending'
          : doc.validation_status === 'approved'
            ? 'verified'
            : doc.validation_status === 'rejected'
              ? 'rejected'
              : 'pending',
        validation_details: doc.validation_details,
        analysis_method: 'openai_analysis'
      };
    };

    // Identity docs mapping
    const identity = {
      aadhaar: mapDoc('aadhaar'),
      pan: mapDoc('pan'),
      passport: mapDoc('passport'),
      voterId: mapDoc('voter_id'),
      drivingLicence: mapDoc('driving_licence'),
    };

    // Address proof
    const addressProof = mapDoc('address_proof');

    // Education entries mapping
    const education = localState.education.map(entry => {
      const doc = mapDoc('education_certificate', entry.level);
      return doc ? { ...entry, document: doc } : entry;
    });

    // Employment entries mapping
    const employment = localState.employment.map(entry => {
      const companyKey = entry.company || '';
      return {
        ...entry,
        offerLetter: mapDoc('offer_letter', companyKey) || entry.offerLetter,
        experienceLetter: mapDoc('experience_letter', companyKey) || entry.experienceLetter,
        payslip: mapDoc('payslip', companyKey) || mapDoc('salary_slip', companyKey) || entry.payslip,
      };
    });

    // Fallback: If company name wasn't entered yet, map general uploads to the first slot
    const firstEmp = employment[0];
    if (firstEmp && !firstEmp.company) {
      const generalOffer = docs.find(d => d.document_type === 'offer_letter');
      if (generalOffer && !firstEmp.offerLetter) {
        firstEmp.offerLetter = {
          id: generalOffer.id.toString(),
          name: generalOffer.file_name,
          size: generalOffer.file_size,
          type: 'application/octet-stream',
          validation_score: generalOffer.validation_score,
          validation_status: generalOffer.validation_status === 'approved' ? 'verified' : 'pending'
        };
        if (generalOffer.description && generalOffer.description.includes(' - ')) {
          firstEmp.company = generalOffer.description.split(' - ')[1] || '';
        }
      }
      const generalExp = docs.find(d => d.document_type === 'experience_letter');
      if (generalExp && !firstEmp.experienceLetter) {
        firstEmp.experienceLetter = {
          id: generalExp.id.toString(),
          name: generalExp.file_name,
          size: generalExp.file_size,
          type: 'application/octet-stream',
          validation_score: generalExp.validation_score,
          validation_status: generalExp.validation_status === 'approved' ? 'verified' : 'pending'
        };
        if (!firstEmp.company && generalExp.description && generalExp.description.includes(' - ')) {
          firstEmp.company = generalExp.description.split(' - ')[1] || '';
        }
      }
    }

    // Financial mapping
    const financial = {
      bankStatement: mapDoc('bank_statement'),
      salarySlip: mapDoc('salary_slip'),
      taxReturn: mapDoc('tax_return'),
    };

    // Photo mapping
    const photo = {
      photo: mapDoc('photo'),
    };

    // References list mapping
    const references = refs.map(r => ({
      id: r.id.toString(),
      name: r.reference_name,
      email: r.reference_email,
      phone: r.reference_phone || '',
      relationship: r.relationship,
      company: r.company || '',
    }));

    // Additional Docs mapping
    // Map files whose description matches the doc labels
    const additionalDocs = localState.additionalDocs.map(doc => {
      const mapped = mapDoc('other', doc.label);
      return mapped ? { ...doc, file: mapped } : doc;
    });

    setLocalState(prev => ({
      ...prev,
      identity,
      address: { ...prev.address, addressProof },
      education,
      employment,
      financial,
      photo,
      backgroundCheck: {
        ...prev.backgroundCheck,
        references: references.length > 0 ? references : prev.backgroundCheck.references,
        consentGiven: bgvState.verification?.consent_given ?? prev.backgroundCheck.consentGiven,
        noCriminalRecord: bgvState.verification?.no_criminal_record ?? prev.backgroundCheck.noCriminalRecord,
      },
      additionalDocs,
    }));
  }, [bgvState.documents, bgvState.references, bgvState.verification]);

  const update = useCallback(<K extends keyof VerificationState>(key: K, value: VerificationState[K]) => {
    updateState({ [key]: value });
  }, []);

  const updateState = useCallback((updates: Partial<VerificationState>) => {
    setLocalState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleStartVerification = async (types: string[] = ['identity', 'address', 'education', 'employment', 'financial', 'criminal', 'reference']) => {
    try {
      await actions.startVerification(candidateId, types, "Initiated via candidate portal wizard");
      await actions.getCandidateStatus(candidateId);
      setCollapsed(true);
    } catch (error) {
      console.error('Failed to start verification:', error);
    }
  };

  const handleUploadDocument = async (file: File, docType: string, entryId?: string) => {
    if (!bgvState.verification) return;

    const EMPLOYMENT_DOC_TYPES = ['experience_letter', 'offer_letter', 'relieving_letter', 'employment_certificate', 'salary_slip'];
    if (EMPLOYMENT_DOC_TYPES.includes(docType)) {
      setActiveUploadFile({ file, documentType: docType, entryId });
      if (entryId) {
        const entry = localState.employment.find(e => e.id === entryId);
        if (entry) {
          setEmploymentForm({
            company_declared: entry.company,
            designation_declared: entry.designation,
            joining_date_declared: entry.fromDate ? `${entry.fromDate}-01` : '',
            leaving_date_declared: entry.toDate ? `${entry.toDate}-01` : '',
            is_current_employer: !entry.toDate,
            hr_email: '',
            manager_name: '',
          });
        }
      }
      setShowEmploymentModal(true);
    } else {
      try {
        let description = `Uploaded ${docType}`;
        if (docType === 'education_certificate' && entryId) {
          const entry = localState.education.find(e => e.id === entryId);
          if (entry) description = `${entry.level} - ${entry.institution}`;
        } else if (docType === 'other' && entryId) {
          const entry = localState.additionalDocs.find(e => e.id === entryId);
          if (entry) description = entry.label;
        }
        await actions.uploadDocument(bgvState.verification.id, file, docType, description);
        await actions.getCandidateStatus(candidateId);
      } catch (err) {
        console.error("Document upload error:", err);
      }
    }
  };

  const handleEmploymentSubmit = async () => {
    if (!activeUploadFile || !bgvState.verification) return;
    
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
        bgvState.verification.id,
        activeUploadFile.file,
        activeUploadFile.documentType,
        `Uploaded ${activeUploadFile.documentType} - ${employmentForm.company_declared}`,
        true, // skip validation
        metadata
      );
      
      // Update local text fields if mapped to an entry
      if (activeUploadFile.entryId) {
        const updatedEmployment = localState.employment.map(e => 
          e.id === activeUploadFile.entryId 
            ? { 
                ...e, 
                company: employmentForm.company_declared, 
                designation: employmentForm.designation_declared,
                fromDate: employmentForm.joining_date_declared.substring(0, 7),
                toDate: employmentForm.leaving_date_declared.substring(0, 7),
              }
            : e
        );
        updateState({ employment: updatedEmployment });
      }

      await actions.getCandidateStatus(candidateId);
      setActiveUploadFile(null);
    } catch (error) {
      console.error('Employment upload error:', error);
    }
  };

  const handleDeleteDocument = async (docType: string, entryId?: string) => {
    let doc = null;
    if (docType === 'education_certificate' && entryId) {
      const entry = localState.education.find(e => e.id === entryId);
      const level = entry?.level || '';
      doc = bgvState.documents.find(d => d.document_type === docType && (d.description || '').includes(level));
    } else if (['offer_letter', 'experience_letter', 'payslip'].includes(docType) && entryId) {
      const entry = localState.employment.find(e => e.id === entryId);
      const company = entry?.company || '';
      doc = bgvState.documents.find(d => d.document_type === docType && (d.description || '').toLowerCase().includes(company.toLowerCase()));
    } else if (docType === 'other' && entryId) {
      const entry = localState.additionalDocs.find(e => e.id === entryId);
      const label = entry?.label || '';
      doc = bgvState.documents.find(d => d.document_type === docType && (d.description || '') === label);
    } else {
      doc = bgvState.documents.find(d => d.document_type === docType);
    }

    if (doc) {
      try {
        await actions.deleteDocument(doc.id);
        await actions.getCandidateStatus(candidateId);
      } catch (err) {
        console.error("Delete document error:", err);
      }
    }
  };

  const handleRemoveReference = async (id: string) => {
    if (!isNaN(Number(id))) {
      try {
        await actions.deleteReference(Number(id));
        await actions.getCandidateStatus(candidateId);
      } catch (err) {
        console.error("Remove reference error:", err);
      }
    } else {
      // Clean local unsynced item
      const updated = localState.backgroundCheck.references.filter(r => r.id !== id);
      updateState({
        backgroundCheck: {
          ...localState.backgroundCheck,
          references: updated.length > 0 ? updated : [{ id: Date.now().toString(), name: '', email: '', phone: '', relationship: '', company: '' }]
        }
      });
    }
  };

  const syncReferencesOnNavigate = async () => {
    if (!bgvState.verification) return;
    
    const localRefs = localState.backgroundCheck.references.filter(
      r => r.name && r.email && r.phone && isNaN(Number(r.id))
    );

    if (localRefs.length > 0) {
      for (const ref of localRefs) {
        try {
          await actions.addReference(bgvState.verification.id, {
            reference_name: ref.name,
            reference_email: ref.email,
            reference_phone: ref.phone,
            relationship: ref.relationship,
            company: ref.company,
          });
        } catch (err) {
          console.error("Failed to sync reference:", err);
        }
      }
      await actions.getCandidateStatus(candidateId);
    }
  };

  const goTo = async (s: number) => {
    if (step === 6) {
      await syncReferencesOnNavigate();
    }
    updateState({ currentStep: s });
  };

  const handleSubmitVerification = async () => {
    if (!bgvState.verification) return;
    try {
      await actions.submitVerification(bgvState.verification.id, candidateName || 'Candidate');
      await actions.getCandidateStatus(candidateId);
    } catch (error) {
      console.error('Failed to submit verification:', error);
    }
  };

  const completedSteps = useMemo(() => {
    const set = new Set<number>();
    if (localState.identity.aadhaar || localState.identity.pan) set.add(0);
    if (localState.address.currentAddress && localState.address.addressProof) set.add(1);
    if (localState.education.some((e) => e.institution && e.document)) set.add(2);
    if (localState.employment.some((e) => e.company && (e.offerLetter || e.experienceLetter))) set.add(3);
    if (localState.financial.bankStatement || localState.financial.salarySlip) set.add(4);
    if (localState.photo.photo) set.add(5);
    if (localState.backgroundCheck.references.some((r) => r.name && r.email)) set.add(6);
    if (localState.additionalDocs.some((doc) => doc.file && doc.label)) set.add(7);
    if (set.size >= 8) set.add(8);
    return set;
  }, [localState]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isSubmitted = bgvState.verification && bgvState.verification.status !== 'pending' && !isEditing;

  const renderStep = () => {
    switch (step) {
      case 0: return <IdentityStep data={localState.identity} onChange={(d) => update('identity', d)} onUploadDocument={handleUploadDocument} onDeleteDocument={handleDeleteDocument} />;
      case 1: return <AddressStep data={localState.address} onChange={(d) => update('address', d)} onUploadDocument={handleUploadDocument} onDeleteDocument={handleDeleteDocument} />;
      case 2: return <EducationStep data={localState.education} onChange={(d) => update('education', d)} onUploadDocument={handleUploadDocument} onDeleteDocument={handleDeleteDocument} />;
      case 3: return <EmploymentStep data={localState.employment} onChange={(d) => update('employment', d)} onUploadDocument={handleUploadDocument} onDeleteDocument={handleDeleteDocument} />;
      case 4: return <FinancialStep data={localState.financial} onChange={(d) => update('financial', d)} onUploadDocument={handleUploadDocument} onDeleteDocument={handleDeleteDocument} />;
      case 5: return <PhotoStep data={localState.photo} onChange={(d) => update('photo', d)} onUploadDocument={handleUploadDocument} onDeleteDocument={handleDeleteDocument} />;
      case 6: return <BackgroundCheckStep data={localState.backgroundCheck} onChange={(d) => update('backgroundCheck', d)} onRemoveReference={handleRemoveReference} />;
      case 7: return <AdditionalDocsStep data={localState.additionalDocs} onChange={(d) => update('additionalDocs', d)} onUploadDocument={handleUploadDocument} onDeleteDocument={handleDeleteDocument} />;
      case 8: return <ReviewStep state={localState} completedSteps={completedSteps} onGoToStep={goTo} />;
      default: return null;
    }
  };

  return (
    <div className="w-full -mt-6">
      {/* Start Verification Screen */}
      {!bgvState.verification && !isSubmitted && (
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Background Verification</CardTitle>
              <p className="text-muted-foreground">
                Complete your background verification process by providing the required documents and information.
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4 mb-6">
                <div className="text-left">
                  <h3 className="font-medium mb-2">What you'll need:</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Identity documents (Aadhaar, PAN, Passport)</li>
                    <li>• Address proof documents</li>
                    <li>• Education certificates</li>
                    <li>• Employment documents (HR contact emails)</li>
                    <li>• Professional references</li>
                    <li>• Recent photograph</li>
                  </ul>
                </div>
              </div>

              {/* DigiLocker Option - Prominent */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
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
                    onClick={() => handleStartVerification()}
                    disabled={bgvState.loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    <Wifi className="w-4 h-4 mr-2" />
                    Start with DigiLocker
                  </Button>
                </div>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500 font-semibold">OR</span>
                </div>
              </div>

              <Button 
                onClick={() => handleStartVerification()}
                size="lg"
                className="w-full sm:w-auto"
                disabled={bgvState.loading}
                variant="outline"
              >
                {bgvState.loading ? 'Starting...' : 'Start Verification (Manual)'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success / Live Verification Status Screen */}
      {isSubmitted && (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto p-4 md:p-8">
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">Verification in Progress</CardTitle>
              <p className="text-muted-foreground mt-2">
                Your background verification details have been submitted. Our automated checks and email confirmations are actively running.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {bgvState.verification && (
                <div className="bg-gray-50 rounded-lg p-6 border text-left">
                  <h3 className="font-semibold text-lg mb-4 text-gray-900 border-b pb-2">Verification Details:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <p><span className="text-muted-foreground font-medium">Verification ID:</span> #{bgvState.verification.id}</p>
                    <p>
                      <span className="text-muted-foreground font-medium">Overall Status:</span>{' '}
                      <Badge className={getStatusColor(bgvState.verification.status)}>
                        {bgvState.verification.status.toUpperCase()}
                      </Badge>
                    </p>
                    <p><span className="text-muted-foreground font-medium">Submitted on:</span> {new Date(bgvState.verification.initiated_at).toLocaleDateString()}</p>
                    <p><span className="text-muted-foreground font-medium">Initiated by:</span> Candidate</p>
                  </div>
                </div>
              )}

              {/* Employer HR Status Block */}
              {hrStatus && hrStatus.requests && hrStatus.requests.length > 0 && (
                <div className="space-y-4 text-left">
                  <h3 className="text-lg font-semibold text-gray-950 flex items-center gap-2 border-b pb-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Employer HR Confirmations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hrStatus.requests.map((req: any) => (
                      <div key={req.id || req.hr_email} className="border rounded-lg p-4 bg-white shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{req.company}</h4>
                            <p className="text-xs text-muted-foreground">{req.designation}</p>
                          </div>
                          <Badge className={
                            req.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            req.status === 'disputed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {req.status?.toUpperCase() || 'PENDING'}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1 mt-2 border-t pt-2">
                          <div><span>HR Contact:</span> <strong className="text-gray-700">{req.hr_email}</strong></div>
                          {req.manager_name && <div><span>Manager:</span> <strong className="text-gray-700">{req.manager_name}</strong></div>}
                          {req.response_date && <div><span>Response date:</span> <strong className="text-gray-700">{new Date(req.response_date).toLocaleDateString()}</strong></div>}
                          {req.notes && <div className="italic bg-gray-50 p-2 rounded mt-1 border">" {req.notes} "</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 justify-center pt-4">
                {bgvState.verification && bgvState.verification.status !== 'completed' && (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    Edit Details
                  </Button>
                )}
                <Button 
                  onClick={async () => {
                    await actions.getCandidateStatus(candidateId);
                    if (bgvState.verification) {
                      try {
                        const res = await actions.getHRVerificationStatus(bgvState.verification.id);
                        setHrStatus(res);
                      } catch(e) {}
                    }
                  }}
                  variant="outline"
                  disabled={bgvState.loading}
                >
                  Refresh Live Status
                </Button>
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  variant="secondary"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Verification Wizard Form */}
      {bgvState.verification && !isSubmitted && (
        <>
          {/* Draft Notification Banner */}
          <Card className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-sm">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 sm:mt-0 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900 text-sm">
                    {bgvState.verification.status === 'pending' ? 'Draft Mode - Uploads are immediate' : 'Editing Mode - Verification Submitted'}
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    {bgvState.verification.status === 'pending' 
                      ? 'Your files will upload and validate as you navigate steps. When complete, click Submit Verification on the last step to trigger HR validation emails.' 
                      : 'You are editing an already submitted verification. Once you are done making changes, click Submit Verification again to finalize.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-stretch sm:self-center">
                {bgvState.verification.status !== 'pending' && (
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    size="sm"
                    className="border-amber-300 text-amber-950 hover:bg-amber-100"
                  >
                    View Status
                  </Button>
                )}
                {completedSteps.has(8) && (
                  <Button
                    onClick={async () => {
                      await handleSubmitVerification();
                      setIsEditing(false);
                    }}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs whitespace-nowrap"
                  >
                    Submit Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {bgvState.error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{bgvState.error}</AlertDescription>
            </Alert>
          )}

          {/* DigiLocker Section on Step 0 or 1 */}
          {(step === 0 || step === 1) && (
            <Card className="mb-6 border-blue-200 bg-blue-50/30">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Wifi className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm">DigiLocker Verification</h4>
                    <p className="text-xs text-blue-700">Connect to fetch secure government-issued identity and address credentials.</p>
                  </div>
                </div>
                <DigiLockerConnect
                  verificationId={bgvState.verification.id}
                  candidateId={candidateId}
                  onConnected={(details) => console.log('DigiLocker connected', details)}
                  onDocumentFetched={() => actions.getCandidateStatus(candidateId)}
                />
                {digiLockerState.isConnected && (
                  <DigiLockerDocumentFetcher
                    verificationId={bgvState.verification.id}
                    candidateId={candidateId}
                    documentType={step === 0 ? 'identity' : 'address'}
                    onDocumentFetched={() => actions.getCandidateStatus(candidateId)}
                  />
                )}
              </CardContent>
            </Card>
          )}

          <VerificationHeader completedSteps={completedSteps} />

          <div className="flex gap-6 mt-6">
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-6">
                <StepSidebar currentStep={step} completedSteps={completedSteps} onStepClick={goTo} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-xl border p-4 md:p-6 shadow-sm min-h-[400px]">
                {renderStep()}
              </div>

              {/* Navigation Bar */}
              <div className="flex items-center justify-between border border-t-0 border-border bg-card rounded-b-xl px-4 py-3 sm:px-6">
                <Button variant="outline" size="sm" disabled={step === 0} onClick={() => goTo(step - 1)} className="gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                
                <span className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length}</span>

                {step === STEPS.length - 1 ? (
                  <Button 
                    size="sm" 
                    onClick={handleSubmitVerification}
                    disabled={bgvState.loading || completedSteps.size < STEPS.length}
                    className="bg-green-600 hover:bg-green-700 text-white gap-1 font-semibold"
                  >
                    {bgvState.loading ? 'Submitting...' : 'Submit Verification'}
                    {bgvState.loading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={() => goTo(step + 1)} 
                    className="bg-primary text-primary-foreground gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Employment Metadata Collection Modal */}
      {showEmploymentModal && activeUploadFile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 border-b pb-3">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">
                Employment Details Required
              </h3>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              We require details about this employer to send automated confirmation requests to their HR contact.
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

              <div className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  id="is_current_employer"
                  checked={employmentForm.is_current_employer}
                  onChange={(e) => setEmploymentForm({...employmentForm, is_current_employer: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="is_current_employer" className="text-xs font-medium text-gray-700">
                  This is my current employer
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase">HR Contact Email *</label>
                <input
                  type="email"
                  placeholder="hr@company.com"
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

            <div className="flex space-x-2 pt-3 border-t">
              <Button onClick={handleEmploymentSubmit} className="flex-1 bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm">
                Upload & Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEmploymentModal(false);
                  setActiveUploadFile(null);
                }}
                className="flex-1 text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Verification: React.FC<VerificationProps> = ({ candidateId, candidateName }) => {
  return (
    <DigiLockerProvider>
      <VerificationInner candidateId={candidateId} candidateName={candidateName} />
    </DigiLockerProvider>
  );
};

export default Verification;
