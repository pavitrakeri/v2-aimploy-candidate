/**
 * AImploy v2 API Client for Candidates & Referees
 * Handles Audio uploads, Segment 1-3 submissions, and Segment 4 witness portal.
 */

export const getApiV2BaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_V2_URL;
  if (envUrl) {
    if (envUrl.includes("/api/v2")) {
      return envUrl.replace(/\/+$/, "");
    }
    return `${envUrl.replace(/\/+$/, "")}/api/v2`;
  }
  return "https://v2-aimploy-backend.onrender.com/api/v2";
};

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("candidate_access_token") || localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface AudioTranscribeResult {
  question_id: string;
  transcript: string;
  audio_url: string;
  duration_seconds: number;
  is_silent: boolean;
}

export interface RefereePortalData {
  id?: number;
  application_id?: number;
  candidate_name: string;
  job_title: string;
  company_name: string;
  questions: Array<{ id: string; question: string; captures?: string }>;
  referee_name?: string;
  relationship?: string;
}

export const apiV2 = {
  /**
   * Upload an audio blob and transcribe it using OpenAI Whisper
   */
  async transcribeAudio(
    blob: Blob,
    questionId: string,
    entityType: "candidate" | "referee" = "candidate",
    entityId?: number,
    language?: string
  ): Promise<AudioTranscribeResult> {
    const baseUrl = getApiV2BaseUrl();
    const formData = new FormData();
    const filename = `${questionId}_${Date.now()}.webm`;
    formData.append("file", blob, filename);
    formData.append("question_id", questionId);
    formData.append("entity_type", entityType);
    if (entityId) formData.append("entity_id", String(entityId));
    if (language) formData.append("language", language);

    const res = await fetch(`${baseUrl}/audio/transcribe`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Transcription failed" }));
      throw new Error(err.detail || "Failed to transcribe audio");
    }

    return await res.json();
  },

  /**
   * Fetch candidate assessment profile (Segments 1 & 2)
   */
  async getCandidateAssessmentProfile(candidateId: number) {
    const baseUrl = getApiV2BaseUrl();
    const res = await fetch(`${baseUrl}/candidate/profile/assessment/${candidateId}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) return null;
    return await res.json();
  },

  /**
   * Save candidate assessment profile (Segments 1 & 2)
   */
  async saveCandidateAssessmentProfile(payload: {
    candidate_id: number;
    segment_1: Record<string, any>;
    segment_2: Record<string, any>;
  }) {
    const baseUrl = getApiV2BaseUrl();
    const res = await fetch(`${baseUrl}/candidate/profile/assessment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to save profile" }));
      throw new Error(err.detail || "Failed to save candidate assessment profile");
    }

    return await res.json();
  },

  /**
   * Submit Job Application v2 (Segment 3 + Referee nominations)
   */
  async submitApplicationV2(
    applicationId: number,
    payload: {
      job_id: number;
      segment_3_answers: Record<string, any>;
      referees: Array<{
        name: string;
        email: string;
        relationship: string;
        linkedin_url?: string;
      }>;
    }
  ) {
    const baseUrl = getApiV2BaseUrl();
    const res = await fetch(`${baseUrl}/candidate/applications/${applicationId}/submit-v2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        application_id: applicationId,
        ...payload,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Submission failed" }));
      throw new Error(err.detail || "Failed to submit application");
    }

    return await res.json();
  },

  /**
   * Trigger v2 3-run median evaluation
   */
  async runEvaluation(applicationId: number) {
    const baseUrl = getApiV2BaseUrl();
    const res = await fetch(`${baseUrl}/evaluation/run/${applicationId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Evaluation trigger failed" }));
      throw new Error(err.detail || "Failed to trigger evaluation");
    }

    return await res.json();
  },

  /**
   * Fetch public referee portal for invited witness
   */
  async getRefereePortal(token: string): Promise<RefereePortalData> {
    const baseUrl = getApiV2BaseUrl();
    const res = await fetch(`${baseUrl}/public/references/${token}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Token invalid or expired" }));
      throw new Error(err.detail || "Referee portal link invalid or expired");
    }
    const data = await res.json();
    return data.referee_data;
  },

  /**
   * Submit referee answers with anti-fraud telemetry
   */
  async submitRefereeResponse(
    token: string,
    payload: {
      referee_name?: string;
      relationship_confirmed?: string;
      answers: Record<string, string>;
      client_device_fingerprint?: string;
    }
  ) {
    const baseUrl = getApiV2BaseUrl();
    const res = await fetch(`${baseUrl}/public/references/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        referee_name: payload.referee_name || "Verified Referee",
        relationship_confirmed: payload.relationship_confirmed || "Professional Reference",
        answers: payload.answers,
        client_device_fingerprint: payload.client_device_fingerprint || navigator.userAgent,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Submission failed" }));
      throw new Error(err.detail || "Failed to submit referee response");
    }

    return await res.json();
  },

  /**
   * Fetch plain-language candidate strengths summary (Slide 17 footnote)
   */
  async getCandidateStrengths(applicationId: number) {
    const baseUrl = getApiV2BaseUrl();
    const res = await fetch(`${baseUrl}/evaluation/candidate-strengths/${applicationId}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) return null;
    return await res.json();
  },

  /**
   * Check if a job has an approved v2 Role Profile
   */
  async getRoleProfile(jobId: number) {
    const baseUrl = getApiV2BaseUrl();
    try {
      const res = await fetch(`${baseUrl}/company/roles/${jobId}/profile`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.role_profile || data;
    } catch {
      return null;
    }
  },

  /**
   * Submit voluntary isolated diversity demographic data for NYC LL144 & EEOC adverse impact monitoring
   */
  async submitVoluntaryDiversity(payload: {
    candidateId?: number;
    applicationId?: number;
    gender?: string;
    ageBracket?: string;
    ethnicityRegion?: string;
    disabilityOrNeurodiversity?: string;
  }) {
    const baseUrl = getApiV2BaseUrl();
    try {
      const res = await fetch(`${baseUrl}/analytics/diversity/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          candidate_id: payload.candidateId,
          application_id: payload.applicationId,
          gender: payload.gender,
          age_bracket: payload.ageBracket,
          ethnicity_region: payload.ethnicityRegion,
          disability_or_neurodiversity: payload.disabilityOrNeurodiversity,
        }),
      });
      return await res.json();
    } catch {
      return { success: true };
    }
  },
};

