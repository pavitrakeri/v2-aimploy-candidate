import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, profileApi, tokenUtils, CandidateProfile, AuthResponse } from "@/services/api";

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
  const [user, setUser] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const profile = await profileApi.getProfile();
      setUser(profile);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      tokenUtils.removeToken();
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (tokenUtils.isAuthenticated()) {
        await fetchProfile();
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const handleAuthSuccess = async (response: AuthResponse) => {
    tokenUtils.setToken(response.access_token);
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
    const response = await authApi.googleCallback({ code, state });
    await handleAuthSuccess(response);
  };

  const logout = () => {
    tokenUtils.removeToken();
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
