import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Shield, Wifi, WifiOff, Info, FileText, Download, Landmark, Briefcase, Camera, Trash2, Loader2 } from 'lucide-react';
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
import { bgvApi } from '../../services/bgv-api';

interface PendingDocument {
  id: string;
  file: File;
  documentType: string;
  description: string;
  metadata?: any;
  analysisResult?: any;
}

interface VerificationProps {
  candidateId: number;
  candidateName?: string;
}

const VerificationInner: React.FC<VerificationProps> = ({ candidateId, candidateName }) => {
  const { state: bgvState, actions } = useBGV();
  const { state: digiLockerState, actions: digiLockerActions } = useDigiLocker();
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
  const handleCloseEmploymentModal = () => {
    setShowEmploymentModal(false);
    if (employmentUploadPromise) {
      employmentUploadPromise.resolve(false);
      setEmploymentUploadPromise(null);
    }
  };
  const [showEmploymentModal, setShowEmploymentModal] = useState(false);
  const [employmentUploadPromise, setEmploymentUploadPromise] = useState<{resolve: (val: boolean) => void} | null>(null);
  const [activeUploadFile, setActiveUploadFile] = useState<{ file: File; documentType: string; entryId?: string } | null>(null);

  // Live HR email verification status from backend
  const [hrStatus, setHrStatus] = useState<any>(null);

  // Upload progress tracking
  const [uploadingFile, setUploadingFile] = useState<{ name: string; docType: string } | null>(null);
  const [isSubmittingDocs, setIsSubmittingDocs] = useState<{ name: string; docType: string } | null>(null);

  // Pending documents kept in memory until Final Submit
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);

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
  }, [bgvState.verification]);

  // Scroll to top on step change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [step]);

  // Map server-side documents & references to the local state expected by step components
  useEffect(() => {
    if (!bgvState.verification) return;

    // Merge pending local documents with backend documents for UI display
    const pseudoDocs = pendingDocuments.map(p => {
      console.log('Mapping pseudoDoc:', p);
      return {
        id: p.id,
        document_type: p.documentType,
        description: p.description,
        file_name: p.file.name,
        file_size: p.file.size,
        validation_score: p.analysisResult?.ai_analysis?.score ?? p.analysisResult?.score,
        validation_status: p.analysisResult?.status || 'uploaded',
        validation_details: {
          ...(p.metadata || {}),
          ...(p.analysisResult?.ai_analysis?.validation_details || {}),
          ...(p.analysisResult?.ai_analysis?.required_fields_detected || {}),
          ...(p.analysisResult?.validation_details || {})
        },
      };
    });

    const docs = [...pseudoDocs, ...bgvState.documents];
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
      // Map backend validation_status to frontend status
      // 'uploaded' / 'pending' / 'processing' = still pending
      // 'approved' / 'verified' = verified
      // 'needs_review' = needs_review
      // 'rejected' = rejected
      // If there's a validation_score but no meaningful status, treat as verified
      const backendStatus = doc.validation_status;
      let frontendStatus: 'pending' | 'verified' | 'rejected' | 'needs_review' = 'pending';
      if (backendStatus === 'approved') frontendStatus = 'verified';
      else if (backendStatus === 'needs_review') frontendStatus = 'needs_review';
      else if (backendStatus === 'rejected') frontendStatus = 'rejected';
      else if (backendStatus === 'processing') frontendStatus = 'pending';
      else if (doc.validation_score !== undefined && doc.validation_score !== null) {
        // Has a score but status is 'uploaded' or similar — show it
        frontendStatus = doc.validation_score >= 80 ? 'verified' : doc.validation_score >= 50 ? 'needs_review' : 'rejected';
      }
      return {
        id: doc.id.toString(),
        name: doc.file_name,
        size: doc.file_size,
        type: 'application/octet-stream',
        validation_score: doc.validation_score,
        validation_status: frontendStatus,
        validation_details: doc.validation_details,
        analysis_method: 'openai_analysis'
      };
    };

    setLocalState(prev => {
      // Identity docs mapping
      const identity = {
        aadhaar: mapDoc('aadhaar'),
        pan: mapDoc('pan'),
        passport: mapDoc('passport'),
        voterId: mapDoc('voter_id'),
        drivingLicence: mapDoc('driving_licence'),
      };

      // Address proof and text values reconstruction
    const addressProof = mapDoc('address_proof');
      let address = { ...prev.address };
      if (addressProof && addressProof.validation_details) {
        const details = addressProof.validation_details;
        address = {
          currentAddress: prev.address.currentAddress || details.currentAddress || '',
          currentCity: prev.address.currentCity || details.currentCity || '',
          currentState: prev.address.currentState || details.currentState || '',
          currentPincode: prev.address.currentPincode || details.currentPincode || '',
          permanentAddress: prev.address.permanentAddress || details.permanentAddress || '',
          permanentCity: prev.address.permanentCity || details.permanentCity || '',
          permanentState: prev.address.permanentState || details.permanentState || '',
          permanentPincode: prev.address.permanentPincode || details.permanentPincode || '',
          sameAsCurrent: details.sameAsCurrent !== undefined ? details.sameAsCurrent : prev.address.sameAsCurrent,
          addressProof
        };
      } else if (addressProof) {
        address.addressProof = addressProof;
      } else {
        address.addressProof = undefined;
      }

      // Education entries mapping
      const education = prev.education.map(entry => {
        const doc = mapDoc('education_certificate', entry.level);
        if (doc) {
          const details = doc.validation_details || {};
          return {
            ...entry,
            institution: entry.institution || details.institution || '',
            board: entry.board || details.board || '',
            year: entry.year || details.year || '',
            percentage: entry.percentage || details.percentage || '',
            document: doc
          };
        }
        return { ...entry, document: undefined };
      });

      // Employment entries mapping
      const empDocs = docs.filter(d => 
        ['offer_letter', 'experience_letter', 'relieving_letter', 'employment_certificate', 'payslip', 'salary_slip'].includes(d.document_type)
      );

      let baseEmployment = prev.employment;
      // If the UI just loaded with the default empty entry, but we have employment docs from the server, reconstruct the entries
      if (baseEmployment.length === 1 && !baseEmployment[0].company && empDocs.length > 0) {
        const companies = new Set<string>();
        empDocs.forEach(d => {
          const details = d.validation_details || {};
          const cName = details.company_declared || (d.description && d.description.includes(' - ') ? d.description.split(' - ')[1] : '') || '';
          if (cName) companies.add(cName.trim());
        });
        
        if (companies.size > 0) {
          baseEmployment = Array.from(companies).map((cName, idx) => ({
            id: (idx + 1).toString(),
            company: cName,
            designation: '',
            fromDate: '',
            toDate: '',
            managerName: '',
            hrEmail: ''
          }));
        }
      }

      const employment = baseEmployment.map(entry => {
        const newEntry = { ...entry };
        
        const matchDoc = (typeList: string[]) => {
          const d = empDocs.find(doc => {
            if (!typeList.includes(doc.document_type)) return false;
            const details = doc.validation_details || {};
            
            console.log('matchDoc considering:', { docId: doc.id, docType: doc.document_type, docEntryId: details.entryId, targetEntryId: entry.id });
            
            // First try matching by entryId (most reliable for local uploads)
            if (details.entryId && String(details.entryId) === String(entry.id)) {
              console.log('matchDoc matched by entryId!');
              return true;
            }
            
            // Fallback to matching by company name
            const companyName = details.company_declared || (doc.description && doc.description.includes(' - ') ? doc.description.split(' - ')[1] : '') || '';
            if (!entry.company) return false;
            
            const match = companyName.toLowerCase().trim() === entry.company.toLowerCase().trim();
            if (match) console.log('matchDoc matched by company name!');
            return match;
          });
          
          if (d) {
            const bStatus = d.validation_status;
            let frontendStatus: UploadedFile['validation_status'] = 'pending';
            if (bStatus === 'approved') frontendStatus = 'verified';
            else if (bStatus === 'needs_review') frontendStatus = 'needs_review';
            else if (bStatus === 'rejected') frontendStatus = 'rejected';
            else if (bStatus === 'processing') frontendStatus = 'pending';
            else if (d.validation_score !== undefined && d.validation_score !== null) {
              frontendStatus = d.validation_score >= 80 ? 'verified' : d.validation_score >= 50 ? 'needs_review' : 'rejected';
            }

            return {
              id: d.id.toString(),
              name: d.file_name,
              size: d.file_size,
              type: 'application/octet-stream',
              validation_score: d.validation_score,
              validation_status: frontendStatus,
              validation_details: d.validation_details,
              analysis_method: 'openai_analysis'
            } as UploadedFile;
          }
          return undefined;
        };

        newEntry.offerLetter = matchDoc(['offer_letter']);
        newEntry.experienceLetter = matchDoc(['experience_letter', 'relieving_letter', 'employment_certificate']);
        newEntry.payslip = matchDoc(['payslip', 'salary_slip']);

        // Auto-fill details if empty
        const entryDocs = empDocs.filter(d => {
            const details = d.validation_details || {};
            if (details.entryId && String(details.entryId) === String(entry.id)) return true;
            
            const companyName = details.company_declared || (d.description && d.description.includes(' - ') ? d.description.split(' - ')[1] : '') || '';
            if (!entry.company) return false;
            return companyName.toLowerCase().trim() === entry.company.toLowerCase().trim();
        });
        
        entryDocs.forEach(d => {
          const details = d.validation_details || {};
          if (!newEntry.company && details.company_declared) newEntry.company = details.company_declared;
          if (!newEntry.designation && details.designation_declared) newEntry.designation = details.designation_declared;
          if (!newEntry.fromDate && details.joining_date_declared) newEntry.fromDate = details.joining_date_declared.substring(0, 7);
          if (!newEntry.toDate && details.leaving_date_declared) newEntry.toDate = details.leaving_date_declared.substring(0, 7);
        });

        return newEntry;
      });

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

      // Additional Docs mapping — match by entryId in metadata, then by label
      const otherDocs = docs.filter(d => d.document_type === 'other');
      const mappedEntryIds = new Set<string>();

      const additionalDocs = prev.additionalDocs.map(doc => {
        // Try match by entryId stored in metadata first
        let backendDoc = otherDocs.find(d => (d.validation_details as any)?.entryId === doc.id);
        // Fallback: match by label/description
        if (!backendDoc && doc.label) {
          backendDoc = otherDocs.find(d => (d.description || '') === doc.label || (d.description || '').startsWith(`doc_`));
        }
        if (backendDoc) {
          mappedEntryIds.add(backendDoc.id.toString());
          const bStatus = backendDoc.validation_status;
          const score = backendDoc.validation_score;
          const frontendStatus: UploadedFile['validation_status'] =
            bStatus === 'approved' ? 'verified' :
            bStatus === 'needs_review' ? 'needs_review' :
            bStatus === 'rejected' ? 'rejected' :
            (score !== undefined && score !== null) ? (score >= 80 ? 'verified' : score >= 50 ? 'needs_review' : 'rejected') : 'pending';
          return {
            ...doc,
            file: {
              id: backendDoc.id.toString(),
              name: backendDoc.file_name,
              size: backendDoc.file_size,
              type: 'application/octet-stream',
              validation_score: score,
              validation_status: frontendStatus,
              validation_details: backendDoc.validation_details,
              analysis_method: 'openai_analysis'
            }
          };
        }
        return { ...doc, file: undefined };
      });

      // Add any backend 'other' docs that aren't matched to existing cards
      const unmatchedOtherDocs = otherDocs.filter(d => !mappedEntryIds.has(d.id.toString()));
      unmatchedOtherDocs.forEach(d => {
        const score = d.validation_score;
        const bStatus = d.validation_status;
        const frontendStatus: UploadedFile['validation_status'] =
          bStatus === 'approved' ? 'verified' :
          bStatus === 'needs_review' ? 'needs_review' :
          bStatus === 'rejected' ? 'rejected' :
          (score !== undefined && score !== null) ? (score >= 80 ? 'verified' : score >= 50 ? 'needs_review' : 'rejected') : 'pending';
        additionalDocs.push({
          id: d.id.toString(),
          label: d.description || 'Additional Document',
          file: {
            id: d.id.toString(),
            name: d.file_name,
            size: d.file_size,
            type: 'application/octet-stream',
            validation_score: score,
            validation_status: frontendStatus,
            validation_details: d.validation_details,
            analysis_method: 'openai_analysis'
          }
        });
      });

      return {
        ...prev,
        identity,
        address,
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
      };
    });
  }, [bgvState.documents, bgvState.references, bgvState.verification, pendingDocuments]);

  const update = useCallback(<K extends keyof VerificationState>(key: K, value: VerificationState[K]) => {
    updateState({ [key]: value });
  }, []);

  const updateState = useCallback((updates: Partial<VerificationState>) => {
    setLocalState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleStartVerification = async (
    types: string[] = ['identity', 'address', 'education', 'employment', 'financial'],
    connectDigiLocker = false
  ) => {
    try {
      await actions.startVerification(candidateId, types, "Initiated via candidate portal wizard");
      await actions.getCandidateStatus(candidateId);
      setCollapsed(true);

      if (connectDigiLocker) {
        setTimeout(async () => {
          try {
            const statusSummary = await bgvApi.getCandidateVerificationStatus(candidateId);
            if (statusSummary && statusSummary.verification_id) {
              await digiLockerActions.connectWithDigiLocker(statusSummary.verification_id, candidateId);
            }
          } catch (err) {
            console.error("Auto-connecting DigiLocker failed:", err);
          }
        }, 800);
      }
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
            hr_email: entry.hrEmail || '',
            manager_name: entry.managerName || '',
          });
        }
      }
      setShowEmploymentModal(true);
      return new Promise<boolean>((resolve) => {
        setEmploymentUploadPromise({ resolve });
      });
    } else {
      try {
        let description = `Uploaded ${docType}`;
        let metadata: any = undefined;
        if (docType === 'education_certificate' && entryId) {
          const entry = localState.education.find(e => e.id === entryId);
          if (entry) {
            description = `${entry.level} - ${entry.institution}`;
            metadata = {
              level: entry.level,
              institution: entry.institution,
              board: entry.board,
              year: entry.year,
              percentage: entry.percentage,
              entryId: entry.id
            };
          }
        } else if (docType === 'address_proof') {
          metadata = {
            currentAddress: localState.address.currentAddress,
            currentCity: localState.address.currentCity,
            currentState: localState.address.currentState,
            currentPincode: localState.address.currentPincode,
            permanentAddress: localState.address.permanentAddress,
            permanentCity: localState.address.permanentCity,
            permanentState: localState.address.permanentState,
            permanentPincode: localState.address.permanentPincode,
            sameAsCurrent: localState.address.sameAsCurrent,
          };
        } else if (docType === 'other' && entryId) {
          const entry = localState.additionalDocs.find(e => e.id === entryId);
          // Use label as description, fall back to entryId so we can always match back
          if (entry) description = entry.label || `doc_${entryId}`;
          else description = `doc_${entryId}`;
          metadata = { entryId };
        }
        setUploadingFile({ name: file.name, docType });
        const analysisResult = await actions.analyzeDocument(file, docType);
        
        setPendingDocuments(prev => {
          const filtered = prev.filter(p => {
            if (p.documentType !== docType) return true;
            if (entryId) return p.metadata?.entryId !== entryId;
            return false;
          });
          
          return [...filtered, {
            id: Date.now().toString(),
            file,
            documentType: docType,
            description,
            metadata,
            analysisResult
          }];
        });
        
        return true;
      } catch (err: any) {
        console.error("Document upload error:", err);
        let errorMessage = err.message || 'Unknown error';
        if (errorMessage.includes("Failed to fetch") || errorMessage.includes("Network Error")) {
          errorMessage = "The file might be too large for the server. Please try a smaller file (under 1MB) or check your connection.";
        }
        alert(`Upload failed: ${errorMessage}`);
        return false;
      } finally {
        setUploadingFile(null);
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

      setUploadingFile({ name: activeUploadFile.file.name, docType: activeUploadFile.documentType });
      const analysisResult = await actions.analyzeDocument(activeUploadFile.file, activeUploadFile.documentType);
      
      setPendingDocuments(prev => {
        const filtered = prev.filter(p => {
          if (p.documentType !== activeUploadFile.documentType) return true;
          if (activeUploadFile.entryId) return p.metadata?.entryId !== activeUploadFile.entryId;
          return false;
        });
        
        return [...filtered, {
          id: Date.now().toString(),
          file: activeUploadFile.file,
          documentType: activeUploadFile.documentType,
          description: `Uploaded ${activeUploadFile.documentType} - ${employmentForm.company_declared}`,
          metadata,
          analysisResult
        }];
      });
      
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

      if (employmentUploadPromise) {
        employmentUploadPromise.resolve(true);
        setEmploymentUploadPromise(null);
      }
      setActiveUploadFile(null);
    } catch (error: any) {
      console.error('Employment upload error:', error);
      let errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("Network Error")) {
        errorMessage = "The file might be too large for the server. Please try a smaller file (under 1MB) or check your connection.";
      }
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setUploadingFile(null);
    }
  };

  const handleDeleteDocument = async (docType: string, entryId?: string) => {
    // 1. Check if it's a pending document (local only)
    const pendingIndex = pendingDocuments.findIndex(p => {
      if (p.documentType !== docType) return false;
      if (entryId) return p.metadata?.entryId === entryId;
      return true;
    });

    if (pendingIndex >= 0) {
      setPendingDocuments(prev => prev.filter((_, i) => i !== pendingIndex));
      return; // It was local, successfully removed
    }

    // 2. Fallback to deleting from backend
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
    updateState({ currentStep: s });
  };

  const handleSubmitVerification = async () => {
    if (!bgvState.verification) return;
    try {
      // 1. Upload all pending documents first
      if (pendingDocuments.length > 0) {
        for (const pd of pendingDocuments) {
          try {
            setIsSubmittingDocs({ name: pd.file.name, docType: pd.documentType });
            await actions.uploadDocument(
              bgvState.verification.id,
              pd.file,
              pd.documentType,
              pd.description,
              true, // skip validation since we did it with analyzeDocument
              pd.metadata
            );
          } catch (uploadError: any) {
            console.error(`Failed to upload pending document ${pd.file.name}:`, uploadError);
            alert(`Failed to upload ${pd.file.name}. Error: ${uploadError.message}. Please try again or use a smaller file.`);
            return; // Abort the submission process!
          }
        }
        setPendingDocuments([]);
      }

      // 2. Finally submit the verification
      setIsSubmittingDocs({ name: "Finalizing", docType: "Submitting Verification" });
      await actions.submitVerification(bgvState.verification.id, candidateName || 'Candidate');
      await actions.getCandidateStatus(candidateId);
    } catch (error: any) {
      console.error('Failed to submit verification:', error);
      alert(`Failed to submit verification: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmittingDocs(null);
    }
  };

  const completedSteps = useMemo(() => {
    const set = new Set<number>();
    // Step 0: Identity - need at least one identity doc
    if (localState.identity.aadhaar || localState.identity.pan || localState.identity.passport || localState.identity.voterId || localState.identity.drivingLicence) set.add(0);
    // Step 1: Address - need address proof (text fields optional)
    if (localState.address.addressProof) set.add(1);
    // Step 2: Education - need at least one education doc OR institution filled
    if (localState.education.some((e) => e.document || e.institution)) set.add(2);
    // Step 3: Employment - need at least one employment doc OR company name filled
    if (localState.employment.some((e) => e.company && (e.offerLetter || e.experienceLetter || e.payslip))) set.add(3);
    // Step 4: Financial - at least one financial doc
    if (localState.financial.bankStatement || localState.financial.salarySlip || localState.financial.taxReturn) set.add(4);
    // Step 5: Photo
    if (localState.photo.photo) set.add(5);
    // Step 6: Additional Docs - optional, mark done if has any OR if no docs added (skippable)
    if (localState.additionalDocs.length === 0 || localState.additionalDocs.some((doc) => doc.file)) set.add(6);
    // Step 7: Review - unlocked when all mandatory steps done (0,1,2,3,4,5)
    const mandatoryStepsDone = set.has(0) && set.has(1) && set.has(2) && set.has(3) && set.has(4) && set.has(5);
    if (mandatoryStepsDone) set.add(7);
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
      case 0: return (
        <IdentityStep 
          data={localState.identity} 
          onChange={(d) => update('identity', d)} 
          onUploadDocument={handleUploadDocument} 
          onDeleteDocument={handleDeleteDocument} 
          verificationId={bgvState.verification?.id || 0}
          candidateId={candidateId}
        />
      );
      case 1: return (
        <AddressStep 
          data={localState.address} 
          onChange={(d) => update('address', d)} 
          onUploadDocument={handleUploadDocument} 
          onDeleteDocument={handleDeleteDocument} 
          verificationId={bgvState.verification?.id || 0}
          candidateId={candidateId}
        />
      );
      case 2: return <EducationStep data={localState.education} onChange={(d) => update('education', d)} onUploadDocument={handleUploadDocument} onDeleteDocument={handleDeleteDocument} />;
      case 3: return <EmploymentStep data={localState.employment} onChange={(d) => update('employment', d)} onUploadDocument={handleUploadDocument} onDeleteDocument={handleDeleteDocument} />;
      case 4: return <FinancialStep data={localState.financial} onChange={(d) => update('financial', d)} onUploadDocument={handleUploadDocument} onDeleteDocument={handleDeleteDocument} />;
      case 5: return <PhotoStep data={localState.photo} onChange={(d) => update('photo', d)} onUploadDocument={handleUploadDocument} onDeleteDocument={handleDeleteDocument} />;
      case 6: return <AdditionalDocsStep data={localState.additionalDocs} onChange={(d) => update('additionalDocs', d)} onUploadDocument={handleUploadDocument} onDeleteDocument={handleDeleteDocument} />;
      case 7: return <ReviewStep state={localState} completedSteps={completedSteps} onGoToStep={goTo} />;
      default: return null;
    }
  };

  const DigiLockerStatusBanner = () => {
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async () => {
      if (!bgvState.verification) return;
      try {
        setConnecting(true);
        setError(null);
        await digiLockerActions.connectWithDigiLocker(bgvState.verification.id, candidateId);
      } catch (err) {
        console.error('Failed to link DigiLocker:', err);
        setError(err instanceof Error ? err.message : 'Connection failed');
      } finally {
        setConnecting(false);
      }
    };

    if (digiLockerState.isConnected && digiLockerState.userDetails) {
      return (
        <Card className="mb-6 border-emerald-100 bg-emerald-50/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-8.5 h-8.5 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-emerald-950 text-sm flex items-center gap-2">
                  DigiLocker Account Linked
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px] py-0 border-emerald-200">Verified</Badge>
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Import verified credentials (Aadhaar, PAN, DL) directly within step upload cards.
                  Linked ID: <span className="font-mono font-semibold text-emerald-950">{digiLockerState.userDetails.digilockerId}</span>
                </p>
              </div>
            </div>
            <Button
              onClick={() => digiLockerActions.disconnect()}
              variant="outline"
              size="sm"
              className="text-emerald-900 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-950 text-xs shrink-0"
            >
              Disconnect
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="mb-6 border-blue-100 bg-blue-50/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="flex-1 bg-[#F97316]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#22C55E]" />
        </div>
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-8.5 h-8.5 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
              <Wifi className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-semibold text-blue-900 text-sm flex items-center gap-2">
                Link DigiLocker to Skip Manual Uploads
              </h4>
              <p className="text-xs text-blue-700">
                Instantly fetch authenticated, government-signed documents directly from your DigiLocker.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0 w-full sm:w-auto">
            <Button
              onClick={handleConnect}
              disabled={connecting}
              size="sm"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 h-8.5"
            >
              {connecting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Shield className="h-3.5 w-3.5 mr-1" />
                  Link DigiLocker Account
                </>
              )}
            </Button>
            {error && <p className="text-[10px] text-red-500">{error}</p>}
          </div>
        </CardContent>
      </Card>
    );
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
                    onClick={() => handleStartVerification(undefined, true)}
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
                    {bgvState.verification.status === 'pending' ? 'Draft Mode - Uploads are immediate' : 'Editing Mode — Documents updated'}
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    {bgvState.verification.status === 'pending' 
                      ? 'Your files will upload and validate as you navigate steps. When complete, click Submit Verification on the last step to trigger HR validation emails.' 
                      : 'You are editing a submitted verification. Your document changes are saved automatically. Click "Done Editing" when finished — no new HR emails will be sent.'}
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
                    Done Editing
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

          <VerificationHeader completedSteps={completedSteps} />

          <DigiLockerStatusBanner />

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
                  isEditing && bgvState.verification?.status !== 'pending' ? (
                    // In edit mode on an already-submitted verification — just exit editing, no re-submit
                    <Button
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      className="bg-green-600 hover:bg-green-700 text-white gap-1 font-semibold"
                    >
                      Done Editing
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  ) : (
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
                  )
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

      {/* Uploading Overlay for Final Submit */}
      {isSubmittingDocs && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl border flex flex-col items-center space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isSubmittingDocs.name === "Finalizing" ? "Finalizing Verification..." : "Uploading Documents..."}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs text-center">
              {isSubmittingDocs.name === "Finalizing" 
                ? "Please wait while we submit your application." 
                : `Please wait while we securely upload your ${isSubmittingDocs.docType.replace('_', ' ')}...`}
            </p>
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
