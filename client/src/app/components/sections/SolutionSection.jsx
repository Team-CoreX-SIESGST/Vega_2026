import { motion } from "framer-motion";
import { FileText, Cpu, GitBranch, Bell, ArrowRight } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: FileText,
    title: "Ingest",
    desc: "Complaints from email, web portal, mobile app, and Twitter aggregated into a unified pipeline.",
  },
  {
    num: "02",
    icon: Cpu,
    title: "Preprocess & Classify",
    desc: "NLP pipeline cleans text; ML model categorizes into 6 complaint types with high accuracy.",
  },
  {
    num: "03",
    icon: GitBranch,
    title: "Cluster & Detect",
    desc: "Unsupervised clustering detects emerging issue patterns by specific route, train, or zone.",
  },
  {
    num: "04",
    icon: Bell,
    title: "Alert & Prioritize",
    desc: "Severity tagging flags critical complaints for immediate escalation to the right authority.",
  },
];

const SolutionSection = () => {
  return (
    <section id="solution" className="py-24 section-lavender">
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
            How RailMind Works
          </span>
          <h2 className="font-outfit text-4xl font-bold mb-4" style={{ color: "#1A1A2E" }}>
            Intelligent. Automated. Actionable.
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "#4A4A6A" }}>
            An end-to-end AI pipeline that transforms raw passenger complaints into structured intelligence.
          </p>
        </motion.div>

        {/* Pipeline Steps */}
        <div className="flex flex-col lg:flex-row items-stretch gap-0">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="flex flex-col lg:flex-row items-stretch flex-1">
                <motion.div
                  className="flex-1 bg-white rounded-2xl p-7 shadow-sm border flex flex-col"
                  style={{ borderColor: "rgba(78,78,148,0.15)" }}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  whileHover={{ y: -4, boxShadow: "0 12px 32px -8px rgba(78,78,148,0.18)" }}
                >
                  {/* Step number */}
                  <div className="flex items-center gap-3 mb-5">
                    <span
                      className="font-outfit text-2xl font-black"
                      style={{ color: "rgba(78,78,148,0.18)" }}
                    >
                      {step.num}
                    </span>
                    <div
                      className="ml-auto w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "rgba(78,78,148,0.1)" }}
                    >
                      <Icon size={18} style={{ color: "#4E4E94" }} />
                    </div>
                  </div>
                  {/* Content */}
                  <div
                    className="w-8 h-1 rounded-full mb-4"
                    style={{ backgroundColor: "#4E4E94" }}
                  />
                  <h3 className="font-outfit font-bold text-xl mb-2" style={{ color: "#1A1A2E" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#4A4A6A" }}>
                    {step.desc}
                  </p>
                </motion.div>

                {/* Arrow connector */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex items-center justify-center px-2 self-center">
                    <ArrowRight size={20} style={{ color: "rgba(78,78,148,0.35)" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
