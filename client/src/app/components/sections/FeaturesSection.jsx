import { motion } from "framer-motion";
import { Shield, TrendingUp, AlertOctagon, BarChart2, Zap, CheckCircle } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Auto-Categorization",
    desc: "Classifies complaints into Cleanliness, Delay, Staff, Food, Safety, and Ticketing with high ML accuracy.",
  },
  {
    icon: TrendingUp,
    title: "Pattern Detection",
    desc: "Identifies complaint clusters emerging from specific trains, stations, or zones before they escalate.",
  },
  {
    icon: AlertOctagon,
    title: "Severity Tagging",
    desc: "Three-tier system: Critical / High / Normal — urgent issues bubble to the top instantly for action.",
  },
  {
    icon: BarChart2,
    title: "Interactive Dashboard",
    desc: "Real-time visualizations of complaint volumes, category distribution, zone heatmaps, and trends.",
  },
  {
    icon: Zap,
    title: "Fast Resolution",
    desc: "Automated routing slashes manual triage time from hours to seconds, improving passenger satisfaction.",
  },
  {
    icon: CheckCircle,
    title: "Evaluation Metrics",
    desc: "Built-in Accuracy and F1-score tracking to monitor model performance and reliability over time.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 section-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span
            className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
            style={{ backgroundColor: "rgba(78,78,148,0.08)", color: "#4E4E94" }}
          >
            What RailMind Delivers
          </span>
          <h2 className="font-outfit text-4xl font-bold mb-4" style={{ color: "#1A1A2E" }}>
            Built for Railway Operations
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "#4A4A6A" }}>
            Every feature designed to reduce resolution time, surface hidden patterns, and improve passenger experience.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={itemVariants}>
              <div className="railmind-card h-full group cursor-default">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                  style={{ backgroundColor: "rgba(78,78,148,0.1)" }}
                >
                  <Icon size={20} style={{ color: "#4E4E94" }} />
                </div>
                <h3
                  className="font-outfit font-semibold text-lg mb-2"
                  style={{ color: "#1A1A2E" }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#4A4A6A" }}>
                  {desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;