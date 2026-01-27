import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  ArrowRight,
  Check,
  Pause,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioRecording {
  blob: Blob;
  url: string;
  duration: number;
}

interface AudioQuestionFlowProps {
  questions: string[];
  onComplete: (recordings: (AudioRecording | null)[]) => void;
  initialRecordings?: (AudioRecording | null)[];
}

type QuestionState = 
  | "idle"
  | "countdown"
  | "recording"
  | "retake-window"
  | "completed";

const MAX_RECORDING_TIME = 60; // 60 seconds max
const RETAKE_WINDOW_TIME = 15; // 15 seconds retake window

export const AudioQuestionFlow = ({
  questions,
  onComplete,
  initialRecordings,
}: AudioQuestionFlowProps) => {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordings, setRecordings] = useState<(AudioRecording | null)[]>(
    initialRecordings || new Array(questions.length).fill(null)
  );
  const [questionState, setQuestionState] = useState<QuestionState>("idle");
  const [countdown, setCountdown] = useState(3);
  const [recordingTime, setRecordingTime] = useState(0);
  const [retakeTime, setRetakeTime] = useState(RETAKE_WINDOW_TIME);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTimeRef = useRef<number>(0);

  const currentQuestion = questions[currentQuestionIndex];
  const currentRecording = recordings[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Auto-start countdown when question changes (only if no existing recording)
  useEffect(() => {
    if (questionState === "idle" && !currentRecording) {
      startCountdown();
    }
  }, [currentQuestionIndex, questionState, currentRecording]);

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

  // Recording timer
  useEffect(() => {
    if (questionState === "recording") {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
        setRecordingTime(elapsed);
        
        if (elapsed >= MAX_RECORDING_TIME) {
          stopRecording();
        }
      }, 100);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [questionState]);

  // Retake window timer
  useEffect(() => {
    if (questionState === "retake-window") {
      timerRef.current = setInterval(() => {
        setRetakeTime((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setQuestionState("completed");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [questionState]);

  const startCountdown = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setCountdown(3);
      setQuestionState("countdown");
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record your answers",
        variant: "destructive",
      });
    }
  }, [toast]);

  const startActualRecording = useCallback(() => {
    if (!streamRef.current) return;

    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const duration = recordingTime;

      const newRecordings = [...recordings];
      if (newRecordings[currentQuestionIndex]?.url) {
        URL.revokeObjectURL(newRecordings[currentQuestionIndex]!.url);
      }
      newRecordings[currentQuestionIndex] = { blob: audioBlob, url: audioUrl, duration };
      setRecordings(newRecordings);

      // Start retake window
      setRetakeTime(RETAKE_WINDOW_TIME);
      setQuestionState("retake-window");
    };

    mediaRecorder.start();
    recordingStartTimeRef.current = Date.now();
    setRecordingTime(0);
    setQuestionState("recording");
  }, [recordings, currentQuestionIndex, recordingTime]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && questionState === "recording") {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  }, [questionState]);

  const handleRetake = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (currentRecording?.url) {
      URL.revokeObjectURL(currentRecording.url);
    }
    const newRecordings = [...recordings];
    newRecordings[currentQuestionIndex] = null;
    setRecordings(newRecordings);
    setQuestionState("idle");
    startCountdown();
  }, [currentRecording, recordings, currentQuestionIndex, startCountdown]);

  const playRecording = useCallback(() => {
    if (currentRecording) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(currentRecording.url);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentRecording]);

  const stopPlaying = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    stopPlaying();

    if (isLastQuestion) {
      onComplete(recordings);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuestionState("idle");
    }
  }, [isLastQuestion, recordings, onComplete, stopPlaying]);

  const skipQuestion = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    stopPlaying();

    if (isLastQuestion) {
      onComplete(recordings);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuestionState("idle");
    }
  }, [isLastQuestion, recordings, onComplete, stopPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
        <div className="flex gap-1">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx < currentQuestionIndex
                  ? "bg-primary"
                  : idx === currentQuestionIndex
                  ? "bg-primary animate-pulse"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question Card */}
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="border rounded-xl p-6 bg-card"
      >
        <p className="text-lg font-medium mb-6">
          Q{currentQuestionIndex + 1}: {currentQuestion}
        </p>

        {/* Countdown State */}
        <AnimatePresence mode="wait">
          {questionState === "countdown" && (
            <motion.div
              key="countdown"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-8xl font-bold text-primary"
              >
                {countdown}
              </motion.div>
              <p className="text-muted-foreground mt-4">Get ready to speak...</p>
            </motion.div>
          )}

          {/* Recording State */}
          {questionState === "recording" && (
            <motion.div
              key="recording"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse">
                    <Mic className="w-8 h-8 text-destructive" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive animate-ping" />
                </div>
                <div className="text-2xl font-mono font-semibold">
                  {formatTime(recordingTime)}
                </div>
              </div>
              
              <Progress value={(recordingTime / MAX_RECORDING_TIME) * 100} className="h-2" />
              
              <p className="text-center text-sm text-muted-foreground">
                Recording... Max {MAX_RECORDING_TIME} seconds
              </p>

              <div className="flex justify-center">
                <Button variant="destructive" onClick={stopRecording}>
                  <Square size={16} className="mr-2" />
                  Stop Recording
                </Button>
              </div>
            </motion.div>
          )}

          {/* Retake Window State */}
          {questionState === "retake-window" && (
            <motion.div
              key="retake"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  <Check size={16} className="mr-2" />
                  Recorded ({formatTime(currentRecording?.duration || 0)})
                </Badge>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Retake available for
                </p>
                <div className="text-3xl font-bold text-primary">{retakeTime}s</div>
                <Progress 
                  value={(retakeTime / RETAKE_WINDOW_TIME) * 100} 
                  className="h-1 mt-2"
                />
              </div>

              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={handleRetake}>
                  <RotateCcw size={16} className="mr-2" />
                  Retake
                </Button>
                <Button onClick={handleNext}>
                  {isLastQuestion ? "Finish" : "Next Question"}
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Completed State */}
          {questionState === "completed" && currentRecording && (
            <motion.div
              key="completed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-2">
                <Badge variant="default" className="text-base px-4 py-2">
                  <Check size={16} className="mr-2" />
                  Answer Recorded ({formatTime(currentRecording.duration)})
                </Badge>
              </div>

              <div className="flex justify-center gap-3">
                {isPlaying ? (
                  <Button variant="outline" onClick={stopPlaying}>
                    <Pause size={16} className="mr-2" />
                    Stop
                  </Button>
                ) : (
                  <Button variant="outline" onClick={playRecording}>
                    <Play size={16} className="mr-2" />
                    Play Recording
                  </Button>
                )}
                <Button onClick={handleNext}>
                  {isLastQuestion ? "Finish" : "Next Question"}
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Idle State - Auto-starting, show loading */}
          {questionState === "idle" && !currentRecording && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-6"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Mic className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Preparing to record...
              </p>
            </motion.div>
          )}

          {/* Idle State with existing recording */}
          {questionState === "idle" && currentRecording && (
            <motion.div
              key="idle-with-recording"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  <Check size={16} className="mr-2" />
                  Previously Recorded ({formatTime(currentRecording.duration)})
                </Badge>
              </div>

              <div className="flex justify-center gap-3">
                {isPlaying ? (
                  <Button variant="outline" onClick={stopPlaying}>
                    <Pause size={16} className="mr-2" />
                    Stop
                  </Button>
                ) : (
                  <Button variant="outline" onClick={playRecording}>
                    <Play size={16} className="mr-2" />
                    Play
                  </Button>
                )}
                <Button variant="outline" onClick={handleRetake}>
                  <RotateCcw size={16} className="mr-2" />
                  Re-record
                </Button>
                <Button onClick={handleNext}>
                  {isLastQuestion ? "Finish" : "Next"}
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Summary of completed recordings */}
      {recordings.some(Boolean) && questionState === "idle" && (
        <div className="text-sm text-muted-foreground text-center">
          {recordings.filter(Boolean).length} of {questions.length} questions answered
        </div>
      )}
    </div>
  );
};

export default AudioQuestionFlow;
