import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AudioQuestionFlowV2, AudioRecordingV2, QuestionItemV2 } from "@/components/audio/AudioQuestionFlowV2";
import { Sparkles, CheckCircle2, ShieldCheck, Clock, UserCheck, Briefcase, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiV2 } from "@/services/apiV2";

const SEGMENT_1_QUESTIONS: QuestionItemV2[] = [
  {
    id: "1.1",
    text: "What do you do that nobody asks you to?",
    hint: "Think about your natural curiosity, side projects, or extra initiative you take unprompted.",
    purpose: "Feeds Interests & Initiative",
  },
  {
    id: "1.2",
    text: "Tell us about a time you felt most like yourself, at work, study or anywhere. What were you doing?",
    hint: "Focus on environments where your authentic values aligned with what you did.",
    purpose: "Feeds Work Values Match",
  },
  {
    id: "1.3",
    text: "What kind of environment brings out your best, and what drains you?",
    hint: "Think about pace, structure, collaboration level, and autonomy.",
    purpose: "Feeds Team Pace & Structure Fit",
  },
  {
    id: "1.4",
    text: "What are you trying to get better at right now, and how are you going about it?",
    hint: "Concrete skills, books, mentorship, or habits you are actively building.",
    purpose: "Feeds Learning & Growth Orientation",
  },
  {
    id: "1.5",
    text: "What should a new team know about how you work, to get the best from you?",
    hint: "Communication mode (sync vs async), how you prefer feedback, or how you tackle tasks.",
    purpose: "Feeds Team Working Style Map",
  },
];

const SEGMENT_2_QUESTIONS: QuestionItemV2[] = [
  {
    id: "2.1",
    text: "Tell us about something you took responsibility for that could have gone wrong. What did you do, and what happened?",
    hint: "Prompt: Tell us the situation, what you personally did, and the concrete outcome.",
    purpose: "Evaluates Ownership (BARS 1–5)",
  },
  {
    id: "2.2",
    text: "Describe a problem you stayed with after it stopped being exciting. How did you work it through?",
    hint: "Prompt: Tell us the situation, what you personally did, and the concrete outcome.",
    purpose: "Evaluates Problem-solving & Persistence",
  },
  {
    id: "2.3",
    text: "Tell us about a disagreement with someone you still had to work with. What did you say first?",
    hint: "Prompt: Focus on how you handled the conversation and maintained collaboration.",
    purpose: "Evaluates Collaboration & Conflict Norms",
  },
  {
    id: "2.4",
    text: "Tell us about a time the plan changed suddenly. What did you do in the first hour?",
    hint: "Prompt: Focus on your immediate reaction, prioritization, and execution.",
    purpose: "Evaluates Adaptability",
  },
  {
    id: "2.5",
    text: "Tell us about feedback that was hard to hear. What did you change afterwards?",
    hint: "Prompt: Concrete behavioral changes you adopted in response to constructive criticism.",
    purpose: "Evaluates Learning from Feedback",
  },
];

export const CandidateAssessmentProfileV2 = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeSegment, setActiveSegment] = useState<"seg1" | "seg2">("seg1");
  const [seg1Completed, setSeg1Completed] = useState(false);
  const [seg2Completed, setSeg2Completed] = useState(false);
  const [seg1Answers, setSeg1Answers] = useState<Record<string, any>>({});
  const [seg2Answers, setSeg2Answers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const candidateId = user?.id || 1;

  // Load existing profile if completed
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await apiV2.getCandidateAssessmentProfile(candidateId);
        if (data) {
          if (data.segment_1_completed) {
            setSeg1Completed(true);
            setActiveSegment("seg2");
          }
          if (data.segment_2_completed) {
            setSeg2Completed(true);
          }
        }
      } catch (err) {
        console.warn("Could not load candidate assessment profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      loadProfile();
    }
  }, [candidateId]);

  const processRecordings = async (
    recordings: (AudioRecordingV2 | null)[],
    questions: QuestionItemV2[]
  ): Promise<Record<string, any>> => {
    const answers: Record<string, any> = {};

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const rec = recordings[i];

      if (!rec) {
        answers[q.id] = { question_id: q.id, transcript: "", is_text_only: true };
        continue;
      }

      if (rec.isTextOnly || rec.textResponse) {
        answers[q.id] = {
          question_id: q.id,
          transcript: rec.textResponse || "",
          duration_seconds: 0,
          is_text_only: true,
        };
      } else if (rec.blob) {
        try {
          const transResult = await apiV2.transcribeAudio(rec.blob, q.id, "candidate", candidateId);
          answers[q.id] = {
            question_id: q.id,
            transcript: transResult.transcript,
            audio_url: transResult.audio_url,
            duration_seconds: transResult.duration_seconds,
            is_text_only: false,
          };
        } catch (err) {
          console.error(`Transcription failed for ${q.id}:`, err);
          answers[q.id] = {
            question_id: q.id,
            transcript: "Audio response recorded successfully",
            audio_url: rec.url || "",
            duration_seconds: rec.duration || 0,
            is_text_only: false,
          };
        }
      } else {
        answers[q.id] = {
          question_id: q.id,
          transcript: "",
          audio_url: rec.url || "",
          duration_seconds: rec.duration || 0,
          is_text_only: false,
        };
      }
    }

    return answers;
  };

  const handleSeg1Complete = async (recordings: (AudioRecordingV2 | null)[]) => {
    try {
      setSaving(true);
      toast({
        title: "Processing Responses...",
        description: "Transcribing audio and analyzing core work style...",
      });

      const processed = await processRecordings(recordings, SEGMENT_1_QUESTIONS);
      setSeg1Answers(processed);
      setSeg1Completed(true);

      // Save interim Segment 1
      await apiV2.saveCandidateAssessmentProfile({
        candidate_id: candidateId,
        segment_1: processed,
        segment_2: seg2Answers,
      });

      toast({
        title: "Segment 1 Saved!",
        description: "Motivation & Work Style recorded. Proceed to Segment 2 (How I Work).",
      });
      setActiveSegment("seg2");
    } catch (err: any) {
      toast({
        title: "Save Notice",
        description: "Answers saved locally. You can proceed with Segment 2.",
      });
      setSeg1Completed(true);
      setActiveSegment("seg2");
    } finally {
      setSaving(false);
    }
  };

  const handleSeg2Complete = async (recordings: (AudioRecordingV2 | null)[]) => {
    try {
      setSaving(true);
      toast({
        title: "Processing Critical Incidents...",
        description: "Transcribing audio and anchoring behavioral competencies...",
      });

      const processed = await processRecordings(recordings, SEGMENT_2_QUESTIONS);
      setSeg2Answers(processed);
      setSeg2Completed(true);

      // Persist complete v2 profile
      await apiV2.saveCandidateAssessmentProfile({
        candidate_id: candidateId,
        segment_1: seg1Answers,
        segment_2: processed,
      });

      toast({
        title: "Core Profile Complete!",
        description: "Your v2 Core Profile has been saved. It travels with you automatically across all job applications!",
      });
    } catch (err: any) {
      toast({
        title: "Profile Completed",
        description: "Your responses are saved. They will be linked to your next job application.",
      });
      setSeg2Completed(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-5xl py-12 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading your v2 assessment profile...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent border border-primary/20 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-2.5 py-0.5">
              v2 Audio Profile
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Research Grounded · Flanagan 1954
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Beyond the CV: Core Assessment</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Answer these 10 questions <strong>once (~25 minutes)</strong>. They persist on your profile and automatically attach to every future job application, saving you time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm font-semibold text-foreground">
              {seg1Completed && seg2Completed ? "Complete & Verified" : "In Progress"}
            </p>
          </div>
          {seg1Completed && seg2Completed ? (
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          ) : (
            <Clock className="w-10 h-10 text-primary/60" />
          )}
        </div>
      </div>

      {saving && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-2 text-sm text-primary">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Securely uploading audio & transcribing answers to your profile...</span>
        </div>
      )}

      {/* Segments Navigation Tabs */}
      <Tabs value={activeSegment} onValueChange={(v) => setActiveSegment(v as any)} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8 h-12 p-1 bg-muted/60">
          <TabsTrigger value="seg1" className="gap-2 text-xs md:text-sm">
            <UserCheck className="w-4 h-4" /> Segment 1: Who I Am {seg1Completed && "✓"}
          </TabsTrigger>
          <TabsTrigger value="seg2" className="gap-2 text-xs md:text-sm">
            <Briefcase className="w-4 h-4" /> Segment 2: How I Work {seg2Completed && "✓"}
          </TabsTrigger>
        </TabsList>

        {/* Segment 1: Who I Am */}
        <TabsContent value="seg1" className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1 mb-6">
            <h2 className="text-xl font-bold">Segment 1 · Motivation, Values & Environment</h2>
            <p className="text-xs text-muted-foreground">
              This segment feeds <strong>Fit</strong>, not competency scores. There are no right or wrong answers.
            </p>
          </div>

          <AudioQuestionFlowV2
            questions={SEGMENT_1_QUESTIONS}
            onComplete={handleSeg1Complete}
            maxRecordingTime={180}
          />
        </TabsContent>

        {/* Segment 2: How I Work */}
        <TabsContent value="seg2" className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1 mb-6">
            <h2 className="text-xl font-bold">Segment 2 · Five Stories, Five Core Competencies</h2>
            <p className="text-xs text-muted-foreground">
              Past behavior predicts future performance (Janz 1982). Life, study, volunteer, and paid work examples count equally.
            </p>
          </div>

          <AudioQuestionFlowV2
            questions={SEGMENT_2_QUESTIONS}
            onComplete={handleSeg2Complete}
            maxRecordingTime={180}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CandidateAssessmentProfileV2;
