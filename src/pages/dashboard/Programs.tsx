import { useState } from "react";
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
  Search,
  X,
  AlertCircle
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
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

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
          <p className="text-muted-foreground text-sm font-semibold tracking-wide">Loading programs...</p>
        </div>
      </div>
    );
  }

  if (error || !programs) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md border-destructive/20 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4 text-destructive">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-bold mb-2 text-destructive">Error Loading Programs</h2>
          <p className="text-muted-foreground text-sm mb-6">Could not retrieve the program catalog. Please check your connection and try again.</p>
          <Button onClick={() => window.location.reload()} className="w-full">Retry</Button>
        </Card>
      </div>
    );
  }

  // Filter programs based on category & search query
  const filteredPrograms = programs?.filter((program) => {
    const matchesSearch = 
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.provider?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.tracks?.some(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
      
    if (!matchesSearch) return false;
    
    if (activeCategory === "All") return true;
    if (activeCategory === "Incubators") {
      return program.title.toLowerCase().includes("incubator") || program.description?.toLowerCase().includes("incubator") || program.slug === "aincubatr";
    }
    if (activeCategory === "Paid") return program.is_paid;
    if (activeCategory === "Free") return !program.is_paid;
    if (activeCategory === "Technical") {
      return program.tracks?.some(t => t.title.toLowerCase().includes("cto") || t.tags?.some(tag => ["architecture", "leadership", "technical", "engineering"].includes(tag.toLowerCase())));
    }
    return true;
  });

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
                <Button variant="ghost" onClick={() => navigate("/login")} className="font-semibold text-sm">Login</Button>
                <Button variant="gradient" onClick={() => navigate("/register")} className="font-semibold text-sm">Register</Button>
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
            {/* Immersive Hero Header */}
            <motion.div 
              variants={itemVariants}
              className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 md:p-12 shadow-purple-lg text-primary-foreground"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20" />
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-black/10 rounded-full blur-2xl" />
              
              <div className="relative z-10 max-w-2xl space-y-4">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-md px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                  Aimploy Academy
                </Badge>
                <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight leading-none">
                  Accelerate Your Career Growth
                </h1>
                <p className="text-white/80 text-sm md:text-lg max-w-xl font-normal leading-relaxed">
                  Unlock exclusive incubator programs, leadership residencies, and verified certifications designed to connect you with premier tech opportunities.
                </p>
              </div>
            </motion.div>

            {/* Filter and Search Bar */}
            <motion.div 
              variants={itemVariants}
              className="glass rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm border border-primary/10"
            >
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="Search programs or tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background/50 border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium transition-all outline-none"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
                {["All", "Incubators", "Technical", "Paid", "Free"].map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                      activeCategory === category
                        ? "bg-primary text-primary-foreground shadow-purple"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Featured Aimploy Programs */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-2">
                <Sparkles className="text-primary animate-pulse" size={20} />
                <h2 className="font-display text-xl font-bold tracking-tight">Aimploy Program Offerings</h2>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {filteredPrograms && filteredPrograms.length > 0 ? (
                  filteredPrograms.map((program) => (
                    <Card key={program.id} className="overflow-hidden bg-card/60 backdrop-blur-md hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group border border-border hover:border-primary/40 flex flex-col justify-between">
                      <div>
                        {/* Header */}
                        <div className="bg-gradient-hero p-6 relative overflow-hidden text-primary-foreground min-h-[160px] flex flex-col justify-between">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl" />
                          <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-xl" />
                          
                          <div className="relative z-10 flex items-start justify-between">
                            <Badge className={`${program.badge_color || "bg-white/20 text-white"} border border-white/10 hover:bg-white/30 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold`}>
                              {program.badge || "Featured"}
                            </Badge>
                            <span className="text-5xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                              {program.image || "🎓"}
                            </span>
                          </div>
                          
                          <div className="relative z-10 mt-4">
                            <h3 className="font-display text-xl md:text-2xl font-extrabold tracking-tight">
                              {program.title}
                            </h3>
                            <p className="text-white/80 text-xs mt-1 font-medium tracking-wide uppercase flex items-center gap-1">
                              <Building2 size={12} />
                              {program.provider}
                            </p>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-5">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {program.description}
                          </p>

                          {/* Tracks */}
                          {program.tracks && program.tracks.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                Available Paths
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {program.tracks.map((track) => (
                                  <Badge key={track.id || track.title} variant="secondary" className="font-semibold px-2.5 py-1 text-xs border border-border hover:border-primary/20 transition-colors bg-secondary/50">
                                    {track.title}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Highlights */}
                          {program.highlights && program.highlights.length > 0 && (
                            <div className="space-y-2.5 pt-2 border-t border-border/60">
                              {program.highlights.map((highlight, index) => {
                                const HighlightIcon = getIconComponent(highlight.icon);
                                return (
                                  <div key={index} className="flex items-center gap-3 text-sm text-foreground/80">
                                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                      <HighlightIcon className="text-primary w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-medium">{highlight.text}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Meta & CTA Footer */}
                      <div className="p-6 pt-0 space-y-4">
                        <div className="flex items-center justify-between pt-4 border-t border-border/60 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-primary" />
                            {program.duration}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Building2 size={14} className="text-primary" />
                            {program.type}
                          </span>
                          {program.is_paid ? (
                            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 font-semibold text-[10px]">
                              Paid Program
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/5 font-semibold text-[10px]">
                              Free Certification
                            </Badge>
                          )}
                        </div>

                        {/* CTA Buttons */}
                        <div className="pt-2 flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1 rounded-xl h-11 border-border hover:bg-muted font-bold text-sm tracking-wide transition-all"
                            onClick={() => handleViewDetails(program.slug)}
                          >
                            <Eye size={16} className="mr-2" />
                            Details
                          </Button>
                          <Button
                            variant="gradient"
                            className="flex-1 rounded-xl h-11 shadow-purple font-bold text-sm tracking-wide group-hover:shadow-purple-lg transition-all"
                            onClick={() => handleApply(program.slug)}
                          >
                            Apply Now
                            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 py-16 text-center space-y-4 glass rounded-3xl border-2 border-dashed border-muted-foreground/20">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                      <AlertCircle size={32} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">No Programs Found</h3>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">We couldn't find any programs matching your search or active filters.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setActiveCategory("All"); }} className="rounded-xl mt-2">
                      Reset Filters
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Info Banner */}
            <motion.div variants={itemVariants}>
              <Card className="bg-muted/40 border-dashed border-2 hover:border-primary/30 hover:bg-muted/60 transition-all duration-300 rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Briefcase className="text-primary" size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-base">How to Apply</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Program applications are available on the portal as job roles recommended to candidates. 
                        Check your <strong>Browse Jobs</strong> section for program openings tailored to your profile.
                      </p>
                      <div className="pt-2">
                        <Button variant="link" className="px-0 h-auto font-bold text-primary flex items-center gap-1" onClick={() => navigate(isDashboard ? "/dashboard/jobs" : "/login")}>
                          View Recommended Programs
                          <ExternalLink size={14} />
                        </Button>
                      </div>
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
        <footer className="border-t py-8 mt-16 bg-card/50">
          <div className="container mx-auto px-6 text-center space-y-4">
            <img src={aimployLogo} alt="Aimploy" className="h-6 mx-auto" />
            <p className="text-xs text-muted-foreground font-medium">
              © 2026 Aimploy. All rights reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Programs;

