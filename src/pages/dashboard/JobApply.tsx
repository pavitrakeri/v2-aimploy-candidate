import { useState, useEffect } from "react";
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
  IndianRupee,
  CheckCircle2,
  Clock,
  Briefcase,
  Users,
  Calendar,
} from "lucide-react";
import { jobsApi, Job, applicationsApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import AudioQuestionFlow from "@/components/audio/AudioQuestionFlow";
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
  duration: number;
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/30";
    case "reviewing":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30";
    case "shortlisted":
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30";
    case "rejected":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30";
    case "hired":
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30";
    default:
      return "bg-primary/10 text-primary border-primary/20 dark:bg-primary/5 dark:text-primary dark:border-primary/10";
  }
};

const getStageFromStatus = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return 1;
    case "reviewing":
      return 2;
    case "shortlisted":
      return 3;
    case "rejected":
      return 4;
    case "hired":
      return 4;
    default:
      return 1;
  }
};

export const JobApply = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any | null>(null);
  const [showApplication, setShowApplication] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligibility, setEligibility] = useState<{
    eligible: boolean;
    detected_country?: string;
    detected_state?: string;
    restricted_country?: string;
    restricted_state?: string;
  } | null>(null);

  // Form data
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [previousCompanyWebsite, setPreviousCompanyWebsite] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [experienceMonths, setExperienceMonths] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [showInterviewInline, setShowInterviewInline] = useState(false);

  // Audio questions
  const [audioQuestions, setAudioQuestions] = useState<string[]>([]);
  const [audioRecordings, setAudioRecordings] = useState<(AudioRecording | null)[]>([]);

  const steps = [
    { number: 1, title: "Personal Info" },
    { number: 2, title: "Resume" },
    { number: 3, title: "Review & Submit" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!jobId) return;

      try {
        const [jobData, prefillData, questionsData, applicationsData, eligibilityData] = await Promise.all([
          jobsApi.getJobById(parseInt(jobId)),
          jobsApi.getApplicationPrefill().catch(() => null),
          jobsApi.getJobAudioQuestions(parseInt(jobId)),
          applicationsApi.getMyApplications({ page_size: 100 }).catch(() => ({ applications: [] })),
          jobsApi.checkJobEligibility(parseInt(jobId)).catch(() => null),
        ]);

        setJob(jobData);
        setEligibility(eligibilityData);
        setAudioQuestions(questionsData.questions || []);
        setAudioRecordings(new Array(questionsData.questions?.length || 0).fill(null));

        // Check if already applied to this job
        const matchedApp = applicationsData.applications.find(
          (app) => app.job_id === parseInt(jobId)
        );
        if (matchedApp) {
          setHasApplied(true);
          setExistingApplication(matchedApp);
        }

        if (prefillData) {
          setFullName(prefillData.full_name || "");
          setEmail(prefillData.email || "");
          setPhone(prefillData.phone || "");
          setPreviousCompanyWebsite(prefillData.previous_company_website || "");
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

  const handleAudioComplete = (recordings: (AudioRecording | null)[]) => {
    setAudioRecordings(recordings);
    setCurrentStep(4);
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return fullName.trim() && email.trim() && phone.trim() && experienceYears.trim();
      case 2:
        return resumeFile !== null;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!job || !resumeFile) return;

    setIsSubmitting(true);
    try {
      await jobsApi.applyForJob(job.id, {
        full_name: fullName,
        email,
        phone,
        resume: resumeFile,
        previous_company_website: previousCompanyWebsite,
        years_of_experience: experienceYears ? Number(experienceYears) : undefined,
        months_of_experience: experienceMonths ? Number(experienceMonths) : undefined,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Job Details View
  if (!showApplication) {
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
            <h1 className="font-display text-2xl font-bold">Job Details</h1>
            <p className="text-muted-foreground">Review the position before applying</p>
          </div>
        </motion.div>

        {/* Location Restriction Warning Banner */}
        {eligibility && !eligibility.eligible && (
          <motion.div variants={itemVariants}>
            <div className="p-6 bg-gradient-to-br from-amber-500/10 via-red-500/10 to-rose-500/10 dark:from-amber-500/5 dark:via-red-500/5 dark:to-rose-500/5 backdrop-blur-md border border-red-500/20 dark:border-red-500/10 rounded-2xl shadow-xl flex items-start gap-4 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
              <div className="p-3 bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl shadow-inner flex-shrink-0 relative">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 block animate-ping absolute" />
                <MapPin className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-red-700 dark:text-red-400">Application Restricted</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  This position has geographic restrictions. Your current location does not match the eligibility criteria set by the employer.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-red-500/10">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Allowed Location</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {eligibility.restricted_state ? `${eligibility.restricted_state}, ` : ''}{eligibility.restricted_country}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Detected Location</span>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400 mt-0.5 block">
                      {eligibility.detected_country 
                        ? `${eligibility.detected_state ? `${eligibility.detected_state}, ` : ''}${eligibility.detected_country}`
                        : 'Unknown location'
                      }
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic">
                  * Location detected via client IP address. If you are using a VPN or proxy, please disable it to verify your location.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Job Header Card */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <div className="bg-gradient-hero p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground text-2xl font-bold">
                    {job.title.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-2xl font-bold text-primary-foreground">
                    {job.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-primary-foreground/80">
                    {job.department && (
                      <span className="flex items-center gap-1">
                        <Building2 size={16} />
                        {job.department}
                      </span>
                    )}
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={16} />
                        {job.location}
                      </span>
                    )}
                    {job.employment_type && (
                      <Badge className="bg-primary-foreground/20 text-primary-foreground border-0">
                        {job.employment_type}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {job.salary_range && (
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <IndianRupee className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-xs text-muted-foreground">Salary</p>
                    <p className="font-semibold">{job.salary_range}</p>
                  </div>
                )}
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Briefcase className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Job Type</p>
                  <p className="font-semibold">{job.employment_type || "Full-time"}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Posted</p>
                  <p className="font-semibold">{formatDate(job.created_at)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Applications</p>
                  <p className="font-semibold">Open</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Job Description */}
        {job.description && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="font-display">About the Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Requirements */}
        {job.requirements && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.split(",").map((req, idx) => (
                    <Badge key={idx} variant="secondary" className="px-3 py-1">
                      {req.trim()}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <Card className={hasApplied ? "border-green-500/30 bg-green-500/5 dark:bg-green-950/5" : "border-primary/30 bg-primary/5"}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {hasApplied && existingApplication ? (
                  <div className="w-full space-y-6">
                    <div>
                      <h3 className="font-display text-xl font-bold flex items-center gap-2 mb-2 text-primary">
                        <CheckCircle2 size={24} className="text-green-500" />
                        Application Status
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        You applied for this position on {formatDate(existingApplication.created_at)}.
                      </p>
                    </div>

                    {/* Status Badges & Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="p-4 bg-muted/40 rounded-xl border border-border/50">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1">Current Status</span>
                        <Badge className={`${getStatusColor(existingApplication.status)} px-3 py-1 font-semibold text-sm border`}>
                          {existingApplication.status ? existingApplication.status.charAt(0).toUpperCase() + existingApplication.status.slice(1) : 'Pending'}
                        </Badge>
                      </div>
                      {existingApplication.match_score !== undefined && existingApplication.match_score !== null && (
                        <div className="p-4 bg-muted/40 rounded-xl border border-border/50">
                          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1">AI Match Score</span>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-primary">{existingApplication.match_score}%</span>
                            <div className="w-24 bg-muted h-2 rounded-full overflow-hidden">
                              <div className="bg-primary h-full rounded-full" style={{ width: `${existingApplication.match_score}%` }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="p-4 bg-muted/40 rounded-xl border border-border/50">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1">Position Type</span>
                        <span className="font-semibold text-foreground">{job.employment_type || "Full-time"}</span>
                      </div>
                    </div>

                    {/* Progress Timeline */}
                    <div className="py-6 px-4 bg-muted/20 rounded-2xl border border-border/30">
                      <h4 className="font-semibold text-sm text-foreground mb-6 uppercase tracking-wider">Application Timeline</h4>
                      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4">
                        {/* Horizontal line for desktop */}
                        <div className="hidden md:block absolute top-[18px] left-[5%] right-[5%] h-0.5 bg-muted-foreground/20 -z-10 w-[90%]">
                          <div 
                            className="bg-primary h-full transition-all duration-500" 
                            style={{ 
                              width: existingApplication.status?.toLowerCase() === 'rejected' 
                                ? '100%' 
                                : `${Math.max(0, (getStageFromStatus(existingApplication.status) - 1) * 33.3)}%` 
                            }}
                          />
                        </div>

                        {/* Timeline Steps */}
                        {[
                          { step: 1, label: "Applied", desc: "Form submitted successfully" },
                          { step: 2, label: "Screening", desc: "Resume & audio scoring" },
                          { step: 3, label: "Interview", desc: "Shortlist decision" },
                          { 
                            step: 4, 
                            label: existingApplication.status?.toLowerCase() === 'rejected' ? "Rejected" : "Decision", 
                            desc: existingApplication.status?.toLowerCase() === 'hired' 
                              ? "Offer extended!" 
                              : existingApplication.status?.toLowerCase() === 'rejected'
                              ? "Application closed"
                              : "Final updates"
                          }
                        ].map((t) => {
                          const isCurrent = t.step === getStageFromStatus(existingApplication.status);
                          const isCompleted = t.step < getStageFromStatus(existingApplication.status) || existingApplication.status?.toLowerCase() === 'hired' || (existingApplication.status?.toLowerCase() === 'rejected' && t.step === 4);
                          const isRejectedStep = t.step === 4 && existingApplication.status?.toLowerCase() === 'rejected';

                          return (
                            <div key={t.step} className="flex md:flex-col items-center gap-4 md:gap-2 flex-1 text-left md:text-center relative">
                              <div 
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 z-10 transition-all duration-300 ${
                                  isRejectedStep 
                                    ? "bg-red-100 border-red-500 text-red-600 dark:bg-red-950/30"
                                    : isCompleted 
                                    ? "bg-primary border-primary text-primary-foreground" 
                                    : isCurrent 
                                    ? "bg-background border-primary text-primary shadow-md ring-2 ring-primary/20" 
                                    : "bg-background border-muted text-muted-foreground"
                                }`}
                              >
                                {isCompleted && !isRejectedStep ? "✓" : isRejectedStep ? "✗" : t.step}
                              </div>
                              <div className="space-y-0.5">
                                <p className={`font-semibold text-sm ${isCurrent ? 'text-primary' : isRejectedStep ? 'text-red-600' : 'text-foreground'}`}>
                                  {t.label}
                                </p>
                                <p className="text-xs text-muted-foreground hidden md:block max-w-[120px] mx-auto leading-relaxed">
                                  {t.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Skills match */}
                    {((existingApplication.match_skills && existingApplication.match_skills.length > 0) || 
                      (existingApplication.missing_skills && existingApplication.missing_skills.length > 0)) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {existingApplication.match_skills && existingApplication.match_skills.length > 0 && (
                          <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/10">
                            <h5 className="text-xs font-semibold text-green-800 dark:text-green-400 uppercase tracking-wider mb-2">Matched Skills</h5>
                            <div className="flex flex-wrap gap-1.5">
                              {existingApplication.match_skills.map((skill: string) => (
                                <Badge key={skill} className="bg-green-100 hover:bg-green-100 text-green-800 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30 text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {existingApplication.missing_skills && existingApplication.missing_skills.length > 0 && (
                          <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/10">
                            <h5 className="text-xs font-semibold text-yellow-800 dark:text-yellow-400 uppercase tracking-wider mb-2">Missing Skills</h5>
                            <div className="flex flex-wrap gap-1.5">
                              {existingApplication.missing_skills.map((skill: string) => (
                                <Badge key={skill} className="bg-yellow-100 hover:bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/30 text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {existingApplication.status?.toLowerCase() === "shortlisted" && (
                      (!existingApplication.audio_response || Object.keys(existingApplication.audio_response).length === 0) ? (
                        showInterviewInline ? (
                          <div className="mt-6 p-6 bg-background rounded-2xl border border-border space-y-6">
                            <h4 className="font-display font-bold text-lg text-primary mb-4">Audio Interview Round</h4>
                            <AudioQuestionFlow
                              questions={audioQuestions}
                              onComplete={async (recordings) => {
                                setIsSubmitting(true);
                                try {
                                  const audioFiles: Record<string, File> = {};
                                  recordings.forEach((recording, index) => {
                                    if (recording) {
                                      const file = new File([recording.blob], `audio_q${index + 1}.webm`, {
                                        type: "audio/webm",
                                      });
                                      audioFiles[`audio_q${index + 1}`] = file;
                                    }
                                  });

                                  await applicationsApi.submitAudioForApplication(existingApplication.id, audioFiles);

                                  toast({
                                    title: "Audio interview submitted!",
                                    description: "Your responses have been recorded and screening has started.",
                                  });

                                  // Fetch updated applications to refresh UI state
                                  try {
                                    const appData = await applicationsApi.getMyApplications({ page_size: 100 });
                                    const matchedApp = appData.applications.find(
                                      (app) => app.job_id === parseInt(jobId!)
                                    );
                                    if (matchedApp) {
                                      setExistingApplication(matchedApp);
                                    }
                                  } catch (e) {
                                    console.error("Error refreshing applications after audio submission:", e);
                                  }

                                  navigate("/dashboard/applications");
                                } catch (error) {
                                  toast({
                                    title: "Failed to submit audio responses",
                                    description: error instanceof Error ? error.message : "Please try again",
                                    variant: "destructive",
                                  });
                                } finally {
                                  setIsSubmitting(false);
                                }
                              }}
                              initialRecordings={audioRecordings}
                            />
                          </div>
                        ) : (
                          <div className="mt-6 p-6 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl space-y-4">
                            <div>
                              <h4 className="font-display font-bold text-lg text-primary">Next Stage: Audio Interview Required</h4>
                              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                                Great news! You have been shortlisted for this position. The next stage is an automated audio-based interview.
                              </p>
                            </div>
                            <Button
                              variant="gradient"
                              onClick={() => setShowInterviewInline(true)}
                              disabled={isSubmitting}
                            >
                              Start Audio Interview
                              <ArrowRight size={18} className="ml-2" />
                            </Button>
                          </div>
                        )
                      ) : (
                        <div className="mt-6 p-6 bg-green-500/5 border border-green-500/20 rounded-2xl space-y-2">
                          <h4 className="font-display font-bold text-lg text-green-700 dark:text-green-400 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            Audio Assessment Completed
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-450 leading-relaxed">
                            Your audio responses have been submitted successfully. The screening evaluation is in progress.
                          </p>
                        </div>
                      )
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1 rounded-xl shadow-sm"
                        onClick={() => navigate("/dashboard/jobs")}
                      >
                        Browse All Jobs
                      </Button>
                      <Button
                        variant="gradient"
                        size="lg"
                        className="flex-1 rounded-xl shadow-md"
                        onClick={() => navigate("/dashboard/applications")}
                      >
                        View My Applications
                        <ArrowRight size={18} className="ml-2" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="font-display text-lg font-semibold">Ready to Apply?</h3>
                      <p className="text-sm text-muted-foreground">
                        {eligibility && !eligibility.eligible 
                          ? "This position is not open to applications from your current location."
                          : "Submit your application and take the next step in your career"
                        }
                      </p>
                    </div>
                    <Button
                      variant={eligibility && !eligibility.eligible ? "outline" : "gradient"}
                      size="lg"
                      className="w-full md:w-auto"
                      onClick={() => setShowApplication(true)}
                      disabled={eligibility !== null && !eligibility.eligible}
                    >
                      {eligibility && !eligibility.eligible ? "Apply Restricted" : "Apply Now"}
                      <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  // Application Form View
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
          onClick={() => setShowApplication(false)}
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
                  <IndianRupee size={14} />
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
                    disabled
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experienceYears">Years of Experience *</Label>
                    <Input
                      id="experienceYears"
                      type="number"
                      min="0"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="Years"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experienceMonths">Months</Label>
                    <Input
                      id="experienceMonths"
                      type="number"
                      min="0"
                      max="11"
                      value={experienceMonths}
                      onChange={(e) => setExperienceMonths(e.target.value)}
                      placeholder="Months"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousCompanyWebsite">Previous Company Website <span className="text-muted-foreground font-normal text-xs">(Optional)</span></Label>
                  <Input
                    id="previousCompanyWebsite"
                    value={previousCompanyWebsite}
                    onChange={(e) => setPreviousCompanyWebsite(e.target.value)}
                    placeholder="example.com"
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
                    <div 
                      className="cursor-pointer"
                      onClick={() => document.getElementById("resume")?.click()}
                    >
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium mb-1">Upload your resume</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        PDF, DOC, or DOCX (max 10MB)
                      </p>
                      <Button variant="outline" type="button">
                        Select File
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
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
                      <div>
                        <span className="text-muted-foreground">Experience:</span> {experienceYears} Years {experienceMonths ? `, ${experienceMonths} Months` : ""}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Previous Company Website:</span> {previousCompanyWebsite || "Not provided"}
                      </div>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Resume</h4>
                    <p className="text-sm">{resumeFile?.name}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((s) => s - 1)}
          disabled={currentStep === 1}
        >
          <ArrowLeft size={16} className="mr-2" />
          Previous
        </Button>
        {currentStep < 3 ? (
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
