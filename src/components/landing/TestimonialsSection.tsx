import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Software Engineer at Google",
    content: "Aimploy's AI matching helped me find my dream job in just 2 weeks. The audio interview feature was a game-changer!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Product Manager at Meta",
    content: "The platform made job hunting so much easier. I loved how it matched me with roles that truly fit my skills.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Data Scientist at Amazon",
    content: "From profile creation to getting hired, everything was seamless. Highly recommend Aimploy to anyone job hunting!",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "UX Designer at Apple",
    content: "The skill challenges helped me stand out from other candidates. I got multiple offers within a month!",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
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
            Testimonials
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Loved by{" "}
            <span className="text-gradient">Professionals</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See what our users have to say about their experience with Aimploy.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-card border hover:border-primary/30 transition-all duration-300"
            >
              <Quote className="text-primary/30 mb-4" size={32} />
              <p className="text-sm text-muted-foreground mb-4">{testimonial.content}</p>
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {testimonial.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
