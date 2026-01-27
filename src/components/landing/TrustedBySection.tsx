import { motion } from "framer-motion";

const companies = [
  { name: "Google", initial: "G" },
  { name: "Microsoft", initial: "M" },
  { name: "Amazon", initial: "A" },
  { name: "Meta", initial: "M" },
  { name: "Apple", initial: "A" },
  { name: "Netflix", initial: "N" },
];

export const TrustedBySection = () => {
  return (
    <section className="py-12 border-y bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mb-8"
        >
          TRUSTED BY LEADING COMPANIES WORLDWIDE
        </motion.p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {companies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                {company.initial}
              </div>
              <span className="font-semibold text-lg hidden sm:block">{company.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
