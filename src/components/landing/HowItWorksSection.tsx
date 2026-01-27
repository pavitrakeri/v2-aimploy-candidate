import { motion } from "framer-motion";
import { UserPlus, Search, Mic, CheckCircle } from "lucide-react";
import aiMatchingImage from "@/assets/ai-matching.jpg";
import interviewImage from "@/assets/interview.jpg";
import successImage from "@/assets/success.jpg";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Sign up and build your professional profile with your skills, experience, and career goals.",
    image: null,
  },
  {
    icon: Search,
    title: "AI Job Matching",
    description: "Our AI analyzes your profile and matches you with the most relevant job opportunities.",
    image: aiMatchingImage,
  },
  {
    icon: Mic,
    title: "Audio Interview",
    description: "Complete a quick audio interview to showcase your personality and communication skills.",
    image: interviewImage,
  },
  {
    icon: CheckCircle,
    title: "Get Hired",
    description: "Receive offers from top companies and start your dream career journey.",
    image: successImage,
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Your Path to{" "}
            <span className="text-gradient">Success</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Follow these simple steps to land your dream job with Aimploy.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-primary/20" />
              )}

              <div className="relative z-10 text-center">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </div>

                {/* Icon/Image Container */}
                <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 overflow-hidden">
                  {step.image ? (
                    <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                  ) : (
                    <step.icon className="text-primary-foreground" size={40} />
                  )}
                </div>

                <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
