import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Clock,
  Calendar,
  ExternalLink,
  MoreVertical,
} from "lucide-react";

const applications = [
  {
    id: 1,
    company: "Google",
    role: "Senior Frontend Developer",
    location: "Mountain View, CA",
    appliedDate: "Jan 20, 2024",
    status: "In Review",
    statusColor: "bg-yellow-100 text-yellow-700 border-yellow-200",
    stage: 2,
    totalStages: 5,
    logo: "G",
  },
  {
    id: 2,
    company: "Meta",
    role: "React Developer",
    location: "Menlo Park, CA",
    appliedDate: "Jan 18, 2024",
    status: "Interview Scheduled",
    statusColor: "bg-green-100 text-green-700 border-green-200",
    stage: 3,
    totalStages: 5,
    logo: "M",
  },
  {
    id: 3,
    company: "Apple",
    role: "UI Engineer",
    location: "Cupertino, CA",
    appliedDate: "Jan 15, 2024",
    status: "Applied",
    statusColor: "bg-primary/10 text-primary border-primary/20",
    stage: 1,
    totalStages: 5,
    logo: "A",
  },
  {
    id: 4,
    company: "Netflix",
    role: "Senior Software Engineer",
    location: "Los Gatos, CA",
    appliedDate: "Jan 12, 2024",
    status: "Rejected",
    statusColor: "bg-red-100 text-red-700 border-red-200",
    stage: 4,
    totalStages: 5,
    logo: "N",
  },
  {
    id: 5,
    company: "Stripe",
    role: "Frontend Engineer",
    location: "San Francisco, CA",
    appliedDate: "Jan 10, 2024",
    status: "Offer Received",
    statusColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    stage: 5,
    totalStages: 5,
    logo: "S",
  },
];

const stages = ["Applied", "Screening", "Interview", "Final Round", "Decision"];

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
            <p className="text-3xl font-bold">12</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-3xl font-bold text-yellow-600">5</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Interviews</p>
            <p className="text-3xl font-bold text-green-600">3</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Offers</p>
            <p className="text-3xl font-bold text-emerald-600">1</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Applications List */}
      <motion.div variants={containerVariants} className="space-y-4">
        {applications.map((app) => (
          <motion.div key={app.id} variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Company Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                      <span className="text-primary-foreground text-xl font-bold">
                        {app.logo}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-display text-lg font-semibold">{app.role}</h3>
                        <Badge variant="outline" className={app.statusColor}>
                          {app.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Building2 size={14} />
                          {app.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {app.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          Applied {app.appliedDate}
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
                        <span>{app.stage}/{app.totalStages} stages</span>
                      </div>
                      <div className="flex gap-1">
                        {stages.map((stage, index) => (
                          <div
                            key={stage}
                            className={`h-2 flex-1 rounded-full ${
                              index < app.stage
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
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Applications;
