import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, LayoutDashboard, Briefcase, FileText, GraduationCap, Trophy, ShieldCheck, User } from "lucide-react";
import moduleDashboard from "@/assets/module-dashboard.png";
import moduleBrowseJobs from "@/assets/module-browse-jobs.png";
import moduleApplications from "@/assets/module-applications.png";

const modules = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    description: "Your personal command center showing job recommendations, application stats, market insights, and quick actions.",
    features: [
      "View personalized job recommendations",
      "Track application statistics",
      "See trending skills and hot industries",
      "Quick access to all platform features",
    ],
    screenshot: moduleDashboard,
  },
  {
    id: "browse-jobs",
    title: "Browse Jobs",
    icon: Briefcase,
    description: "Explore thousands of verified job opportunities with advanced filters and AI-powered matching.",
    features: [
      "Search by location, role, and salary",
      "Filter by remote/on-site options",
      "View match scores for each job",
      "Save jobs for later applications",
    ],
    screenshot: moduleBrowseJobs,
  },
  {
    id: "applications",
    title: "My Applications",
    icon: FileText,
    description: "Track all your job applications in one place with detailed status updates and progress timeline.",
    features: [
      "View application status in real-time",
      "Track progress through hiring stages",
      "See match scores and feedback",
      "Get interview scheduling updates",
    ],
    screenshot: moduleApplications,
  },
  {
    id: "programs",
    title: "Programs",
    icon: GraduationCap,
    description: "Upskill with exclusive Aimploy programs including residencies, internships, and certifications.",
    features: [
      "Aincubatr Residency Program",
      "AImakt Marketing Internship",
      "Industry-recognized certifications",
      "Career placement support",
    ],
  },
  {
    id: "challenges",
    title: "Challenges",
    icon: Trophy,
    description: "Prove your expertise through competitive skill challenges and earn badges to stand out.",
    features: [
      "Participate in skill-based challenges",
      "Earn verified badges and certificates",
      "Compete with other professionals",
      "Showcase achievements on your profile",
    ],
  },
  {
    id: "verification",
    title: "Background Verification",
    icon: ShieldCheck,
    description: "Build trust with employers through our comprehensive background verification process.",
    features: [
      "Identity verification",
      "Employment history check",
      "Education verification",
      "Professional reference check",
    ],
  },
  {
    id: "profile",
    title: "Profile",
    icon: User,
    description: "Manage your professional profile, resume, skills, and preferences to attract the right opportunities.",
    features: [
      "Build AI-optimized resume",
      "Showcase skills and certifications",
      "Set job preferences and alerts",
      "Control privacy settings",
    ],
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

export const UserGuidance = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass"
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/aimploy-logo.png" alt="Aimploy" className="h-8 object-contain" />
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="px-2.5">
              <Link to="/" className="flex items-center">
                <ArrowLeft size={16} className="sm:mr-1.5" />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
            </Button>
            <Button variant="gradient" size="sm" asChild className="px-3">
              <Link to="/register">
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Get Started</span>
              </Link>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-28 pb-12 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <LayoutDashboard size={16} />
              Platform Guide
            </span>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Explore <span className="text-gradient">Aimploy</span> Features
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Discover all the powerful tools and features available to help you land your dream job.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-12 px-6">
        <div className="container mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-8"
          >
            {modules.map((module, index) => (
              <motion.div key={module.id} variants={itemVariants}>
                <Card className="overflow-hidden hover:shadow-lg transition-all border-2 hover:border-primary/30">
                  <CardContent className="p-0">
                    <div className={`grid lg:grid-cols-2 gap-0 ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                      {/* Content Side */}
                      <div className={`p-8 flex flex-col justify-center ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                            <module.icon className="text-primary-foreground" size={24} />
                          </div>
                          <h2 className="font-display text-2xl font-bold">{module.title}</h2>
                        </div>
                        <p className="text-muted-foreground mb-6">{module.description}</p>
                        <ul className="space-y-2">
                          {module.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Screenshot Side */}
                      <div className={`bg-muted/50 p-6 flex items-center justify-center min-h-[300px] ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                        {module.screenshot ? (
                          <img 
                            src={module.screenshot} 
                            alt={`${module.title} screenshot`}
                            className="w-full rounded-lg shadow-lg border"
                          />
                        ) : (
                          <div className="w-full max-w-md aspect-video rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-3">
                            <module.icon className="text-primary/40" size={48} />
                            <p className="text-sm text-muted-foreground font-medium">{module.title} Screenshot</p>
                            <p className="text-xs text-muted-foreground">Coming Soon</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-primary rounded-3xl p-8 md:p-12 text-center"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Create your free account today and start exploring all these powerful features.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/register">Create Free Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t">
        <div className="container mx-auto text-center">
          <Link to="/" className="inline-block mb-4">
            <img src="/aimploy-logo.png" alt="Aimploy" className="h-6 mx-auto object-contain" />
          </Link>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Aimploy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default UserGuidance;
