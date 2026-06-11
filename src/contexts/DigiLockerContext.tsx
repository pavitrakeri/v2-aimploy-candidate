import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { digiLockerApi, DigiLockerRequestResponse, DigiLockerDocumentsList, DigiLockerDocumentResponse, DigiLockerAadhaarResponse, DigiLockerDocumentLink } from '../services/digilocker-api';

// Types
export interface DigiLockerState {
  isConnected: boolean;
  request: DigiLockerRequestResponse | null;
  availableDocuments: DigiLockerDocumentsList | null;
  userDetails: {
    digilockerId: string;
    email?: string;
    phoneNumber?: string;
  } | null;
  loading: boolean;
  error: string | null;
  fetchedDocuments: DigiLockerDocumentLink[];
  aadhaarData: DigiLockerAadhaarResponse | null;
}

type DigiLockerAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_REQUEST'; payload: DigiLockerRequestResponse }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_AVAILABLE_DOCUMENTS'; payload: DigiLockerDocumentsList }
  | { type: 'SET_USER_DETAILS'; payload: { digilockerId: string; email?: string; phoneNumber?: string } }
  | { type: 'ADD_FETCHED_DOCUMENT'; payload: DigiLockerDocumentLink }
  | { type: 'SET_AADHAAR_DATA'; payload: DigiLockerAadhaarResponse }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: DigiLockerState = {
  isConnected: false,
  request: null,
  availableDocuments: null,
  userDetails: null,
  loading: false,
  error: null,
  fetchedDocuments: [],
  aadhaarData: null,
};

// Reducer
function digiLockerReducer(state: DigiLockerState, action: DigiLockerAction): DigiLockerState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_REQUEST':
      return { 
        ...state, 
        request: action.payload,
        isConnected: action.payload.status === 'authenticated',
        loading: false 
      };
    
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload, loading: false };
    
    case 'SET_AVAILABLE_DOCUMENTS':
      return { ...state, availableDocuments: action.payload, loading: false };
    
    case 'SET_USER_DETAILS':
      return { ...state, userDetails: action.payload, loading: false };
    
    case 'ADD_FETCHED_DOCUMENT':
      return { 
        ...state, 
        fetchedDocuments: [...state.fetchedDocuments, action.payload],
        loading: false 
      };
    
    case 'SET_AADHAAR_DATA':
      return { ...state, aadhaarData: action.payload, loading: false };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Context
const DigiLockerContext = createContext<{
  state: DigiLockerState;
  dispatch: React.Dispatch<DigiLockerAction>;
  actions: {
    createRequest: (verificationId: number, candidateId: number) => Promise<DigiLockerRequestResponse>;
    getRequestStatus: (requestId: string) => Promise<DigiLockerRequestResponse>;
    getAvailableDocuments: () => Promise<void>;
    fetchDocument: (requestId: string, docType: string, orgId: string, format: string, parameters: Array<{name: string; value: string}>) => Promise<DigiLockerDocumentResponse>;
    fetchAadhaarData: (requestId: string) => Promise<DigiLockerAadhaarResponse>;
    downloadDocument: (requestId: string, fileUrl: string, verificationId: number, documentType: string) => Promise<DigiLockerDocumentLink>;
    connectWithDigiLocker: (verificationId: number, candidateId: number) => Promise<DigiLockerRequestResponse>;
    disconnect: () => void;
    clearError: () => void;
  };
} | null>(null);

// Provider
export const DigiLockerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(digiLockerReducer, initialState);

  // Actions
  const actions = {
    createRequest: async (verificationId: number, candidateId: number) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const request = await digiLockerApi.createRequest(verificationId, candidateId);
        dispatch({ type: 'SET_REQUEST', payload: request });
        return request;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create DigiLocker request' });
        throw error;
      }
    },

    getRequestStatus: async (requestId: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const status = await digiLockerApi.getRequestStatus(requestId);
        dispatch({ type: 'SET_REQUEST', payload: status });
        
        if (status.status === 'authenticated' && status.digilocker_user_details) {
          dispatch({ type: 'SET_USER_DETAILS', payload: status.digilocker_user_details });
        }
        
        return status;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to get request status' });
        throw error;
      }
    },

    getAvailableDocuments: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const documents = await digiLockerApi.getAvailableDocuments();
        dispatch({ type: 'SET_AVAILABLE_DOCUMENTS', payload: documents });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to get available documents' });
      }
    },

    fetchDocument: async (
      requestId: string,
      docType: string,
      orgId: string,
      format: string,
      parameters: Array<{name: string; value: string}>
    ) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const document = await digiLockerApi.fetchDocument(requestId, docType, orgId, format, parameters);
        return document;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch document' });
        throw error;
      }
    },

    fetchAadhaarData: async (requestId: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const aadhaarData = await digiLockerApi.fetchAadhaarData(requestId);
        dispatch({ type: 'SET_AADHAAR_DATA', payload: aadhaarData });
        return aadhaarData;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch Aadhaar data' });
        throw error;
      }
    },

    downloadDocument: async (
      requestId: string,
      fileUrl: string,
      verificationId: number,
      documentType: string
    ) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const result = await digiLockerApi.downloadDocument(requestId, fileUrl, verificationId, documentType);
        dispatch({ type: 'ADD_FETCHED_DOCUMENT', payload: result.document });
        return result.document;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to download document' });
        throw error;
      }
    },

    connectWithDigiLocker: async (verificationId: number, candidateId: number) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Create request — response includes PKCE code_verifier
        const request = await digiLockerApi.createRequest(verificationId, candidateId);
        dispatch({ type: 'SET_REQUEST', payload: request });
        
        // Open DigiLocker in popup, passing code_verifier for token exchange
        const callback = await digiLockerApi.openDigiLockerPopup(request.url, request.code_verifier);
        
        // Update state with callback data
        if (callback.user_details) {
          dispatch({ type: 'SET_USER_DETAILS', payload: callback.user_details });
        }
        
        // Get final status
        const finalStatus = await digiLockerApi.getRequestStatus(request.id);
        dispatch({ type: 'SET_REQUEST', payload: finalStatus });
        
        return finalStatus;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to connect with DigiLocker' });
        throw error;
      }
    },

    disconnect: () => {
      if (state.request) {
        // Revoke access token
        digiLockerApi.revokeAccessToken(state.request.id).catch(console.error);
      }
      dispatch({ type: 'RESET_STATE' });
    },

    clearError: () => {
      dispatch({ type: 'SET_ERROR', payload: null });
    },
  };

  return (
    <DigiLockerContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </DigiLockerContext.Provider>
  );
};

// Hook
export const useDigiLocker = () => {
  const context = useContext(DigiLockerContext);
  if (!context) {
    throw new Error('useDigiLocker must be used within a DigiLockerProvider');
  }
  return context;
};

export default DigiLockerContext;
