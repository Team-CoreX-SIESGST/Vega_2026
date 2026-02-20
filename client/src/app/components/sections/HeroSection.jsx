import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Train } from "lucide-react";

const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-8 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F5F5FF 60%, #FFFFFF 100%)" }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-20 left-10 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(78,78,148,0.10) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-40 right-10 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(78,78,148,0.08) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center w-full">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border"
            style={{
              backgroundColor: "rgba(78,78,148,0.06)",
              color: "#4E4E94",
              borderColor: "rgba(78,78,148,0.2)",
            }}
          >
            <Train size={12} />
            🚂 AIML-03 · Indian Railways · Hackathon Project
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-outfit text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight"
          style={{ color: "#1A1A2E" }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Rail<span style={{ color: "#4E4E94" }}>Mind</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: "#4A4A6A" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          AI-powered complaint intelligence for Indian Railways.
          <br className="hidden md:block" />
          <span className="font-medium" style={{ color: "#4E4E94" }}>
            Categorize, cluster, and act — instantly.
          </span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <a
            href="#features"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: "#4E4E94" }}
          >
            View Dashboard
            <ArrowRight size={15} />
          </a>
          <a
            href="#solution"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border-2 transition-all duration-200 hover:bg-primary/5"
            style={{ borderColor: "rgba(78,78,148,0.35)", color: "#4E4E94" }}
          >
            <BookOpen size={15} />
            Read Documentation
          </a>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mx-auto max-w-5xl"
        >
          {/* Glowing frame */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              boxShadow: "0 0 80px -20px rgba(78,78,148,0.35), 0 40px 100px -30px rgba(78,78,148,0.2)",
            }}
          />
          <div
            className="rounded-2xl overflow-hidden border shadow-2xl"
            style={{ borderColor: "rgba(78,78,148,0.2)" }}
          >
            {/* Window chrome */}
            <div
              className="px-4 py-3 flex items-center gap-2 border-b"
              style={{
                background: "rgba(78,78,148,0.06)",
                borderColor: "rgba(78,78,148,0.12)",
              }}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FF5F57" }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FEBC2E" }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#28C840" }} />
              <div
                className="ml-3 flex-1 h-6 rounded-md flex items-center px-3 text-xs"
                style={{ backgroundColor: "rgba(78,78,148,0.08)", color: "#4A4A6A" }}
              >
                railmind-dashboard.ai · Complaint Intelligence Platform
              </div>
            </div>
            <img
              src={"/assets/dashboard-preview.png"}
              alt="RailMind AI Dashboard — Complaint Management Analytics"
              className="w-full object-cover"
              loading="eager"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
