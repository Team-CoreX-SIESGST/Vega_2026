import { Train } from "lucide-react";

const Footer = () => {
  return (
    <footer
      className="py-8 section-white"
      style={{ borderTop: "1px solid rgba(78,78,148,0.2)" }}
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo + Tagline */}
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: "rgba(78,78,148,0.1)" }}
          >
            <Train size={18} style={{ color: "#4E4E94" }} />
          </div>
          <div>
            <span className="font-outfit font-bold text-lg" style={{ color: "#1A1A2E" }}>
              Rail<span style={{ color: "#4E4E94" }}>Mind</span>
            </span>
            <p className="text-xs" style={{ color: "#4A4A6A" }}>
              AI for Smarter Railways
            </p>
          </div>
        </div>

        {/* Right info */}
        <p className="text-sm font-medium" style={{ color: "#4A4A6A" }}>
          AIML-03 · Indian Railways Hackathon · 2024
        </p>
      </div>
    </footer>
  );
};

export default Footer;
