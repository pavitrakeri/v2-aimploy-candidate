import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Camera,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Globe,
  Linkedin,
  Github,
  Plus,
  Pencil,
  ShieldCheck,
  Loader2,
  Upload,
  Save,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { profileApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

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

export const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal states
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  
  // Form states
  const [newSkill, setNewSkill] = useState("");
  const [newExperience, setNewExperience] = useState({
    company: "",
    position: "",
    start_date: "",
    end_date: "",
    is_current: false,
    location: "",
    description: "",
  });
  const [newEducation, setNewEducation] = useState({
    institution: "",
    degree: "",
    field_of_study: "",
    start_date: "",
    end_date: "",
    grade: "",
    description: "",
  });
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    profile_summary: "",
    location: "",
    github_url: "",
    linkedin_url: "",
    portfolio_url: "",
    skills: [] as string[],
    professional_experience: [] as any[],
    education: [] as any[],
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        profile_summary: user.profile_summary || "",
        location: user.location || "",
        github_url: user.github_url || "",
        linkedin_url: user.linkedin_url || "",
        portfolio_url: user.portfolio_url || "",
        skills: user.skills || [],
        professional_experience: user.professional_experience || [],
        education: user.education || [],
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handler functions for adding items
  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()],
      }));
      setNewSkill("");
      setIsSkillModalOpen(false);
      toast({ title: "Success", description: "Skill added successfully!" });
    }
  };

  const handleAddExperience = () => {
    if (newExperience.company && newExperience.position && newExperience.start_date) {
      setFormData((prev) => ({
        ...prev,
        professional_experience: [...(prev.professional_experience || []), { ...newExperience }],
      }));
      setNewExperience({
        company: "",
        position: "",
        start_date: "",
        end_date: "",
        is_current: false,
        location: "",
        description: "",
      });
      setIsExperienceModalOpen(false);
      toast({ title: "Success", description: "Experience added successfully!" });
    }
  };

  const handleAddEducation = () => {
    if (newEducation.institution && newEducation.degree && newEducation.start_date) {
      setFormData((prev) => ({
        ...prev,
        education: [...(prev.education || []), { ...newEducation }],
      }));
      setNewEducation({
        institution: "",
        degree: "",
        field_of_study: "",
        start_date: "",
        end_date: "",
        grade: "",
        description: "",
      });
      setIsEducationModalOpen(false);
      toast({ title: "Success", description: "Education added successfully!" });
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills?.filter((skill) => skill !== skillToRemove) || [],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await profileApi.updateProfile(formData);
      await refreshProfile();
      toast({ title: "Success", description: "Profile updated successfully!" });
    } catch (error) {
      toast({
        title: "Failed to update profile",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Error", description: "Please upload a PDF, DOC, or DOCX file", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await profileApi.updateProfileWithResume(file);
      await refreshProfile();
      toast({ title: "Success", description: "Resume uploaded and profile updated!" });
    } catch (error) {
      toast({
        title: "Failed to upload resume",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user?.full_name) {
      const parts = user.full_name.split(" ");
      return parts.map((p) => p[0]).slice(0, 2).join("").toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const getDisplayName = () => {
    if (user?.full_name) return user.full_name;
    if (user?.first_name && user?.last_name) return `${user.first_name} ${user.last_name}`;
    return user?.email || "User";
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="font-display text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and settings
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                  <Camera size={14} />
                </button>
              </div>
              <h2 className="font-display text-xl font-bold">{getDisplayName()}</h2>
              <p className="text-muted-foreground">{user?.professional_level || "Job Seeker"}</p>
              
              <div className="flex items-center justify-center gap-2 mt-3">
                {user?.is_active && (
                  <Badge className="bg-green-100 text-green-700">
                    <ShieldCheck size={12} className="mr-1" />
                    Active
                  </Badge>
                )}
                <Badge variant="secondary">Open to Work</Badge>
                {user?.linkedin_url && (
                  <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full bg-[#0A66C2] text-white hover:bg-[#004182] transition-colors">
                    <Linkedin size={14} />
                  </a>
                )}
              </div>

              {/* Resume Status */}
              {user?.resume_url && (
                <div className="mt-3">
                  <Badge className="bg-green-100 text-green-700">
                    ✓ Resume Submitted
                  </Badge>
                </div>
              )}

              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-muted-foreground" />
                  <span className="truncate">{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user?.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin size={16} className="text-muted-foreground" />
                    <span>{user.location}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-3 mt-6">
                {user?.portfolio_url && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={user.portfolio_url} target="_blank" rel="noopener noreferrer">
                      <Globe size={18} />
                    </a>
                  </Button>
                )}
                {user?.github_url && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={user.github_url} target="_blank" rel="noopener noreferrer">
                      <Github size={18} />
                    </a>
                  </Button>
                )}
              </div>

              {/* Resume Upload */}
              <div className="mt-6">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                  disabled={isLoading}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById("resume-upload")?.click()}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin mr-2" />
                  ) : (
                    <Upload size={16} className="mr-2" />
                  )}
                  {user?.resume_url ? "Update Resume" : "Upload Resume"}
                </Button>
                {user?.resume_url && (
                  <a
                    href={user.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline mt-2 block"
                  >
                    View Current Resume
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* About */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display">About</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                name="profile_summary"
                value={formData.profile_summary}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Social Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn</Label>
                  <Input
                    id="linkedin_url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github_url">GitHub</Label>
                  <Input
                    id="github_url"
                    name="github_url"
                    value={formData.github_url}
                    onChange={handleChange}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="portfolio_url">Portfolio Website</Label>
                  <Input
                    id="portfolio_url"
                    name="portfolio_url"
                    value={formData.portfolio_url}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display">Skills</CardTitle>
              <Dialog open={isSkillModalOpen} onOpenChange={setIsSkillModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Plus size={14} />
                    Add Skill
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Skill</DialogTitle>
                    <DialogDescription>
                      Enter a skill you want to add to your profile.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="skill">Skill</Label>
                      <Input
                        id="skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="e.g., JavaScript, Project Management, etc."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSkillModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddSkill}>Add Skill</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {formData.skills?.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer group relative"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    {skill}
                    <X size={10} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Badge>
                )) || (
                  <p className="text-muted-foreground text-sm">No skills added yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display">Experience</CardTitle>
              <Dialog open={isExperienceModalOpen} onOpenChange={setIsExperienceModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Plus size={14} />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Work Experience</DialogTitle>
                    <DialogDescription>
                      Add your professional work experience to your profile.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={newExperience.company}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="Company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input
                          id="position"
                          value={newExperience.position}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, position: e.target.value }))}
                          placeholder="Job title"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                          id="start_date"
                          type="month"
                          value={newExperience.start_date}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, start_date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_date">End Date</Label>
                        <Input
                          id="end_date"
                          type="month"
                          value={newExperience.end_date}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, end_date: e.target.value }))}
                          disabled={newExperience.is_current}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newExperience.location}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="City, Country"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_current"
                        checked={newExperience.is_current}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, is_current: e.target.checked, end_date: "" }))}
                      />
                      <Label htmlFor="is_current">I currently work here</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newExperience.description}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your role and responsibilities..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsExperienceModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddExperience}>Add Experience</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.professional_experience?.length ? (
                formData.professional_experience.map((exp, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-xl border hover:border-primary/30 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                      <Briefcase className="text-primary-foreground" size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{exp.position}</h3>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                        </div>
                        {exp.is_current && (
                          <Badge className="bg-green-100 text-green-700">Current</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {exp.start_date} - {exp.is_current ? "Present" : exp.end_date}
                      </p>
                      {exp.description && (
                        <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No experience added yet</p>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display">Education</CardTitle>
              <Dialog open={isEducationModalOpen} onOpenChange={setIsEducationModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Plus size={14} />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Education</DialogTitle>
                    <DialogDescription>
                      Add your educational background to your profile.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="institution">Institution</Label>
                      <Input
                        id="institution"
                        value={newEducation.institution}
                        onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                        placeholder="University/College name"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="degree">Degree</Label>
                        <Input
                          id="degree"
                          value={newEducation.degree}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                          placeholder="e.g., Bachelor of Science"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="field_of_study">Field of Study</Label>
                        <Input
                          id="field_of_study"
                          value={newEducation.field_of_study}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, field_of_study: e.target.value }))}
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="edu_start_date">Start Date</Label>
                        <Input
                          id="edu_start_date"
                          type="month"
                          value={newEducation.start_date}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, start_date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edu_end_date">End Date</Label>
                        <Input
                          id="edu_end_date"
                          type="month"
                          value={newEducation.end_date}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, end_date: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade/CGPA</Label>
                      <Input
                        id="grade"
                        value={newEducation.grade}
                        onChange={(e) => setNewEducation(prev => ({ ...prev, grade: e.target.value }))}
                        placeholder="e.g., 3.8 GPA, First Class"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edu_description">Description</Label>
                      <Textarea
                        id="edu_description"
                        value={newEducation.description}
                        onChange={(e) => setNewEducation(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Additional details about your education..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEducationModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddEducation}>Add Education</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.education?.length ? (
                formData.education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-xl border hover:border-primary/30 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                      <GraduationCap className="text-accent" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{edu.degree}</h3>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      {edu.field_of_study && (
                        <p className="text-sm text-muted-foreground">{edu.field_of_study}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {edu.start_date} - {edu.end_date}
                      </p>
                      {edu.grade && (
                        <p className="text-sm text-muted-foreground mt-1">Grade: {edu.grade}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No education added yet</p>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button variant="gradient" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <Save size={18} className="mr-2" />
            )}
            Save Changes
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;
