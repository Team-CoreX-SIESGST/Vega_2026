import GlassCard from "@/components/GlassCard";
import { TrendingUp, Target, Activity, Award } from "lucide-react";

const metrics = [
  { label: "Quality Score", value: "94%", icon: Target, trend: "+12%" },
  { label: "Accuracy Rate", value: "97%", icon: Activity, trend: "+8%" },
  { label: "Performance", value: "A+", icon: Award, trend: "Optimal" },
  { label: "Improvement", value: "23%", icon: TrendingUp, trend: "Monthly" },
];

const TrackingSection = () => {
  return (
    <section id="tracking" className="relative py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="font-display text-3xl md:text-5xl font-bold">
              <span className="gradient-text">Outcome Tracking</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Every simulation is tracked with quality scores, performance trends, 
              and improvement metrics. Watch your AI collective evolve and improve 
              over time with comprehensive analytics.
            </p>
            <ul className="space-y-3">
              {["Quality scoring for each reasoning session", "Performance trends and historical data", "Improvement metrics tracked over time", "Detailed insights and recommendations"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-foreground/80">
                  <div className="w-2 h-2 rounded-full bg-primary animate-glow-pulse" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {metrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <GlassCard 
                  key={metric.label}
                  className="text-center opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  glow
                >
                  <IconComponent className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">
                    {metric.value}
                  </div>
                  <div className="text-muted-foreground text-sm mb-2">{metric.label}</div>
                  <div className="text-xs text-primary font-semibold">{metric.trend}</div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrackingSection;