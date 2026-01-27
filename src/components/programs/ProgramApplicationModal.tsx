import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  GraduationCap,
  Upload,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Linkedin,
} from "lucide-react";

interface ProgramApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: {
    id: string;
    title: string;
    tracks: string[];
    isPaid: boolean;
  } | null;
}

const experienceLevels = [
  "0-1 years",
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "10+ years",
];

export const ProgramApplicationModal = ({
  open,
  onOpenChange,
  program,
}: ProgramApplicationModalProps) => {
  const [step, setStep] = useState(1);
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
    motivation: "",
    agreeTerms: false,
    agreePayment: false,
  });

  const totalSteps = 3;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after modal closes
    setTimeout(() => {
      setStep(1);
      setIsSubmitted(false);
      setSelectedTrack("");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        linkedin: "",
        experience: "",
        currentRole: "",
        motivation: "",
        agreeTerms: false,
        agreePayment: false,
      });
    }, 300);
  };

  if (!program) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden">
        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="bg-gradient-hero p-6 text-primary-foreground">
              <DialogHeader>
                <DialogTitle className="text-xl font-display text-primary-foreground">
                  Apply for {program.title}
                </DialogTitle>
                <DialogDescription className="text-primary-foreground/80">
                  Step {step} of {totalSteps}
                </DialogDescription>
              </DialogHeader>
              {/* Progress Bar */}
              <div className="flex gap-1 mt-4">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i < step ? "bg-primary-foreground" : "bg-primary-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Select Your Track</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose the track that aligns with your career goals
                      </p>
                      <RadioGroup
                        value={selectedTrack}
                        onValueChange={setSelectedTrack}
                        className="grid gap-3 pt-2"
                      >
                        {program.tracks.map((track) => (
                          <Label
                            key={track}
                            htmlFor={track}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedTrack === track
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <RadioGroupItem value={track} id={track} />
                            <div className="flex-1">
                              <span className="font-medium">{track}</span>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {track.includes("CTO")
                                  ? "Technical leadership and architecture focus"
                                  : track.includes("CEO")
                                  ? "Business strategy and vision focus"
                                  : "Practical marketing skills and certification"}
                              </p>
                            </div>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                          <Input
                            id="fullName"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange("fullName", e.target.value)}
                            className="pl-9"
                            maxLength={100}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                          <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="pl-9"
                            maxLength={255}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className="pl-9"
                            maxLength={20}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn Profile</Label>
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                          <Input
                            id="linkedin"
                            placeholder="linkedin.com/in/johndoe"
                            value={formData.linkedin}
                            onChange={(e) => handleInputChange("linkedin", e.target.value)}
                            className="pl-9"
                            maxLength={100}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="experience">Experience Level</Label>
                        <Select
                          value={formData.experience}
                          onValueChange={(value) => handleInputChange("experience", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience" />
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
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                          <Input
                            id="currentRole"
                            placeholder="Software Engineer"
                            value={formData.currentRole}
                            onChange={(e) => handleInputChange("currentRole", e.target.value)}
                            className="pl-9"
                            maxLength={100}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Resume Upload */}
                    <div className="space-y-2">
                      <Label>Resume / CV</Label>
                      <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <Upload className="mx-auto text-muted-foreground mb-2" size={24} />
                        <p className="text-sm font-medium">Drop your resume here or click to upload</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, DOC up to 5MB</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="motivation">Why do you want to join this program?</Label>
                      <Textarea
                        id="motivation"
                        placeholder="Share your motivation, goals, and what you hope to achieve..."
                        rows={5}
                        value={formData.motivation}
                        onChange={(e) => handleInputChange("motivation", e.target.value)}
                        maxLength={1000}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {formData.motivation.length}/1000 characters
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-start gap-3">
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
                          <span className="text-primary hover:underline">Terms & Conditions</span>{" "}
                          and{" "}
                          <span className="text-primary hover:underline">Privacy Policy</span>
                        </Label>
                      </div>

                      {program.isPaid && (
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="agreePayment"
                            checked={formData.agreePayment}
                            onCheckedChange={(checked) =>
                              handleInputChange("agreePayment", checked as boolean)
                            }
                            className="mt-0.5"
                          />
                          <Label htmlFor="agreePayment" className="text-sm font-normal cursor-pointer leading-relaxed">
                            I understand this is a <strong>paid program</strong> and agree to the payment terms upon acceptance
                          </Label>
                        </div>
                      )}
                    </div>

                    {/* Summary Card */}
                    <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                      <p className="text-sm font-medium">Application Summary</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Program:</span>
                          <p className="font-medium">{program.title}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Track:</span>
                          <p className="font-medium">{selectedTrack || "Not selected"}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6 pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={step === 1}
                >
                  <ArrowLeft size={16} />
                  Back
                </Button>
                {step < totalSteps ? (
                  <Button
                    variant="gradient"
                    onClick={handleNext}
                    disabled={step === 1 && !selectedTrack}
                  >
                    Continue
                    <ArrowRight size={16} />
                  </Button>
                ) : (
                  <Button
                    variant="hero"
                    onClick={handleSubmit}
                    disabled={!formData.agreeTerms || (program.isPaid && !formData.agreePayment) || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin">⏳</span>
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
            </div>
          </>
        ) : (
          /* Success State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="font-display text-2xl font-bold mb-2">Application Submitted!</h3>
            <p className="text-muted-foreground mb-6">
              Thank you for applying to {program.title}. We'll review your application and get back to you within 5-7 business days.
            </p>
            <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm font-medium mb-2">What's next?</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Check your email for confirmation</li>
                <li>• Our team will review your application</li>
                <li>• You'll be contacted for next steps</li>
              </ul>
            </div>
            <Button variant="gradient" onClick={handleClose} className="w-full">
              Done
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProgramApplicationModal;
