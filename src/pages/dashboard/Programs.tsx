import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  Clock,
  Users,
  Star,
  ArrowRight,
  Play,
  Award,
} from "lucide-react";

const programs = [
  {
    id: 1,
    title: "Full Stack Development Bootcamp",
    provider: "Aimploy Academy",
    duration: "12 weeks",
    enrolled: 1240,
    rating: 4.8,
    level: "Intermediate",
    tags: ["React", "Node.js", "MongoDB"],
    image: "🚀",
    progress: 45,
    isEnrolled: true,
  },
  {
    id: 2,
    title: "AI & Machine Learning Fundamentals",
    provider: "Tech Leaders Institute",
    duration: "8 weeks",
    enrolled: 890,
    rating: 4.9,
    level: "Advanced",
    tags: ["Python", "TensorFlow", "Data Science"],
    image: "🤖",
    progress: 0,
    isEnrolled: false,
  },
  {
    id: 3,
    title: "Product Management Essentials",
    provider: "Product School",
    duration: "6 weeks",
    enrolled: 650,
    rating: 4.7,
    level: "Beginner",
    tags: ["Strategy", "User Research", "Agile"],
    image: "📊",
    progress: 100,
    isEnrolled: true,
  },
  {
    id: 4,
    title: "Cloud Architecture Masterclass",
    provider: "AWS Partners",
    duration: "10 weeks",
    enrolled: 720,
    rating: 4.6,
    level: "Advanced",
    tags: ["AWS", "Docker", "Kubernetes"],
    image: "☁️",
    progress: 0,
    isEnrolled: false,
  },
  {
    id: 5,
    title: "UX Design Professional Certificate",
    provider: "Design Academy",
    duration: "16 weeks",
    enrolled: 1100,
    rating: 4.9,
    level: "Intermediate",
    tags: ["Figma", "User Testing", "Prototyping"],
    image: "🎨",
    progress: 0,
    isEnrolled: false,
  },
  {
    id: 6,
    title: "Leadership & Management",
    provider: "Harvard Online",
    duration: "8 weeks",
    enrolled: 2300,
    rating: 4.8,
    level: "All Levels",
    tags: ["Leadership", "Communication", "Team Building"],
    image: "👔",
    progress: 20,
    isEnrolled: true,
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
  const enrolledPrograms = programs.filter((p) => p.isEnrolled);
  const availablePrograms = programs.filter((p) => !p.isEnrolled);

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
          Upskill with industry-leading programs and certifications
        </p>
      </motion.div>

      {/* My Programs */}
      {enrolledPrograms.length > 0 && (
        <motion.div variants={itemVariants}>
          <h2 className="font-display text-xl font-semibold mb-4">My Programs</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrolledPrograms.map((program) => (
              <Card key={program.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="bg-gradient-hero p-6 text-center">
                    <span className="text-5xl">{program.image}</span>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-semibold line-clamp-1">{program.title}</h3>
                      <p className="text-sm text-muted-foreground">{program.provider}</p>
                    </div>

                    {program.progress === 100 ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <Award size={18} />
                        <span className="text-sm font-medium">Completed!</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{program.progress}%</span>
                        </div>
                        <Progress value={program.progress} className="h-2" />
                      </div>
                    )}

                    <Button
                      variant={program.progress === 100 ? "outline" : "gradient"}
                      className="w-full"
                    >
                      {program.progress === 100 ? (
                        <>
                          View Certificate
                          <Award size={16} />
                        </>
                      ) : (
                        <>
                          Continue Learning
                          <Play size={16} />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Available Programs */}
      <motion.div variants={itemVariants}>
        <h2 className="font-display text-xl font-semibold mb-4">Available Programs</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availablePrograms.map((program) => (
            <Card key={program.id} className="overflow-hidden hover:shadow-md transition-shadow group">
              <CardContent className="p-0">
                <div className="bg-gradient-primary p-6 text-center group-hover:scale-105 transition-transform">
                  <span className="text-5xl">{program.image}</span>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold line-clamp-1 flex-1">{program.title}</h3>
                      <Badge variant="secondary">{program.level}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{program.provider}</p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {program.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {program.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {program.enrolled.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      {program.rating}
                    </span>
                  </div>

                  <Button variant="outline" className="w-full group-hover:border-primary group-hover:text-primary transition-colors">
                    Enroll Now
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Programs;
