// API Service for Aimploy Backend
const API_BASE_URL = "https://aimploy.onrender.com/api/v1";

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
  created_at: string;
  updated_at?: string;
  reviewed_at?: string;
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
    const error = await response.json().catch(() => ({ detail: "An error occurred" }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
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
    return apiRequest("/candidate/login/request-otp", {
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
    return apiRequest("/candidate/login/google/url");
  },

  googleCallback: async (data: GoogleCallbackRequest): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>("/candidate/login/google/callback", {
      method: "POST",
      body: JSON.stringify(data),
    });
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

// Jobs APIs
export const jobsApi = {
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
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem("access_token");
  },
};
