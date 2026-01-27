import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Shield, Users, Sparkles, CheckCircle } from "lucide-react";
import aimployLogo from "@/assets/aimploy-logo.png";

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
];

const stats = [
  { value: "50K+", label: "Active Jobs" },
  { value: "10K+", label: "Companies" },
  { value: "1M+", label: "Professionals" },
  { value: "95%", label: "Success Rate" },
];

export const Landing = () => {
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
            <img src={aimployLogo} alt="Aimploy" className="h-8" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Jobs
            </Link>
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Programs
            </Link>
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button variant="gradient" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
              >
                <Sparkles size={16} />
                AI-Powered Job Platform
              </motion.div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Find Your Dream Job with{" "}
                <span className="text-gradient">Aimploy</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Connect with top companies, showcase your skills, and accelerate your career with our intelligent job matching platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/register">
                    Start Your Journey
                    <ArrowRight size={18} />
                  </Link>
                </Button>
                <Button variant="outline-gradient" size="xl" asChild>
                  <Link to="/login">Browse Jobs</Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 mt-10">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-primary opacity-80 -ml-3 first:ml-0 border-2 border-background"
                  />
                ))}
                <div className="text-sm">
                  <span className="font-semibold text-foreground">1M+ Professionals</span>
                  <span className="text-muted-foreground"> already joined</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-card rounded-2xl shadow-xl p-6 border"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                      <Briefcase className="text-primary-foreground" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold">Senior Frontend Developer</h3>
                      <p className="text-sm text-muted-foreground">Google • Remote</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {["React", "TypeScript", "Next.js"].map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gradient">$180k - $220k</span>
                    <Button variant="gradient" size="sm">Apply Now</Button>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-lg p-4 border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Profile Verified</p>
                      <p className="text-xs text-muted-foreground">Background check complete</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -top-4 -right-4 bg-card rounded-xl shadow-lg p-4 border"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-primary" size={18} />
                    <span className="text-sm font-medium">98% Match Score</span>
                  </div>
                </motion.div>
              </div>

              <div className="absolute inset-0 bg-gradient-hero opacity-20 blur-3xl rounded-full transform scale-110" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-primary">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-primary-foreground/80 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
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
                transition={{ delay: index * 0.1 }}
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

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 md:p-16 text-center"
          >
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Land Your Dream Job?
              </h2>
              <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
                Join thousands of professionals who have already found their perfect career match on Aimploy.
              </p>
              <Button
                variant="default"
                size="xl"
                className="bg-card text-foreground hover:bg-card/90"
                asChild
              >
                <Link to="/register">
                  Create Free Account
                  <ArrowRight size={18} />
                </Link>
              </Button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img src={aimployLogo} alt="Aimploy" className="h-6" />
            <p className="text-sm text-muted-foreground">
              © 2024 Aimploy. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
