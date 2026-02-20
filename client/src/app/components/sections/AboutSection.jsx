import GlassCard from "@/components/GlassCard";
import { Brain, Search, Lightbulb, MessageSquare, Scale, ArrowRight } from "lucide-react";

const agents = [
  {
    icon: Brain,
    name: "Planner",
    description: "Orchestrates the reasoning process and sets strategic direction",
    color: "text-primary",
  },
  {
    icon: Search,
    name: "Researcher",
    description: "Gathers context and discovers relevant information",
    color: "text-secondary",
  },
  {
    icon: Lightbulb,
    name: "Analyzer",
    description: "Finds patterns and extracts meaningful insights",
    color: "text-accent",
  },
  {
    icon: MessageSquare,
    name: "Critic",
    description: "Identifies flaws and challenges assumptions",
    color: "text-chart-4",
  },
  {
    icon: Scale,
    name: "Referee",
    description: "Scores reasoning and identifies best insights",
    color: "text-chart-5",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      
      <div className="relative container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-glow opacity-0 animate-fade-in">
            Multi-Agent Intelligence, <span className="gradient-text">Redefined</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Multiple AI agents with unique reasoning roles collaborate, critique, and evolve over time 
            in a structured arena designed for continuous improvement.
          </p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-2">
          {agents.map((agent, index) => {
            const IconComponent = agent.icon;
            return (
              <div key={agent.name} className="flex items-center opacity-0 animate-fade-in-up" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                <GlassCard className="w-40 md:w-48 text-center p-4 md:p-6" glow>
                  <IconComponent className={`w-10 h-10 mx-auto mb-3 ${agent.color}`} />
                  <h3 className="font-display text-sm md:text-base font-semibold text-foreground mb-1">
                    {agent.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {agent.description}
                  </p>
                </GlassCard>
                {index < agents.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-primary mx-2 hidden md:block animate-text-glow-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;