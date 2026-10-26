import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Mic,
  MicOff,
  Square,
  Play,
  RotateCcw,
  ArrowRight,
  Check,
  Pause,
  Keyboard,
  Volume2,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export interface AudioRecordingV2 {
  blob?: Blob;
  url?: string;
  duration: number;
  textResponse?: string;
  isTextOnly: boolean;
  language?: string;
}

export const SUPPORTED_INTERVIEW_LANGUAGES = [
  { code: "en", label: "English", speechCode: "en-US" },
  { code: "hi", label: "Hindi (हिन्दी)", speechCode: "hi-IN" },
  { code: "ml", label: "Malayalam (മലയാളം)", speechCode: "ml-IN" },
  { code: "ar", label: "Arabic (العربية)", speechCode: "ar-SA" },
  { code: "es", label: "Spanish (Español)", speechCode: "es-ES" },
  { code: "fr", label: "French (Français)", speechCode: "fr-FR" },
];

export interface QuestionItemV2 {
  id: string;
  text: string;
  hint?: string;
  purpose?: string;
}

interface AudioQuestionFlowV2Props {
  questions: (string | QuestionItemV2)[];
  onComplete: (recordings: (AudioRecordingV2 | null)[]) => void;
  initialRecordings?: (AudioRecordingV2 | null)[];
  maxRecordingTime?: number; // Default 180 seconds (3 mins) for v2
}

type QuestionState =
  | "idle"
  | "countdown"
  | "recording"
  | "review"
  | "completed";

export const AudioQuestionFlowV2 = ({
  questions,
  onComplete,
  initialRecordings,
  maxRecordingTime = 180, // v2 standard: 1–3 min limits
}: AudioQuestionFlowV2Props) => {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordings, setRecordings] = useState<(AudioRecordingV2 | null)[]>(
    initialRecordings || new Array(questions.length).fill(null)
  );
  const [questionState, setQuestionState] = useState<QuestionState>("idle");
  const [countdown, setCountdown] = useState(3);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [isDictating, setIsDictating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dictationRef = useRef<any>(null);
  const baseTypedTextRef = useRef<string>("");
  const sessionDictationFinalRef = useRef<string>("");
  const isDictatingIntentionallyRef = useRef<boolean>(false);

  const startDictationSession = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      const langObj = SUPPORTED_INTERVIEW_LANGUAGES.find((l) => l.code === selectedLanguage);
      recognition.lang = langObj?.speechCode || "en-US";
      dictationRef.current = recognition;

      recognition.onresult = (event: any) => {
        let sessionFinal = "";
        let sessionInterim = "";

        for (let i = 0; i < event.results.length; i++) {
          const chunk = event.results[i][0]?.transcript || "";
          if (event.results[i].isFinal) {
            sessionFinal += chunk + " ";
          } else {
            sessionInterim += chunk;
          }
        }

        sessionDictationFinalRef.current = sessionFinal.trim();
        const full = [
          baseTypedTextRef.current,
          sessionDictationFinalRef.current,
          sessionInterim.trim(),
        ]
          .filter(Boolean)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        setTypedAnswer(full);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event?.error);
        if (event?.error === "not-allowed" || event?.error === "service-not-allowed") {
          isDictatingIntentionallyRef.current = false;
          setIsDictating(false);
        }
      };

      recognition.onend = () => {
        if (sessionDictationFinalRef.current) {
          baseTypedTextRef.current = [baseTypedTextRef.current, sessionDictationFinalRef.current]
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
          sessionDictationFinalRef.current = "";
        }

        if (isDictatingIntentionallyRef.current) {
          try {
            recognition.start();
          } catch (e) {
            setIsDictating(false);
            isDictatingIntentionallyRef.current = false;
          }
        } else {
          setIsDictating(false);
        }
      };

      recognition.start();
    } catch (e) {
      console.warn("Speech recognition error:", e);
      setIsDictating(false);
      isDictatingIntentionallyRef.current = false;
    }
  };

  const toggleDictation = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "Voice Dictation Unsupported",
        description: "Your browser does not support live voice dictation. Please type directly.",
        variant: "destructive",
      });
      return;
    }

    if (isDictating) {
      isDictatingIntentionallyRef.current = false;
      if (dictationRef.current) {
        try {
          dictationRef.current.stop();
        } catch (e) {}
      }
      setIsDictating(false);
      return;
    }

    baseTypedTextRef.current = typedAnswer.trim();
    sessionDictationFinalRef.current = "";
    isDictatingIntentionallyRef.current = true;
    setIsDictating(true);

    const langObj = SUPPORTED_INTERVIEW_LANGUAGES.find((l) => l.code === selectedLanguage);
    toast({
      title: `Microphone Active (${langObj?.label || "English"})`,
      description: "Speak your response. You can pause and resume without losing prior words.",
    });

    startDictationSession();
  };

  const rawQuestion = questions[currentQuestionIndex];
  const questionText = typeof rawQuestion === "string" ? rawQuestion : rawQuestion.text;
  const questionHint = typeof rawQuestion === "string" ? null : rawQuestion.hint;
  const questionId = typeof rawQuestion === "string" ? `Q${currentQuestionIndex + 1}` : rawQuestion.id;
  const currentRecording = recordings[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      recordings.forEach((rec) => {
        if (rec?.url) URL.revokeObjectURL(rec.url);
      });
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (questionState === "countdown") {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        startActualRecording();
      }
    }
  }, [questionState, countdown]);

  const startCountdown = () => {
    setCountdown(3);
    setQuestionState("countdown");
  };

  const startActualRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);

        const newRecording: AudioRecordingV2 = {
          blob: audioBlob,
          url: audioUrl,
          duration: recordingTime,
          isTextOnly: false,
          language: selectedLanguage,
        };

        const updated = [...recordings];
        updated[currentQuestionIndex] = newRecording;
        setRecordings(updated);
        setQuestionState("review");
      };

      mediaRecorder.start(250);
      setRecordingTime(0);
      setQuestionState("recording");

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxRecordingTime - 1) {
            stopRecording();
            return maxRecordingTime;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      toast({
        title: "Microphone Access Required",
        description: "Please enable microphone permissions or use Accessibility Mode to type your answer.",
        variant: "destructive",
      });
      setQuestionState("idle");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const handleRetake = () => {
    if (currentRecording?.url) {
      URL.revokeObjectURL(currentRecording.url);
    }
    const updated = [...recordings];
    updated[currentQuestionIndex] = null;
    setRecordings(updated);
    setRecordingTime(0);
    setQuestionState("idle");
  };

  const handleSaveTypedAnswer = () => {
    if (!typedAnswer.trim()) {
      toast({
        title: "Answer Required",
        description: "Please provide an answer before proceeding.",
        variant: "destructive",
      });
      return;
    }
    const newRecording: AudioRecordingV2 = {
      duration: 0,
      textResponse: typedAnswer,
      isTextOnly: true,
      language: selectedLanguage,
    };
    const updated = [...recordings];
    updated[currentQuestionIndex] = newRecording;
    setRecordings(updated);
    setTypedAnswer("");
    handleNextQuestion(updated);
  };

  const handleNextQuestion = (updatedRecordings = recordings) => {
    if (isLastQuestion) {
      setQuestionState("completed");
      onComplete(updatedRecordings);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuestionState("idle");
      setRecordingTime(0);
      setTypedAnswer("");
    }
  };

  const togglePlayback = () => {
    if (!currentRecording?.url) return;
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(currentRecording.url);
        audioRef.current.onended = () => setIsPlaying(false);
      } else {
        audioRef.current.src = currentRecording.url;
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-card border rounded-2xl shadow-xl transition-all">
      {/* Progress & Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-primary font-semibold px-3 py-1 bg-primary/10">
            {questionId} · Question {currentQuestionIndex + 1} of {questions.length}
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:inline">v2 Structured Interview</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Multilingual Selector (EU AI Act & Global Hiring) */}
          <div className="flex items-center gap-1.5 bg-muted/60 px-2 py-1 rounded-lg border text-xs">
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer"
              title="Interview Spoken Language"
            >
              {SUPPORTED_INTERVIEW_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-popover text-foreground">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="acc-mode" className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer">
              <Keyboard className="w-3.5 h-3.5" /> Text Alternative
            </Label>
            <Switch
              id="acc-mode"
              checked={isAccessibilityMode}
              onCheckedChange={(checked) => {
                setIsAccessibilityMode(checked);
                setQuestionState("idle");
              }}
            />
          </div>
        </div>
      </div>

      <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2 mb-6" />

      {/* Question Card */}
      <div className="bg-muted/40 p-5 rounded-xl border border-border/60 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2 leading-relaxed">{questionText}</h3>
        {questionHint && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-2 bg-background/80 p-2.5 rounded-lg border">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" /> {questionHint}
          </p>
        )}
      </div>

      {/* Main Flow: Accessibility Mode (Typed) vs Audio Recorder */}
      {isAccessibilityMode ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Accessibility Mode: Your response will be scored using Behaviorally Anchored Rating Scales (BARS 1–5).
            </p>
            <Button
              type="button"
              variant={isDictating ? "destructive" : "outline"}
              size="sm"
              onClick={toggleDictation}
              className="gap-2 shrink-0 h-8 text-xs"
            >
              {isDictating ? (
                <>
                  <MicOff className="w-3.5 h-3.5 animate-pulse text-white" />
                  <span>Stop Dictating</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-primary" />
                  <span>Voice Dictation (Live STT)</span>
                </>
              )}
            </Button>
          </div>
          {isDictating && (
            <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-md text-xs text-red-600 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Microphone listening... Speak clearly and your words will appear below.
            </div>
          )}
          <Textarea
            value={typedAnswer}
            onChange={(e) => setTypedAnswer(e.target.value)}
            placeholder="Describe the situation, what you did, and what happened..."
            className="min-h-[140px] text-sm"
          />
          <Button onClick={handleSaveTypedAnswer} className="w-full bg-primary hover:bg-primary/90">
            Submit Answer & Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6">
          <AnimatePresence mode="wait">
            {questionState === "idle" && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <Button
                  size="lg"
                  onClick={startCountdown}
                  className="rounded-full h-20 w-20 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 mb-4"
                >
                  <Mic className="w-8 h-8" />
                </Button>
                <p className="text-sm font-medium">Click to Record (1–3 min answer)</p>
                <p className="text-xs text-muted-foreground mt-1">Take a breath, speak naturally with specific examples.</p>

                <div className="mt-4 pt-3 border-t border-border/40">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAccessibilityMode(true);
                      setQuestionState("idle");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
                  >
                    <Keyboard className="w-3.5 h-3.5" />
                    Prefer to type your answer instead?
                  </Button>
                </div>
              </motion.div>
            )}

            {questionState === "countdown" && (
              <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-center py-4">
                <span className="text-6xl font-bold font-mono text-primary animate-pulse">{countdown}</span>
                <p className="text-xs text-muted-foreground mt-2">Get ready...</p>
              </motion.div>
            )}

            {questionState === "recording" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center w-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-2xl font-mono font-bold text-red-500">{formatTime(recordingTime)}</span>
                  <span className="text-xs text-muted-foreground font-mono">/ {formatTime(maxRecordingTime)}</span>
                </div>

                <div className="flex items-center gap-1.5 h-10 mb-6">
                  {[...Array(16)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [8, Math.random() * 32 + 8, 8] }}
                      transition={{ repeat: Infinity, duration: 0.6 + (i % 4) * 0.1 }}
                      className="w-1.5 bg-primary/70 rounded-full"
                    />
                  ))}
                </div>

                <Button size="lg" variant="destructive" onClick={stopRecording} className="gap-2 px-6">
                  <Square className="w-4 h-4" /> Stop Recording
                </Button>
              </motion.div>
            )}

            {questionState === "review" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col items-center">
                <div className="flex items-center gap-2 mb-4 text-emerald-600 font-medium text-sm">
                  <Check className="w-4 h-4" /> Answer Recorded ({formatTime(currentRecording?.duration || 0)})
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <Button variant="outline" size="sm" onClick={togglePlayback} className="gap-2">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? "Pause" : "Play Back"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleRetake} className="gap-2 text-muted-foreground hover:text-foreground">
                    <RotateCcw className="w-4 h-4" /> Retake
                  </Button>
                </div>

                <Button onClick={() => handleNextQuestion()} className="w-full bg-primary hover:bg-primary/90">
                  {isLastQuestion ? "Complete All Questions" : "Confirm & Next Question"} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AudioQuestionFlowV2;
