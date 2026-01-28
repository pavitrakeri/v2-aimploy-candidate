import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Building2,
  Bookmark,
  Filter,
  Clock,
  DollarSign,
  Loader2,
  Briefcase,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { jobsApi, Job, applicationsApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const BrowseJobs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [gradYear, setGradYear] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await jobsApi.getJobs({
        page,
        page_size: 10,
        search: searchQuery || undefined,
        location: locationFilter || undefined,
        employment_type: employmentType || undefined,
      });
      setJobs(response.jobs);
      setTotalPages(response.total_pages);
      setTotal(response.total);
    } catch (error) {
      toast({
        title: "Failed to load jobs",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch applied jobs on mount
  const fetchAppliedJobs = async () => {
    try {
      const response = await applicationsApi.getMyApplications({ page_size: 100 });
      const appliedIds = response.applications
        .filter((app) => app.job_id)
        .map((app) => app.job_id);
      setAppliedJobIds(appliedIds);
    } catch (error) {
      console.error("Failed to fetch applied jobs:", error);
    }
  };

  useEffect(() => {
    fetchAppliedJobs();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [page, employmentType]);

  const handleSearch = () => {
    setPage(1);
    fetchJobs();
  };

  const toggleSaveJob = (id: number) => {
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id]
    );
  };

  const getCompanyInitial = (job: Job) => {
    return job.title.charAt(0).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
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
        <h1 className="font-display text-3xl font-bold">Browse Jobs</h1>
        <p className="text-muted-foreground mt-1">
          Find your next opportunity from {total} available positions
        </p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search jobs, companies, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 h-12"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 h-12 w-full sm:w-48"
          />
        </div>
        <Select value={employmentType} onValueChange={setEmploymentType}>
          <SelectTrigger className="h-12 w-full sm:w-40">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
          </SelectContent>
        </Select>
        <Select value={gradYear} onValueChange={setGradYear}>
          <SelectTrigger className="h-12 w-full sm:w-36">
            <SelectValue placeholder="Grad Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            <SelectItem value="1">1st Year</SelectItem>
            <SelectItem value="2">2nd Year</SelectItem>
            <SelectItem value="3">3rd Year</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="lg" className="h-12" onClick={handleSearch}>
          <Filter size={18} />
          Search
        </Button>
      </motion.div>

      {/* Job Listings */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : jobs.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
          <p className="text-muted-foreground">Try adjusting your search filters</p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-4">
          {jobs.map((job) => (
            <motion.div key={job.id} variants={itemVariants}>
              <Card className="hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Company Logo */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground text-xl font-bold">
                        {getCompanyInitial(job)}
                      </span>
                    </div>

                    {/* Job Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
                            {job.department && (
                              <span className="flex items-center gap-1">
                                <Building2 size={14} />
                                {job.department}
                              </span>
                            )}
                            {job.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {job.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {formatDate(job.created_at)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSaveJob(job.id)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Bookmark
                            size={20}
                            className={
                              savedJobs.includes(job.id)
                                ? "fill-primary text-primary"
                                : "text-muted-foreground"
                            }
                          />
                        </button>
                      </div>

                      {job.requirements && (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {job.requirements.split(",").slice(0, 4).map((req, idx) => (
                            <Badge key={idx} variant="secondary" className="font-normal">
                              {req.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col items-center lg:items-end gap-3 lg:shrink-0">
                      {job.salary_range && (
                        <div className="flex items-center gap-1 text-gradient font-semibold">
                          <DollarSign size={16} />
                          <span>{job.salary_range}</span>
                        </div>
                      )}
                      {job.employment_type && (
                        <Badge variant="outline">{job.employment_type}</Badge>
                      )}
                      {appliedJobIds.includes(job.id) ? (
                        <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
                          <CheckCircle size={14} className="mr-1" />
                          Applied
                        </Badge>
                      ) : (
                        <Button 
                          variant="gradient" 
                          size="sm" 
                          className="w-full lg:w-auto"
                          onClick={() => navigate(`/dashboard/jobs/${job.id}/apply`)}
                        >
                          Apply Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
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

export default BrowseJobs;
