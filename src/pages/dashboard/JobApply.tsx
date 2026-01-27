import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Check,
  Loader2,
  MapPin,
  Building2,
  DollarSign,
  Mic,
  Square,
  Play,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { jobsApi, Job, ApplicationPrefill } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface AudioRecording {
  blob: Blob;
  url: string;
}

export const JobApply = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Audio questions
  const [audioQuestions, setAudioQuestions] = useState<string[]>([]);
  const [audioRecordings, setAudioRecordings] = useState<(AudioRecording | null)[]>([]);
  const [isRecording, setIsRecording] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const steps = [
    { number: 1, title: "Personal Info" },
    { number: 2, title: "Resume" },
    { number: 3, title: "Audio Interview" },
    { number: 4, title: "Review & Submit" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!jobId) return;

      try {
        const [jobData, prefillData, questionsData] = await Promise.all([
          jobsApi.getJobById(parseInt(jobId)),
          jobsApi.getApplicationPrefill().catch(() => null),
          jobsApi.getJobAudioQuestions(parseInt(jobId)),
        ]);

        setJob(jobData);
        setAudioQuestions(questionsData.questions || []);
        setAudioRecordings(new Array(questionsData.questions?.length || 0).fill(null));

        if (prefillData) {
          setFullName(prefillData.full_name || "");
          setEmail(prefillData.email || "");
          setPhone(prefillData.phone || "");
        }
      } catch (error) {
        toast({
          title: "Failed to load job details",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
      } finally {
        setIsLoadingJob(false);
      }
    };

    fetchData();
  }, [jobId, toast]);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, or DOCX file",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Resume must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      setResumeFile(file);
    }
  };

  const startRecording = async (questionIndex: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioRecordings((prev) => {
          const updated = [...prev];
          updated[questionIndex] = { blob: audioBlob, url: audioUrl };
          return updated;
        });

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(questionIndex);
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record your answers",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording !== null) {
      mediaRecorderRef.current.stop();
      setIsRecording(null);
    }
  };

  const playRecording = (questionIndex: number) => {
    const recording = audioRecordings[questionIndex];
    if (recording) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(recording.url);
      audioRef.current.onended = () => setIsPlaying(null);
      audioRef.current.play();
      setIsPlaying(questionIndex);
    }
  };

  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(null);
    }
  };

  const deleteRecording = (questionIndex: number) => {
    setAudioRecordings((prev) => {
      const updated = [...prev];
      if (updated[questionIndex]?.url) {
        URL.revokeObjectURL(updated[questionIndex]!.url);
      }
      updated[questionIndex] = null;
      return updated;
    });
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return fullName.trim() && email.trim() && phone.trim();
      case 2:
        return resumeFile !== null;
      case 3:
        return true; // Audio is optional
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!job || !resumeFile) return;

    setIsSubmitting(true);
    try {
      const audioFiles: Record<string, File> = {};
      audioRecordings.forEach((recording, index) => {
        if (recording) {
          const file = new File([recording.blob], `audio_q${index + 1}.webm`, {
            type: "audio/webm",
          });
          audioFiles[`audio_q${index + 1}`] = file;
        }
      });

      await jobsApi.applyForJob(job.id, {
        full_name: fullName,
        email,
        phone,
        resume: resumeFile,
        ...audioFiles,
      });

      toast({
        title: "Application submitted!",
        description: "Your application has been submitted successfully.",
      });

      navigate("/dashboard/applications");
    } catch (error) {
      toast({
        title: "Failed to submit application",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingJob) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Job not found</h2>
        <Button onClick={() => navigate("/dashboard/jobs")}>Browse Jobs</Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/jobs")}
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Apply for Position</h1>
          <p className="text-muted-foreground">{job.title}</p>
        </div>
      </motion.div>

      {/* Job Summary Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {job.department && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Building2 size={14} />
                  {job.department}
                </span>
              )}
              {job.location && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin size={14} />
                  {job.location}
                </span>
              )}
              {job.salary_range && (
                <span className="flex items-center gap-1 text-primary font-medium">
                  <DollarSign size={14} />
                  {job.salary_range}
                </span>
              )}
              {job.employment_type && (
                <Badge variant="outline">{job.employment_type}</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Steps */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep > step.number
                      ? "bg-primary text-primary-foreground"
                      : currentStep === step.number
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.number ? <Check size={20} /> : step.number}
                </div>
                <span className="text-xs mt-1 text-muted-foreground hidden sm:block">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 sm:w-24 h-1 mx-2 transition-colors ${
                    currentStep > step.number ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Step Content */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Resume */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="hidden"
                  />
                  {resumeFile ? (
                    <div className="space-y-2">
                      <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
                      <p className="font-medium">{resumeFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("resume")?.click()}
                      >
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="resume" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium mb-1">Upload your resume</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        PDF, DOC, or DOCX (max 10MB)
                      </p>
                      <Button variant="outline" type="button">
                        Select File
                      </Button>
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Audio Interview */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {audioQuestions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No audio questions for this position. You can proceed to the next step.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Record your answers to the following questions. Audio responses are optional but highly recommended.
                    </p>
                    {audioQuestions.map((question, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <p className="font-medium">
                          Q{index + 1}: {question}
                        </p>
                        <div className="flex items-center gap-3">
                          {!audioRecordings[index] ? (
                            isRecording === index ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={stopRecording}
                              >
                                <Square size={16} className="mr-2" />
                                Stop Recording
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startRecording(index)}
                                disabled={isRecording !== null}
                              >
                                <Mic size={16} className="mr-2" />
                                Record Answer
                              </Button>
                            )
                          ) : (
                            <>
                              {isPlaying === index ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={stopPlaying}
                                >
                                  <Square size={16} className="mr-2" />
                                  Stop
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => playRecording(index)}
                                >
                                  <Play size={16} className="mr-2" />
                                  Play
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteRecording(index)}
                              >
                                <Trash2 size={16} className="mr-2" />
                                Delete
                              </Button>
                              <Badge variant="secondary">
                                <Check size={12} className="mr-1" />
                                Recorded
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Personal Information</h4>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span> {fullName}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span> {email}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span> {phone}
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Resume</h4>
                    <p className="text-sm">{resumeFile?.name}</p>
                  </div>
                  {audioQuestions.length > 0 && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Audio Responses</h4>
                      <p className="text-sm text-muted-foreground">
                        {audioRecordings.filter(Boolean).length} of {audioQuestions.length} questions answered
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation Buttons */}
      <motion.div variants={itemVariants} className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((s) => s - 1)}
          disabled={currentStep === 1}
        >
          <ArrowLeft size={16} className="mr-2" />
          Previous
        </Button>
        {currentStep < 4 ? (
          <Button
            onClick={() => setCurrentStep((s) => s + 1)}
            disabled={!canProceedToNextStep()}
          >
            Next
            <ArrowRight size={16} className="ml-2" />
          </Button>
        ) : (
          <Button
            variant="gradient"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Application
                <Check size={16} className="ml-2" />
              </>
            )}
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default JobApply;
