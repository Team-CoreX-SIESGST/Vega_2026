import GlassCard from "@/components/GlassCard";
import { Users, Award, BarChart3, Eye } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Peer Review System",
    description: "Each agent's reasoning is critiqued by others, ensuring robust and validated conclusions through collaborative analysis.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: Award,
    title: "Referee Scoring",
    description: "The Referee Agent evaluates all responses, assigns quality scores, and identifies the best insights and weaknesses.",
    gradient: "from-secondary to-accent",
  },
  {
    icon: BarChart3,
    title: "Outcome Tracking",
    description: "All simulations are saved with quality scores, performance trends, and improvement tracking for continuous learning.",
    gradient: "from-accent to-chart-4",
  },
  {
    icon: Eye,
    title: "Real-Time Visualization",
    description: "Watch agents think, review, and get judged in phases with live visualization of the reasoning process.",
    gradient: "from-chart-4 to-primary",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-display text-3xl md:text-5xl font-bold">
            <span className="gradient-text">Core Features</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Advanced systems designed for multi-agent collaboration and continuous improvement
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <GlassCard 
                key={feature.title} 
                className="opacity-0 animate-fade-in-up group cursor-pointer"
                style={{ animationDelay: `${0.2 + index * 0.15}s` }}
                glow
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.gradient} bg-opacity-20`}>
                    <IconComponent className="w-6 h-6 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-glow transition-all">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;