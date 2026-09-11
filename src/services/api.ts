// API Service for Aimploy Backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "https://api.aimploy.org/api/v1";

// Types
export interface CandidateRegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface CandidateLoginRequest {
  email: string;
  password: string;
}

export interface OTPRequest {
  email: string;
}

export interface OTPVerifyRequest {
  email: string;
  otp: string;
}

export interface GoogleCallbackRequest {
  code: string;
  state?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterResponse {
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  id: number;
  is_active: boolean;
  created_at: string;
}

export interface Project {
  title: string;
  description?: string;
  technologies?: string[];
  github_url?: string;
  live_url?: string;
  start_date?: string;
  end_date?: string;
}

export interface Education {
  institution: string;
  degree?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  grade?: string;
  description?: string;
}

export interface ProfessionalExperience {
  company: string;
  position?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  location?: string;
  description?: string;
  achievements?: string[];
}

export interface Internship {
  company: string;
  position?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  description?: string;
}

export interface Certification {
  name: string;
  issuer?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
}

export interface Award {
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
}

export interface CandidateProfile {
  id: number;
  email: string;
  hashed_password?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  resume_url?: string;
  location?: string;
  projects?: Project[];
  education?: Education[];
  professional_experience?: ProfessionalExperience[];
  internships?: Internship[];
  certifications?: Certification[];
  awards?: Award[];
  skills?: string[];
  domain?: string;
  area_of_interest?: string;
  notice_period?: number;
  expected_salary?: number;
  current_salary?: number;
  years_of_experience?: number;
  professional_level?: string;
  profile_summary?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Job {
  id: number;
  company_id: number;
  title: string;
  description?: string;
  requirements?: string;
  location?: string;
  employment_type?: string;
  department?: string;
  salary_range?: string;
  status?: string;
  audio_questions?: string[];
  created_by?: number;
  created_at: string;
  updated_at?: string;
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Application {
  id: number;
  job_id: number;
  job?: {
    id: number;
    title: string;
    description?: string;
    location?: string;
    employment_type?: string;
    department?: string;
    salary_range?: string;
    status?: string;
    company_id: number;
  };
  status: string;
  match_score?: number;
  match_skills?: string[];
  missing_skills?: string[];
  additional_skills?: string[];
  candidate_name?: string;
  resume_url?: string;
  cover_letter?: string;
  previous_company_website?: string;
  created_at: string;
  updated_at?: string;
  reviewed_at?: string;
  audio_response?: any;
}

export interface ApplicationsResponse {
  applications: Application[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApplicationPrefill {
  full_name?: string;
  email: string;
  phone?: string;
  resume_url?: string;
  previous_company_website?: string;
}

export interface AudioQuestionsResponse {
  questions: string[];
  is_custom: boolean;
  total_questions: number;
}

// Helper function for API calls
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("access_token");
  
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
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("candidate_user");
      window.dispatchEvent(new Event("unauthorized"));
    }
    const errorData = await response.json().catch(() => null);
    
    let message = "";
    if (errorData && typeof errorData.detail === "string" && errorData.detail !== "Not Found") {
      message = errorData.detail;
    } else if (errorData && typeof errorData.message === "string") {
      message = errorData.message;
    } else if (response.status === 404) {
      message = "Service is currently updating. Please try logging in with password or try again shortly.";
    } else if (response.status === 500) {
      message = "Service is temporarily experiencing issues. Please try logging in with password or try again.";
    } else {
      message = "Unable to complete request. Please try again.";
    }

    const errObj = new Error(message);
    (errObj as any).status = response.status;
    (errObj as any).data = errorData;
    throw errObj;
  }

  return response.json();
}

// Auth APIs
export const authApi = {
  register: async (data: CandidateRegisterRequest): Promise<RegisterResponse> => {
    return apiRequest<RegisterResponse>("/candidate/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  registerWithResume: async (data: CandidateRegisterRequest, resume: File): Promise<RegisterResponse> => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    if (data.full_name) formData.append("full_name", data.full_name);
    if (data.first_name) formData.append("first_name", data.first_name);
    if (data.last_name) formData.append("last_name", data.last_name);
    if (data.phone) formData.append("phone", data.phone);
    formData.append("resume", resume);

    return apiRequest<RegisterResponse>("/candidate/register", {
      method: "POST",
      body: formData,
    });
  },

  login: async (data: CandidateLoginRequest): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>("/candidate/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  requestOTP: async (data: OTPRequest): Promise<{ message: string; expires_in: number }> => {
    return apiRequest<{ message: string; expires_in: number }>("/candidate/login/request-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  verifyOTP: async (data: OTPVerifyRequest): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>("/candidate/login/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getGoogleAuthUrl: async (): Promise<{ auth_url: string }> => {
    return apiRequest<{ auth_url: string }>("/candidate/login/google/url");
  },

  handleGoogleCallback: async (_code: string): Promise<AuthResponse> => {
    // This method is kept for compatibility but won't be used
    throw new Error("Google callback should be handled by redirect, not API call");
  },
};

// Profile APIs
export const profileApi = {
  getProfile: async (): Promise<CandidateProfile> => {
    return apiRequest<CandidateProfile>("/candidate/profile");
  },

  updateProfile: async (data: Partial<CandidateProfile>): Promise<CandidateProfile> => {
    return apiRequest<CandidateProfile>("/candidate/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  updateProfileWithResume: async (resume: File): Promise<CandidateProfile> => {
    const formData = new FormData();
    formData.append("resume", resume);

    return apiRequest<CandidateProfile>("/candidate/profile", {
      method: "PATCH",
      body: formData,
    });
  },
};

// Export token management utilities
export const tokenUtils = {
  setToken: (token: string) => {
    localStorage.setItem("access_token", token);
  },
  
  getToken: () => {
    return localStorage.getItem("access_token");
  },
  
  removeToken: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("candidate_user");
  },
  
  isTokenExpired: (token?: string | null): boolean => {
    const t = token || localStorage.getItem("access_token");
    if (!t) return true;
    try {
      const payloadBase64 = t.split('.')[1];
      if (!payloadBase64) return true;
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      if (!payload.exp) return false;
      return Date.now() >= payload.exp * 1000 - 10000;
    } catch {
      return false;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("access_token");
    if (!token) return false;
    if (tokenUtils.isTokenExpired(token)) {
      tokenUtils.removeToken();
      return false;
    }
    return true;
  },
};

// Jobs APIs
export const jobsApi = {
  getPublicJobs: async (params?: {
    page?: number;
    page_size?: number;
    location?: string;
    employment_type?: string;
    department?: string;
    search?: string;
  }): Promise<JobsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.page_size) searchParams.append("page_size", params.page_size.toString());
    if (params?.location) searchParams.append("location", params.location);
    if (params?.employment_type) searchParams.append("employment_type", params.employment_type);
    if (params?.department) searchParams.append("department", params.department);
    if (params?.search) searchParams.append("search", params.search);

    const query = searchParams.toString();
    
    // Use fetch directly for public endpoint (no authentication needed)
    const response = await fetch(`${API_BASE_URL}/public/jobs${query ? `?${query}` : ""}`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "An error occurred" }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  getJobs: async (params?: {
    page?: number;
    page_size?: number;
    location?: string;
    employment_type?: string;
    department?: string;
    search?: string;
  }): Promise<JobsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.page_size) searchParams.append("page_size", params.page_size.toString());
    if (params?.location) searchParams.append("location", params.location);
    if (params?.employment_type) searchParams.append("employment_type", params.employment_type);
    if (params?.department) searchParams.append("department", params.department);
    if (params?.search) searchParams.append("search", params.search);

    const query = searchParams.toString();
    return apiRequest<JobsResponse>(`/candidate/jobs${query ? `?${query}` : ""}`);
  },

  getJobById: async (jobId: number): Promise<Job> => {
    return apiRequest<Job>(`/candidate/jobs/${jobId}`);
  },

  getJobAudioQuestions: async (jobId: number): Promise<AudioQuestionsResponse> => {
    return apiRequest<AudioQuestionsResponse>(`/candidate/jobs/${jobId}/audio-questions`);
  },

  getApplicationPrefill: async (): Promise<ApplicationPrefill> => {
    return apiRequest<ApplicationPrefill>("/candidate/application-prefill");
  },

  applyForJob: async (
    jobId: number,
    data: {
      full_name: string;
      email: string;
      phone: string;
      resume: File;
      previous_company_website?: string;
      years_of_experience?: number;
      months_of_experience?: number;
      audio_q1?: File;
      audio_q2?: File;
      audio_q3?: File;
      audio_q4?: File;
      audio_q5?: File;
      audio_q6?: File;
    }
  ): Promise<Application> => {
    const formData = new FormData();
    formData.append("full_name", data.full_name);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("resume", data.resume);
    if (data.previous_company_website) {
      formData.append("previous_company_website", data.previous_company_website);
    }
    if (data.years_of_experience !== undefined) {
      formData.append("years_of_experience", data.years_of_experience.toString());
    }
    if (data.months_of_experience !== undefined) {
      formData.append("months_of_experience", data.months_of_experience.toString());
    }
    
    if (data.audio_q1) formData.append("audio_q1", data.audio_q1);
    if (data.audio_q2) formData.append("audio_q2", data.audio_q2);
    if (data.audio_q3) formData.append("audio_q3", data.audio_q3);
    if (data.audio_q4) formData.append("audio_q4", data.audio_q4);
    if (data.audio_q5) formData.append("audio_q5", data.audio_q5);
    if (data.audio_q6) formData.append("audio_q6", data.audio_q6);

    return apiRequest<Application>(`/candidate/jobs/${jobId}/apply`, {
      method: "POST",
      body: formData,
    });
  },

  checkJobEligibility: async (jobId: number): Promise<{
    eligible: boolean;
    detected_country?: string;
    detected_state?: string;
    restricted_country?: string;
    restricted_state?: string;
  }> => {
    const queryParams = new URLSearchParams(window.location.search);
    const mockCountry = queryParams.get("mockCountry");
    const mockState = queryParams.get("mockState");
    
    let url = `/candidate/jobs/${jobId}/check-eligibility`;
    const params = new URLSearchParams();
    if (mockCountry) params.append("mockCountry", mockCountry);
    if (mockState) params.append("mockState", mockState);
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
    
    return apiRequest<{
      eligible: boolean;
      detected_country?: string;
      detected_state?: string;
      restricted_country?: string;
      restricted_state?: string;
    }>(url);
  },
};

// Applications APIs
export const applicationsApi = {
  getMyApplications: async (params?: {
    page?: number;
    page_size?: number;
    application_status?: string;
  }): Promise<ApplicationsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.page_size) searchParams.append("page_size", params.page_size.toString());
    if (params?.application_status) searchParams.append("application_status", params.application_status);

    const query = searchParams.toString();
    return apiRequest<ApplicationsResponse>(`/candidate/applications${query ? `?${query}` : ""}`);
  },

  submitAudioForApplication: async (
    applicationId: number,
    audioFiles: Record<string, File>
  ): Promise<Application> => {
    const formData = new FormData();
    Object.entries(audioFiles).forEach(([key, file]) => {
      formData.append(key, file);
    });

    return apiRequest<Application>(`/candidate/applications/${applicationId}/submit-audio`, {
      method: "POST",
      body: formData,
    });
  },

  submitApplicationFeedback: async (
    applicationId: number,
    feedback: { rating: number; comment?: string }
  ): Promise<Application> => {
    return apiRequest<Application>(`/candidate/applications/${applicationId}/feedback`, {
      method: "POST",
      body: JSON.stringify(feedback),
    });
  },
};

// Programs Interfaces
export interface ProgramTrack {
  id: string;
  title: string;
  description: string;
  tags: string[];
  icon: string;
}

export interface ProgramHighlight {
  icon: string;
  text: string;
}

export interface Program {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  provider?: string;
  duration?: string;
  type?: string;
  tracks: ProgramTrack[];
  description?: string;
  highlights: ProgramHighlight[];
  is_paid: boolean;
  badge?: string;
  badge_color?: string;
  image?: string;
  start_date?: string;
  location?: string;
  created_at: string;
  updated_at?: string;
}

// Programs APIs
export const programsApi = {
  getPrograms: async (): Promise<Program[]> => {
    const response = await fetch(`${API_BASE_URL}/public/programs`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "An error occurred" }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  getProgramById: async (slug: string): Promise<Program> => {
    const response = await fetch(`${API_BASE_URL}/public/programs/${slug}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "An error occurred" }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  applyForProgram: async (slug: string, data: any): Promise<any> => {
    return apiRequest<any>(`/candidate/programs/${slug}/apply`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getMyProgramApplications: async (): Promise<any[]> => {
    return apiRequest<any[]>("/candidate/programs/applications", {
      method: "GET",
    });
  },
};

// Challenges Types & APIs
export interface Challenge {
  id: number;
  title: string;
  company: string;
  difficulty: string;
  difficulty_color?: string;
  time_limit?: string;
  prize?: string;
  status: string;
  status_color?: string;
  tags: string[];
  ends_in?: string;
  starts_in?: string;
  questions?: any[];
  duration_minutes?: number;
  num_questions?: number;
  participant_status?: string;
  participant_score?: number;
  participant_answers?: any;
  participant_completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChallengeStats {
  challenges_won: number;
  participated: number;
  total_points: number;
  global_rank: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  badge: string;
}

export const challengesApi = {
  getChallenges: async (): Promise<Challenge[]> => {
    return apiRequest<Challenge[]>("/challenges", {
      method: "GET",
    });
  },

  getStats: async (): Promise<ChallengeStats> => {
    return apiRequest<ChallengeStats>("/challenges/stats", {
      method: "GET",
    });
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    return apiRequest<LeaderboardEntry[]>("/challenges/leaderboard", {
      method: "GET",
    });
  },

  joinChallenge: async (challengeId: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/challenges/${challengeId}/join`, {
      method: "POST",
    });
  },

  startChallenge: async (challengeId: number): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/challenges/${challengeId}/start`, {
      method: "POST",
    });
  },

  submitChallenge: async (challengeId: number, answers: { question_id: string, selected_option: string }[]): Promise<{ message: string, score: number, correct_count: number, total_questions: number }> => {
    return apiRequest<{ message: string, score: number, correct_count: number, total_questions: number }>(`/challenges/${challengeId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  },
  
  submitCodeChallenge: async (challengeId: number, code: string, language: string, test_results: any[] = []): Promise<{ message: string, score: number, feedback?: string }> => {
    return apiRequest<{ message: string, score: number, feedback?: string }>(`/challenges/${challengeId}/submit_code`, {
      method: "POST",
      body: JSON.stringify({ code, language, test_results }),
    });
  },
};

