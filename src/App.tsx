import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import { VerificationProvider } from "@/contexts/VerificationContext";
import { BGVProvider } from "@/contexts/BGVContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import GoogleCallback from "./pages/auth/GoogleCallback";
import DigiLockerCallback from "./pages/auth/DigiLockerCallback";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import BrowseJobs from "./pages/dashboard/BrowseJobs";
import JobApply from "./pages/dashboard/JobApply";
import Applications from "./pages/dashboard/Applications";
import Programs from "./pages/dashboard/Programs";
import ProgramDetails from "./pages/dashboard/ProgramDetails";
import ProgramApply from "./pages/dashboard/ProgramApply";
import Challenges from "./pages/dashboard/Challenges";
import Verification from "./pages/dashboard/Verification";
import VerificationManagement from "./pages/dashboard/VerificationManagement";
import BGVVerificationWrapper from "./pages/dashboard/BGVVerificationWrapper";
import ValidationDemo from '@/components/verification/ValidationDemo';
import ResumeBuilder from "./pages/dashboard/ResumeBuilder";
import Profile from "./pages/dashboard/Profile";
import NotFound from "./pages/NotFound";
import UserGuidance from "./pages/UserGuidance";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CandidateAssessmentProfileV2 from "./pages/dashboard/CandidateAssessmentProfileV2";
import JobApplyV2 from "./pages/dashboard/JobApplyV2";
import RefereePortalV2 from "./pages/RefereePortalV2";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="aimploy-theme">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <VerificationProvider>
          <BGVProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/user-guidance" element={<UserGuidance />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />
                <Route path="/bgv/digilocker/callback" element={<DigiLockerCallback />} />
                <Route path="/programs" element={<Programs />} />
                <Route path="/programs/:programId" element={<ProgramDetails />} />
                <Route path="/programs/apply/:programId" element={<ProgramApply />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="jobs" element={<BrowseJobs />} />
                  <Route path="applications" element={<Applications />} />
                  <Route path="resume-builder" element={<ResumeBuilder />} />
                  <Route path="programs" element={<Programs />} />
                  <Route path="programs/:programId" element={<ProgramDetails />} />
                  <Route path="programs/apply/:programId" element={<ProgramApply />} />
                  <Route path="challenges" element={<Challenges />} />
                  <Route path="verification" element={<Verification />} />
                  <Route path="verification-management" element={<VerificationManagement />} />
                  <Route path="bgv-verification" element={<BGVVerificationWrapper />} />
                  <Route path="validation-demo" element={<ValidationDemo />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="assessment-v2" element={<CandidateAssessmentProfileV2 />} />
                </Route>
              <Route 
                path="/dashboard/jobs/:jobId" 
                element={
                  <ProtectedRoute>
                    <JobApply />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/jobs/:jobId/apply" 
                element={
                  <ProtectedRoute>
                    <JobApply />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/jobs/:jobId/apply-v2" 
                element={
                  <ProtectedRoute>
                    <JobApplyV2 />
                  </ProtectedRoute>
                } 
              />
              <Route path="/references-v2/:token" element={<RefereePortalV2 />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
          </BGVProvider>
        </VerificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
