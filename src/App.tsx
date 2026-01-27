import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import GoogleCallback from "./pages/auth/GoogleCallback";
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
import Profile from "./pages/dashboard/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
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
              <Route path="programs" element={<Programs />} />
              <Route path="challenges" element={<Challenges />} />
              <Route path="verification" element={<Verification />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="/dashboard/programs/:programId" element={<ProgramDetails />} />
            <Route path="/dashboard/programs/apply/:programId" element={<ProgramApply />} />
            <Route path="/dashboard/jobs/:jobId/apply" element={<JobApply />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
