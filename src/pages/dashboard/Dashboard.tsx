import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  FileText,
  ArrowRight,
  Clock,
  Building2,
  MapPin,
  CheckCircle2,
  Circle,
  Sparkles,
  Flame,
  BarChart3,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { applicationsApi, jobsApi, Application, Job } from "@/services/api";

const marketInsights = {
  trendingSkills: [
    { name: "React", growth: "+24%", hot: true },
    { name: "TypeScript", growth: "+31%", hot: true },
    { name: "AI/ML", growth: "+45%", hot: true },
    { name: "Python", growth: "+18%", hot: false },
    { name: "AWS", growth: "+15%", hot: false },
  ],
  hotIndustries: ["FinTech", "HealthTech", "AI/SaaS", "E-commerce"],
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

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes("review") || statusLower.includes("pending")) {
    return "bg-yellow-100 text-yellow-700";
  }
  if (statusLower.includes("interview") || statusLower.includes("accepted")) {
    return "bg-green-100 text-green-700";
  }
  if (statusLower.includes("reject")) {
    return "bg-red-100 text-red-700";
  }
  return "bg-primary/10 text-primary";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: applicationsData, isLoading: isLoadingApplications } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => applicationsApi.getMyApplications({ page: 1, page_size: 5 }),
  });

  const { data: jobsData, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["recommended-jobs"],
    queryFn: () => jobsApi.getJobs({ page: 1, page_size: 5 }),
  });

  const recentApplications = applicationsData?.applications || [];
  const recommendedJobs = jobsData?.jobs || [];
  const totalApplications = applicationsData?.total || 0;
  const totalJobs = jobsData?.total || 0;

  // Calculate profile completion
  const profileFields = [
    { name: "Name", completed: !!user?.full_name },
    { name: "Email", completed: !!user?.email },
    { name: "Phone", completed: !!user?.phone },
    { name: "Location", completed: !!user?.location },
    { name: "Resume", completed: !!user?.resume_url },
    { name: "LinkedIn", completed: !!user?.linkedin_url },
    { name: "Skills", completed: !!user?.skills && user.skills.length > 0 },
    { name: "Experience", completed: !!user?.years_of_experience },
  ];
  const completedFields = profileFields.filter(f => f.completed).length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

  const firstName = user?.first_name || user?.full_name?.split(" ")[0] || "there";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Welcome back, {firstName}! 👋</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Here's what's happening with your job search
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">{totalApplications}</p>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-primary/10 text-primary">
                <FileText size={20} className="sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Jobs</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1">{totalJobs}</p>
                <p className="text-xs text-muted-foreground mt-1">Open positions</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-accent/10 text-accent">
                <Briefcase size={20} className="sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow col-span-1 sm:col-span-2">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">Quick Actions</p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/jobs")} className="flex-1 sm:flex-none">
                  Browse Jobs
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/applications")} className="flex-1 sm:flex-none">
                  Applications
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/profile")} className="flex-1 sm:flex-none">
                  Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Profile Completion & Career Tip */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Profile Completion */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Sparkles className="text-primary" size={20} />
              Profile Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-foreground">{profileCompletion}%</span>
                </div>
              </div>
              <div className="flex-1">
                <Progress value={profileCompletion} className="h-2 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {completedFields} of {profileFields.length} sections completed
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {profileFields.map((field) => (
                <div key={field.name} className="flex items-center gap-2 text-sm">
                  {field.completed ? (
                    <CheckCircle2 size={14} className="text-primary" />
                  ) : (
                    <Circle size={14} className="text-muted-foreground" />
                  )}
                  <span className={field.completed ? "text-foreground" : "text-muted-foreground"}>
                    {field.name}
                  </span>
                </div>
              ))}
            </div>
            {profileCompletion < 100 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => navigate("/dashboard/profile")}
              >
                Complete Your Profile
                <ArrowRight size={14} />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Job Market Insights */}
        <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <BarChart3 className="text-primary" size={20} />
              Job Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Trending Skills */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-accent" />
                <span className="text-sm font-medium">Trending Skills</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {marketInsights.trendingSkills.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-sm"
                  >
                    {skill.hot && <Flame size={12} className="text-destructive" />}
                    <span>{skill.name}</span>
                    <span className="text-xs text-primary font-medium">{skill.growth}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Hot Industries */}
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Hot Industries:</span>
                <div className="flex gap-1.5">
                  {marketInsights.hotIndustries.map((industry) => (
                    <Badge key={industry} variant="secondary" className="text-xs">
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Applications */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-lg">Recent Applications</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/applications")}>
                View all
                <ArrowRight size={16} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingApplications ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              ) : recentApplications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto mb-2 opacity-50" size={32} />
                  <p>No applications yet</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => navigate("/dashboard/jobs")}
                  >
                    Browse jobs to get started
                  </Button>
                </div>
              ) : (
                recentApplications.map((app: Application) => (
                  <div
                    key={app.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer gap-3"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                        <Building2 className="text-primary-foreground" size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{app.job?.title || "Position"}</p>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          {app.job?.location && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin size={12} />
                              {app.job.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-0 ml-13 sm:ml-0">
                      <Badge className={`${getStatusColor(app.status)} text-xs`}>{app.status}</Badge>
                      <p className="text-xs text-muted-foreground sm:mt-1 flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(app.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommended Jobs */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-lg">Available Jobs</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/jobs")}>
                See more
                <ArrowRight size={16} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingJobs ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                ))
              ) : recommendedJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="mx-auto mb-2 opacity-50" size={32} />
                  <p>No jobs available at the moment</p>
                  <p className="text-sm">Check back soon for new opportunities</p>
                </div>
              ) : (
                recommendedJobs.map((job: Job) => (
                  <div
                    key={job.id}
                    className="p-3 sm:p-4 rounded-xl border hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => navigate(`/dashboard/jobs/${job.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
                          <Building2 className="text-primary-foreground" size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">{job.title}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {job.department || "General"}
                          </p>
                        </div>
                      </div>
                      {job.employment_type && (
                        <Badge variant="secondary" className="text-xs shrink-0">{job.employment_type}</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {job.location && (
                          <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs flex items-center gap-1">
                            <MapPin size={10} />
                            <span className="truncate max-w-[120px] sm:max-w-none">{job.location}</span>
                          </span>
                        )}
                      </div>
                      {job.salary_range && (
                        <span className="text-sm font-medium text-gradient">{job.salary_range}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
