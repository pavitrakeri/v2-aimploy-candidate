// BGV (Background Verification) API Service

// Types
export interface BGVVerificationCreate {
  candidate_id: number;
  consent_given: boolean;
  no_criminal_record: boolean;
  verification_types: string[];
  initiated_by: number;
  notes?: string;
}

export interface BGVVerificationResponse {
  id: number;
  candidate_id: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  consent_given: boolean;
  no_criminal_record: boolean;
  verification_types: string[];
  initiated_by: number;
  initiated_at: string;
  completed_at?: string;
  notes?: string;
  failed_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface BGVVerificationDetail extends BGVVerificationResponse {
  documents: BGVDocument[];
  references: BGVReference[];
}

export interface BGVReferenceCreate {
  verification_id: number;
  reference_name: string;
  reference_email: string;
  reference_phone?: string;
  relationship: string;
  company?: string;
  position?: string;
  is_current?: boolean;
}

export interface BGVReferenceResponse {
  id: number;
  verification_id: number;
  reference_name: string;
  reference_email: string;
  reference_phone?: string;
  relationship: string;
  company?: string;
  position?: string;
  status: 'pending' | 'contacted' | 'responded' | 'verified';
  is_current?: boolean;
  response_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BGVDocumentCreate {
  verification_id: number;
  document_type: string;
  file: File;
  description?: string;
}

export interface BGVDocumentResponse {
  id: number;
  verification_id: number;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size: number;
  validation_score?: number;
  validation_status?: 'pending' | 'processing' | 'approved' | 'rejected';
  validation_details?: any;
  description?: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export interface BGVOverallStatus {
  candidate_id: number;
  verification?: BGVVerificationResponse;
  documents: BGVDocumentResponse[];
  references: BGVReferenceResponse[];
  overall_status: 'not_started' | 'pending' | 'in_progress' | 'completed' | 'failed';
  completion_percentage: number;
  last_updated: string;
}

// Helper function for API calls
async function bgvApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("access_token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://aimploy-backend-main.onrender.com/api/v1";
  
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

// BGV APIs
export const bgvApi = {
  // Verification Management
  startVerification: async (data: BGVVerificationCreate): Promise<BGVVerificationResponse> => {
    return bgvApiRequest<BGVVerificationResponse>("/verification/start", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getVerification: async (verificationId: number): Promise<BGVVerificationDetail> => {
    return bgvApiRequest<BGVVerificationDetail>(`/verification/${verificationId}`);
  },

  updateVerification: async (
    verificationId: number,
    data: Partial<BGVVerificationCreate>
  ): Promise<BGVVerificationResponse> => {
    return bgvApiRequest<BGVVerificationResponse>(`/verification/${verificationId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getCandidateVerificationStatus: async (candidateId: number): Promise<BGVOverallStatus> => {
    return bgvApiRequest<BGVOverallStatus>(`/verification/candidate/${candidateId}`);
  },

  // Reference Management
  addReference: async (data: BGVReferenceCreate): Promise<BGVReferenceResponse> => {
    return bgvApiRequest<BGVReferenceResponse>("/verification/references", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getReferences: async (verificationId: number): Promise<BGVReferenceResponse[]> => {
    return bgvApiRequest<BGVReferenceResponse[]>(`/verification/${verificationId}/references`);
  },

  updateReference: async (
    referenceId: number,
    data: Partial<BGVReferenceCreate>
  ): Promise<BGVReferenceResponse> => {
    return bgvApiRequest<BGVReferenceResponse>(`/verification/references/${referenceId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteReference: async (referenceId: number): Promise<void> => {
    return bgvApiRequest<void>(`/verification/references/${referenceId}`, {
      method: "DELETE",
    });
  },

  // Document Management
  uploadDocument: async (data: BGVDocumentCreate): Promise<BGVDocumentResponse> => {
    const formData = new FormData();
    formData.append("verification_id", data.verification_id.toString());
    formData.append("document_type", data.document_type);
    formData.append("file", data.file);
    if (data.description) formData.append("description", data.description);

    return bgvApiRequest<BGVDocumentResponse>("/verification/documents", {
      method: "POST",
      body: formData,
    });
  },

  getDocuments: async (verificationId: number): Promise<BGVDocumentResponse[]> => {
    return bgvApiRequest<BGVDocumentResponse[]>(`/verification/${verificationId}/documents`);
  },

  deleteDocument: async (documentId: number): Promise<void> => {
    return bgvApiRequest<void>(`/verification/documents/${documentId}`, {
      method: "DELETE",
    });
  },

  // Bulk Operations
  bulkUploadDocuments: async (
    verificationId: number,
    documents: { file: File; document_type: string; description?: string }[]
  ): Promise<BGVDocumentResponse[]> => {
    const formData = new FormData();
    formData.append("verification_id", verificationId.toString());
    
    documents.forEach((doc, index) => {
      formData.append(`files`, doc.file);
      formData.append(`document_types`, doc.document_type);
      if (doc.description) formData.append(`descriptions`, doc.description);
    });

    return bgvApiRequest<BGVDocumentResponse[]>("/verification/documents/bulk", {
      method: "POST",
      body: formData,
    });
  },

  bulkAddReferences: async (
    verificationId: number,
    references: Omit<BGVReferenceCreate, 'verification_id'>[]
  ): Promise<BGVReferenceResponse[]> => {
    return bgvApiRequest<BGVReferenceResponse[]>(`/verification/${verificationId}/references/bulk`, {
      method: "POST",
      body: JSON.stringify({ references }),
    });
  },
};
