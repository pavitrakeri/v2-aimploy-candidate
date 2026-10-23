import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Quote,
} from "lucide-react";
import { apiV2 } from "@/services/apiV2";

interface StrengthThemeItem {
  theme: string;
  summary: string;
  evidence_highlight?: string;
  impact_context?: string;
}

interface CandidateStrengthsData {
  candidate_name: string;
  headline: string;
  strengths: StrengthThemeItem[];
  work_style_fit: string;
  growth_recommendations: string[];
  summary_note?: string;
}

interface CandidateStrengthsModalProps {
  applicationId: number | null;
  jobTitle?: string;
  companyName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CandidateStrengthsModal = ({
  applicationId,
  jobTitle,
  companyName,
  isOpen,
  onClose,
}: CandidateStrengthsModalProps) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CandidateStrengthsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !applicationId) {
      setData(null);
      setError(null);
      return;
    }

    const fetchStrengths = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiV2.getCandidateStrengths(applicationId);
        if (result) {
          setData(result);
        } else {
          setError("Strengths feedback report is still being generated or pending evaluation.");
        }
      } catch (err: any) {
        console.error("Error fetching candidate strengths:", err);
        setError("Unable to load strengths summary at this time. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStrengths();
  }, [isOpen, applicationId]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-8">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Plain-Language Strengths Report
            </span>
            <span className="text-xs text-muted-foreground">v2 Research-Backed Feedback</span>
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {data?.headline || "Your Behavioral Strengths Profile"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {jobTitle && companyName
              ? `Feedback synthesized for your application to ${jobTitle} at ${companyName}.`
              : "Derived strictly from what you shared during your structured questionnaire."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Synthesizing strengths and evidence quotes...</p>
          </div>
        ) : error ? (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{error}</p>
            <p className="text-xs text-muted-foreground">
              Note: Strengths summaries are generated automatically once your application questionnaire has been evaluated.
            </p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Top Strengths Grid */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Strengths Evidenced
              </h4>
              <div className="grid gap-3">
                {data.strengths && data.strengths.length > 0 ? (
                  data.strengths.map((str, idx) => (
                    <Card key={idx} className="border-border/60 bg-muted/30">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-foreground">{str.theme}</span>
                          <Badge variant="secondary" className="text-[10px] font-normal uppercase">
                            Demonstrated Agency
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{str.summary}</p>
                        {str.evidence_highlight && (
                          <div className="flex items-start gap-2 bg-background p-2.5 rounded-lg border text-xs text-foreground/90 italic">
                            <Quote className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            <span>"{str.evidence_highlight}"</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">Strengths details will appear here once processed.</p>
                )}
              </div>
            </div>

            {/* Work Style & Environment Alignment */}
            {data.work_style_fit && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Preferred Work Style & Environment
                </h4>
                <p className="text-xs text-foreground/90 leading-relaxed">{data.work_style_fit}</p>
              </div>
            )}

            {/* Growth & Development Tips */}
            {data.growth_recommendations && data.growth_recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" /> Career Growth & Next Steps
                </h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {data.growth_recommendations.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Scientific Transparency Guarantee */}
            <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg border text-[11px] text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>
                EU AI Act & DPDP Compliant: Scored strictly on verified behavioral incidents and what you said, never how you sound, your accent, or vocal tone.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={onClose} variant="outline" size="sm">
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
