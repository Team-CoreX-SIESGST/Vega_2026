import UnicornBackground from "@/components/UnicornBackground";
import GlassCard from "@/components/GlassCard";
import { Sparkles, Zap, Brain, MessageSquare } from "lucide-react";

const thinkingNodes = [
  { icon: Brain, label: "Analyzing", delay: "0s" },
  { icon: Zap, label: "Processing", delay: "0.5s" },
  { icon: MessageSquare, label: "Critiquing", delay: "1s" },
  { icon: Sparkles, label: "Synthesizing", delay: "1.5s" },
];

const DemoSection = () => {
  return (
    <section id="demo" className="relative py-24 md:py-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 space-y-4">
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            <span className="gradient-text">Watch the Arena</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience AI agents thinking in real-time
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <GlassCard className="p-0 overflow-hidden" hover={false}>
            <div className="relative h-[400px] md:h-[500px]">
              <UnicornBackground useVideo={false} />
              
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent z-10" />
              
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 p-6">
                  {thinkingNodes.map((node, index) => {
                    const IconComponent = node.icon;
                    return (
                      <div 
                        key={node.label}
                        className="flex flex-col items-center gap-3 opacity-0 animate-fade-in"
                        style={{ animationDelay: `${0.3 + index * 0.2}s` }}
                      >
                        <div className="relative">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-primary/50 flex items-center justify-center bg-card/50 backdrop-blur-sm animate-glow-pulse">
                            <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                          </div>
                          <div 
                            className="absolute -inset-2 rounded-full border border-primary/20 animate-ping"
                            style={{ animationDelay: node.delay, animationDuration: "2s" }}
                          />
                        </div>
                        <span className="font-display text-xs md:text-sm text-foreground/80 animate-text-glow-pulse">
                          {node.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                <p className="font-display text-sm md:text-base text-muted-foreground">
                  Watch agents think in real-time
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;