import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { challengesApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Clock,
  Users,
  Zap,
  ArrowRight,
  Medal,
  Target,
  Code,
  Sparkles,
  CheckCircle,
  X,
  Award,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Challenge } from "@/services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  },
};

const getDifficultyGlow = (difficulty: string) => {
  const diff = difficulty.toLowerCase();
  if (diff === "hard") return "hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]";
  if (diff === "medium") return "hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]";
  return "hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]";
};

export const Challenges = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Queries
  const { data: challenges = [], isLoading: isLoadingChallenges } = useQuery({
    queryKey: ["challenges"],
    queryFn: challengesApi.getChallenges,
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["challenge-stats"],
    queryFn: challengesApi.getStats,
  });

  const { data: leaderboard = [], isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ["challenge-leaderboard"],
    queryFn: challengesApi.getLeaderboard,
  });

  // Mutations
  const joinMutation = useMutation({
    mutationFn: (challengeId: number) => challengesApi.joinChallenge(challengeId),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "Successfully registered for the challenge!",
      });
      queryClient.invalidateQueries({ queryKey: ["challenge-stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Could not register for this challenge. Please try again.",
        variant: "destructive",
      });
    },
  });

  const [activeQuizChallenge, setActiveQuizChallenge] = useState<Challenge | null>(null);
  const [showingQuizIntro, setShowingQuizIntro] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSecondsLeft, setQuizSecondsLeft] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [quizResults, setQuizResults] = useState<{ score: number; correct_count: number; total_questions: number; feedback?: string } | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Timer countdown hook
  useEffect(() => {
    if (!quizStarted || quizSecondsLeft <= 0 || quizResults) return;

    const timer = setInterval(() => {
      setQuizSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (activeQuizChallenge?.challenge_type === 'coding') {
            triggerSubmitCode();
          } else {
            triggerSubmitQuiz();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, quizSecondsLeft, quizResults]);

  const triggerSubmitQuiz = async (overrideAnswers?: Record<string, string>) => {
    if (!activeQuizChallenge || submittingQuiz) return;
    setSubmittingQuiz(true);
    try {
      const answersMap = overrideAnswers || answers;
      const formattedAnswers = Object.entries(answersMap).map(([question_id, selected_option]) => ({
        question_id,
        selected_option,
      }));

      const res = await challengesApi.submitChallenge(activeQuizChallenge.id, formattedAnswers);
      setQuizResults({
        score: res.score,
        correct_count: res.correct_count,
        total_questions: res.total_questions,
      });
      toast({
        title: "Challenge Completed!",
        description: `You scored ${res.score}% on the challenge.`,
      });
      queryClient.invalidateQueries({ queryKey: ["challenge-stats"] });
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.message || "Failed to submit challenge responses.",
        variant: "destructive",
      });
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const triggerSubmitCode = async () => {
    if (!activeQuizChallenge || submittingQuiz) return;
    setSubmittingQuiz(true);
    try {
      const res = await challengesApi.submitCodeChallenge(activeQuizChallenge.id, code, language);
      setQuizResults({
        score: res.score,
        correct_count: res.score >= 50 ? 1 : 0,
        total_questions: 1,
        feedback: res.feedback
      });
      toast({
        title: "Code Evaluated!",
        description: `You scored ${res.score}% on the challenge.`,
      });
      queryClient.invalidateQueries({ queryKey: ["challenge-stats"] });
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.message || "Failed to submit code.",
        variant: "destructive",
      });
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleStartQuiz = async () => {
    if (!activeQuizChallenge) return;
    try {
      await challengesApi.startChallenge(activeQuizChallenge.id);
      setShowingQuizIntro(false);
      setQuizStarted(true);
      setQuizSecondsLeft((activeQuizChallenge.duration_minutes || 60) * 60);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setCode(activeQuizChallenge.starter_code || "");
      setQuizResults(null);
    } catch (err: any) {
      toast({
        title: "Initialization Failed",
        description: err.message || "Could not start the challenge. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleJoin = (challengeId: number, challengeTitle: string) => {
    const challenge = challenges.find((c) => c.id === challengeId);
    console.log("CANDIDATE PORTAL handleJoin challenge:", challenge);
    console.log("questions field:", challenge?.questions, "type:", typeof challenge?.questions);
    
    // Parse questions if it's a string
    let parsedQuestions = challenge?.questions;
    if (typeof parsedQuestions === 'string') {
      try {
        parsedQuestions = JSON.parse(parsedQuestions);
      } catch (e) {
        parsedQuestions = [];
      }
    }

    if (challenge && (challenge.challenge_type === 'coding' || (parsedQuestions && Array.isArray(parsedQuestions) && parsedQuestions.length > 0))) {
      // Create a copy of challenge with parsed questions
      const finalChallenge = { ...challenge, questions: parsedQuestions };
      setActiveQuizChallenge(finalChallenge);
      setShowingQuizIntro(true);
    } else {
      joinMutation.mutate(challengeId);
    }
  };

  const handleRemind = (challengeTitle: string) => {
    toast({
      title: "Reminder Set",
      description: `We will notify you when ${challengeTitle} starts!`,
    });
  };

  // Extract top 3 podium entries if available
  const topThree = leaderboard.slice(0, 3);
  const restOfLeaderboard = leaderboard.slice(3);

  if (quizStarted && activeQuizChallenge) {
    const questions = activeQuizChallenge.questions || [];
    const currentQuestion = questions[currentQuestionIndex];
    const minutes = Math.floor(quizSecondsLeft / 60);
    const seconds = quizSecondsLeft % 60;
    const isWarningTime = minutes < 2;

    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        {quizResults ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl bg-card border border-border rounded-3xl p-8 shadow-2xl space-y-8"
          >
            <div className="text-center space-y-3">
              <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-500 animate-bounce">
                <Trophy size={48} />
              </div>
              <h2 className="text-3xl font-display font-extrabold tracking-tight">Challenge Evaluated!</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Excellent effort. Your submission has been processed and graded by the evaluator.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/50 p-4 rounded-2xl text-center space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Score</span>
                <h3 className="text-2xl font-extrabold text-primary">{quizResults.score}%</h3>
              </div>
              <div className="bg-muted/50 p-4 rounded-2xl text-center space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Correct</span>
                <h3 className="text-2xl font-extrabold text-emerald-500">{quizResults.correct_count} / {quizResults.total_questions}</h3>
              </div>
              <div className="bg-muted/50 p-4 rounded-2xl text-center space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Status</span>
                <h3 className="text-2xl font-extrabold text-indigo-500">{quizResults.score >= 80 ? "Winner" : "Completed"}</h3>
              </div>
            </div>

            <div className="space-y-4">
              {quizResults.feedback ? (
                <>
                  <h3 className="font-bold text-base text-foreground/90">AI Evaluation Feedback</h3>
                  <div className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/30 dark:bg-indigo-950/20">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{quizResults.feedback}</p>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-base text-foreground/90">Detailed Question Summary</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {questions.map((q: any, idx: number) => {
                      const selected = answers[q.id];
                      const isCorrect = selected && selected.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
                      return (
                        <div key={q.id} className="p-4 rounded-2xl border border-border bg-muted/20 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-semibold text-sm">Q{idx + 1}: {q.text}</p>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${isCorrect ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                              {isCorrect ? "Correct" : "Incorrect"}
                            </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt: string) => {
                          const isSelected = selected === opt;
                          const isCorrectOpt = q.correct_answer === opt;
                          let borderClass = "border-border";
                          let bgClass = "";
                          if (isSelected) {
                            borderClass = isCorrect ? "border-emerald-500" : "border-rose-500";
                            bgClass = isCorrect ? "bg-emerald-500/5" : "bg-rose-500/5";
                          } else if (isCorrectOpt) {
                            borderClass = "border-emerald-500/50";
                          }
                          return (
                            <div key={opt} className={`p-2.5 rounded-xl border ${borderClass} ${bgClass} flex items-center justify-between`}>
                              <span>{opt}</span>
                              {isCorrectOpt && <CheckCircle size={14} className="text-emerald-500 shrink-0" />}
                              {isSelected && !isCorrect && <X size={14} className="text-rose-500 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                          {q.explanation && (
                            <p className="text-[11px] text-muted-foreground italic bg-muted/40 p-2.5 rounded-lg">
                              Explanation: {q.explanation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                setQuizStarted(false);
                setActiveQuizChallenge(null);
                setQuizResults(null);
              }}
            >
              Back to Challenges
            </Button>
          </motion.div>
        ) : activeQuizChallenge.challenge_type === 'coding' ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[95vw] h-[85vh] bg-card border border-border rounded-xl shadow-xl flex overflow-hidden"
          >
            <ResizablePanelGroup direction="horizontal" className="w-full h-full">
              {/* Left Pane: Problem Statement */}
              <ResizablePanel defaultSize={40} minSize={25} className="flex flex-col bg-card">
                <div className="flex items-center justify-between border-b p-4 shrink-0 bg-muted/20">
                  <div>
                    <h2 className="text-xl font-bold font-display">{activeQuizChallenge.title}</h2>
                    <p className="text-xs text-muted-foreground">{activeQuizChallenge.company} Coding Challenge</p>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border shadow-sm ${isWarningTime ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse' : 'bg-primary/10 text-primary border-primary/20'}`}>
                    <Clock size={16} />
                    <span className="font-mono font-bold text-sm">
                      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 prose dark:prose-invert prose-sm max-w-none prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeQuizChallenge.problem_statement || ""}
                  </ReactMarkdown>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle className="w-1.5 bg-border/50 hover:bg-primary/30 transition-colors" />

              {/* Right Pane: Code Editor */}
              <ResizablePanel defaultSize={60} minSize={30} className="flex flex-col bg-[#1e1e1e]">
                <div className="bg-[#2d2d2d] border-b border-[#3d3d3d] px-4 py-2 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Code size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-200">Solution</span>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-[#1e1e1e] text-xs text-slate-300 border border-[#3d3d3d] rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-[#252525] transition-colors"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="go">Go</option>
                    <option value="csharp">C#</option>
                  </select>
                </div>
                <div className="flex-1 relative">
                  {/* Line numbers (fake simulation) */}
                  <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#1e1e1e] border-r border-[#333] text-right pr-2 pt-4 select-none pointer-events-none text-xs font-mono text-[#666]">
                    {code.split('\n').map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <textarea
                    className="w-full h-full pl-14 p-4 bg-transparent text-slate-200 font-mono text-sm focus:outline-none resize-none leading-relaxed"
                    spellCheck="false"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Write your code here..."
                  />
                </div>
                <div className="bg-[#2d2d2d] border-t border-[#3d3d3d] p-4 flex justify-between items-center shrink-0">
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <Sparkles size={14} className="text-purple-400" />
                    AI Evaluation Engine Ready
                  </div>
                  <Button
                    variant="gradient"
                    size="sm"
                    disabled={submittingQuiz}
                    onClick={() => triggerSubmitCode()}
                    className="shadow-lg shadow-primary/20"
                  >
                    {submittingQuiz ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Evaluating...
                      </span>
                    ) : (
                      "Run & Evaluate Code (AI)"
                    )}
                  </Button>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-card border border-border rounded-3xl p-8 shadow-xl space-y-6"
          >
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-bold font-display">{activeQuizChallenge.title}</h2>
                <p className="text-xs text-muted-foreground">{activeQuizChallenge.company} Challenge</p>
              </div>
              <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border ${isWarningTime ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse' : 'bg-primary/10 text-primary border-primary/20'}`}>
                <Clock size={16} />
                <span className="font-mono font-bold text-sm">
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>QUESTION {currentQuestionIndex + 1} OF {questions.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% COMPLETE</span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} />
              </div>
            </div>

            {currentQuestion && (
              <div className="space-y-6">
                <p className="text-lg font-medium text-foreground">{currentQuestion.text}</p>
                <div className="space-y-3">
                  {currentQuestion.options.map((option: string) => {
                    const isSelected = answers[currentQuestion.id] === option;
                    return (
                      <button
                        key={option}
                        onClick={() => {
                          setAnswers((prev) => ({
                            ...prev,
                            [currentQuestion.id]: option,
                          }));
                        }}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${isSelected ? 'border-primary bg-primary/5 text-primary shadow-sm font-semibold' : 'border-border hover:border-primary/50'}`}
                      >
                        <span className="text-sm">{option}</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30 group-hover:border-primary/50'}`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t gap-4">
              <Button
                variant="outline"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full ${currentQuestionIndex === idx ? 'bg-primary' : answers[questions[idx].id] ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}
                  />
                ))}
              </div>

              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  variant="gradient"
                  disabled={submittingQuiz}
                  onClick={() => triggerSubmitQuiz()}
                >
                  {submittingQuiz ? "Submitting..." : "Submit Challenge"}
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                >
                  Next
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  console.log("CANDIDATE PORTAL ALL CHALLENGES:", challenges);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-[1200px] mx-auto px-4 sm:px-6"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Skill Arenas
            </h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors font-medium px-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse" />
              Arena Active
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
            Compete in top-tier engineering sprints, benchmark your talent, and catch the eye of global recruiters.
          </p>
        </div>
      </motion.div>

      {/* Modern Dashboard Stats & Profile Banner */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-7 lg:col-span-8 overflow-hidden border border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-300 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <CardContent className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-8 relative z-10">
            <div className="space-y-5 flex-1">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  <Target size={14} className="text-primary" />
                  <span>Current Standings</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Your Combat Profile</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                Participate in live coding challenges to earn points. Climb the global leaderboard and unlock exclusive badges to stand out to employers.
              </p>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-400 gap-1.5 px-3 py-1 text-xs">
                  <Award size={14} />
                  3 Achievements Locked
                </Badge>
              </div>
            </div>

            {/* Circular score display */}
            <div className="relative flex items-center justify-center shrink-0 bg-background rounded-full p-2 shadow-sm border border-border/50">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle cx="56" cy="56" r="46" className="stroke-muted" strokeWidth="8" fill="transparent" />
                <circle cx="56" cy="56" r="46" className="stroke-primary" strokeWidth="8" fill="transparent"
                  strokeDasharray="289"
                  strokeDashoffset={289 - (289 * (stats?.total_points ? Math.min(stats.total_points / 5000, 1) : 0.49))}
                  strokeLinecap="round" 
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {isLoadingStats ? (
                  <Skeleton className="h-6 w-14 mb-1" />
                ) : (
                  <span className="text-2xl font-bold tracking-tight text-foreground">{stats?.total_points ?? 0}</span>
                )}
                <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">Arena Pts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Small stats cards grid */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-4">
          <Card className="border border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-300 p-5 flex-1 flex flex-col justify-center group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                <Trophy size={24} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Challenges Won</p>
              {isLoadingStats ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                <h3 className="text-4xl font-bold tracking-tight text-foreground">{stats?.challenges_won ?? 0}</h3>
              )}
            </div>
          </Card>

          <Card className="border border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-300 p-5 flex-1 flex flex-col justify-center group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Sprints Entered</p>
              {isLoadingStats ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                <h3 className="text-4xl font-bold tracking-tight text-foreground">{stats?.participated ?? 0}</h3>
              )}
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Main challenges & leaderboard section */}
      <div className="grid gap-8 lg:grid-cols-3 items-start">
        {/* Challenges list */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-display text-2xl font-bold tracking-tight">Active Sprints</h2>
            <span className="text-sm font-semibold text-muted-foreground">
              {challenges.length} Available
            </span>
          </div>

          <div className="space-y-4">
            {isLoadingChallenges ? (
              [1, 2, 3].map((n) => (
                <Card key={n} className="border border-muted-foreground/5 bg-card/40">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-9 w-28" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : challenges.length === 0 ? (
              <Card className="border border-dashed border-border text-center py-12">
                <CardContent>
                  <Trophy size={40} className="mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground font-medium">No challenges scheduled at the moment.</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">Check back later or explore other sections.</p>
                </CardContent>
              </Card>
            ) : (
              challenges.map((challenge) => (
                <Card key={challenge.id} className={`border border-border/60 bg-card/60 backdrop-blur-md transition-all duration-300 ${getDifficultyGlow(challenge.difficulty)} relative overflow-hidden group`}>
                  {/* Subtle top indicator based on difficulty */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    challenge.difficulty.toLowerCase() === 'hard' ? 'bg-rose-500' :
                    challenge.difficulty.toLowerCase() === 'medium' ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`} />
                  
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-5">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                            {challenge.title}
                          </h3>
                          <Badge variant="outline" className={`${
                            challenge.status === "Live" 
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                              : "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                          } font-medium px-2 py-0.5`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${challenge.status === "Live" ? "bg-emerald-500" : "bg-indigo-500"}`} />
                            {challenge.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Hosted by <span className="font-semibold text-foreground/80">{challenge.company}</span>
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {(challenge.tags || []).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 text-[11px] font-medium tracking-wide transition-colors"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground pt-1.5">
                          <span className="flex items-center gap-1">
                            <Clock size={14} className="text-slate-400" />
                            {challenge.time_limit || "N/A"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={14} className="text-slate-400" />
                            Competitive
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            challenge.difficulty.toLowerCase() === 'hard' ? 'bg-rose-500/10 text-rose-600' :
                            challenge.difficulty.toLowerCase() === 'medium' ? 'bg-amber-500/10 text-amber-600' :
                            'bg-emerald-500/10 text-emerald-600'
                          }`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4 shrink-0 sm:border-l border-border/40 sm:pl-5">
                        <div className="text-right sm:space-y-1">
                          <p className="text-sm text-muted-foreground/80 font-medium">
                            {challenge.ends_in ? `Ends in ${challenge.ends_in}` : challenge.starts_in ? `Starts in ${challenge.starts_in}` : ""}
                          </p>
                        </div>
                        
                        <Button
                          variant={challenge.status !== "Live" ? "outline" : ((challenge.participant_status === "completed" || challenge.participant_status === "submitted") ? "secondary" : "gradient")}
                          size="sm"
                          className="w-full sm:w-auto shadow-md"
                          onClick={() => {
                            if (challenge.status !== "Live") {
                              handleRemind(challenge.title);
                            } else if (challenge.participant_status !== "completed" && challenge.participant_status !== "submitted") {
                              handleJoin(challenge.id, challenge.title);
                            }
                          }}
                          disabled={(joinMutation.isPending && joinMutation.variables === challenge.id) || challenge.participant_status === "completed" || challenge.participant_status === "submitted"}
                        >
                          {challenge.status === "Live" ? (
                            (challenge.participant_status === "completed" || challenge.participant_status === "submitted") ? (
                              <>
                                <CheckCircle size={14} className="mr-1.5 text-emerald-500" />
                                {`Completed (${challenge.participant_score}%)`}
                              </>
                            ) : challenge.participant_status === "started" ? (
                              <>
                                <Zap size={14} className="mr-1.5 animate-pulse" />
                                Resume Challenge
                              </>
                            ) : (
                              <>
                                <Zap size={14} className="mr-1.5" />
                                {joinMutation.isPending && joinMutation.variables === challenge.id ? "Entering..." : "Join Now"}
                              </>
                            )
                          ) : (
                            <>
                              Remind Me
                              <ArrowRight size={14} className="ml-1.5" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </motion.div>

        {/* Premium Leaderboard with Podium Visualizer */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-display text-2xl font-bold tracking-tight">Top Command</h2>
            <Trophy size={20} className="text-amber-500" />
          </div>

          <Card className="border border-border/60 bg-card/40 backdrop-blur-md overflow-hidden relative shadow-lg">
            <CardContent className="p-6 space-y-6">
              
              {/* Podium Visualizer */}
              {!isLoadingLeaderboard && topThree.length > 0 && (
                <div className="flex items-end justify-center gap-2 pt-6 pb-2 px-1 border-b border-border/40">
                  
                  {/* Rank 2 */}
                  {topThree[1] && (
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center font-bold text-sm text-slate-800 shadow-md">
                        🥈
                      </div>
                      <span className="text-xs font-bold text-foreground mt-2 truncate w-full text-center">{topThree[1].name}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-0.5">{topThree[1].score}</span>
                      <div className="w-full bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 h-12 rounded-t-lg mt-2 flex items-center justify-center">
                        <span className="text-xs font-extrabold text-slate-400">2nd</span>
                      </div>
                    </div>
                  )}

                  {/* Rank 1 */}
                  {topThree[0] && (
                    <div className="flex flex-col items-center flex-1 -translate-y-3 scale-105">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-2 border-amber-400 flex items-center justify-center font-bold text-base text-white shadow-lg animate-bounce">
                        👑
                      </div>
                      <span className="text-xs font-extrabold text-foreground mt-2 truncate w-full text-center">{topThree[0].name}</span>
                      <span className="text-[10px] font-extrabold text-amber-500 mt-0.5">{topThree[0].score}</span>
                      <div className="w-full bg-gradient-to-b from-amber-500/20 to-amber-500/5 dark:from-amber-500/30 dark:to-transparent border border-amber-500/30 h-16 rounded-t-lg mt-2 flex items-center justify-center">
                        <span className="text-xs font-extrabold text-amber-500">1st</span>
                      </div>
                    </div>
                  )}

                  {/* Rank 3 */}
                  {topThree[2] && (
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center font-bold text-sm text-orange-800 shadow-md">
                        🥉
                      </div>
                      <span className="text-xs font-bold text-foreground mt-2 truncate w-full text-center">{topThree[2].name}</span>
                      <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 mt-0.5">{topThree[2].score}</span>
                      <div className="w-full bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-950 h-9 rounded-t-lg mt-2 flex items-center justify-center">
                        <span className="text-xs font-extrabold text-orange-400">3rd</span>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Leaderboard entries */}
              <div className="space-y-2">
                {isLoadingLeaderboard ? (
                  [1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="flex items-center gap-3 p-3">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))
                ) : leaderboard.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">No records yet</p>
                ) : (
                  restOfLeaderboard.map((user) => (
                    <div
                      key={user.rank}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/30"
                    >
                      <span className="text-sm font-bold w-6 text-center text-muted-foreground">
                        {user.rank}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{user.name}</p>
                      </div>
                      <span className="font-bold text-sm text-primary">
                        {user.score.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <Button variant="ghost" className="w-full font-semibold text-xs border border-border/40 hover:bg-muted">
                View Full Leaderboard
                <ArrowRight size={14} className="ml-1.5" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quiz Intro / Instructions Modal */}
      {showingQuizIntro && activeQuizChallenge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center gap-3 text-primary">
              <Trophy size={28} />
              <h3 className="text-xl font-bold font-display">Start Skill Challenge</h3>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-lg text-foreground">{activeQuizChallenge.title}</h4>
              <p className="text-sm text-muted-foreground">
                You are about to start a timed multiple-choice coding/design sprint hosted by <span className="font-semibold text-foreground/80">{activeQuizChallenge.company}</span>.
              </p>
              
              <div className="bg-muted/50 p-4 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Format:</span>
                  <span className="font-bold text-foreground">{activeQuizChallenge.challenge_type === 'coding' ? 'Live Coding Round' : `${activeQuizChallenge.questions?.length || 5} MCQs`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Time Limit:</span>
                  <span className="font-bold text-foreground">{activeQuizChallenge.duration_minutes || 60} Minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Difficulty:</span>
                  <span className="font-bold text-indigo-500">{activeQuizChallenge.difficulty}</span>
                </div>
              </div>
              
              <p className="text-xs text-rose-500 font-medium">
                ⚠️ Warning: Once you click "Start Timer", the session will begin. You cannot pause or restart the timer. Unfinished questions will be auto-submitted when the time runs out.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowingQuizIntro(false);
                  setActiveQuizChallenge(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                onClick={handleStartQuiz}
              >
                Start Timer
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Challenges;
