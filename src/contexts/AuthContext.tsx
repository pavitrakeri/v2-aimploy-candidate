import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, profileApi, tokenUtils, CandidateProfile, AuthResponse } from "@/services/api";
import { useTheme } from "@/components/ThemeProvider";

interface AuthContextType {
  user: CandidateProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOTP: (email: string, otp: string) => Promise<void>;
  requestOTP: (email: string) => Promise<{ message: string; expires_in: number }>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  handleGoogleCallback: (code: string, state?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { setTheme } = useTheme();
  const [user, setUser] = useState<CandidateProfile | null>(() => {
    if (tokenUtils.isAuthenticated()) {
      const cached = localStorage.getItem("candidate_user");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const profile = await profileApi.getProfile();
      setUser(profile);
      localStorage.setItem("candidate_user", JSON.stringify(profile));
    } catch (error: any) {
      console.error("Failed to fetch profile:", error);
      const is401 = error?.status === 401 ||
        (error instanceof Error && (
          error.message.includes("401") ||
          error.message.includes("unauthorized") ||
          error.message.includes("Invalid authentication credentials")
        ));

      if (is401 || tokenUtils.isTokenExpired()) {
        tokenUtils.removeToken();
        localStorage.removeItem("candidate_user");
        localStorage.removeItem("aimploy-theme");
        setTheme("light");
        setUser(null);
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (tokenUtils.isAuthenticated()) {
        await fetchProfile();
      } else {
        localStorage.removeItem("candidate_user");
        localStorage.removeItem("aimploy-theme");
        setTheme("light");
        setUser(null);
      }
      setIsLoading(false);
    };
    initAuth();

    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, [setTheme]);

  const handleAuthSuccess = async (response: AuthResponse) => {
    tokenUtils.setToken(response.access_token);
    localStorage.removeItem("aimploy-theme");
    setTheme("light");
    await fetchProfile();
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    await handleAuthSuccess(response);
  };

  const loginWithOTP = async (email: string, otp: string) => {
    const response = await authApi.verifyOTP({ email, otp });
    await handleAuthSuccess(response);
  };

  const requestOTP = async (email: string) => {
    return authApi.requestOTP({ email });
  };

  const register = async (email: string, password: string, fullName?: string) => {
    await authApi.register({ email, password, full_name: fullName });
    // After registration, log them in
    await login(email, password);
  };

  const loginWithGoogle = async () => {
    const { auth_url } = await authApi.getGoogleAuthUrl();
    window.location.href = auth_url;
  };

  const handleGoogleCallback = async (code: string, state?: string) => {
    // Make direct API call to GET callback endpoint
    const params = new URLSearchParams({ code });
    if (state) params.append('state', state);
    
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "https://api.aimploy.org/api/v1"}/candidate/login/google/callback?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "An error occurred" }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    const authResponse = await response.json();
    await handleAuthSuccess(authResponse);
  };

  const logout = () => {
    tokenUtils.removeToken();
    localStorage.removeItem("candidate_user");
    localStorage.removeItem("aimploy-theme");
    setTheme("light");
    setUser(null);
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithOTP,
        requestOTP,
        register,
        loginWithGoogle,
        handleGoogleCallback,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
