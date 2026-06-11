import { useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  HelpCircle,
  Plus,
  Minus,
  Sparkles
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

const faqItems = [
  {
    question: "Who is eligible to participate in these programs?",
    answer: "Our programs are open to both aspiring professionals and experienced individuals looking to upskill or transition. Certain tracks (like the CTO track) may recommend a background in software engineering, while business/CEO tracks are open to all profiles."
  },
  {
    question: "How are the program tracks structured?",
    answer: "Each program is structured into specialized tracks (e.g., CTO, CEO, Marketing). You will follow a tailored curriculum, participate in cohort discussions, receive mentorship from industry leaders, and work on real-world projects."
  },
  {
    question: "Is there a program fee, and are scholarships available?",
    answer: "Fee structures vary by program. Some certification paths are fully sponsored or free, while intensive residencies have tuition fees. Details about tuition, flexible payments, and potential scholarships are provided upon application review."
  },
  {
    question: "What is the application selection process?",
    answer: "The process starts with an online application where you choose your track and share your motivation. Selected candidates are invited to an interview round with program directors. Finally, admission decisions and onboarding instructions are emailed."
  },
  {
    question: "How do I get connected with employers after completion?",
    answer: "Aimploy partners with premier tech companies. Upon successful completion of the program, your verified profile and program completion badge are highlighted to hiring managers, and you will get direct interview access."
  }
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

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const { data: program, isLoading, error } = useQuery({
    queryKey: ["program", programId],
    queryFn: () => programsApi.getProgramById(programId || ""),
    enabled: !!programId,
  });

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground text-sm font-semibold tracking-wide">Loading program details...</p>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md border-destructive/20 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4 text-destructive">
            <HelpCircle size={24} />
          </div>
          <h2 className="text-xl font-bold mb-2">Program not found</h2>
          <p className="text-muted-foreground text-sm mb-6">The program you're looking for doesn't exist or failed to load.</p>
          <Button variant="gradient" onClick={() => navigate(isDashboard ? "/dashboard/programs" : "/programs")} className="w-full">
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
                className="font-bold flex items-center gap-1 hover:bg-muted"
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
        <div className="px-6 py-4 border-b bg-card/40 backdrop-blur-md sticky top-0 z-40">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/programs")}
            className="font-bold flex items-center gap-1 hover:bg-muted"
          >
            <ChevronLeft size={18} />
            Back to Programs
          </Button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[380px] md:min-h-[460px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={getHeroImage(program.slug)}
            alt={program.title}
            className="w-full h-full object-cover filter brightness-[0.85]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-sidebar/95 via-sidebar/85 to-sidebar/50" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 container mx-auto px-6 py-12 md:py-20"
        >
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/30 text-primary-foreground border border-primary/40 px-3 py-1 font-semibold text-xs tracking-wider uppercase">
                {program.type}
              </Badge>
              <Badge variant="outline" className="text-sidebar-foreground border-sidebar-foreground/30 px-3 py-1 font-semibold text-xs">
                {program.duration}
              </Badge>
            </div>
            
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight tracking-tight">
              {program.title}
            </h1>
            
            <p className="text-base md:text-xl text-sidebar-foreground/80 leading-relaxed font-normal">
              {program.subtitle}
            </p>
            
            <div className="pt-2">
              <Button
                variant="hero"
                size="xl"
                className="shadow-purple-lg hover:shadow-purple transition-all duration-300 font-bold px-8 rounded-xl h-14"
                onClick={() => navigate(isDashboard ? `/dashboard/programs/apply/${program.slug}` : `/programs/apply/${program.slug}`)}
              >
                Apply Now
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      <div className="container mx-auto px-6 py-16 space-y-20 max-w-5xl">
        {/* About Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-12"
        >
          <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={14} className="text-primary animate-pulse" />
              Overview
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">About the Program</h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {program.description}
            </p>
          </motion.div>

          {/* Highlights Grid */}
          {program.highlights && program.highlights.length > 0 && (
            <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="font-display text-lg font-bold text-center tracking-wider uppercase text-muted-foreground">Program Highlights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {program.highlights.map((highlight, index) => {
                  const HighlightIcon = getIconComponent(highlight.icon);
                  return (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      className="flex items-center gap-3.5 p-5 rounded-2xl bg-card border border-border/80 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <HighlightIcon className="text-primary" size={20} />
                      </div>
                      <span className="text-sm font-bold text-foreground/80 leading-snug">{highlight.text}</span>
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
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="text-center">
              <h2 className="font-display text-3xl font-extrabold tracking-tight">Program Tracks</h2>
              <p className="text-muted-foreground text-sm mt-1">Select the specialized pathway that matches your ambition</p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              {program.tracks.map((track) => {
                const TrackIcon = getIconComponent(track.icon);
                return (
                  <motion.div key={track.id} variants={itemVariants} whileHover={{ y: -6 }}>
                    <Card className="h-full bg-card/40 backdrop-blur-md hover:shadow-xl hover:border-primary/40 hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between border border-border">
                      <CardContent className="p-6 space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shrink-0 shadow-purple">
                            <TrackIcon className="text-primary-foreground" size={26} />
                          </div>
                          <div className="space-y-2 flex-1">
                            <h3 className="font-display text-xl font-bold tracking-tight text-foreground">{track.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{track.description}</p>
                          </div>
                        </div>
                        
                        {track.tags && (
                          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/40">
                            {track.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="font-semibold px-2 py-0.5 text-[10px] uppercase tracking-wider">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Program Details Grid */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-8"
        >
          <motion.div variants={itemVariants} className="text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight">Key Details</h2>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: "Duration", val: program.duration, icon: Clock },
              { label: "Start Date", val: program.start_date || "Rolling Admissions", icon: Calendar },
              { label: "Location", val: program.location || "Hybrid / Remote", icon: MapPin },
              { label: "Tuition / Fee", val: program.is_paid ? "Paid Program" : "Sponsored / Free", icon: IndianRupee }
            ].map((d, index) => (
              <Card key={index} className="text-center bg-card/60 hover:border-primary/20 hover:shadow-md transition-all duration-300">
                <CardContent className="p-5 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                    <d.icon size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{d.label}</p>
                    <p className="font-bold text-sm text-foreground">{d.val}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-muted/40 rounded-3xl p-8 lg:p-12 border border-border/60"
        >
          <motion.div variants={itemVariants} className="text-center mb-10 space-y-1">
            <h2 className="font-display text-3xl font-extrabold tracking-tight">How It Works</h2>
            <p className="text-sm text-muted-foreground">Follow these simple steps to secure your spot</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-4 max-w-4xl mx-auto">
            {applicationSteps.map((step, index) => (
              <motion.div
                key={step.step}
                variants={itemVariants}
                className="relative text-center space-y-3"
              >
                {index < applicationSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-[2px] bg-border/80" />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto shadow-purple border-4 border-background">
                    <span className="text-lg font-bold text-primary-foreground">{step.step}</span>
                  </div>
                </div>
                <div className="space-y-1 px-2">
                  <h3 className="font-bold text-base text-foreground leading-snug">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-8 max-w-3xl mx-auto"
        >
          <motion.div variants={itemVariants} className="text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground mt-1">Find answers to common questions about Aimploy programs</p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index}
                  className="bg-card/50 backdrop-blur-sm border border-border/80 hover:border-primary/20 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-sm md:text-base text-foreground hover:text-primary transition-colors"
                  >
                    <span>{item.question}</span>
                    <span className="shrink-0 ml-4 p-1 rounded-full bg-secondary text-muted-foreground">
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 text-xs md:text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-4 bg-muted/10">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
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
            className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 md:p-12 text-center text-primary-foreground shadow-purple-lg"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl transform translate-x-20 -translate-y-20" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            
            <div className="relative z-10 max-w-xl mx-auto space-y-6">
              <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
                Transform Your Career
              </h2>
              <p className="text-white/80 text-sm md:text-base leading-relaxed">
                Take the first step towards becoming a technology leader with our intensive residency program. Cohort seats are limited.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Button
                  size="xl"
                  className="bg-card text-foreground hover:bg-card/90 font-bold px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  onClick={() => navigate(isDashboard ? `/dashboard/programs/apply/${program.slug}` : `/programs/apply/${program.slug}`)}
                >
                  Apply Now
                  <ArrowRight size={18} className="ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="xl"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-bold px-6 rounded-xl transition-all bg-transparent"
                  onClick={() => navigate(isDashboard ? "/dashboard/programs" : "/programs")}
                >
                  Explore Catalog
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.section>
      </div>

      {/* Public Footer */}
      {!isDashboard && (
        <footer className="border-t py-8 bg-card/50">
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

export default ProgramDetails;

