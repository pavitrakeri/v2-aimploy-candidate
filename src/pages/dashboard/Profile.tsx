import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";

const skills = [
  "React", "TypeScript", "JavaScript", "Node.js", "Python",
  "PostgreSQL", "MongoDB", "AWS", "Docker", "Git",
];

const experience = [
  {
    id: 1,
    role: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    period: "2022 - Present",
    current: true,
  },
  {
    id: 2,
    role: "Frontend Developer",
    company: "StartupXYZ",
    period: "2020 - 2022",
    current: false,
  },
  {
    id: 3,
    role: "Junior Developer",
    company: "WebAgency",
    period: "2018 - 2020",
    current: false,
  },
];

const education = [
  {
    id: 1,
    degree: "Master of Computer Science",
    school: "Stanford University",
    period: "2016 - 2018",
  },
  {
    id: 2,
    degree: "Bachelor of Science in IT",
    school: "MIT",
    period: "2012 - 2016",
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

export const Profile = () => {
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
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" />
                  <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                    JD
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                  <Camera size={14} />
                </button>
              </div>
              <h2 className="font-display text-xl font-bold">John Doe</h2>
              <p className="text-muted-foreground">Senior Frontend Developer</p>
              
              <div className="flex items-center justify-center gap-2 mt-3">
                <Badge className="bg-green-100 text-green-700">
                  <ShieldCheck size={12} className="mr-1" />
                  Verified
                </Badge>
                <Badge variant="secondary">Open to Work</Badge>
              </div>

              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-muted-foreground" />
                  <span>john.doe@email.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-muted-foreground" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin size={16} className="text-muted-foreground" />
                  <span>San Francisco, CA</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 mt-6">
                <Button variant="outline" size="icon">
                  <Globe size={18} />
                </Button>
                <Button variant="outline" size="icon">
                  <Linkedin size={18} />
                </Button>
                <Button variant="outline" size="icon">
                  <Github size={18} />
                </Button>
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
              <Button variant="ghost" size="sm">
                <Pencil size={14} />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Passionate frontend developer with 6+ years of experience building modern web applications. 
                I specialize in React, TypeScript, and creating intuitive user experiences. 
                Love working with innovative teams to solve complex problems and deliver high-quality products.
              </p>
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
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="john.doe@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    defaultValue="Passionate frontend developer with 6+ years of experience..."
                  />
                </div>
              </div>
              <Button variant="gradient" className="mt-6">
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display">Skills</CardTitle>
              <Button variant="ghost" size="sm">
                <Plus size={14} />
                Add Skill
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display">Experience</CardTitle>
              <Button variant="ghost" size="sm">
                <Plus size={14} />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {experience.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-start gap-4 p-4 rounded-xl border hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                    <Briefcase className="text-primary-foreground" size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{exp.role}</h3>
                        <p className="text-sm text-muted-foreground">{exp.company}</p>
                      </div>
                      {exp.current && (
                        <Badge className="bg-green-100 text-green-700">Current</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{exp.period}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display">Education</CardTitle>
              <Button variant="ghost" size="sm">
                <Plus size={14} />
                Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {education.map((edu) => (
                <div
                  key={edu.id}
                  className="flex items-start gap-4 p-4 rounded-xl border hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                    <GraduationCap className="text-accent" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <p className="text-sm text-muted-foreground">{edu.school}</p>
                    <p className="text-xs text-muted-foreground mt-1">{edu.period}</p>
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

export default Profile;
