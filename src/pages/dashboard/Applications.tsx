import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { applicationsApi, Application } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

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

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
          Track and manage your job applications
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
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

      {/* Filter */}
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

      {/* Applications List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : applications.length === 0 ? (
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
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <ExternalLink size={14} />
                            View Details
                          </Button>
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
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
    </motion.div>
  );
};

export default Applications;
