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
  documents: BGVDocumentResponse[];
}



export interface BGVDocumentCreate {
  verification_id: number;
  document_type: string;
  file: File;
  description?: string;
  metadata?: any;
}

export interface BGVDocumentResponse {
  id: number;
  verification_id: number;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size: number;
  validation_score?: number;
  validation_status?: 'pending' | 'processing' | 'approved' | 'rejected' | 'needs_review';
  validation_details?: any;
  description?: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export interface BGVReferenceResponse {
  id: number;
  verification_id: number;
  reference_name: string;
  reference_email: string;
  reference_phone?: string;
  relationship: string;
  company?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BGVOverallStatus {
  candidate_id: number;
  verification_id?: number;
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

  // Document Management
  uploadDocument: async (data: BGVDocumentCreate): Promise<BGVDocumentResponse> => {
    const formData = new FormData();
    formData.append("verification_id", data.verification_id.toString());
    formData.append("document_type", data.document_type);
    formData.append("file", data.file);
    if (data.description) formData.append("description", data.description);
    if (data.metadata) formData.append("metadata_json", JSON.stringify(data.metadata));

    return bgvApiRequest<BGVDocumentResponse>("/verification/documents/upload", {
      method: "POST",
      body: formData,
    });
  },

  getDocuments: async (verificationId: number): Promise<BGVDocumentResponse[]> => {
    return bgvApiRequest<BGVDocumentResponse[]>(`/verification/documents/${verificationId}`);
  },

  deleteDocument: async (documentId: number): Promise<void> => {
    return bgvApiRequest<void>(`/verification/documents/${documentId}`, {
      method: "DELETE",
    });
  },

  updateDocument: async (
    documentId: number,
    data: Partial<BGVDocumentCreate>
  ): Promise<BGVDocumentResponse> => {
    const formData = new FormData();
    if (data.verification_id) formData.append("verification_id", data.verification_id.toString());
    if (data.document_type) formData.append("document_type", data.document_type);
    if (data.file) formData.append("file", data.file);
    if (data.description) formData.append("description", data.description);
    if (data.metadata) formData.append("metadata_json", JSON.stringify(data.metadata));

    return bgvApiRequest<BGVDocumentResponse>(`/verification/documents/${documentId}`, {
      method: "PUT",
      body: formData,
    });
  },

  analyzeDocument: async (file: File, documentType: string): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType);

    return bgvApiRequest<any>("/bgv/documents/analyze-only", {
      method: "POST",
      body: formData,
    });
  },

  addReference: async (verificationId: number, data: {
    reference_name: string;
    reference_email: string;
    reference_phone?: string;
    relationship: string;
    company?: string;
  }): Promise<BGVReferenceResponse> => {
    return bgvApiRequest<BGVReferenceResponse>("/bgv/references", {
      method: "POST",
      body: JSON.stringify({
        verification_id: verificationId,
        ...data,
      }),
    });
  },

  deleteReference: async (referenceId: number): Promise<void> => {
    return bgvApiRequest<void>(`/bgv/references/${referenceId}`, {
      method: "DELETE",
    });
  },

  // Bulk Operations (Polyfill)
  bulkUploadDocuments: async (
    verificationId: number,
    documents: { file: File; document_type: string; description?: string }[]
  ): Promise<BGVDocumentResponse[]> => {
    // Sequentially upload since bulk is not supported in backend
    const results: BGVDocumentResponse[] = [];
    for (const doc of documents) {
      try {
        const result = await bgvApi.uploadDocument({
          verification_id: verificationId,
          document_type: doc.document_type,
          file: doc.file,
          description: doc.description
        });
        results.push(result);
      } catch (e) {
        console.error("Bulk upload partial failure:", e);
      }
    }
    return results;
  },

  // BGV AI & Submission Flows
  submitVerification: async (verificationId: number, candidateName: string): Promise<any> => {
    return bgvApiRequest<any>(`/bgv/verification/${verificationId}/submit?candidate_name=${encodeURIComponent(candidateName)}`, {
      method: "POST",
    });
  },

  getHRVerificationStatus: async (verificationId: number): Promise<any> => {
    return bgvApiRequest<any>(`/bgv/verification/${verificationId}/hr-status`);
  },
};
