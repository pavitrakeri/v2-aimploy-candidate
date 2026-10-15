import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AudioQuestionFlowV2, AudioRecordingV2, QuestionItemV2 } from "@/components/audio/AudioQuestionFlowV2";
import { Sparkles, CheckCircle2, ShieldCheck, Clock, UserCheck, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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
  const [loading, setLoading] = useState(false);

  const handleSeg1Complete = async (recordings: (AudioRecordingV2 | null)[]) => {
    setSeg1Completed(true);
    toast({
      title: "Segment 1 Saved",
      description: "Motivation & Work Style saved. Now complete Segment 2 (How I Work).",
    });
    setActiveSegment("seg2");
  };

  const handleSeg2Complete = async (recordings: (AudioRecordingV2 | null)[]) => {
    setSeg2Completed(true);
    toast({
      title: "Core Profile Complete!",
      description: "Your v2 Core Profile has been saved. It travels with you automatically across all job applications!",
    });
  };

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
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Research Grounded
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
