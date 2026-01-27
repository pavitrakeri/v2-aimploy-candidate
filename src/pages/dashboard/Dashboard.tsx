import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  FileText,
  Eye,
  TrendingUp,
  ArrowRight,
  Clock,
  Building2,
  MapPin,
} from "lucide-react";

const stats = [
  {
    title: "Active Applications",
    value: "12",
    change: "+3 this week",
    icon: FileText,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Jobs Viewed",
    value: "48",
    change: "+12 this week",
    icon: Eye,
    color: "bg-accent/10 text-accent",
  },
  {
    title: "Profile Views",
    value: "156",
    change: "+28% vs last week",
    icon: TrendingUp,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Saved Jobs",
    value: "24",
    change: "5 new matches",
    icon: Briefcase,
    color: "bg-orange-100 text-orange-600",
  },
];

const recentApplications = [
  {
    id: 1,
    company: "Google",
    role: "Senior Frontend Developer",
    location: "Mountain View, CA",
    status: "In Review",
    statusColor: "bg-yellow-100 text-yellow-700",
    date: "2 days ago",
  },
  {
    id: 2,
    company: "Meta",
    role: "React Developer",
    location: "Menlo Park, CA",
    status: "Interview",
    statusColor: "bg-green-100 text-green-700",
    date: "5 days ago",
  },
  {
    id: 3,
    company: "Apple",
    role: "UI Engineer",
    location: "Cupertino, CA",
    status: "Applied",
    statusColor: "bg-primary/10 text-primary",
    date: "1 week ago",
  },
];

const recommendedJobs = [
  {
    id: 1,
    company: "Stripe",
    role: "Frontend Engineer",
    location: "Remote",
    salary: "$150k - $200k",
    tags: ["React", "TypeScript", "Node.js"],
    match: 95,
  },
  {
    id: 2,
    company: "Vercel",
    role: "Full Stack Developer",
    location: "Remote",
    salary: "$140k - $180k",
    tags: ["Next.js", "PostgreSQL", "AWS"],
    match: 92,
  },
  {
    id: 3,
    company: "Figma",
    role: "Senior Software Engineer",
    location: "San Francisco, CA",
    salary: "$180k - $220k",
    tags: ["React", "WebGL", "C++"],
    match: 88,
  },
];

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

export const Dashboard = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-display text-3xl font-bold">Welcome back, John! 👋</h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your job search
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-lg">Recent Applications</CardTitle>
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight size={16} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 rounded-xl border hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                      <Building2 className="text-primary-foreground" size={20} />
                    </div>
                    <div>
                      <p className="font-medium">{app.role}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{app.company}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {app.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={app.statusColor}>{app.status}</Badge>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                      <Clock size={12} />
                      {app.date}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommended Jobs */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-lg">Recommended for You</CardTitle>
              <Button variant="ghost" size="sm">
                See more
                <ArrowRight size={16} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendedJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl border hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <Building2 className="text-primary-foreground" size={18} />
                      </div>
                      <div>
                        <p className="font-medium">{job.role}</p>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary">{job.match}% Match</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gradient">{job.salary}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
