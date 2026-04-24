import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { verificationAPI, VerificationResponse, VerificationStatus, ReferenceResponse, DocumentResponse, VerificationType } from '@/services/verification-api';
import { VerificationState, initialState, ReferenceEntry } from '@/types/verification';

interface VerificationContextType {
  state: VerificationState;
  verification: VerificationResponse | null;
  verificationStatus: VerificationStatus | null;
  references: ReferenceResponse[];
  documents: DocumentResponse[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateState: (updates: Partial<VerificationState>) => void;
  startVerification: (candidateId: number) => Promise<void>;
  getVerificationStatus: (candidateId: number) => Promise<void>;
  uploadDocument: (file: File, documentType: string, description?: string) => Promise<void>;
  addReference: (reference: Omit<ReferenceResponse, 'id' | 'verification_id' | 'status' | 'created_at' | 'updated_at' | 'contacted_at' | 'responded_at' | 'verified_at'>) => Promise<void>;
  submitVerification: () => Promise<void>;
  resetVerification: () => void;
}

type VerificationAction = 
  | { type: 'SET_STATE'; payload: Partial<VerificationState> }
  | { type: 'SET_VERIFICATION'; payload: VerificationResponse }
  | { type: 'SET_VERIFICATION_STATUS'; payload: VerificationStatus }
  | { type: 'SET_REFERENCES'; payload: ReferenceResponse[] }
  | { type: 'SET_DOCUMENTS'; payload: DocumentResponse[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

const verificationReducer = (state: VerificationContextType, action: VerificationAction): VerificationContextType => {
  switch (action.type) {
    case 'SET_STATE':
      return {
        ...state,
        state: { ...state.state, ...action.payload }
      };
    case 'SET_VERIFICATION':
      return {
        ...state,
        verification: action.payload
      };
    case 'SET_VERIFICATION_STATUS':
      return {
        ...state,
        verificationStatus: action.payload
      };
    case 'SET_REFERENCES':
      return {
        ...state,
        references: action.payload
      };
    case 'SET_DOCUMENTS':
      return {
        ...state,
        documents: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    case 'RESET':
      return {
        ...initialContext,
        state: initialState
      };
    default:
      return state;
  }
};

const initialContext: VerificationContextType = {
  state: initialState,
  verification: null,
  verificationStatus: null,
  references: [],
  documents: [],
  isLoading: false,
  error: null,
  updateState: () => {},
  startVerification: async () => {},
  getVerificationStatus: async () => {},
  uploadDocument: async () => {},
  addReference: async () => {},
  submitVerification: async () => {},
  resetVerification: () => {}
};

const VerificationContext = createContext<VerificationContextType>(initialContext);

export const useVerification = () => {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error('useVerification must be used within a VerificationProvider');
  }
  return context;
};

interface VerificationProviderProps {
  children: ReactNode;
}

export const VerificationProvider: React.FC<VerificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(verificationReducer, initialContext);

  const updateState = (updates: Partial<VerificationState>) => {
    dispatch({ type: 'SET_STATE', payload: updates });
  };

  const startVerification = async (candidateId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const verificationTypes: VerificationType[] = [];
      
      // Determine verification types based on completed steps
      if (state.state.identity.aadhaar || state.state.identity.pan || state.state.identity.passport) {
        verificationTypes.push('identity');
      }
      if (state.state.address.currentAddress && state.state.address.permanentAddress) {
        verificationTypes.push('address');
      }
      if (state.state.education.some(e => e.institution && e.document)) {
        verificationTypes.push('education');
      }
      if (state.state.employment.some(e => e.company && e.designation)) {
        verificationTypes.push('employment');
      }
      if (state.state.financial.bankStatement || state.state.financial.salarySlip) {
        verificationTypes.push('financial');
      }
      if (state.state.backgroundCheck.references.some(r => r.name && r.email)) {
        verificationTypes.push('reference');
      }
      if (state.state.backgroundCheck.noCriminalRecord) {
        verificationTypes.push('criminal');
      }

      const request = {
        candidate_id: candidateId,
        consent_given: state.state.backgroundCheck.consentGiven,
        no_criminal_record: state.state.backgroundCheck.noCriminalRecord,
        verification_types: verificationTypes,
        notes: 'Verification initiated from candidate portal'
      };

      const verification = await verificationAPI.startVerification(request);
      dispatch({ type: 'SET_VERIFICATION', payload: verification });

      // Upload documents
      await uploadAllDocuments(verification.id);
      
      // Add references
      await addAllReferences(verification.id);

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to start verification' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const uploadAllDocuments = async (verificationId: number) => {
    const documentsToUpload: { file: File; document_type: string; description?: string }[] = [];

    // Helper function to convert UploadedFile to File
    const uploadedFileToFile = (uploadedFile: any): File => {
      return new File([uploadedFile], uploadedFile.name, {
        type: uploadedFile.type
      });
    };

    // Identity documents
    if (state.state.identity.aadhaar) {
      documentsToUpload.push({ file: uploadedFileToFile(state.state.identity.aadhaar), document_type: 'aadhaar', description: 'Aadhaar Card' });
    }
    if (state.state.identity.pan) {
      documentsToUpload.push({ file: uploadedFileToFile(state.state.identity.pan), document_type: 'pan', description: 'PAN Card' });
    }
    if (state.state.identity.passport) {
      documentsToUpload.push({ file: uploadedFileToFile(state.state.identity.passport), document_type: 'passport', description: 'Passport' });
    }
    if (state.state.identity.voterId) {
      documentsToUpload.push({ file: uploadedFileToFile(state.state.identity.voterId), document_type: 'voter_id', description: 'Voter ID' });
    }
    if (state.state.identity.drivingLicence) {
      documentsToUpload.push({ file: uploadedFileToFile(state.state.identity.drivingLicence), document_type: 'driving_licence', description: 'Driving License' });
    }

    // Address proof
    if (state.state.address.addressProof) {
      documentsToUpload.push({ file: uploadedFileToFile(state.state.address.addressProof), document_type: 'address_proof', description: 'Address Proof' });
    }

    // Education documents
    state.state.education.forEach((edu, index) => {
      if (edu.document) {
        const docType = 'education_certificate';
        documentsToUpload.push({ 
          file: uploadedFileToFile(edu.document), 
          document_type: docType, 
          description: `${edu.level} - ${edu.institution}` 
        });
      }
    });

    // Employment documents
    state.state.employment.forEach((emp) => {
      if (emp.offerLetter) {
        documentsToUpload.push({ file: uploadedFileToFile(emp.offerLetter), document_type: 'offer_letter', description: `Offer Letter - ${emp.company}` });
      }
      if (emp.experienceLetter) {
        documentsToUpload.push({ file: uploadedFileToFile(emp.experienceLetter), document_type: 'experience_letter', description: `Experience Letter - ${emp.company}` });
      }
      if (emp.payslip) {
        documentsToUpload.push({ file: uploadedFileToFile(emp.payslip), document_type: 'payslip', description: `Payslip - ${emp.company}` });
      }
    });

    // Financial documents
    if (state.state.financial.bankStatement) {
      documentsToUpload.push({ file: uploadedFileToFile(state.state.financial.bankStatement), document_type: 'bank_statement', description: 'Bank Statement' });
    }
    if (state.state.financial.salarySlip) {
      documentsToUpload.push({ file: uploadedFileToFile(state.state.financial.salarySlip), document_type: 'payslip', description: 'Salary Slip' });
    }
    if (state.state.financial.taxReturn) {
      documentsToUpload.push({ file: uploadedFileToFile(state.state.financial.taxReturn), document_type: 'tax_return', description: 'Tax Return' });
    }

    // Photo
    if (state.state.photo.photo) {
      documentsToUpload.push({ file: uploadedFileToFile(state.state.photo.photo), document_type: 'photo', description: 'Profile Photo' });
    }

    // Additional documents
    state.state.additionalDocs.forEach((doc) => {
      if (doc.file) {
        documentsToUpload.push({ file: uploadedFileToFile(doc.file), document_type: 'other', description: doc.label });
      }
    });

    if (documentsToUpload.length > 0) {
      const uploadedDocs = await verificationAPI.bulkUploadDocuments(verificationId, documentsToUpload);
      dispatch({ type: 'SET_DOCUMENTS', payload: uploadedDocs });
    }
  };

  const addAllReferences = async (verificationId: number) => {
    const validReferences = state.state.backgroundCheck.references.filter(
      ref => ref.name && ref.email && ref.phone
    );

    if (validReferences.length > 0) {
      const referencePromises = validReferences.map(ref =>
        verificationAPI.addReference({
          verification_id: verificationId,
          name: ref.name,
          email: ref.email,
          phone: ref.phone,
          relationship: ref.relationship,
          company: ref.company,
          designation: '', // Not in current state
          years_known: undefined, // Not in current state
          notes: ''
        })
      );

      const uploadedReferences = await Promise.all(referencePromises);
      dispatch({ type: 'SET_REFERENCES', payload: uploadedReferences });
    }
  };

  const getVerificationStatus = async (candidateId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const status = await verificationAPI.getCandidateVerificationStatus(candidateId);
      dispatch({ type: 'SET_VERIFICATION_STATUS', payload: status });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to get verification status' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const uploadDocument = async (file: File, documentType: string, description?: string) => {
    if (!state.verification) {
      throw new Error('No active verification');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const document = await verificationAPI.uploadDocument({
        verification_id: state.verification.id,
        document_type: documentType,
        description,
        file
      });

      dispatch({ 
        type: 'SET_DOCUMENTS', 
        payload: [...state.documents, document] 
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to upload document' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addReference = async (reference: Omit<ReferenceResponse, 'id' | 'verification_id' | 'status' | 'created_at' | 'updated_at' | 'contacted_at' | 'responded_at' | 'verified_at'>) => {
    if (!state.verification) {
      throw new Error('No active verification');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newReference = await verificationAPI.addReference({
        verification_id: state.verification.id,
        ...reference
      });

      dispatch({ 
        type: 'SET_REFERENCES', 
        payload: [...state.references, newReference] 
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add reference' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const submitVerification = async () => {
    if (!state.verification) {
      throw new Error('No active verification');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await verificationAPI.updateVerification(state.verification.id, {
        status: 'in_progress'
      });

      // Refresh verification status
      if (state.verification.candidate_id) {
        await getVerificationStatus(state.verification.candidate_id);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to submit verification' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const resetVerification = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <VerificationContext.Provider
      value={{
        ...state,
        updateState,
        startVerification,
        getVerificationStatus,
        uploadDocument,
        addReference,
        submitVerification,
        resetVerification
      }}
    >
      {children}
    </VerificationContext.Provider>
  );
};
