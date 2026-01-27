import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

export const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 px-6 overflow-hidden relative">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Professionals collaborating" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
      </div>

      <div className="container mx-auto relative z-10">
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 backdrop-blur-sm"
            >
              <Sparkles size={16} />
              AI-Powered Job Platform
            </motion.div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Find Your Dream Job with{" "}
              <span className="text-gradient">Aimploy</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Connect with top companies, showcase your skills through AI-powered interviews, and accelerate your career with our intelligent job matching platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/register">
                  Start Your Journey
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button variant="outline-gradient" size="xl" className="gap-2">
                <Play size={18} className="fill-current" />
                Watch Demo
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
            className="relative hidden lg:block"
          >
            {/* Empty for background image effect */}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
