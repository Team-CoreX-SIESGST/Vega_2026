import { motion } from "framer-motion";
import { MessageSquare, Clock, AlertTriangle } from "lucide-react";

const stats = [
  { icon: MessageSquare, stat: "50,000+", label: "Daily Complaints" },
  { icon: Clock, stat: "72 hrs", label: "Avg Resolution Time" },
  { icon: AlertTriangle, stat: "23%", label: "Issues Left Unresolved" },
];

const painPoints = [
  {
    title: "Manual Categorization",
    desc: "Complaints manually sorted by overworked staff, causing significant processing delays and errors.",
  },
  {
    title: "Slow Routing",
    desc: "No intelligent triage to route urgent issues to the right department — everything goes to the same queue.",
  },
  {
    title: "Overlooked Patterns",
    desc: "Recurring issues in specific routes go undetected for weeks, allowing systemic problems to persist.",
  },
  {
    title: "Poor Prioritization",
    desc: "High-severity safety complaints treated the same as minor inconveniences — critical issues buried.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ProblemSection = () => {
  return (
    <section id="problem" className="py-24 section-white">
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
            The Challenge
          </span>
          <h2 className="font-outfit text-4xl font-bold mb-4" style={{ color: "#1A1A2E" }}>
            The Problem Indian Railways Faces Daily
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#4A4A6A" }}>
            Thousands of passenger complaints flood in every day. Manual processing means slow responses,
            missed patterns, and unresolved issues.
          </p>
        </motion.div>

        {/* Stat Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map(({ icon: Icon, stat, label }) => (
            <motion.div key={label} variants={itemVariants} className="stat-card">
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                style={{ backgroundColor: "rgba(78,78,148,0.08)" }}
              >
                <Icon size={22} style={{ color: "#4E4E94" }} />
              </div>
              <div
                className="font-outfit text-4xl font-bold mb-1"
                style={{ color: "#4E4E94" }}
              >
                {stat}
              </div>
              <div className="text-sm font-medium" style={{ color: "#4A4A6A" }}>
                {label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Pain Points */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {painPoints.map(({ title, desc }) => (
            <motion.div key={title} variants={itemVariants} className="pain-card">
              <h3 className="font-outfit font-semibold text-lg mb-2" style={{ color: "#1A1A2E" }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#4A4A6A" }}>
                {desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection;