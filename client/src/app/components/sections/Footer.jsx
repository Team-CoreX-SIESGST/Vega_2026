import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative py-12 border-t border-border/50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50">
              <span className="font-display text-sm font-bold text-primary">AI</span>
            </div>
            <span className="font-display text-lg font-semibold text-foreground">
              AI Collective Arena
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              About
            </a>
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Features
            </a>
            <a href="#demo" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Demo
            </a>
            <a href="#cta" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-4">
            {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
              <a 
                key={i}
                href="#" 
                className="w-10 h-10 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:shadow-neon transition-all"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        <div className="neon-line my-8" />

        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 AI Collective Arena. All rights reserved.</p>
          <p className="mt-2">
            Built for the future of multi-agent AI reasoning.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;