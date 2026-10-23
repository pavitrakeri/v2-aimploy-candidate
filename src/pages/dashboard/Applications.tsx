import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  MoreVertical,
  Loader2,
  FileText,
  CheckCircle2,
  Clock,
  Briefcase,
  TrendingUp,
  AlertCircle,
  GraduationCap,
  Sparkles
} from "lucide-react";
import { applicationsApi, programsApi, Application } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { CandidateStrengthsModal } from "@/components/CandidateStrengthsModal";

const stages = ["Applied", "Screening", "Interview", "Final Round", "Decision"];

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "reviewing":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "shortlisted":
      return "bg-green-100 text-green-700 border-green-200";
    case "rejected":
      return "bg-red-100 text-red-700 border-red-200";
    case "hired":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    default:
      return "bg-primary/10 text-primary border-primary/20";
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
      return 5;
    default:
      return 1;
  }
};

const getProgramStage = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return 1;
    case "reviewing":
      return 2;
    case "accepted":
    case "rejected":
      return 3;
    default:
      return 1;
  }
};

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

export const Applications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState<'jobs' | 'programs'>('jobs');
  const [programApplications, setProgramApplications] = useState<any[]>([]);
  const [selectedProgramApp, setSelectedProgramApp] = useState<any | null>(null);
  const [strengthsModalOpen, setStrengthsModalOpen] = useState(false);
  const [strengthsApp, setStrengthsApp] = useState<{ id: number; title: string; company: string } | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    shortlisted: 0,
  });

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await applicationsApi.getMyApplications({
        page,
        page_size: 10,
        application_status: statusFilter || undefined,
      });
      setApplications(response.applications);
      setTotalPages(response.total_pages);
      setTotal(response.total);

      // Calculate stats from all applications (without filter)
      const allResponse = await applicationsApi.getMyApplications({ page_size: 100 });
      const allApps = allResponse.applications;
      setStats({
        total: allApps.length,
        pending: allApps.filter((a) => a.status?.toLowerCase() === "pending").length,
        reviewing: allApps.filter((a) => a.status?.toLowerCase() === "reviewing").length,
        shortlisted: allApps.filter((a) => a.status?.toLowerCase() === "shortlisted").length,
      });
    } catch (error) {
      toast({
        title: "Failed to load applications",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProgramApplications = async () => {
    setIsLoading(true);
    try {
      const response = await programsApi.getMyProgramApplications();
      setProgramApplications(response);
    } catch (error) {
      toast({
        title: "Failed to load program applications",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "programs") {
      fetchProgramApplications();
    } else {
      fetchApplications();
    }
  }, [page, statusFilter, activeSubTab]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleViewDetails = (app: Application) => {
    setSelectedApplication(app);
    setIsDetailsOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "reviewing":
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case "shortlisted":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "hired":
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Your application is being processed. We'll notify you once it's reviewed.";
      case "reviewing":
        return "Great news! Your application is currently under review by the hiring team.";
      case "shortlisted":
        return "Congratulations! You've been shortlisted for the next round.";
      case "rejected":
        return "Unfortunately, your application was not selected for this position.";
      case "hired":
        return "Congratulations! You've been selected for this position!";
      default:
        return "Your application status will be updated soon.";
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-display text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage your submitted applications
        </p>
      </motion.div>

      {/* Sub-tabs toggle */}
      <motion.div variants={itemVariants} className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            setActiveSubTab("jobs");
            setPage(1);
            setStatusFilter("");
          }}
          className={`py-2.5 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubTab === "jobs"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Job Applications
        </button>
        <button
          onClick={() => {
            setActiveSubTab("programs");
            setPage(1);
            setStatusFilter("");
          }}
          className={`py-2.5 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubTab === "programs"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Program Applications
        </button>
      </motion.div>

      {/* Stats */}
      {activeSubTab === "jobs" && (
        <motion.div variants={itemVariants} className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Applications</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">In Review</p>
              <p className="text-3xl font-bold text-blue-600">{stats.reviewing}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Shortlisted</p>
              <p className="text-3xl font-bold text-green-600">{stats.shortlisted}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filter */}
      {activeSubTab === "jobs" && (
        <motion.div variants={itemVariants} className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {/* Applications List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : activeSubTab === "jobs" ? (
        applications.length === 0 ? (
          <motion.div variants={itemVariants} className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
            <p className="text-muted-foreground">Start applying for jobs to see them here</p>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} className="space-y-4">
            {applications.map((app) => {
              const stage = getStageFromStatus(app.status);
              return (
                <motion.div key={app.id} variants={itemVariants}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left: Company Info */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                            <span className="text-primary-foreground text-xl font-bold">
                              {app.job?.title?.charAt(0) || "J"}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-display text-lg font-semibold">
                                {app.job?.title || "Job Title"}
                              </h3>
                              <Badge variant="outline" className={getStatusColor(app.status)}>
                                {app.status || "Pending"}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                              {app.job?.department && (
                                <span className="flex items-center gap-1">
                                  <Building2 size={14} />
                                  {app.job.department}
                                </span>
                              )}
                              {app.job?.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={14} />
                                  {app.job.location}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                Applied {formatDate(app.created_at)}
                              </span>
                            </div>
                            {app.match_score !== undefined && app.match_score !== null && (
                              <div className="mt-2">
                                <span className="text-sm font-medium text-primary">
                                  Match Score: {Math.round(app.match_score)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Progress & Actions */}
                        <div className="lg:w-72 space-y-4">
                          {/* Progress Bar */}
                          <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-2">
                              <span>Progress</span>
                              <span>{stage}/{stages.length} stages</span>
                            </div>
                            <div className="flex gap-1">
                              {stages.map((stageName, index) => (
                                <div
                                  key={stageName}
                                  className={`h-2 flex-1 rounded-full ${
                                    index < stage
                                      ? "bg-gradient-primary"
                                      : "bg-muted"
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>{stages[0]}</span>
                              <span>{stages[stages.length - 1]}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 flex-wrap">
                            {app.status?.toLowerCase() === "shortlisted" && 
                             (!app.audio_response || 
                              Object.keys(app.audio_response).length === 0 ||
                              !Object.values(app.audio_response).some((item: any) => 
                                item && (typeof item === 'string' ? item.trim().length > 0 : !!item.answer_url)
                              )) ? (
                              <>
                                <Button 
                                  variant="gradient" 
                                  size="sm" 
                                  className="flex-1 min-w-[140px]"
                                  onClick={() => navigate(`/dashboard/jobs/${app.job_id}/apply`)}
                                >
                                  Record Audio Responses
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => {
                                    setSelectedProgramApp(null);
                                    setSelectedApplication(app);
                                    setIsDetailsOpen(true);
                                  }}
                                >
                                  View Details
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30"
                                  onClick={() => {
                                    setStrengthsApp({
                                      id: app.id,
                                      title: app.job_title || "Position",
                                      company: app.company_name || "Company"
                                    });
                                    setStrengthsModalOpen(true);
                                  }}
                                >
                                  <Sparkles size={14} className="mr-1 text-emerald-600" />
                                  Strengths
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => {
                                    setSelectedProgramApp(null);
                                    setSelectedApplication(app);
                                    setIsDetailsOpen(true);
                                  }}
                                >
                                  <ExternalLink size={14} className="mr-1" />
                                  View Details
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="sm">
                              <MoreVertical size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )
      ) : (
        programApplications.length === 0 ? (
          <motion.div variants={itemVariants} className="text-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No program applications yet</h3>
            <p className="text-muted-foreground">Start applying for programs to see them here</p>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} className="space-y-4">
            {programApplications.map((app) => {
              const stage = getProgramStage(app.status);
              const pStages = ["Applied", "Reviewing", "Decision"];
              return (
                <motion.div key={app.id} variants={itemVariants}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left: Program Info */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 text-white">
                            <GraduationCap size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-display text-lg font-semibold">
                                {app.program_title}
                              </h3>
                              <Badge variant="outline" className={getStatusColor(app.status)}>
                                {app.status || "Pending"}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                              <span className="flex items-center gap-1">
                                <Briefcase size={14} />
                                Track: <strong>{app.track}</strong>
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                Applied {formatDate(app.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Progress & Actions */}
                        <div className="lg:w-72 space-y-4">
                          {/* Progress Bar */}
                          <div>
                            <div className="flex justify-between text-xs text-muted-foreground mb-2">
                              <span>Progress</span>
                              <span>{stage}/{pStages.length} stages</span>
                            </div>
                            <div className="flex gap-1">
                              {pStages.map((stageName, index) => (
                                <div
                                  key={stageName}
                                  className={`h-2 flex-1 rounded-full ${
                                    index < stage
                                      ? "bg-gradient-primary"
                                      : "bg-muted"
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>{pStages[0]}</span>
                              <span>{pStages[pStages.length - 1]}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => {
                                setSelectedApplication(null);
                                setSelectedProgramApp(app);
                                setIsDetailsOpen(true);
                              }}
                            >
                              <ExternalLink size={14} className="mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )
      )}

      {/* Pagination */}
      {activeSubTab === "jobs" && totalPages > 1 && (
        <motion.div variants={itemVariants} className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </motion.div>
      )}

      {/* Application Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Application Details</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Job Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground text-lg font-bold">
                    {selectedApplication.job?.title?.charAt(0) || "J"}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedApplication.job?.title || "Job Title"}</h3>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-1">
                    {selectedApplication.job?.department && (
                      <span className="flex items-center gap-1">
                        <Building2 size={14} />
                        {selectedApplication.job.department}
                      </span>
                    )}
                    {selectedApplication.job?.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {selectedApplication.job.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(selectedApplication.status)}
                  <div>
                    <p className="text-sm text-muted-foreground">Current Status</p>
                    <Badge variant="outline" className={getStatusColor(selectedApplication.status)}>
                      {selectedApplication.status || "Pending"}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {getStatusMessage(selectedApplication.status)}
                </p>
              </div>

              {/* Application Timeline */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Briefcase size={16} />
                  Application Progress
                </h4>
                <div className="space-y-3">
                  {stages.map((stageName, index) => {
                    const stage = getStageFromStatus(selectedApplication.status);
                    const isCompleted = index < stage;
                    const isCurrent = index === stage - 1;
                    return (
                      <div key={stageName} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isCompleted 
                            ? "bg-primary text-primary-foreground" 
                            : isCurrent 
                              ? "bg-primary/20 text-primary border-2 border-primary"
                              : "bg-muted text-muted-foreground"
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <span className="text-xs font-medium">{index + 1}</span>
                          )}
                        </div>
                        <span className={`text-sm ${isCompleted || isCurrent ? "font-medium" : "text-muted-foreground"}`}>
                          {stageName}
                        </span>
                        {isCurrent && (
                          <Badge variant="secondary" className="text-xs ml-auto">Current</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Match Score */}
              {selectedApplication.match_score !== undefined && selectedApplication.match_score !== null && (
                <div className="bg-primary/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Match Score</span>
                    <span className="text-lg font-bold text-primary">{Math.round(selectedApplication.match_score)}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-primary rounded-full transition-all"
                      style={{ width: `${selectedApplication.match_score}%` }}
                    />
                  </div>
                  {selectedApplication.match_skills && selectedApplication.match_skills.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-1">Matching Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedApplication.match_skills.slice(0, 5).map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Applied Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-4">
                <Calendar size={14} />
                <span>Applied on {formatDate(selectedApplication.created_at)}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                  onClick={() => {
                    setStrengthsApp({
                      id: selectedApplication.id,
                      title: selectedApplication.job_title || "Position",
                      company: selectedApplication.company_name || "Company"
                    });
                    setStrengthsModalOpen(true);
                  }}
                >
                  <Sparkles size={14} className="mr-2 text-emerald-600" />
                  View Strengths Feedback
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    navigate(`/dashboard/jobs/${selectedApplication.job_id}/apply`);
                  }}
                >
                  <ExternalLink size={14} className="mr-2" />
                  View Job Posting
                </Button>
              </div>
            </div>
          )}

          {selectedProgramApp && (
            <div className="space-y-6">
              {/* Program Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0 text-white animate-pulse-subtle">
                  <GraduationCap size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedProgramApp.program_title}</h3>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Briefcase size={14} />
                      Track: <strong>{selectedProgramApp.track}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-muted/50 rounded-lg p-4 border border-border/40">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(selectedProgramApp.status)}
                  <div>
                    <p className="text-sm text-muted-foreground">Current Status</p>
                    <Badge variant="outline" className={getStatusColor(selectedProgramApp.status)}>
                      {selectedProgramApp.status || "Pending"}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedProgramApp.status?.toLowerCase() === "accepted"
                    ? "Congratulations! You have been accepted into the program."
                    : selectedProgramApp.status?.toLowerCase() === "rejected"
                    ? "We regret to inform you that your application was not selected."
                    : "Your application is currently under review by the program committee."}
                </p>
              </div>

              {/* Program Timeline */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Briefcase size={16} />
                  Program Application Progress
                </h4>
                <div className="space-y-3">
                  {["Applied", "Reviewing", "Decision"].map((stageName, index) => {
                    const stage = getProgramStage(selectedProgramApp.status);
                    const isCompleted = index < stage;
                    const isCurrent = index === stage - 1;
                    return (
                      <div key={stageName} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                          isCompleted 
                            ? "bg-primary text-primary-foreground" 
                            : isCurrent 
                              ? "bg-primary/20 text-primary border-2 border-primary"
                              : "bg-muted text-muted-foreground"
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <span className="text-xs font-medium">{index + 1}</span>
                          )}
                        </div>
                        <span className={`text-sm ${isCompleted || isCurrent ? "font-medium" : "text-muted-foreground"}`}>
                          {stageName}
                        </span>
                        {isCurrent && (
                          <Badge variant="secondary" className="text-xs ml-auto">Current</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Motivational Statement & Personal Details */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium text-sm">Application Details</h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">Full Name</span>
                    <span className="font-medium">{selectedProgramApp.full_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Email</span>
                    <span className="font-medium">{selectedProgramApp.email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Phone</span>
                    <span className="font-medium">{selectedProgramApp.phone}</span>
                  </div>
                  {selectedProgramApp.linkedin && (
                    <div>
                      <span className="text-muted-foreground block text-xs">LinkedIn</span>
                      <a 
                        href={selectedProgramApp.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium inline-flex items-center gap-0.5"
                      >
                        Profile <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground block text-xs">Experience Level</span>
                    <span className="font-medium">{selectedProgramApp.experience_level}</span>
                  </div>
                  {(selectedProgramApp.current_role || selectedProgramApp.current_company) && (
                    <div>
                      <span className="text-muted-foreground block text-xs">Current Role</span>
                      <span className="font-medium">
                        {selectedProgramApp.current_role || "N/A"} 
                        {selectedProgramApp.current_company ? ` at ${selectedProgramApp.current_company}` : ""}
                      </span>
                    </div>
                  )}
                </div>
                {selectedProgramApp.motivation && (
                  <div className="mt-3 bg-muted/30 rounded-lg p-3 border border-border/30">
                    <span className="text-muted-foreground block text-xs mb-1">Motivation / Statement of Purpose</span>
                    <p className="text-sm whitespace-pre-line text-foreground/90">{selectedProgramApp.motivation}</p>
                  </div>
                )}
              </div>

              {/* Applied Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-4">
                <Calendar size={14} />
                <span>Applied on {formatDate(selectedProgramApp.created_at)}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    navigate(`/dashboard/programs/${selectedProgramApp.program_slug}`);
                  }}
                >
                  <ExternalLink size={14} className="mr-2" />
                  View Program Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Candidate Strengths Feedback Modal (v2 Plain-Language Report) */}
      <CandidateStrengthsModal
        isOpen={strengthsModalOpen}
        onClose={() => setStrengthsModalOpen(false)}
        applicationId={strengthsApp?.id || null}
        jobTitle={strengthsApp?.title}
        companyName={strengthsApp?.company}
      />
    </motion.div>
  );
};

export default Applications;
