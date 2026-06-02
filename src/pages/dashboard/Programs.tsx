import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { programsApi } from "@/services/api";
import * as Icons from "lucide-react";
import aimployLogo from "@/assets/aimploy-logo.png";
import {
  Clock,
  ArrowRight,
  Briefcase,
  Building2,
  Sparkles,
  ExternalLink,
  Eye,
} from "lucide-react";

const getIconComponent = (iconName: string) => {
  const IconComponent = (Icons as any)[iconName];
  return IconComponent || Icons.HelpCircle;
};

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

export const Programs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  const { data: programs, isLoading, error } = useQuery({
    queryKey: ["programs"],
    queryFn: () => programsApi.getPrograms(),
  });

  const handleViewDetails = (slug: string) => {
    navigate(isDashboard ? `/dashboard/programs/${slug}` : `/programs/${slug}`);
  };

  const handleApply = (slug: string) => {
    navigate(isDashboard ? `/dashboard/programs/apply/${slug}` : `/programs/apply/${slug}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading programs...</p>
        </div>
      </div>
    );
  }

  if (error || !programs) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2 text-destructive">Error Loading Programs</h2>
          <p className="text-muted-foreground mb-4">Could not retrieve the program catalog. Please try again later.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        {/* Public Header */}
        {!isDashboard && (
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
              <Link to="/" className="flex items-center">
                <img src={aimployLogo} alt="Aimploy" className="h-6" />
              </Link>
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => navigate("/login")}>Login</Button>
                <Button variant="gradient" onClick={() => navigate("/register")}>Register</Button>
              </div>
            </div>
          </header>
        )}

        <div className={isDashboard ? "space-y-8 p-1" : "container mx-auto px-6 py-12 space-y-8 max-w-6xl"}>
          {/* Header */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants}>
              <h1 className="font-display text-3xl font-bold">Programs</h1>
              <p className="text-muted-foreground mt-1">
                Upskill with Aimploy's exclusive programs and certifications
              </p>
            </motion.div>

            {/* Featured Aimploy Programs */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-primary" size={20} />
                <h2 className="font-display text-xl font-semibold">Aimploy Program Offerings</h2>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                {programs.map((program) => (
                  <Card key={program.id} className="overflow-hidden hover:shadow-lg transition-all group border-2 hover:border-primary/30">
                    <CardContent className="p-0">
                      {/* Header */}
                      <div className="bg-gradient-hero p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl" />
                        <div className="relative z-10 flex items-start justify-between">
                          <div>
                            <Badge className={program.badge_color || "bg-accent/20 text-accent"}>{program.badge}</Badge>
                            <h3 className="font-display text-xl font-bold text-primary-foreground mt-3">
                              {program.title}
                            </h3>
                            <p className="text-primary-foreground/80 text-sm mt-1">
                              {program.provider}
                            </p>
                          </div>
                          <span className="text-5xl">{program.image}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {program.description}
                        </p>

                        {/* Tracks */}
                        {program.tracks && program.tracks.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                              Available Tracks
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {program.tracks.map((track) => (
                                <Badge key={track.id || track.title} variant="secondary" className="font-normal">
                                  {track.title}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Highlights */}
                        {program.highlights && program.highlights.length > 0 && (
                          <div className="space-y-2">
                            {program.highlights.map((highlight, index) => {
                              const HighlightIcon = getIconComponent(highlight.icon);
                              return (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <HighlightIcon className="text-primary w-4 h-4 shrink-0" />
                                  <span>{highlight.text}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-4 pt-2 border-t text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {program.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 size={14} />
                            {program.type}
                          </span>
                          {program.is_paid && (
                            <Badge variant="outline" className="text-xs">
                              Paid Program
                            </Badge>
                          )}
                        </div>

                        {/* CTA */}
                        <div className="pt-2 flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleViewDetails(program.slug)}
                          >
                            <Eye size={16} />
                            View Details
                          </Button>
                          <Button
                            variant="gradient"
                            className="flex-1 group-hover:shadow-purple-lg transition-shadow"
                            onClick={() => handleApply(program.slug)}
                          >
                            Apply Now
                            <ArrowRight size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Info Banner */}
            <motion.div variants={itemVariants}>
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Briefcase className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">How to Apply</h3>
                      <p className="text-sm text-muted-foreground">
                        Program applications are available on the portal as job roles recommended to candidates. 
                        Check your <strong>Browse Jobs</strong> section for program openings tailored to your profile.
                      </p>
                      <Button variant="link" className="px-0 mt-2 h-auto" onClick={() => navigate(isDashboard ? "/dashboard/jobs" : "/login")}>
                        View Recommended Programs
                        <ExternalLink size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Public Footer */}
      {!isDashboard && (
        <footer className="border-t py-8 mt-16">
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

export default Programs;
