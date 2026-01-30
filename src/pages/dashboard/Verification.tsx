import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  FileText,
  Award,
  Building2,
  GraduationCap,
  CreditCard,
  ArrowRight,
  XCircle,
} from "lucide-react";

const verificationSteps = [
  {
    id: "identity",
    title: "Identity Verification",
    description: "Government-issued ID verification",
    icon: CreditCard,
    status: "completed",
    completedDate: "Jan 15, 2024",
  },
  {
    id: "education",
    title: "Education Verification",
    description: "Verify your academic credentials",
    icon: GraduationCap,
    status: "completed",
    completedDate: "Jan 18, 2024",
  },
  {
    id: "employment",
    title: "Employment History",
    description: "Verify previous work experience",
    icon: Building2,
    status: "in-progress",
  },
  {
    id: "criminal",
    title: "Background Check",
    description: "Criminal background screening",
    icon: ShieldCheck,
    status: "pending",
  },
  {
    id: "professional",
    title: "Professional Credentials",
    description: "Licenses and certifications",
    icon: Award,
    status: "not-started",
  },
];

const documents = [
  {
    name: "Government ID",
    type: "Identity",
    status: "verified",
    date: "Jan 15, 2024",
  },
  {
    name: "Degree Certificate",
    type: "Education",
    status: "verified",
    date: "Jan 18, 2024",
  },
  {
    name: "Employment Letter",
    type: "Employment",
    status: "pending",
    date: "Jan 20, 2024",
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="text-green-500" size={20} />;
    case "in-progress":
      return <Clock className="text-yellow-500" size={20} />;
    case "pending":
      return <AlertCircle className="text-orange-500" size={20} />;
    default:
      return <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />;
  }
};

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    verified: { label: "Verified", className: "bg-green-100 text-green-700" },
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
  };
  const config = statusConfig[status] || statusConfig.pending;
  return <Badge className={config.className}>{config.label}</Badge>;
};

export const Verification = () => {
  const completedSteps = verificationSteps.filter((s) => s.status === "completed").length;
  const progress = (completedSteps / verificationSteps.length) * 100;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-3xl font-bold">Background Verification</h1>
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-medium">
            <Clock size={14} className="mr-1" />
            Coming Soon
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1">
          Complete your verification to increase trust with employers
        </p>
      </motion.div>

      {/* Coming Soon Banner */}
      <motion.div variants={itemVariants}>
        <Card className="border-dashed border-2 border-amber-200 bg-amber-50/50">
          <CardContent className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-amber-600" size={32} />
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">Background Verification Coming Soon!</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              We're partnering with trusted verification providers to offer comprehensive 
              background checks that will help you stand out to employers.
            </p>
            <Badge variant="outline" className="text-amber-700 border-amber-300">
              Expected Launch: Q2 2026
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Overview */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-hero text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck size={32} />
                  <div>
                    <h2 className="font-display text-2xl font-bold">
                      Verification Progress
                    </h2>
                    <p className="text-primary-foreground/80">
                      {completedSteps} of {verificationSteps.length} steps completed
                    </p>
                  </div>
                </div>
                <Progress value={progress} className="h-3 bg-primary-foreground/20" />
              </div>
              <div className="text-center md:text-right">
                <div className="text-5xl font-bold">{Math.round(progress)}%</div>
                <p className="text-sm text-primary-foreground/80">Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Verification Steps */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Verification Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border ${
                    step.status === "in-progress"
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    {getStatusIcon(step.status)}
                    {index < verificationSteps.length - 1 && (
                      <div
                        className={`w-0.5 h-8 mt-2 ${
                          step.status === "completed" ? "bg-green-500" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <step.icon size={18} className="text-primary shrink-0" />
                      <h3 className="font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                    {step.completedDate && (
                      <p className="text-xs text-green-600 mt-2">
                        Completed on {step.completedDate}
                      </p>
                    )}
                    {step.status === "in-progress" && (
                      <Button variant="gradient" size="sm" className="mt-3">
                        Continue
                        <ArrowRight size={14} />
                      </Button>
                    )}
                    {step.status === "not-started" && (
                      <Button variant="outline" size="sm" className="mt-3">
                        Start Verification
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Documents */}
        <motion.div variants={itemVariants} className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display">Uploaded Documents</CardTitle>
              <Button variant="gradient" size="sm">
                <Upload size={14} />
                Upload New
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.name}
                  className="flex items-center justify-between p-4 rounded-xl border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="text-primary" size={20} />
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.type} • {doc.date}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(doc.status)}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Why Get Verified?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "Stand out to employers with a verified profile",
                "Get access to premium job listings",
                "Faster hiring process with pre-verified credentials",
                "Build trust and credibility with recruiters",
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={18} />
                  <p className="text-sm">{benefit}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Verification;
