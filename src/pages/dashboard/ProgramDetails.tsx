import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { programsApi } from "@/services/api";
import * as Icons from "lucide-react";
import {
  Clock,
  Calendar,
  MapPin,
  IndianRupee,
  ArrowRight,
  ChevronLeft,
  Users,
  Briefcase,
  FileText,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import aimployLogo from "@/assets/aimploy-logo.png";
import aincubatrHero from "@/assets/aincubatr-hero.png";
import aimaktHero from "@/assets/aimakt-hero.png";

const getHeroImage = (slug: string) => {
  if (slug === "aincubatr") return aincubatrHero;
  if (slug === "aimakt") return aimaktHero;
  return aincubatrHero;
};

const getIconComponent = (iconName: string) => {
  const Icon = (Icons as any)[iconName];
  return Icon || Icons.HelpCircle;
};

const applicationSteps = [
  {
    step: 1,
    title: "Submit Application",
    description: "Complete the online application form",
    icon: FileText,
  },
  {
    step: 2,
    title: "Review",
    description: "Our team reviews your application",
    icon: Users,
  },
  {
    step: 3,
    title: "Interview",
    description: "Participate in an interview",
    icon: MessageSquare,
  },
  {
    step: 4,
    title: "Decision",
    description: "Receive admission decision",
    icon: CheckCircle,
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

export const ProgramDetails = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

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
          <p className="text-muted-foreground text-sm">Loading program details...</p>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Public Header */}
      {!isDashboard && (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/programs")}
              >
                <ChevronLeft size={18} />
                Back to Programs
              </Button>
            </div>
            <Link to="/">
              <img src={aimployLogo} alt="Aimploy" className="h-6" />
            </Link>
          </div>
        </header>
      )}

      {/* Dashboard Back Button */}
      {isDashboard && (
        <div className="px-6 py-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/programs")}
          >
            <ChevronLeft size={18} />
            Back to Programs
          </Button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={getHeroImage(program.slug)}
            alt={program.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-sidebar/95 via-sidebar/80 to-sidebar/60" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative container mx-auto px-6 py-12 lg:py-20"
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-primary/20 text-primary-foreground border-primary/30">
                {program.type}
              </Badge>
              <Badge variant="outline" className="text-sidebar-foreground border-sidebar-foreground/30">
                {program.duration}
              </Badge>
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              {program.title}
            </h1>
            <p className="text-lg text-sidebar-foreground/80 mb-8">
              {program.subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="hero"
                size="xl"
                onClick={() => navigate(isDashboard ? `/dashboard/programs/apply/${program.slug}` : `/programs/apply/${program.slug}`)}
              >
                Apply Now
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      <div className="container mx-auto px-6 py-16 space-y-20">
        {/* About Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">About the Program</h2>
            <p className="text-lg text-muted-foreground">
              {program.description}
            </p>
          </motion.div>

          {/* Highlights Grid */}
          {program.highlights && program.highlights.length > 0 && (
            <motion.div variants={itemVariants}>
              <h3 className="font-display text-xl font-semibold text-center mb-8">Program Highlights</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {program.highlights.map((highlight, index) => {
                  const HighlightIcon = getIconComponent(highlight.icon);
                  return (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="flex items-center gap-3 p-4 rounded-xl bg-card border hover:border-primary/30 hover:shadow-md transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <HighlightIcon className="text-primary" size={20} />
                      </div>
                      <span className="text-sm font-medium">{highlight.text}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.section>

        {/* Tracks Section */}
        {program.tracks && program.tracks.length > 0 && (
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold mb-4">Program Tracks</h2>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              {program.tracks.map((track) => {
                const TrackIcon = getIconComponent(track.icon);
                return (
                  <motion.div key={track.id} variants={itemVariants}>
                    <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                            <TrackIcon className="text-primary-foreground" size={28} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-display text-xl font-bold mb-2">{track.title}</h3>
                            <p className="text-muted-foreground mb-4">{track.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {track.tags && track.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="font-normal">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Program Details */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">Program Details</h2>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="p-6">
                <Clock className="mx-auto text-primary mb-3" size={32} />
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <p className="font-semibold">{program.duration}</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Calendar className="mx-auto text-primary mb-3" size={32} />
                <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                <p className="font-semibold">{program.start_date}</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <MapPin className="mx-auto text-primary mb-3" size={32} />
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <p className="font-semibold">{program.location}</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <IndianRupee className="mx-auto text-primary mb-3" size={32} />
                <p className="text-sm text-muted-foreground mb-1">Fee</p>
                <p className="font-semibold">{program.is_paid ? "Paid program" : "Free certification"}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center mt-8">
            <Button
              variant="gradient"
              size="lg"
              onClick={() => navigate(isDashboard ? `/dashboard/programs/apply/${program.slug}` : `/programs/apply/${program.slug}`)}
            >
              Apply Now
              <ArrowRight size={18} />
            </Button>
          </motion.div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-muted/30 rounded-3xl p-8 lg:p-12"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-2">How It Works</h2>
            <p className="text-muted-foreground">Simple Application Process</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-4 max-w-5xl mx-auto">
            {applicationSteps.map((step, index) => (
              <motion.div
                key={step.step}
                variants={itemVariants}
                className="relative text-center"
              >
                {index < applicationSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-border" />
                )}
                <div className="relative z-10 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto shadow-purple">
                    <span className="text-2xl font-bold text-primary-foreground">{step.step}</span>
                  </div>
                </div>
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={itemVariants} className="text-center mt-10">
            <Button
              variant="hero"
              size="xl"
              onClick={() => navigate(isDashboard ? `/dashboard/programs/apply/${program.slug}` : `/programs/apply/${program.slug}`)}
            >
              Start Your Application
              <ArrowRight size={18} />
            </Button>
          </motion.div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 lg:p-16 text-center"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-primary-foreground mb-2">
                Transform Your Career
              </h2>
              <p className="text-xl text-primary-foreground/90 mb-2">
                Ready to Join the Next Cohort?
              </p>
              <p className="text-primary-foreground/70 max-w-xl mx-auto mb-8">
                Take the first step towards becoming a technology leader with our intensive residency program.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="xl"
                  className="bg-card text-foreground hover:bg-card/90"
                  onClick={() => navigate(isDashboard ? `/dashboard/programs/apply/${program.slug}` : `/programs/apply/${program.slug}`)}
                >
                  Apply Now
                  <ArrowRight size={18} />
                </Button>
                <Button
                  variant="outline"
                  size="xl"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => navigate(isDashboard ? "/dashboard/programs" : "/programs")}
                >
                  Explore Other Programs
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.section>
      </div>

      {/* Public Footer */}
      {!isDashboard && (
        <footer className="border-t py-8">
          <div className="container mx-auto px-6 text-center">
            <img src={aimployLogo} alt="Aimploy" className="h-6 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              © 2024 Aimploy. All rights reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default ProgramDetails;
