import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ShieldCheck, CheckCircle2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiV2, RefereePortalData } from "@/services/apiV2";

const DEFAULT_REFEREE_QUESTIONS = [
  { id: "4.1", text: "How do you know the candidate, and for how long?", hint: "Validates tenure and relationship context against their CV." },
  { id: "4.2", text: "Describe something they did that made a real difference.", hint: "Provides independent corroboration for their past work achievements." },
  { id: "4.3", text: "What would you ask them to do more of?", hint: "Highlights their highest-impact strengths." },
  { id: "4.4", text: "In what situations do they need the most support?", hint: "Identifies manager onboarding needs (not a penalty)." },
  { id: "4.5", text: "Would you work with them again? Why?", hint: "Evaluates endorsement specificity." },
];

export const RefereePortalV2 = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [candidateName, setCandidateName] = useState("Alex Morgan");
  const [jobTitle, setJobTitle] = useState("Operations Coordinator");
  const [companyName, setCompanyName] = useState("Aimploy Partner");
  const [questions, setQuestions] = useState(DEFAULT_REFEREE_QUESTIONS);
  const [answers, setAnswers] = useState<Record<string, string>>({
    "4.1": "",
    "4.2": "",
    "4.3": "",
    "4.4": "",
    "4.5": "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortalData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data: RefereePortalData = await apiV2.getRefereePortal(token);
        if (data) {
          if (data.candidate_name) setCandidateName(data.candidate_name);
          if (data.job_title) setJobTitle(data.job_title);
          if (data.company_name) setCompanyName(data.company_name);
          if (data.questions && data.questions.length > 0) {
            setQuestions(
              data.questions.map((q) => ({
                id: q.id,
                text: q.question,
                hint: q.captures || "Provides independent corroboration for their application.",
              }))
            );
          }
        }
      } catch (err: any) {
        console.warn("Could not load referee details from backend, falling back to defaults:", err);
        setFetchError(err.message || "Failed to load referee invitation details");
      } finally {
        setLoading(false);
      }
    };

    fetchPortalData();
  }, [token]);

  const handleSubmit = async () => {
    if (!answers["4.1"] || !answers["4.2"] || !answers["4.5"]) {
      toast({
        title: "Required Fields Missing",
        description: "Please answer at least questions 4.1, 4.2, and 4.5.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      if (token) {
        await apiV2.submitRefereeResponse(token, {
          answers,
          client_device_fingerprint: navigator.userAgent,
        });
      }
      setSubmitted(true);
      toast({
        title: "Endorsement Recorded",
        description: "Thank you for verifying and supporting the candidate's career journey.",
      });
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.message || "Could not record endorsement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading verification portal...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
        <Card className="max-w-md w-full text-center p-8 border-emerald-500/20 shadow-xl">
          <CardContent className="space-y-4 pt-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-bold">Thank You!</h2>
            <p className="text-sm text-muted-foreground">
              Your endorsement for <strong>{candidateName}</strong> has been securely submitted and linked to their application for <strong>{jobTitle}</strong>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-muted/10">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-3 py-1">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Witness Network Verification
          </Badge>
          <h1 className="text-2xl font-bold">Reference Endorsement for {candidateName}</h1>
          <p className="text-sm text-muted-foreground">
            Role: <strong>{jobTitle}</strong> at <strong>{companyName}</strong>
          </p>
          {fetchError && (
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Note: Running in offline/preview mode.
            </p>
          )}
        </div>

        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">5 Quick Verification Questions (~2 mins)</CardTitle>
            <CardDescription>
              Your honest perspective provides independent corroboration and helps the hiring team understand how to best support {candidateName}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((q) => (
              <div key={q.id} className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{q.id}</Badge>
                  {q.text}
                </Label>
                <p className="text-xs text-muted-foreground">{q.hint}</p>
                <Textarea
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder="Share a concise, concrete example..."
                  className="text-sm min-h-[90px]"
                />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-primary hover:bg-primary/90">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Submit Endorsement <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RefereePortalV2;
