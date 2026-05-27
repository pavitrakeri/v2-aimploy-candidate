const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.aimploy.org";

export interface VerificationStartRequest {
  candidate_id: number;
  consent_given: boolean;
  no_criminal_record: boolean;
  verification_types: VerificationType[];
  initiated_by?: number;
  notes?: string;
}

export type VerificationType = 'identity' | 'address' | 'education' | 'employment' | 'criminal' | 'reference' | 'financial';

export interface VerificationResponse {
  id: number;
  candidate_id: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  consent_given: boolean;
  no_criminal_record: boolean;
  verification_types: string[];
  initiated_by?: number;
  initiated_at: string;
  completed_at?: string;
  notes?: string;
  failed_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ReferenceRequest {
  verification_id: number;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  company: string;
  designation?: string;
  years_known?: number;
  notes?: string;
}

export interface ReferenceResponse {
  id: number;
  verification_id: number;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  company: string;
  designation?: string;
  years_known?: number;
  status: 'pending' | 'contacted' | 'responded' | 'verified' | 'unable_to_contact' | 'declined';
  notes?: string;
  response_notes?: string;
  verification_notes?: string;
  contacted_at?: string;
  responded_at?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentUploadRequest {
  verification_id: number;
  document_type: string;
  description?: string;
  file: File;
}

export interface DocumentResponse {
  id: number;
  verification_id: number;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  status: 'uploaded' | 'pending_verification' | 'verified' | 'rejected' | 'expired';
  description?: string;
  expiry_date?: string;
  verification_notes?: string;
  verified_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  // OpenAI validation fields
  validation_score?: number;
  validation_details?: Record<string, any>;
  analysis_method?: string;
}

export interface VerificationStatus {
  candidate_id: number;
  verification_id: number;
  is_active: boolean;
  overall_status: string;
  progress_percentage: number;
  checks: VerificationCheck[];
  references_count: number;
  references_verified: number;
  documents_count: number;
  documents_verified: number;
  initiated_at: string;
  last_updated: string;
  estimated_completion?: string;
}

export interface VerificationCheck {
  verification_type: string;
  status: string;
  result?: string;
  verified_at?: string;
  notes?: string;
}

export interface VerificationLog {
  id: number;
  verification_id: number;
  action: string;
  description?: string;
  performed_by?: number;
  metadata?: any;
  created_at: string;
}

class VerificationAPI {
  private baseURL = `${API_BASE_URL}/api/v1/verification`;

  // Verification Management
  async startVerification(request: VerificationStartRequest): Promise<VerificationResponse> {
    const response = await fetch(`${this.baseURL}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to start verification: ${response.statusText}`);
    }

    return response.json();
  }

  async getVerification(verificationId: number): Promise<VerificationResponse> {
    const response = await fetch(`${this.baseURL}/${verificationId}`);

    if (!response.ok) {
      throw new Error(`Failed to get verification: ${response.statusText}`);
    }

    return response.json();
  }

  async updateVerification(verificationId: number, updates: Partial<VerificationResponse>): Promise<VerificationResponse> {
    const response = await fetch(`${this.baseURL}/${verificationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update verification: ${response.statusText}`);
    }

    return response.json();
  }

  async getCandidateVerificationStatus(candidateId: number): Promise<VerificationStatus> {
    const response = await fetch(`${this.baseURL}/candidate/${candidateId}`);

    if (!response.ok) {
      throw new Error(`Failed to get candidate verification status: ${response.statusText}`);
    }

    return response.json();
  }

  // Reference Management
  async addReference(request: ReferenceRequest): Promise<ReferenceResponse> {
    const response = await fetch(`${this.baseURL}/references`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to add reference: ${response.statusText}`);
    }

    return response.json();
  }

  async getReferences(verificationId: number): Promise<ReferenceResponse[]> {
    const response = await fetch(`${this.baseURL}/references/${verificationId}`);

    if (!response.ok) {
      throw new Error(`Failed to get references: ${response.statusText}`);
    }

    return response.json();
  }

  async updateReference(referenceId: number, updates: Partial<ReferenceResponse>): Promise<ReferenceResponse> {
    const response = await fetch(`${this.baseURL}/references/${referenceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update reference: ${response.statusText}`);
    }

    return response.json();
  }

  async submitReferenceResponse(referenceId: number, response: { respondent_name: string; response_data: any }): Promise<void> {
    const fetchResponse = await fetch(`${this.baseURL}/references/${referenceId}/response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    });

    if (!fetchResponse.ok) {
      throw new Error(`Failed to submit reference response: ${fetchResponse.statusText}`);
    }
  }

  // Document Management
  async uploadDocument(request: DocumentUploadRequest): Promise<DocumentResponse> {
    const formData = new FormData();
    formData.append('verification_id', request.verification_id.toString());
    formData.append('document_type', request.document_type);
    if (request.description) {
      formData.append('description', request.description);
    }
    formData.append('file', request.file);

    const response = await fetch(`${this.baseURL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload document: ${response.statusText}`);
    }

    return response.json();
  }

  async bulkUploadDocuments(verificationId: number, documents: { file: File; document_type: string; description?: string }[]): Promise<DocumentResponse[]> {
    const formData = new FormData();
    formData.append('verification_id', verificationId.toString());
    
    documents.forEach((doc, index) => {
      formData.append(`documents`, doc.file);
      formData.append(`document_types`, doc.document_type);
      if (doc.description) {
        formData.append(`descriptions`, doc.description);
      }
    });

    const response = await fetch(`${this.baseURL}/documents/bulk-upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to bulk upload documents: ${response.statusText}`);
    }

    const result = await response.json();
    return result.documents;
  }

  async getDocuments(verificationId: number): Promise<DocumentResponse[]> {
    const response = await fetch(`${this.baseURL}/documents/${verificationId}`);

    if (!response.ok) {
      throw new Error(`Failed to get documents: ${response.statusText}`);
    }

    return response.json();
  }

  async updateDocument(documentId: number, updates: Partial<DocumentResponse>): Promise<DocumentResponse> {
    const response = await fetch(`${this.baseURL}/documents/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update document: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteDocument(documentId: number): Promise<void> {
    const response = await fetch(`${this.baseURL}/documents/${documentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.statusText}`);
    }
  }

  // Logging and Audit
  async getVerificationLogs(verificationId: number): Promise<VerificationLog[]> {
    const response = await fetch(`${this.baseURL}/logs/${verificationId}`);

    if (!response.ok) {
      throw new Error(`Failed to get verification logs: ${response.statusText}`);
    }

    return response.json();
  }

  // Consent Management
  async recordConsent(verificationId: number, consentGiven: boolean): Promise<void> {
    const formData = new FormData();
    formData.append('verification_id', verificationId.toString());
    formData.append('consent_given', consentGiven.toString());

    const response = await fetch(`${this.baseURL}/consent`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to record consent: ${response.statusText}`);
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; module: string }> {
    const response = await fetch(`${this.baseURL}/health`);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const verificationAPI = new VerificationAPI();
