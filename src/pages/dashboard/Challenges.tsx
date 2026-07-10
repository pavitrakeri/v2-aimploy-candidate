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
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Challenge } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  const [completedChallengeDetails, setCompletedChallengeDetails] = useState<Challenge | null>(null);
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
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Skill Assessments
          </h1>
          <p className="text-muted-foreground mt-2 text-base max-w-2xl">
            Complete engineering assessments to benchmark your skills and improve your profile visibility.
          </p>
        </div>
      </motion.div>

      {/* Premium Dashboard Stats */}
      <motion.div variants={itemVariants} className="grid gap-5 md:grid-cols-3">
        <Card className="border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background shadow-md overflow-hidden relative group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors" />
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4 relative z-10">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-primary/80 uppercase tracking-wider">Points</p>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <h3 className="text-4xl font-black tracking-tighter text-foreground">{stats?.total_points ?? 0}</h3>
                )}
              </div>
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Target size={24} />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground">Based on completed assessments</p>
          </CardContent>
        </Card>

        <Card className="border border-emerald-500/10 bg-gradient-to-br from-emerald-500/5 via-background to-background shadow-sm overflow-hidden relative group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors" />
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4 relative z-10">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-500/80 uppercase tracking-wider">Passed</p>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <h3 className="text-4xl font-black tracking-tighter text-foreground">{stats?.challenges_won ?? 0}</h3>
                )}
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-500">
                <CheckCircle size={24} />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground">Successfully completed tests</p>
          </CardContent>
        </Card>

        <Card className="border border-indigo-500/10 bg-gradient-to-br from-indigo-500/5 via-background to-background shadow-sm overflow-hidden relative group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors" />
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4 relative z-10">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-500/80 uppercase tracking-wider">Participated</p>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <h3 className="text-4xl font-black tracking-tighter text-foreground">{stats?.participated ?? 0}</h3>
                )}
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-500">
                <FileText size={24} />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground">Assessments entered</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main challenges & leaderboard section */}
      <div className="grid gap-8 lg:grid-cols-3 items-start">
        {/* Challenges list */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Available Assessments</h2>
            <span className="text-sm font-medium text-muted-foreground">
              {challenges.length} Items
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
                <Card key={challenge.id} className="border border-border/50 bg-card/40 backdrop-blur-md shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-500 group-hover:h-1.5 ${
                    challenge.difficulty.toLowerCase() === 'hard' ? 'bg-gradient-to-r from-rose-500 to-rose-400' :
                    challenge.difficulty.toLowerCase() === 'medium' ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                    'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  }`} />
                  
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-5">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-bold tracking-tight text-foreground">
                            {challenge.title}
                          </h3>
                          <Badge variant="secondary" className={`${
                            challenge.status === "Live" 
                              ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" 
                              : "bg-muted text-muted-foreground"
                          } font-medium px-2 py-0.5 rounded-sm`}>
                            {challenge.status === "Live" && <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-emerald-500" />}
                            {challenge.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {challenge.company}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {(challenge.tags || []).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 border border-border rounded-md text-muted-foreground text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground pt-2">
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} />
                            {challenge.time_limit || "N/A"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Target size={14} />
                            Assessment
                          </span>
                          <span className={`px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-wider font-semibold ${
                            challenge.difficulty.toLowerCase() === 'hard' ? 'text-rose-600 bg-rose-500/10' :
                            challenge.difficulty.toLowerCase() === 'medium' ? 'text-amber-600 bg-amber-500/10' :
                            'text-emerald-600 bg-emerald-500/10'
                          }`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4 shrink-0 sm:pl-5">
                        <div className="text-right sm:space-y-1">
                          <p className="text-sm text-muted-foreground font-medium">
                            {challenge.ends_in ? `Closes in ${challenge.ends_in}` : challenge.starts_in ? `Opens in ${challenge.starts_in}` : ""}
                          </p>
                        </div>
                        
                        <Button
                          variant={challenge.participant_status === "completed" || challenge.participant_status === "submitted" ? "secondary" : "default"}
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => {
                            if (challenge.status !== "Live") {
                              handleRemind(challenge.title);
                            } else if (challenge.participant_status === "completed" || challenge.participant_status === "submitted") {
                              setCompletedChallengeDetails(challenge);
                            } else {
                              handleJoin(challenge.id, challenge.title);
                            }
                          }}
                          disabled={joinMutation.isPending && joinMutation.variables === challenge.id}
                        >
                          {challenge.status === "Live" ? (
                            (challenge.participant_status === "completed" || challenge.participant_status === "submitted") ? (
                              <>
                                <CheckCircle size={14} className="mr-2" />
                                {`Completed (${challenge.participant_score}%)`}
                              </>
                            ) : challenge.participant_status === "started" ? (
                              <>
                                Resume
                              </>
                            ) : (
                              <>
                                {joinMutation.isPending && joinMutation.variables === challenge.id ? "Loading..." : "Start Assessment"}
                              </>
                            )
                          ) : (
                            <>
                              Remind Me
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

        {/* Minimal Leaderboard */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Global Leaderboard</h2>
          </div>

          <Card className="border border-border bg-card shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {/* Table Header */}
                <div className="flex items-center gap-4 px-6 py-3 bg-muted/30 text-xs font-semibold text-muted-foreground">
                  <div className="w-8 text-center">Rank</div>
                  <div className="flex-1">Candidate</div>
                  <div className="w-16 text-right">Points</div>
                </div>

                {/* Leaderboard entries */}
                <div className="flex flex-col">
                  {isLoadingLeaderboard ? (
                    [1, 2, 3, 4, 5].map((n) => (
                      <div key={n} className="flex items-center gap-4 px-6 py-4">
                        <Skeleton className="h-4 w-4 mx-auto" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                    ))
                  ) : leaderboard.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <p className="text-sm text-muted-foreground">No records yet</p>
                    </div>
                  ) : (
                    leaderboard.map((user, index) => (
                      <div
                        key={user.rank}
                        className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                          index === 0 ? "bg-amber-500/5 hover:bg-amber-500/10" :
                          index === 1 ? "bg-slate-300/10 hover:bg-slate-300/20" :
                          index === 2 ? "bg-orange-500/5 hover:bg-orange-500/10" :
                          "hover:bg-muted/30"
                        }`}
                      >
                        <span className={`text-sm font-bold w-8 text-center ${
                          index === 0 ? "text-amber-500 text-lg" :
                          index === 1 ? "text-slate-400 text-base" :
                          index === 2 ? "text-orange-500 text-base" :
                          "text-muted-foreground"
                        }`}>
                          {index === 0 ? "1" : index === 1 ? "2" : index === 2 ? "3" : user.rank}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm truncate ${
                            index < 3 ? "text-foreground" : "text-foreground/80"
                          }`}>
                            {user.name}
                          </p>
                        </div>
                        <span className={`font-bold text-sm w-16 text-right ${
                          index === 0 ? "text-amber-500" :
                          index === 1 ? "text-slate-500 dark:text-slate-400" :
                          index === 2 ? "text-orange-500" :
                          "text-primary"
                        }`}>
                          {user.score.toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
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

      {/* Completed Challenge Details Modal */}
      <Dialog open={!!completedChallengeDetails} onOpenChange={(open) => !open && setCompletedChallengeDetails(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CheckCircle className="text-emerald-500" />
              {completedChallengeDetails?.title}
            </DialogTitle>
            <DialogDescription>
              Completed on {completedChallengeDetails?.participant_completed_at ? new Date(completedChallengeDetails.participant_completed_at).toLocaleString() : "Unknown"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Final Score</p>
                <p className="text-3xl font-bold text-foreground">
                  {completedChallengeDetails?.participant_score ?? 0}%
                </p>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-4 py-1.5 text-sm">
                Evaluation Complete
              </Badge>
            </div>

            {completedChallengeDetails?.participant_answers && (
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <FileText className="text-primary" size={20} />
                  Detailed Feedback & Answers
                </h4>
                
                {completedChallengeDetails.challenge_type === 'coding' ? (
                  <div className="space-y-4">
                    {/* For coding challenges, answers is usually an array with one entry containing code & feedback */}
                    {(() => {
                      try {
                        const answersData = typeof completedChallengeDetails.participant_answers === 'string' 
                          ? JSON.parse(completedChallengeDetails.participant_answers)
                          : completedChallengeDetails.participant_answers;
                          
                        if (Array.isArray(answersData) && answersData.length > 0) {
                          const codeSubmit = answersData[0];
                          return (
                            <div className="space-y-4">
                              {codeSubmit.feedback && (
                                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                  <h5 className="font-semibold text-indigo-700 dark:text-indigo-400 mb-2 flex items-center gap-2">
                                    <Sparkles size={16} /> AI Evaluation Feedback
                                  </h5>
                                  <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown>{codeSubmit.feedback}</ReactMarkdown>
                                  </div>
                                </div>
                              )}
                              <div>
                                <h5 className="font-medium text-sm text-muted-foreground mb-2">Submitted Code ({codeSubmit.language || 'python'})</h5>
                                <div className="relative rounded-xl overflow-hidden bg-slate-950 p-4 font-mono text-sm text-emerald-400">
                                  <pre className="overflow-x-auto">
                                    <code>{codeSubmit.code || codeSubmit.selected_option}</code>
                                  </pre>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        return <p className="text-sm text-muted-foreground">Could not parse submission data.</p>;
                      }
                      return <p className="text-sm text-muted-foreground">No detailed feedback available.</p>;
                    })()}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* For Quiz challenges */}
                    <p className="text-sm text-muted-foreground">Your multiple-choice answers have been recorded and evaluated.</p>
                    <div className="grid gap-2">
                      {(() => {
                        try {
                          const answersData = typeof completedChallengeDetails.participant_answers === 'string' 
                            ? JSON.parse(completedChallengeDetails.participant_answers)
                            : completedChallengeDetails.participant_answers;
                            
                          if (Array.isArray(answersData)) {
                            return answersData.map((ans: any, idx: number) => (
                              <div key={idx} className="p-3 bg-muted/30 rounded-lg text-sm flex flex-col gap-1">
                                <span className="font-medium text-muted-foreground">Question ID: {ans.question_id}</span>
                                <span className="font-semibold">Selected: {ans.selected_option}</span>
                              </div>
                            ));
                          }
                        } catch (e) {}
                        return null;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Challenges;
