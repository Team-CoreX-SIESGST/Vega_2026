import { motion } from "framer-motion";
import { Github, LayoutDashboard } from "lucide-react";

const CTASection = () => {
  return (
    <section id="cta" className="py-28" style={{ backgroundColor: "#4E4E94" }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span
            className="inline-block text-xs font-semibold tracking-widest uppercase mb-6 px-3 py-1 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}
          >
            Get Started
          </span>
          <h2 className="font-outfit text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            From Complaint to Resolution —<br className="hidden md:block" /> In Seconds
          </h2>
          <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.75)" }}>
            RailMind gives railway authorities the AI-powered tools to respond faster, detect patterns earlier,
            and serve passengers better.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundColor: "white", color: "#4E4E94" }}
            >
              <LayoutDashboard size={16} />
              Explore the Dashboard
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border-2 text-white transition-all duration-200 hover:bg-white/10"
              style={{ borderColor: "rgba(255,255,255,0.4)" }}
            >
              <Github size={16} />
              View on GitHub
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
