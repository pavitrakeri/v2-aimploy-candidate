// DigiLocker API Service for BGV Integration

// Types
export interface DigiLockerRequestCreate {
  verification_id: number;
  candidate_id: number;
  redirect_url: string;
}

export interface DigiLockerRequestResponse {
  id: string;
  status: 'unauthenticated' | 'authenticated' | 'revoked';
  url: string;
  valid_upto: string;
  digilocker_user_details?: {
    digilockerId: string;
    email?: string;
    phoneNumber?: string;
  };
}

export interface DigiLockerDocumentParameter {
  name: string;
  value: string;
}

export interface DigiLockerDocumentFetch {
  doc_type: string;
  org_id: string;
  format: string;
  consent: string;
  parameters: DigiLockerDocumentParameter[];
}

export interface DigiLockerDocumentResponse {
  file_url: string;
  valid_upto: string;
  doc_type: string;
  org_id: string;
  format: string;
}

export interface DigiLockerAvailableDocument {
  doc_type: string;
  org_id: string;
  org_name: string;
  description: string;
  available_formats: string[];
  parameters: Array<{
    name: string;
    description: string;
  }>;
}

export interface DigiLockerDocumentsList {
  documents: DigiLockerAvailableDocument[];
}

export interface DigiLockerAadhaarData {
  name: string;
  date_of_birth: string;
  gender: string;
  address: {
    house: string;
    street: string;
    locality: string;
    landmark: string;
    postOffice: string;
    vtc: string;
    subDistrict: string;
    district: string;
    state: string;
    pin: string;
    country: string;
  };
  masked_number: string;
  email?: string;
  phone?: string;
  photo?: string;
  verified: {
    email: boolean;
    phone: boolean;
    signature: boolean;
  };
  generated_at: string;
}

export interface DigiLockerAadhaarResponse {
  aadhaar: DigiLockerAadhaarData;
  id: string;
  status: string;
}

export interface DigiLockerCallbackResponse {
  success: boolean;
  request_id: string;
  verification_id?: number;
  candidate_id?: number;
  scope?: string;
  user_details?: {
    digilockerId: string;
    email?: string;
    phoneNumber?: string;
  };
  status: string;
}

export interface DigiLockerDocumentLink {
  id: number;
  verification_id: number;
  digilocker_doc_type: string;
  digilocker_org_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  file_format: string;
  fetched_at: string;
  expires_at: string;
  is_verified: boolean;
  verification_score: number;
}

// API Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class DigiLockerAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('access_token');
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('DigiLocker API Error:', error);
      throw error;
    }
  }

  // Create DigiLocker request
  async createRequest(verificationId: number, candidateId: number): Promise<DigiLockerRequestResponse> {
    const formData = new FormData();
    formData.append('verification_id', verificationId.toString());
    formData.append('candidate_id', candidateId.toString());

    const token = localStorage.getItem('access_token');
    const url = `${this.baseURL}/digilocker/request`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Get request status
  async getRequestStatus(requestId: string): Promise<DigiLockerRequestResponse> {
    return this.request<DigiLockerRequestResponse>(`/digilocker/request/${requestId}/status`);
  }

  // Get available documents
  async getAvailableDocuments(requestId: string): Promise<DigiLockerDocumentsList> {
    return this.request<DigiLockerDocumentsList>(`/digilocker/documents?request_id=${requestId}`);
  }

  // Get documents for BGV type
  async getDocumentsForBGVType(bgvType: string): Promise<{
    bgv_type: string;
    available_documents: Array<{
      doc_type: string;
      org_id: string;
      description: string;
    }>;
    count: number;
  }> {
    return this.request(`/digilocker/documents/${bgvType}`);
  }

  // Fetch document
  async fetchDocument(
    requestId: string,
    uri: string
  ): Promise<DigiLockerDocumentResponse> {
    const formData = new FormData();
    formData.append('request_id', requestId);
    formData.append('uri', uri);

    const token = localStorage.getItem('access_token');
    const url = `${this.baseURL}/digilocker/fetch-document`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Fetch Aadhaar data
  async fetchAadhaarData(requestId: string): Promise<DigiLockerAadhaarResponse> {
    return this.request<DigiLockerAadhaarResponse>(`/digilocker/fetch-aadhaar/${requestId}`);
  }

  // Download document
  async downloadDocument(
    requestId: string,
    uri: string,
    verificationId: number,
    documentType: string
  ): Promise<{ message: string; document: DigiLockerDocumentLink; file_size: number }> {
    const formData = new FormData();
    formData.append('uri', uri);
    formData.append('verification_id', verificationId.toString());
    formData.append('document_type', documentType);

    const token = localStorage.getItem('access_token');
    const url = `${this.baseURL}/digilocker/download-document/${requestId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Handle callback (this would be called by your backend redirect handler)
  async handleCallback(callbackParams: {
    request_id: string;
    success: boolean;
    verification_id?: number;
    candidate_id?: number;
    scope?: string;
    errCode?: string;
    errMessage?: string;
  }): Promise<DigiLockerCallbackResponse> {
    const params = new URLSearchParams();
    Object.entries(callbackParams).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    return this.request<DigiLockerCallbackResponse>(`/digilocker/callback?${params.toString()}`);
  }

  // Revoke access token
  async revokeAccessToken(requestId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/digilocker/revoke/${requestId}`, {
      method: 'POST',
    });
  }

  // Get BGV-DigiLocker mapping
  async getBGVDigiLockerMapping(): Promise<Record<string, Array<{
    doc_type: string;
    org_id: string;
    description: string;
  }>>> {
    return this.request<Record<string, Array<{
      doc_type: string;
      org_id: string;
      description: string;
    }>>>('/digilocker/mapping');
  }

  // Health check
  async healthCheck(): Promise<{
    status: string;
    service: string;
    timestamp: string;
  }> {
    return this.request('/digilocker/health');
  }

  // Helper method to generate redirect URL
  generateRedirectURL(verificationId: number, candidateId: number): string {
    const baseURL = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    return `${baseURL}/bgv/digilocker/callback?verification_id=${verificationId}&candidate_id=${candidateId}`;
  }

  // Helper method to open DigiLocker in popup
  openDigiLockerPopup(digiLockerUrl: string, codeVerifier?: string): Promise<DigiLockerCallbackResponse> {
    return new Promise((resolve, reject) => {
      const popup = window.open(
        digiLockerUrl,
        'digilocker',
        'width=800,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for this site.'));
        return;
      }

      let settled = false; // prevent double resolve/reject

      // Listen for messages from the popup
      const messageHandler = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) {
          return;
        }

        if (event.data.type === 'DIGILOCKER_CALLBACK') {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener('message', messageHandler);

          if (event.data.success && event.data.errCode) {
            // event.data.errCode = auth code from DigiLocker
            // event.data.request_id = state (base64-encoded JSON with id/v_id/c_id)
            try {
              // Complete PKCE token exchange on the backend
              const redirectUri = `${window.location.origin}/bgv/digilocker/callback`;
              const tokenResponse = await this.completeTokenExchange(
                event.data.errCode || event.data.code,
                redirectUri,
                codeVerifier,
                event.data.request_id  // ✅ Fixed: use request_id (the state value)
              );
              if (!settled) { settled = true; resolve({ ...event.data, ...tokenResponse }); }
            } catch (err) {
              if (!settled) { settled = true; resolve(event.data); }
            }
          } else if (event.data.success) {
            if (!settled) { settled = true; resolve(event.data); }
          } else {
            if (!settled) { settled = true; reject(new Error(event.data.error || 'DigiLocker authentication failed')); }
          }
        }
      };

      window.addEventListener('message', messageHandler);

      // Check if popup was closed manually — only reject if no message was received
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          // Give a brief delay so any pending postMessage can still arrive
          setTimeout(() => {
            if (!settled) { settled = true; reject(new Error('DigiLocker authentication was cancelled')); }
          }, 500);
        }
      }, 1000);

      // Auto-cleanup after 10 minutes
      setTimeout(() => {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        if (!popup.closed) {
          popup.close();
        }
        if (!settled) { settled = true; reject(new Error('DigiLocker authentication timed out')); }
      }, 10 * 60 * 1000);
    });
  }

  // Complete token exchange after OAuth callback (PKCE)
  async completeTokenExchange(code: string, redirectUri: string, codeVerifier?: string, state?: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/digilocker/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify({ code, redirect_uri: redirectUri, code_verifier: codeVerifier, state })
    });
    if (!response.ok) return {};
    return response.json();
  }
}

export const digiLockerApi = new DigiLockerAPI();
