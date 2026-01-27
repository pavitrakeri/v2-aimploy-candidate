import { motion } from "framer-motion";
import { Briefcase, Shield, Users, Sparkles, Target, Award, Zap, Globe } from "lucide-react";

const features = [
  {
    icon: Briefcase,
    title: "Smart Job Matching",
    description: "AI-powered recommendations that match your skills with the perfect opportunities.",
  },
  {
    icon: Shield,
    title: "Background Verification",
    description: "Seamless verification process to build trust with potential employers.",
  },
  {
    icon: Users,
    title: "Talent Programs",
    description: "Exclusive programs to upskill and connect with industry leaders.",
  },
  {
    icon: Sparkles,
    title: "Skill Challenges",
    description: "Prove your expertise through competitive challenges and stand out.",
  },
  {
    icon: Target,
    title: "Career Guidance",
    description: "Personalized career paths and recommendations based on your goals.",
  },
  {
    icon: Award,
    title: "Certifications",
    description: "Earn industry-recognized certifications to boost your profile.",
  },
  {
    icon: Zap,
    title: "Instant Apply",
    description: "Apply to multiple jobs with one click using your saved profile.",
  },
  {
    icon: Globe,
    title: "Remote Opportunities",
    description: "Access remote and hybrid jobs from companies worldwide.",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="text-gradient">Succeed</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform provides comprehensive tools to help you find the perfect job and grow your career.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group p-6 rounded-2xl bg-card border hover:border-primary/50 hover:shadow-purple transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="text-primary-foreground" size={24} />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
