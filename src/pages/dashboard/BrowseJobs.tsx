import { useState } from "react";
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
} from "lucide-react";

const jobs = [
  {
    id: 1,
    company: "Google",
    role: "Senior Frontend Developer",
    location: "Mountain View, CA",
    type: "Full-time",
    salary: "$180k - $220k",
    posted: "2 hours ago",
    tags: ["React", "TypeScript", "Next.js", "GraphQL"],
    description: "Join Google's core team to build innovative web applications.",
    logo: "G",
  },
  {
    id: 2,
    company: "Meta",
    role: "Full Stack Engineer",
    location: "Remote",
    type: "Full-time",
    salary: "$160k - $200k",
    posted: "5 hours ago",
    tags: ["React", "Node.js", "PostgreSQL", "AWS"],
    description: "Build scalable infrastructure for billions of users worldwide.",
    logo: "M",
  },
  {
    id: 3,
    company: "Stripe",
    role: "Frontend Engineer",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$150k - $190k",
    posted: "1 day ago",
    tags: ["React", "Ruby", "API Design"],
    description: "Create payment solutions that power the internet economy.",
    logo: "S",
  },
  {
    id: 4,
    company: "Vercel",
    role: "Developer Experience Engineer",
    location: "Remote",
    type: "Full-time",
    salary: "$140k - $180k",
    posted: "2 days ago",
    tags: ["Next.js", "TypeScript", "Edge Functions"],
    description: "Shape the future of web development tools and frameworks.",
    logo: "V",
  },
  {
    id: 5,
    company: "Figma",
    role: "UI Engineer",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$170k - $210k",
    posted: "3 days ago",
    tags: ["React", "WebGL", "Canvas API", "C++"],
    description: "Build the collaborative design tool of the future.",
    logo: "F",
  },
  {
    id: 6,
    company: "Notion",
    role: "Software Engineer",
    location: "New York, NY",
    type: "Full-time",
    salary: "$155k - $195k",
    posted: "4 days ago",
    tags: ["React", "Electron", "Node.js"],
    description: "Create beautiful productivity tools used by millions.",
    logo: "N",
  },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

  const toggleSaveJob = (id: number) => {
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id]
    );
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
          Find your next opportunity from {jobs.length} available positions
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
            className="pl-10 h-12"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input placeholder="Location" className="pl-10 h-12 w-full sm:w-48" />
        </div>
        <Button variant="outline" size="lg" className="h-12">
          <Filter size={18} />
          Filters
        </Button>
      </motion.div>

      {/* Job Listings */}
      <motion.div variants={containerVariants} className="space-y-4">
        {jobs.map((job) => (
          <motion.div key={job.id} variants={itemVariants}>
            <Card className="hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Company Logo */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                    <span className="text-primary-foreground text-xl font-bold">
                      {job.logo}
                    </span>
                  </div>

                  {/* Job Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">
                          {job.role}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Building2 size={14} />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {job.posted}
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

                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      {job.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col items-center lg:items-end gap-3 lg:shrink-0">
                    <div className="flex items-center gap-1 text-gradient font-semibold">
                      <DollarSign size={16} />
                      <span>{job.salary.replace("$", "").replace(" - ", "-")}</span>
                    </div>
                    <Badge variant="outline">{job.type}</Badge>
                    <Button variant="gradient" size="sm" className="w-full lg:w-auto">
                      Apply Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default BrowseJobs;
