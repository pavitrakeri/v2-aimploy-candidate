import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { programsApi, jobsApi } from "@/services/api";
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

  const { toast } = useToast();
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

  const { data: prefillData } = useQuery({
    queryKey: ["application-prefill"],
    queryFn: () => jobsApi.getApplicationPrefill(),
    enabled: isDashboard,
  });

  useEffect(() => {
    if (prefillData) {
      setFormData((prev) => ({
        ...prev,
        fullName: prefillData.full_name || prev.fullName,
        email: prefillData.email || prev.email,
        phone: prefillData.phone || prev.phone,
      }));
    }
  }, [prefillData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground text-sm font-semibold tracking-wide">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md border-destructive/20 shadow-xl">
          <h2 className="text-xl font-bold mb-2">Program not found</h2>
          <p className="text-muted-foreground text-sm mb-6">The program you're looking for doesn't exist or failed to load.</p>
          <Button variant="gradient" onClick={() => navigate(isDashboard ? "/dashboard/programs" : "/programs")} className="w-full">
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
    try {
      await programsApi.applyForProgram(program.slug, {
        track: selectedTrack,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        linkedin: formData.linkedin,
        experience_level: formData.experience,
        current_role: formData.currentRole,
        current_company: formData.currentCompany,
        motivation: formData.motivation
      });
      setIsSubmitted(true);
    } catch (err: any) {
      toast({
        title: "Application Error",
        description: err.message || "Failed to submit program application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="overflow-hidden border border-border shadow-2xl rounded-3xl bg-card/60 backdrop-blur-md">
            <div className="bg-gradient-hero p-8 text-center text-primary-foreground relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 border border-white/20"
              >
                <CheckCircle className="text-primary-foreground" size={32} />
              </motion.div>
              <h2 className="font-display text-2xl font-bold tracking-tight">
                Application Submitted!
              </h2>
            </div>
            <CardContent className="p-6 text-center space-y-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Thank you for applying to <strong>{program.title}</strong>. We'll review your application and get back to you within 5-7 business days.
              </p>
              
              <div className="bg-muted/40 rounded-2xl p-5 text-left border border-border/60">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Next Steps</p>
                <ul className="text-xs text-muted-foreground space-y-2.5">
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Check size={12} />
                    </div>
                    <span>Check your email for a confirmation receipt</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Check size={12} />
                    </div>
                    <span>Our admissions team will review your credentials</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Check size={12} />
                    </div>
                    <span>You will be contacted for an interview session</span>
                  </li>
                </ul>
              </div>
              
              <Button
                variant="gradient"
                className="w-full rounded-xl h-11 shadow-purple font-bold tracking-wide"
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
              className="font-bold flex items-center gap-1 hover:bg-muted"
            >
              <ChevronLeft size={18} />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <Link to="/">
              <img src={aimployLogo} alt="Aimploy" className="h-6" />
            </Link>
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">
            Application for <span className="font-bold text-foreground">{program.title}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10 max-w-3xl">
        {/* Progress Steps */}
        <div className="mb-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2 ${
                      currentStep > step.id
                        ? "bg-primary text-primary-foreground border-primary shadow-purple"
                        : currentStep === step.id
                        ? "bg-gradient-primary text-primary-foreground border-primary shadow-purple-lg"
                        : "bg-muted text-muted-foreground border-border/80"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check size={14} />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="mt-2.5 text-center hidden md:block">
                    <p className={`text-xs font-bold uppercase tracking-wider ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] mx-4 rounded-full transition-all duration-300 ${
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card className="overflow-hidden bg-card/60 backdrop-blur-md border border-border shadow-xl rounded-3xl">
          <AnimatePresence mode="wait">
            {/* Step 1: Select Track */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-gradient-hero p-6 text-primary-foreground relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                  <h2 className="font-display text-xl font-bold tracking-tight">
                    Choose Your Track
                  </h2>
                  <p className="text-white/80 text-xs mt-1 font-medium">
                    Select the track that aligns with your professional aspirations
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
                        className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                          selectedTrack === track.title
                            ? "border-primary bg-primary/5 shadow-purple"
                            : "border-border hover:border-primary/30 bg-background/30"
                        }`}
                      >
                        <RadioGroupItem value={track.title} id={track.title} className="mt-1" />
                        <div className="flex-1 space-y-1.5">
                          <span className="font-bold text-base text-foreground leading-snug">{track.title}</span>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {track.description || (
                              track.title.includes("CTO")
                                ? "Focus on technical leadership, system architecture, and building engineering teams. Perfect for aspiring technology leaders."
                                : track.title.includes("CEO")
                                ? "Focus on business strategy, fundraising, and company vision. Ideal for future entrepreneurs and business leaders."
                                : "Comprehensive marketing training covering digital marketing, brand strategy, content creation, and growth hacking techniques."
                            )}
                          </p>
                          <div className="flex items-center gap-4 pt-1.5 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                            <span className="flex items-center gap-1">
                              <Clock size={12} className="text-primary" />
                              {program.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 size={12} className="text-primary" />
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
                transition={{ duration: 0.2 }}
              >
                <div className="bg-gradient-hero p-6 text-primary-foreground relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                  <h2 className="font-display text-xl font-bold tracking-tight">
                    Personal Information
                  </h2>
                  <p className="text-white/80 text-xs mt-1 font-medium">
                    Please provide your contact and profile details
                  </p>
                </div>
                <CardContent className="p-6 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80" size={16} />
                        <Input
                          id="fullName"
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          className="pl-10 h-11 rounded-xl bg-background/50 border border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                          maxLength={100}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80" size={16} />
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="pl-10 h-11 rounded-xl bg-background/50 border border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                          maxLength={255}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80" size={16} />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="pl-10 h-11 rounded-xl bg-background/50 border border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                          maxLength={20}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="linkedin" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">LinkedIn Profile</Label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80" size={16} />
                        <Input
                          id="linkedin"
                          placeholder="linkedin.com/in/johndoe"
                          value={formData.linkedin}
                          onChange={(e) => handleInputChange("linkedin", e.target.value)}
                          className="pl-10 h-11 rounded-xl bg-background/50 border border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                          maxLength={100}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resume Upload */}
                  <div className="space-y-2">
                    <Label className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Resume / CV</Label>
                    <div className="border-2 border-dashed border-border/80 rounded-2xl p-6 text-center hover:border-primary/40 transition-colors cursor-pointer bg-muted/20 hover:bg-muted/40 duration-300">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 text-primary">
                        <Upload size={20} />
                      </div>
                      <p className="font-bold text-sm">Drop your resume here or click to upload</p>
                      <p className="text-xs text-muted-foreground mt-0.5">PDF, DOC, DOCX files up to 5MB</p>
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
                transition={{ duration: 0.2 }}
              >
                <div className="bg-gradient-hero p-6 text-primary-foreground relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                  <h2 className="font-display text-xl font-bold tracking-tight">
                    Experience & Background
                  </h2>
                  <p className="text-white/80 text-xs mt-1 font-medium">
                    Help us understand your educational and professional background
                  </p>
                </div>
                <CardContent className="p-6 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="experience" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Experience Level *</Label>
                      <Select
                        value={formData.experience}
                        onValueChange={(value) => handleInputChange("experience", value)}
                      >
                        <SelectTrigger className="h-11 rounded-xl bg-background/50 border border-input focus:border-primary focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Select your experience" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-border">
                          {experienceLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currentRole" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Current Role</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80" size={16} />
                        <Input
                          id="currentRole"
                          placeholder="Software Engineer"
                          value={formData.currentRole}
                          onChange={(e) => handleInputChange("currentRole", e.target.value)}
                          className="pl-10 h-11 rounded-xl bg-background/50 border border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                          maxLength={100}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentCompany" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Current Company</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80" size={16} />
                      <Input
                        id="currentCompany"
                        placeholder="Acme Inc."
                        value={formData.currentCompany}
                        onChange={(e) => handleInputChange("currentCompany", e.target.value)}
                        className="pl-10 h-11 rounded-xl bg-background/50 border border-input focus:border-primary focus:ring-2 focus:ring-primary/20"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motivation" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Why do you want to join this program? *</Label>
                    <Textarea
                      id="motivation"
                      placeholder="Share your motivation, career goals, and what you hope to achieve from this intensive path..."
                      rows={5}
                      value={formData.motivation}
                      onChange={(e) => handleInputChange("motivation", e.target.value)}
                      maxLength={1000}
                      className="resize-none rounded-xl bg-background/50 border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 leading-relaxed"
                    />
                    <p className="text-[10px] font-bold text-muted-foreground text-right uppercase tracking-wider">
                      {formData.motivation.length} / 1000 characters
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
                transition={{ duration: 0.2 }}
              >
                <div className="bg-gradient-hero p-6 text-primary-foreground relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                  <h2 className="font-display text-xl font-bold tracking-tight">
                    Review & Submit
                  </h2>
                  <p className="text-white/80 text-xs mt-1 font-medium">
                    Please review your application summary details below
                  </p>
                </div>
                <CardContent className="p-6 space-y-6">
                  {/* Summary Cards */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="bg-muted/30 border border-border/50 rounded-2xl p-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Target Program</p>
                      <p className="font-bold text-foreground text-base leading-snug">{program.title}</p>
                      <p className="text-xs text-primary font-bold mt-1 uppercase tracking-wide">{selectedTrack}</p>
                    </div>
                    <div className="bg-muted/30 border border-border/50 rounded-2xl p-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Duration & Type</p>
                      <p className="font-bold text-foreground text-base leading-snug">{program.duration}</p>
                      <p className="text-xs text-muted-foreground font-semibold mt-1 uppercase tracking-wide">{program.type}</p>
                    </div>
                  </div>

                  <div className="bg-muted/30 border border-border/50 rounded-2xl p-4 space-y-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/30 pb-2">Candidate Details</p>
                    <div className="grid gap-4 sm:grid-cols-2 text-xs leading-relaxed">
                      <div>
                        <span className="text-muted-foreground font-semibold">Name:</span>
                        <p className="font-bold text-foreground mt-0.5">{formData.fullName || "Not provided"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-semibold">Email:</span>
                        <p className="font-bold text-foreground mt-0.5">{formData.email || "Not provided"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-semibold">Phone:</span>
                        <p className="font-bold text-foreground mt-0.5">{formData.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-semibold">Experience Level:</span>
                        <p className="font-bold text-foreground mt-0.5">{formData.experience || "Not provided"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Agreement Checkboxes */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-start gap-3.5 p-4 rounded-2xl border bg-background/20">
                      <Checkbox
                        id="agreeTerms"
                        checked={formData.agreeTerms}
                        onCheckedChange={(checked) =>
                          handleInputChange("agreeTerms", checked as boolean)
                        }
                        className="mt-0.5 rounded-md border-border"
                      />
                      <Label htmlFor="agreeTerms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer font-medium">
                        I agree to the{" "}
                        <span className="text-primary font-bold hover:underline">Terms & Conditions</span>{" "}
                        and{" "}
                        <span className="text-primary font-bold hover:underline">Privacy Policy</span>. 
                        I confirm that all candidate profile information provided is complete and accurate.
                      </Label>
                    </div>

                    {program.is_paid && (
                      <div className="flex items-start gap-3.5 p-4 rounded-2xl border border-primary/20 bg-primary/5">
                        <Checkbox
                          id="agreePayment"
                          checked={formData.agreePayment}
                          onCheckedChange={(checked) =>
                            handleInputChange("agreePayment", checked as boolean)
                          }
                          className="mt-0.5 rounded-md border-primary/30"
                        />
                        <Label htmlFor="agreePayment" className="text-xs text-foreground/80 leading-relaxed cursor-pointer font-medium">
                          I understand that this is a **paid cohort program** and agree to the tuition payment terms upon admission acceptance. Payment processing instructions will be shared following application approval.
                        </Label>
                      </div>
                    )}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Footer */}
          <div className="flex justify-between items-center p-6 border-t border-border/80 bg-muted/20">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="font-bold flex items-center gap-1 rounded-xl h-10 hover:bg-muted"
            >
              <ArrowLeft size={16} />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button
                variant="gradient"
                onClick={handleNext}
                disabled={!canProceed()}
                className="font-bold flex items-center gap-1 rounded-xl h-10 px-5 shadow-purple"
              >
                Continue
                <ArrowRight size={16} />
              </Button>
            ) : (
              <Button
                variant="hero"
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="font-bold flex items-center gap-1.5 rounded-xl h-10 px-6 shadow-purple-lg"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-1">⏳</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <Sparkles size={16} />
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

