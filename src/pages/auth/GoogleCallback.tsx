import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGoogleCallback } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError("Google authentication was cancelled or failed");
        toast({
          title: "Authentication Failed",
          description: "Google sign-in was cancelled or failed",
          variant: "destructive",
        });
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      if (!code) {
        setError("No authorization code received");
        toast({
          title: "Authentication Failed",
          description: "No authorization code received from Google",
          variant: "destructive",
        });
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      try {
        await handleGoogleCallback(code, state || undefined);
        toast({ title: "Success", description: "Successfully signed in with Google!" });
        navigate("/dashboard", { replace: true });
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to complete authentication");
        toast({
          title: "Authentication Failed",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    processCallback();
  }, [searchParams, handleGoogleCallback, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      {error ? (
        <div className="text-center">
          <p className="text-destructive mb-2">{error}</p>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium">Completing sign in...</p>
          <p className="text-muted-foreground">Please wait while we authenticate you with Google</p>
        </div>
      )}
    </div>
  );
};

export default GoogleCallback;
