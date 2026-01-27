import { motion } from "framer-motion";

const stats = [
  { value: "50K+", label: "Active Jobs" },
  { value: "10K+", label: "Companies" },
  { value: "1M+", label: "Professionals" },
  { value: "95%", label: "Success Rate" },
];

export const StatsSection = () => {
  return (
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
  );
};
