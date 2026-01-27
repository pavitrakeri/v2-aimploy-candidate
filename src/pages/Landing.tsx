import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Shield, Users, Sparkles, CheckCircle, TrendingUp, Award, Globe, Zap, Star, Quote } from "lucide-react";
import aimployLogo from "@/assets/aimploy-logo.png";
import landingHero from "@/assets/landing-hero.jpg";
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";

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
    icon: TrendingUp,
    title: "Career Growth",
    description: "Track your progress and get personalized career development insights.",
  },
  {
    icon: Award,
    title: "Certifications",
    description: "Earn verified certifications to showcase your expertise to employers.",
  },
  {
    icon: Globe,
    title: "Global Opportunities",
    description: "Access job opportunities from companies worldwide, remote or on-site.",
  },
  {
    icon: Zap,
    title: "Instant Apply",
    description: "One-click applications with your saved profile and resume.",
  },
];

const stats = [
  { value: "50K+", label: "Active Jobs" },
  { value: "10K+", label: "Companies" },
  { value: "1M+", label: "Professionals" },
  { value: "95%", label: "Success Rate" },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Senior Product Manager",
    company: "Google",
    image: testimonial1,
    quote: "Aimploy helped me find my dream job in just 2 weeks. The AI matching is incredibly accurate!",
  },
  {
    name: "Michael Rodriguez",
    role: "Software Engineer",
    company: "Meta",
    image: testimonial2,
    quote: "The skill challenges helped me stand out from other candidates. Landed a 40% salary increase!",
  },
  {
    name: "Emily Watson",
    role: "UX Designer",
    company: "Spotify",
    image: testimonial3,
    quote: "Best platform for tech professionals. The verification process gave employers confidence in my profile.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Create Your Profile",
    description: "Sign up and build your professional profile with our AI-assisted resume builder.",
  },
  {
    step: "02",
    title: "Get Matched",
    description: "Our AI analyzes your skills and preferences to find the perfect job matches.",
  },
  {
    step: "03",
    title: "Apply & Connect",
    description: "Apply with one click and connect directly with hiring managers.",
  },
  {
    step: "04",
    title: "Land Your Dream Job",
    description: "Interview confidently and secure the position that fits your career goals.",
  },
];

const companies = ["Google", "Meta", "Amazon", "Microsoft", "Apple", "Netflix", "Spotify", "Uber"];

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
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Testimonials
            </a>
            <Link to="/dashboard/programs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Programs
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
      <section className="pt-24 pb-16 px-6 overflow-hidden">
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
                <div className="flex -space-x-3">
                  {[testimonial1, testimonial2, testimonial3].map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="User"
                      className="w-10 h-10 rounded-full border-2 border-background object-cover"
                    />
                  ))}
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center border-2 border-background text-xs font-semibold text-primary-foreground">
                    +1M
                  </div>
                </div>
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
                <img 
                  src={landingHero} 
                  alt="Team collaboration" 
                  className="rounded-2xl shadow-2xl w-full object-cover"
                />
                
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
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
                  animate={{ y: [0, 8, 0] }}
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

      {/* Trusted By Section */}
      <section className="py-12 border-y border-border/50">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm text-muted-foreground mb-8">Trusted by professionals at leading companies</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {companies.map((company) => (
              <span key={company} className="text-xl font-semibold text-muted-foreground/60 hover:text-foreground transition-colors">
                {company}
              </span>
            ))}
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
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Zap size={16} />
              Powerful Features
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

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <TrendingUp size={16} />
              Simple Process
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              How <span className="text-gradient">Aimploy</span> Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes and find your dream job with our streamlined process.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-gradient opacity-30 mb-4">{item.step}</div>
                <h3 className="font-display font-semibold text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-x-8" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Star size={16} />
              Success Stories
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              What Our <span className="text-gradient">Users Say</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of professionals who have transformed their careers with Aimploy.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card border hover:shadow-purple transition-all duration-300"
              >
                <Quote className="text-primary/30 mb-4" size={32} />
                <p className="text-foreground mb-6">{testimonial.quote}</p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
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
              <div className="flex flex-wrap justify-center gap-4">
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
                <Button
                  variant="outline"
                  size="xl"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link to="/login">Browse Jobs</Link>
                </Button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <img src={aimployLogo} alt="Aimploy" className="h-8 mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                The smartest way to find your dream job with AI-powered matching.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
                <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Enterprise</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
                <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</Link>
                <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2">
                <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
                <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
                <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Security</Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t">
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
