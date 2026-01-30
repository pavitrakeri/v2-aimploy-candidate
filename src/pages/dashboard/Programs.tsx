import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  ArrowRight,
  Briefcase,
  TrendingUp,
  Megaphone,
  Building2,
  Sparkles,
  ExternalLink,
  Eye,
} from "lucide-react";

const aimployPrograms = [
  {
    id: "aincubatr",
    title: "Aincubatr Residency Program",
    provider: "Aimploy × SOUL Incubator",
    duration: "3 months",
    type: "Residency",
    tracks: ["CTO Training", "CEO Training"],
    description: "Intensive leadership training program designed to develop the next generation of tech leaders. Choose between CTO or CEO track based on your career aspirations.",
    highlights: [
      "Hands-on leadership experience",
      "Mentorship from industry experts",
      "Partnership with SOUL Incubator",
      "Network with fellow entrepreneurs",
    ],
    isPaid: true,
    badge: "Premium",
    badgeColor: "bg-gradient-primary text-primary-foreground",
    icon: TrendingUp,
    image: "🚀",
  },
  {
    id: "aimakt",
    title: "AImakt Internship",
    provider: "Aimploy Academy",
    duration: "3 months",
    type: "Internship",
    tracks: ["Marketing Certification Program"],
    description: "Comprehensive marketing internship program with certification. Gain practical experience in digital marketing, brand strategy, and growth hacking.",
    highlights: [
      "Marketing Certification included",
      "Real-world project experience",
      "Industry-recognized credential",
      "Career placement support",
    ],
    isPaid: false,
    badge: "Certification",
    badgeColor: "bg-accent/20 text-accent",
    icon: Megaphone,
    image: "📈",
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

export const Programs = () => {
  const navigate = useNavigate();

  const handleViewDetails = (programId: string) => {
    navigate(`/dashboard/programs/${programId}`);
  };

  const handleApply = (programId: string) => {
    navigate(`/dashboard/programs/apply/${programId}`);
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
          {aimployPrograms.map((program) => (
            <Card key={program.id} className="overflow-hidden hover:shadow-lg transition-all group border-2 hover:border-primary/30">
              <CardContent className="p-0">
                {/* Header */}
                <div className="bg-gradient-hero p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl" />
                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <Badge className={program.badgeColor}>{program.badge}</Badge>
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
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Available Tracks
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {program.tracks.map((track) => (
                        <Badge key={track} variant="secondary" className="font-normal">
                          {track}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-2">
                    {program.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>

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
                    {program.isPaid && (
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
                      onClick={() => handleViewDetails(program.id)}
                    >
                      <Eye size={16} />
                      View Details
                    </Button>
                    <Button
                      variant="gradient"
                      className="flex-1 group-hover:shadow-purple-lg transition-shadow"
                      onClick={() => handleApply(program.id)}
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
                <Button variant="link" className="px-0 mt-2 h-auto">
                  View Recommended Programs
                  <ExternalLink size={14} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Programs;
