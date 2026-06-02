import { useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery } from "@tanstack/react-query";
import { programsApi } from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Upload,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Linkedin,
  Clock,
  Building2,
  ChevronLeft,
  Check,
} from "lucide-react";
import aimployLogo from "@/assets/aimploy-logo.png";

const experienceLevels = [
  "0-1 years",
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "10+ years",
];

const steps = [
  { id: 1, title: "Select Track", description: "Choose your path" },
  { id: 2, title: "Personal Info", description: "Your details" },
  { id: 3, title: "Experience", description: "Background info" },
  { id: 4, title: "Review", description: "Confirm & submit" },
];

export const ProgramApply = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    experience: "",
    currentRole: "",
    currentCompany: "",
    motivation: "",
    agreeTerms: false,
    agreePayment: false,
  });

  const { data: program, isLoading, error } = useQuery({
    queryKey: ["program", programId],
    queryFn: () => programsApi.getProgramById(programId || ""),
    enabled: !!programId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Program not found</h2>
          <p className="text-muted-foreground mb-4">The program you're looking for doesn't exist or failed to load.</p>
          <Button variant="gradient" onClick={() => navigate(isDashboard ? "/dashboard/programs" : "/programs")}>
            Back to Programs
          </Button>
        </Card>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedTrack !== "";
      case 2:
        return formData.fullName && formData.email && formData.phone;
      case 3:
        return formData.experience && formData.motivation;
      case 4:
        return formData.agreeTerms && (!program.is_paid || formData.agreePayment);
      default:
        return true;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="overflow-hidden">
            <div className="bg-gradient-hero p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="text-primary-foreground" size={40} />
              </motion.div>
              <h2 className="font-display text-2xl font-bold text-primary-foreground">
                Application Submitted!
              </h2>
            </div>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-6">
                Thank you for applying to <strong>{program.title}</strong>. We'll review your application and get back to you within 5-7 business days.
              </p>
              <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-medium mb-3">What's next?</p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="text-primary mt-0.5 shrink-0" size={16} />
                    Check your email for confirmation
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-primary mt-0.5 shrink-0" size={16} />
                    Our team will review your application
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-primary mt-0.5 shrink-0" size={16} />
                    You'll be contacted for next steps
                  </li>
                </ul>
              </div>
              <Button
                variant="gradient"
                className="w-full"
                onClick={() => navigate(isDashboard ? "/dashboard/programs" : "/programs")}
              >
                Back to Programs
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(isDashboard ? "/dashboard/programs" : "/programs")}
            >
              <ChevronLeft size={18} />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <Link to="/">
              <img src={aimployLogo} alt="Aimploy" className="h-6" />
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">
            Application for <span className="font-medium text-foreground">{program.title}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                      currentStep > step.id
                        ? "bg-primary text-primary-foreground"
                        : currentStep === step.id
                        ? "bg-gradient-primary text-primary-foreground shadow-purple"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check size={18} />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="mt-2 text-center hidden sm:block">
                    <p className={`text-sm font-medium ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded-full ${
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card className="overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Step 1: Select Track */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-gradient-hero p-6">
                  <h2 className="font-display text-xl font-bold text-primary-foreground">
                    Choose Your Track
                  </h2>
                  <p className="text-primary-foreground/80 text-sm mt-1">
                    Select the track that aligns with your career goals
                  </p>
                </div>
                <CardContent className="p-6">
                  <RadioGroup
                    value={selectedTrack}
                    onValueChange={setSelectedTrack}
                    className="space-y-4"
                  >
                    {program.tracks && program.tracks.map((track) => (
                      <Label
                        key={track.id || track.title}
                        htmlFor={track.title}
                        className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedTrack === track.title
                            ? "border-primary bg-primary/5 shadow-purple"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={track.title} id={track.title} className="mt-1" />
                        <div className="flex-1">
                          <span className="font-semibold text-lg">{track.title}</span>
                          <p className="text-sm text-muted-foreground mt-1">
                            {track.description || (
                              track.title.includes("CTO")
                                ? "Focus on technical leadership, system architecture, and building engineering teams. Perfect for aspiring technology leaders."
                                : track.title.includes("CEO")
                                ? "Focus on business strategy, fundraising, and company vision. Ideal for future entrepreneurs and business leaders."
                                : "Comprehensive marketing training covering digital marketing, brand strategy, content creation, and growth hacking techniques."
                            )}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {program.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 size={14} />
                              {program.type}
                            </span>
                          </div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </motion.div>
            )}

            {/* Step 2: Personal Info */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-gradient-hero p-6">
                  <h2 className="font-display text-xl font-bold text-primary-foreground">
                    Personal Information
                  </h2>
                  <p className="text-primary-foreground/80 text-sm mt-1">
                    Tell us about yourself
                  </p>
                </div>
                <CardContent className="p-6 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="fullName"
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          className="pl-10 h-12"
                          maxLength={100}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="pl-10 h-12"
                          maxLength={255}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="pl-10 h-12"
                          maxLength={20}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn Profile</Label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="linkedin"
                          placeholder="linkedin.com/in/johndoe"
                          value={formData.linkedin}
                          onChange={(e) => handleInputChange("linkedin", e.target.value)}
                          className="pl-10 h-12"
                          maxLength={100}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resume Upload */}
                  <div className="space-y-2">
                    <Label>Resume / CV</Label>
                    <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30">
                      <Upload className="mx-auto text-muted-foreground mb-3" size={32} />
                      <p className="font-medium">Drop your resume here or click to upload</p>
                      <p className="text-sm text-muted-foreground mt-1">PDF, DOC, DOCX up to 5MB</p>
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            )}

            {/* Step 3: Experience */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-gradient-hero p-6">
                  <h2 className="font-display text-xl font-bold text-primary-foreground">
                    Experience & Background
                  </h2>
                  <p className="text-primary-foreground/80 text-sm mt-1">
                    Help us understand your professional background
                  </p>
                </div>
                <CardContent className="p-6 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience Level *</Label>
                      <Select
                        value={formData.experience}
                        onValueChange={(value) => handleInputChange("experience", value)}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select your experience" />
                        </SelectTrigger>
                        <SelectContent>
                          {experienceLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentRole">Current Role</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          id="currentRole"
                          placeholder="Software Engineer"
                          value={formData.currentRole}
                          onChange={(e) => handleInputChange("currentRole", e.target.value)}
                          className="pl-10 h-12"
                          maxLength={100}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentCompany">Current Company</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        id="currentCompany"
                        placeholder="Acme Inc."
                        value={formData.currentCompany}
                        onChange={(e) => handleInputChange("currentCompany", e.target.value)}
                        className="pl-10 h-12"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motivation">Why do you want to join this program? *</Label>
                    <Textarea
                      id="motivation"
                      placeholder="Share your motivation, goals, and what you hope to achieve from this program..."
                      rows={6}
                      value={formData.motivation}
                      onChange={(e) => handleInputChange("motivation", e.target.value)}
                      maxLength={1000}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {formData.motivation.length}/1000 characters
                    </p>
                  </div>
                </CardContent>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-gradient-hero p-6">
                  <h2 className="font-display text-xl font-bold text-primary-foreground">
                    Review & Submit
                  </h2>
                  <p className="text-primary-foreground/80 text-sm mt-1">
                    Please review your application before submitting
                  </p>
                </div>
                <CardContent className="p-6 space-y-6">
                  {/* Summary Cards */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Program</p>
                      <p className="font-semibold">{program.title}</p>
                      <p className="text-sm text-muted-foreground">{selectedTrack}</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Duration</p>
                      <p className="font-semibold">{program.duration}</p>
                      <p className="text-sm text-muted-foreground">{program.type}</p>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Personal Details</p>
                    <div className="grid gap-3 sm:grid-cols-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <p className="font-medium">{formData.fullName || "Not provided"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">{formData.email || "Not provided"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <p className="font-medium">{formData.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Experience:</span>
                        <p className="font-medium">{formData.experience || "Not provided"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Agreement Checkboxes */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-start gap-3 p-4 rounded-xl border">
                      <Checkbox
                        id="agreeTerms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) =>
                          handleInputChange("agreeTerms", checked as boolean)
                        }
                        className="mt-0.5"
                      />
                      <Label htmlFor="agreeTerms" className="text-sm font-normal cursor-pointer leading-relaxed">
                        I agree to the{" "}
                        <span className="text-primary hover:underline cursor-pointer">Terms & Conditions</span>{" "}
                        and{" "}
                        <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>. 
                        I confirm that all information provided is accurate.
                      </Label>
                    </div>

                    {program.is_paid && (
                      <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5">
                        <Checkbox
                          id="agreePayment"
                          checked={formData.agreePayment}
                          onCheckedChange={(checked) =>
                            handleInputChange("agreePayment", checked as boolean)
                          }
                          className="mt-0.5"
                        />
                        <Label htmlFor="agreePayment" className="text-sm font-normal cursor-pointer leading-relaxed">
                          I understand this is a <strong>paid program</strong> and agree to the payment terms upon acceptance. 
                          Payment details will be shared after application approval.
                        </Label>
                      </div>
                    )}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Footer */}
          <div className="flex justify-between items-center p-6 border-t bg-muted/30">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft size={18} />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button
                variant="gradient"
                onClick={handleNext}
                disabled={!canProceed()}
                size="lg"
              >
                Continue
                <ArrowRight size={18} />
              </Button>
            ) : (
              <Button
                variant="hero"
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <Sparkles size={18} />
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProgramApply;
