import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { bgvApi, BGVVerificationResponse, BGVOverallStatus, BGVDocumentResponse, BGVReferenceResponse } from '../services/bgv-api';
import { fileValidationService, ValidationResult } from '../services/fileValidation';

// Local storage key for pending uploads
const PENDING_UPLOADS_KEY = 'bgv_pending_uploads';

// Types
export interface BGVState {
  verification: BGVVerificationResponse | null;
  overallStatus: BGVOverallStatus | null;
  documents: BGVDocumentResponse[];
  references: BGVReferenceResponse[];
  loading: boolean;
  error: string | null;
}

type BGVAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_VERIFICATION'; payload: BGVVerificationResponse }
  | { type: 'SET_OVERALL_STATUS'; payload: BGVOverallStatus }
  | { type: 'SET_DOCUMENTS'; payload: BGVDocumentResponse[] }
  | { type: 'ADD_DOCUMENT'; payload: BGVDocumentResponse }
  | { type: 'REMOVE_DOCUMENT'; payload: number }
  | { type: 'SET_REFERENCES'; payload: BGVReferenceResponse[] }
  | { type: 'ADD_REFERENCE'; payload: BGVReferenceResponse }
  | { type: 'REMOVE_REFERENCE'; payload: number }
  | { type: 'UPDATE_VERIFICATION_STATUS'; payload: string }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: BGVState = {
  verification: null,
  overallStatus: null,
  documents: [],
  references: [],
  loading: false,
  error: null,
};

// Reducer
function bgvReducer(state: BGVState, action: BGVAction): BGVState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_VERIFICATION':
      return { ...state, verification: action.payload, loading: false, error: null };
    
    case 'SET_OVERALL_STATUS':
      return { 
        ...state, 
        overallStatus: action.payload,
        verification: action.payload.verification,
        documents: action.payload.documents,
        references: action.payload.references,
        loading: false, 
        error: null 
      };
    
    case 'SET_DOCUMENTS':
      return { ...state, documents: action.payload, loading: false };
    
    case 'ADD_DOCUMENT':
      return { 
        ...state, 
        documents: [...state.documents, action.payload], 
        loading: false 
      };
    
    case 'REMOVE_DOCUMENT':
      return { 
        ...state, 
        documents: state.documents.filter(doc => doc.id !== action.payload),
        loading: false 
      };
    
    case 'SET_REFERENCES':
      return { ...state, references: action.payload, loading: false };
    
    case 'ADD_REFERENCE':
      return { 
        ...state, 
        references: [...state.references, action.payload], 
        loading: false 
      };
    
    case 'REMOVE_REFERENCE':
      return { 
        ...state, 
        references: state.references.filter(ref => ref.id !== action.payload),
        loading: false 
      };
    
    case 'UPDATE_VERIFICATION_STATUS':
      return state.verification 
        ? { ...state, verification: { ...state.verification, status: action.payload as any } }
        : state;
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Context
const BGVContext = createContext<{
  state: BGVState;
  dispatch: React.Dispatch<BGVAction>;
  actions: {
    startVerification: (candidateId: number, verificationTypes: string[], notes?: string) => Promise<void>;
    getCandidateStatus: (candidateId: number) => Promise<void>;
    validateDocument: (file: File, documentType: string) => Promise<ValidationResult>;
    uploadDocument: (verificationId: number, file: File, documentType: string, description?: string, skipValidation?: boolean, metadata?: any) => Promise<void>;
    deleteDocument: (documentId: number) => Promise<void>;
    addReference: (verificationId: number, referenceData: Omit<import('../services/bgv-api').BGVReferenceCreate, 'verification_id'>) => Promise<void>;
    deleteReference: (referenceId: number) => Promise<void>;
    refreshData: () => Promise<void>;
    syncPendingUploads: () => Promise<{ successful: number; failed: number }>;
    submitVerification: (verificationId: number, candidateName: string) => Promise<any>;
    getHRVerificationStatus: (verificationId: number) => Promise<any>;
  };
} | null>(null);

// Provider
export const BGVProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(bgvReducer, initialState);

  // Helper function to save file locally when API fails
  async function saveFileLocally(
    verificationId: number,
    file: File,
    documentType: string,
    description?: string
  ): Promise<BGVDocumentResponse> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          // Get existing pending uploads
          const pendingUploads = JSON.parse(localStorage.getItem(PENDING_UPLOADS_KEY) || '[]');
          
          // Create document object
          const document: BGVDocumentResponse = {
            id: Date.now() + Math.random(), // Temporary ID
            verification_id: verificationId,
            document_type: documentType,
            file_name: file.name,
            file_url: (event.target?.result as string) || '', // Data URL
            file_size: file.size,
            validation_score: undefined,
            validation_status: 'pending',
            validation_details: null,
            description: description || `Uploaded ${documentType}`,
            uploaded_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          // Add to pending uploads
          pendingUploads.push({
            ...document,
            file_data: event.target?.result, // Store base64 data
            is_pending: true,
          });
          
          // Save to localStorage
          localStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(pendingUploads));
          
          resolve(document);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  // Helper function for API requests
  async function bgvApiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem("access_token");
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.aimploy.org/api/v1";
    
    const headers: HeadersInit = {
      ...options.headers,
    };

    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      (headers as Record<string, string>)["Content-Type"] = "application/json";
    }

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "An error occurred" }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Actions
  const actions = {
    startVerification: async (candidateId: number, verificationTypes: string[], notes?: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const verification = await bgvApi.startVerification({
          candidate_id: candidateId,
          consent_given: true,
          no_criminal_record: true,
          verification_types: verificationTypes,
          initiated_by: candidateId, // Assuming candidate initiates their own verification
          notes,
        });
        
        dispatch({ type: 'SET_VERIFICATION', payload: verification });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to start verification' });
      }
    },

    getCandidateStatus: async (candidateId: number) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const statusSummary = await bgvApi.getCandidateVerificationStatus(candidateId);
        
        const verificationId = statusSummary.verification_id;
        if (verificationId) {
          const [verificationDetail, documents, references] = await Promise.all([
            bgvApi.getVerification(verificationId),
            bgvApi.getDocuments(verificationId),
            bgvApi.getReferences(verificationId)
          ]);

          dispatch({
            type: 'SET_OVERALL_STATUS',
            payload: {
              ...statusSummary,
              verification: verificationDetail,
              documents,
              references,
              completion_percentage: statusSummary.completion_percentage || (statusSummary as any).progress_percentage || 0
            } as any
          });
        } else {
          dispatch({ type: 'RESET_STATE' });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message.includes("No verification found for candidate") || message.includes("404")) {
          // Normal case: candidate has not initiated verification yet
          dispatch({ type: 'RESET_STATE' });
        } else {
          dispatch({ type: 'SET_ERROR', payload: message || 'Failed to get candidate status' });
        }
      }
    },

    validateDocument: async (file: File, documentType: string) => {
      try {
        const validation = await fileValidationService.validateFile(file, documentType);
        return validation;
      } catch (error) {
        throw new Error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    uploadDocument: async (verificationId: number, file: File, documentType: string, description?: string, skipValidation?: boolean, metadata?: any) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Validate file unless explicitly skipped
        if (!skipValidation) {
          const validation = await fileValidationService.validateFile(file, documentType);
          if (!validation.isValid) {
            dispatch({ type: 'SET_ERROR', payload: `Validation failed: ${validation.errors.join(', ')}` });
            return;
          }
          
          // Show warnings if any
          if (validation.warnings.length > 0) {
            console.warn('File validation warnings:', validation.warnings);
          }
        }
        
        // Register file for duplicate detection
        await fileValidationService.registerUploadedFile(file, documentType);
        
        const document = await bgvApi.uploadDocument({
          verification_id: verificationId,
          document_type: documentType,
          file,
          description,
          metadata,
        });
        
        dispatch({ type: 'ADD_DOCUMENT', payload: document });
      } catch (error) {
        // Fallback: Save file locally if API fails
        try {
          console.log('API failed, saving file locally...');
          const fallbackDoc = await saveFileLocally(verificationId, file, documentType, description);
          console.log('File saved locally:', fallbackDoc);
          dispatch({ type: 'ADD_DOCUMENT', payload: fallbackDoc });
          dispatch({ type: 'SET_ERROR', payload: 'Document saved locally. Will sync with server when connection is restored.' });
        } catch (fallbackError) {
          console.error('Fallback save failed:', fallbackError);
          dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to upload document' });
        }
      }
    },

    deleteDocument: async (documentId: number) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        await bgvApi.deleteDocument(documentId);
        dispatch({ type: 'REMOVE_DOCUMENT', payload: documentId });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete document' });
      }
    },

    addReference: async (verificationId: number, referenceData: Omit<import('../services/bgv-api').BGVReferenceCreate, 'verification_id'>) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const reference = await bgvApi.addReference({
          ...referenceData,
          verification_id: verificationId,
        });
        
        dispatch({ type: 'ADD_REFERENCE', payload: reference });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add reference' });
      }
    },

    deleteReference: async (referenceId: number) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        await bgvApi.deleteReference(referenceId);
        dispatch({ type: 'REMOVE_REFERENCE', payload: referenceId });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete reference' });
      }
    },

    refreshData: async () => {
      if (state.verification) {
        await actions.getCandidateStatus(state.verification.candidate_id);
      }
    },

    syncPendingUploads: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const pendingUploads = JSON.parse(localStorage.getItem(PENDING_UPLOADS_KEY) || '[]');
        const successfulUploads: any[] = [];
        const failedUploads: any[] = [];
        
        for (const pendingDoc of pendingUploads) {
          if (pendingDoc.is_pending && pendingDoc.file_data) {
            try {
              // Convert base64 back to File
              const base64Data = pendingDoc.file_data.split(',')[1];
              const byteCharacters = atob(base64Data);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const file = new File([byteArray], pendingDoc.file_name, { type: 'application/octet-stream' });
              
              // Try to upload to server
              const uploadedDoc = await bgvApi.uploadDocument({
                verification_id: pendingDoc.verification_id,
                document_type: pendingDoc.document_type,
                file,
                description: pendingDoc.description,
              });
              
              successfulUploads.push({ pending: pendingDoc, uploaded: uploadedDoc });
            } catch (error) {
              failedUploads.push({ pending: pendingDoc, error: error.message });
            }
          }
        }
        
        // Update localStorage - remove successful uploads
        const remainingPending = pendingUploads.filter(pending => 
          !successfulUploads.some(success => success.pending.id === pending.id)
        );
        localStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(remainingPending));
        
        // Refresh data
        if (state.verification) {
          await actions.getCandidateStatus(state.verification.candidate_id);
        }
        
        return { successful: successfulUploads.length, failed: failedUploads.length };
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to sync pending uploads' });
        return { successful: 0, failed: 0 };
      }
    },

    submitVerification: async (verificationId: number, candidateName: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await bgvApi.submitVerification(verificationId, candidateName);
        dispatch({ type: 'UPDATE_VERIFICATION_STATUS', payload: 'in_progress' });
        if (state.verification) {
          await actions.getCandidateStatus(state.verification.candidate_id);
        }
        return response;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to submit verification' });
        throw error;
      }
    },

    getHRVerificationStatus: async (verificationId: number) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const hrStatus = await bgvApi.getHRVerificationStatus(verificationId);
        dispatch({ type: 'SET_LOADING', payload: false });
        return hrStatus;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to get HR verification status' });
        throw error;
      }
    },
  };

  return (
    <BGVContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </BGVContext.Provider>
  );
};

// Hook
export const useBGV = () => {
  const context = useContext(BGVContext);
  if (!context) {
    throw new Error('useBGV must be used within a BGVProvider');
  }
  return context;
};

export default BGVContext;
