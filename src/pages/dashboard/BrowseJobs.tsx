import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import {
  Search,
  Building2,
  Bookmark,
  Clock,
  DollarSign,
  IndianRupee,
  Loader2,
  Briefcase,
  X,
  ChevronDown,
  ChevronUp,
  Laptop,
  Home,
  Building,
  Calendar,
  GraduationCap,
  SlidersHorizontal,
  MapPin,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

// Filter options
const experienceLevels = [
  { value: "fresher", label: "Fresher (0-1 years)" },
  { value: "junior", label: "1-3 years" },
  { value: "mid", label: "3-5 years" },
  { value: "senior", label: "5-10 years" },
  { value: "lead", label: "10+ years" },
];

const workModes = [
  { value: "remote", label: "Remote", icon: Home },
  { value: "hybrid", label: "Hybrid", icon: Laptop },
  { value: "onsite", label: "On-site", icon: Building },
];

const datePostedOptions = [
  { value: "1", label: "Last 24 hours" },
  { value: "3", label: "Last 3 days" },
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
];

const departments = [
  "Engineering",
  "Marketing",
  "Sales",
  "Design",
  "Product",
  "HR",
  "Finance",
  "Operations",
  "Customer Support",
  "Data Science",
];

const employmentTypes = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
];

export const BrowseJobs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [datePosted, setDatePosted] = useState("");
  const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 100]);
  
  // Collapsible states
  const [openSections, setOpenSections] = useState({
    experience: true,
    salary: true,
    workMode: true,
    department: true,
    datePosted: true,
    employmentType: true,
  });
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const activeFilterCount = [
    selectedEmploymentTypes.length,
    selectedExperience.length,
    selectedWorkModes.length,
    selectedDepartments.length,
    datePosted ? 1 : 0,
    salaryRange[0] > 0 || salaryRange[1] < 100 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearAllFilters = () => {
    setSelectedEmploymentTypes([]);
    setSelectedExperience([]);
    setSelectedWorkModes([]);
    setSelectedDepartments([]);
    setDatePosted("");
    setSalaryRange([0, 100]);
  };

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await jobsApi.getPublicJobs({
        page,
        page_size: 12,
        search: searchQuery || undefined,
        location: locationFilter || undefined,
        employment_type: selectedEmploymentTypes[0] || undefined,
        department: selectedDepartments[0] || undefined,
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
  }, [page, selectedEmploymentTypes, selectedDepartments]);

  const handleSearch = () => {
    setPage(1);
    fetchJobs();
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchJobs();
    setIsFilterOpen(false);
  };

  const toggleSaveJob = (id: number) => {
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id]
    );
  };

  const toggleFilter = (value: string, selected: string[], setSelected: (v: string[]) => void) => {
    setSelected(
      selected.includes(value)
        ? selected.filter(v => v !== value)
        : [...selected, value]
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
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Browse Jobs</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Find your next opportunity from {total} available positions
        </p>
      </motion.div>

      {/* Search Bar & Filters Button */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search jobs, skills, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 h-11 sm:h-12"
          />
        </div>
        <div className="flex-1 sm:flex-none sm:w-56">
          <LocationAutocomplete
            value={locationFilter}
            onChange={setLocationFilter}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-11 sm:h-12"
          />
        </div>
        
        {/* Filters Button with Popover */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-11 sm:h-12 gap-2">
              <SlidersHorizontal size={18} />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-1 bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 sm:w-96 p-0 max-h-[70vh] flex flex-col" align="end">
            <div className="p-4 border-b bg-muted/50 shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <SlidersHorizontal size={16} />
                  Filters
                </h3>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-destructive hover:text-destructive h-8 text-xs">
                    Clear all
                  </Button>
                )}
              </div>
            </div>
            
            <div className="p-4 space-y-3 overflow-y-auto flex-1 min-h-0">
              {/* Experience Level */}
              <Collapsible open={openSections.experience} onOpenChange={() => toggleSection("experience")}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium text-sm hover:bg-muted/50 px-2 rounded-md -mx-2">
                  <span className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-primary" />
                    Experience Level
                  </span>
                  {openSections.experience ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-2 pl-6">
                  {experienceLevels.map((level) => (
                    <div key={level.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`exp-${level.value}`}
                        checked={selectedExperience.includes(level.value)}
                        onCheckedChange={() => toggleFilter(level.value, selectedExperience, setSelectedExperience)}
                      />
                      <Label htmlFor={`exp-${level.value}`} className="text-sm font-normal cursor-pointer">
                        {level.label}
                      </Label>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Salary Range */}
              <Collapsible open={openSections.salary} onOpenChange={() => toggleSection("salary")}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium text-sm hover:bg-muted/50 px-2 rounded-md -mx-2">
                  <span className="flex items-center gap-2">
                    <IndianRupee size={16} className="text-primary" />
                    Salary Range (LPA)
                  </span>
                  {openSections.salary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 px-2">
                  <Slider
                    value={salaryRange}
                    onValueChange={(value) => setSalaryRange(value as [number, number])}
                    max={100}
                    min={0}
                    step={5}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>₹{salaryRange[0]} LPA</span>
                    <span>₹{salaryRange[1]}+ LPA</span>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Work Mode */}
              <Collapsible open={openSections.workMode} onOpenChange={() => toggleSection("workMode")}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium text-sm hover:bg-muted/50 px-2 rounded-md -mx-2">
                  <span className="flex items-center gap-2">
                    <Laptop size={16} className="text-primary" />
                    Work Mode
                  </span>
                  {openSections.workMode ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-2 pl-6">
                  {workModes.map((mode) => (
                    <div key={mode.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mode-${mode.value}`}
                        checked={selectedWorkModes.includes(mode.value)}
                        onCheckedChange={() => toggleFilter(mode.value, selectedWorkModes, setSelectedWorkModes)}
                      />
                      <Label htmlFor={`mode-${mode.value}`} className="text-sm font-normal cursor-pointer flex items-center gap-2">
                        <mode.icon size={14} className="text-muted-foreground" />
                        {mode.label}
                      </Label>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Employment Type */}
              <Collapsible open={openSections.employmentType} onOpenChange={() => toggleSection("employmentType")}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium text-sm hover:bg-muted/50 px-2 rounded-md -mx-2">
                  <span className="flex items-center gap-2">
                    <Briefcase size={16} className="text-primary" />
                    Employment Type
                  </span>
                  {openSections.employmentType ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-2 pl-6">
                  {employmentTypes.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type.value}`}
                        checked={selectedEmploymentTypes.includes(type.value)}
                        onCheckedChange={() => toggleFilter(type.value, selectedEmploymentTypes, setSelectedEmploymentTypes)}
                      />
                      <Label htmlFor={`type-${type.value}`} className="text-sm font-normal cursor-pointer">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Department */}
              <Collapsible open={openSections.department} onOpenChange={() => toggleSection("department")}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium text-sm hover:bg-muted/50 px-2 rounded-md -mx-2">
                  <span className="flex items-center gap-2">
                    <Building2 size={16} className="text-primary" />
                    Department
                  </span>
                  {openSections.department ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-2 pl-6 max-h-40 overflow-y-auto">
                  {departments.map((dept) => (
                    <div key={dept} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dept-${dept}`}
                        checked={selectedDepartments.includes(dept)}
                        onCheckedChange={() => toggleFilter(dept, selectedDepartments, setSelectedDepartments)}
                      />
                      <Label htmlFor={`dept-${dept}`} className="text-sm font-normal cursor-pointer">
                        {dept}
                      </Label>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Date Posted */}
              <Collapsible open={openSections.datePosted} onOpenChange={() => toggleSection("datePosted")}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium text-sm hover:bg-muted/50 px-2 rounded-md -mx-2">
                  <span className="flex items-center gap-2">
                    <Calendar size={16} className="text-primary" />
                    Date Posted
                  </span>
                  {openSections.datePosted ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-2 pl-6">
                  {datePostedOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`date-${option.value}`}
                        checked={datePosted === option.value}
                        onCheckedChange={() => setDatePosted(datePosted === option.value ? "" : option.value)}
                      />
                      <Label htmlFor={`date-${option.value}`} className="text-sm font-normal cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Apply Button */}
            <div className="p-4 border-t bg-muted/50 shrink-0">
              <Button variant="gradient" className="w-full" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="gradient" className="h-11 sm:h-12" onClick={handleSearch}>
          <Search size={18} className="mr-2" />
          Search
        </Button>
      </motion.div>

      {/* Selected Filters Tags */}
      {activeFilterCount > 0 && (
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
          {selectedEmploymentTypes.map(type => (
            <Badge key={type} variant="secondary" className="gap-1 pr-1">
              {employmentTypes.find(t => t.value === type)?.label}
              <button onClick={() => toggleFilter(type, selectedEmploymentTypes, setSelectedEmploymentTypes)} className="ml-1 hover:bg-muted rounded p-0.5">
                <X size={12} />
              </button>
            </Badge>
          ))}
          {selectedExperience.map(exp => (
            <Badge key={exp} variant="secondary" className="gap-1 pr-1">
              {experienceLevels.find(e => e.value === exp)?.label}
              <button onClick={() => toggleFilter(exp, selectedExperience, setSelectedExperience)} className="ml-1 hover:bg-muted rounded p-0.5">
                <X size={12} />
              </button>
            </Badge>
          ))}
          {selectedWorkModes.map(mode => (
            <Badge key={mode} variant="secondary" className="gap-1 pr-1">
              {workModes.find(m => m.value === mode)?.label}
              <button onClick={() => toggleFilter(mode, selectedWorkModes, setSelectedWorkModes)} className="ml-1 hover:bg-muted rounded p-0.5">
                <X size={12} />
              </button>
            </Badge>
          ))}
          {selectedDepartments.map(dept => (
            <Badge key={dept} variant="secondary" className="gap-1 pr-1">
              {dept}
              <button onClick={() => toggleFilter(dept, selectedDepartments, setSelectedDepartments)} className="ml-1 hover:bg-muted rounded p-0.5">
                <X size={12} />
              </button>
            </Badge>
          ))}
          {datePosted && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {datePostedOptions.find(d => d.value === datePosted)?.label}
              <button onClick={() => setDatePosted("")} className="ml-1 hover:bg-muted rounded p-0.5">
                <X size={12} />
              </button>
            </Badge>
          )}
          {(salaryRange[0] > 0 || salaryRange[1] < 100) && (
            <Badge variant="secondary" className="gap-1 pr-1">
              ₹{salaryRange[0]} - ₹{salaryRange[1]} LPA
              <button onClick={() => setSalaryRange([0, 100])} className="ml-1 hover:bg-muted rounded p-0.5">
                <X size={12} />
              </button>
            </Badge>
          )}
        </motion.div>
      )}

      {/* Results Count & Sort */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {jobs.length} of {total} jobs
        </p>
        <Select defaultValue="relevance">
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="date">Date Posted</SelectItem>
            <SelectItem value="salary-high">Salary: High to Low</SelectItem>
            <SelectItem value="salary-low">Salary: Low to High</SelectItem>
          </SelectContent>
        </Select>
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
          <p className="text-muted-foreground mb-4">Try adjusting your search filters</p>
          {activeFilterCount > 0 && (
            <Button variant="outline" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <motion.div key={job.id} variants={itemVariants}>
              <Card 
                className="hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group h-full flex flex-col"
                onClick={() => navigate(`/dashboard/jobs/${job.id}/apply`)}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground text-base sm:text-lg font-bold">
                        {getCompanyInitial(job)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveJob(job.id);
                      }}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Bookmark
                        size={18}
                        className={
                          savedJobs.includes(job.id)
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }
                      />
                    </button>
                  </div>

                  {/* Job Info */}
                  <div className="flex-1">
                    <h3 className="font-display text-sm sm:text-base font-semibold group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {job.title}
                    </h3>
                    <div className="flex flex-col gap-1 text-xs sm:text-sm text-muted-foreground mb-3">
                      {job.department && (
                        <span className="flex items-center gap-1.5">
                          <Building2 size={14} />
                          <span className="truncate">{job.department}</span>
                        </span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} />
                          <span className="truncate">{job.location}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {formatDate(job.created_at)}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {job.employment_type && (
                        <Badge variant="outline" className="text-xs">{job.employment_type}</Badge>
                      )}
                      {job.salary_range && (
                        <Badge variant="secondary" className="text-xs">
                          <IndianRupee size={12} className="mr-0.5" />
                          {job.salary_range}
                        </Badge>
                      )}
                    </div>

                    {job.requirements && (
                      <div className="flex flex-wrap gap-1.5">
                        {job.requirements.split(",").slice(0, 2).map((req, idx) => (
                          <Badge key={idx} variant="secondary" className="font-normal text-xs">
                            {req.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="mt-4 pt-3 border-t">
                    {appliedJobIds.includes(job.id) ? (
                      <div className="flex flex-col gap-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20 w-full justify-center py-2">
                          <CheckCircle size={14} className="mr-1.5" />
                          Applied
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/jobs/${job.id}/apply`);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="gradient" 
                        size="sm" 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/jobs/${job.id}/apply`);
                        }}
                      >
                        Apply Now
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div variants={itemVariants} className="flex justify-center gap-2 mt-8">
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
