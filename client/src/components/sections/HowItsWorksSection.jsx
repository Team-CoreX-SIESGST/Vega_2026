import { motion } from 'framer-motion';
import { Database, Cpu, LineChart, Rocket } from 'lucide-react';

const steps = [
  {
    icon: Database,
    step: '01',
    title: 'Connect Your Data',
    description: 'Seamlessly integrate with 100+ data sources including databases, APIs, and cloud services.',
  },
  {
    icon: Cpu,
    step: '02',
    title: 'AI Processing',
    description: 'Our advanced AI analyzes your data, identifying patterns and generating actionable insights.',
  },
  {
    icon: LineChart,
    step: '03',
    title: 'Visualize Insights',
    description: 'Beautiful dashboards and reports that make complex data easy to understand.',
  },
  {
    icon: Rocket,
    step: '04',
    title: 'Take Action',
    description: 'Make informed decisions faster with predictive analytics and automated recommendations.',
  },
];

const HowItWorksSection = () => {
  return (
    <section className="relative py-24 md:py-32">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">
            How It{' '}
            <span className="gradient-text">Works</span>
          </h2>
          <p className="section-subtitle mx-auto">
            Get started in minutes with our simple four-step process.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                <div className="glass-card p-8 h-full relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <step.icon className="w-7 h-7 text-primary" />
                    </div>
                    <span className="text-4xl font-bold text-primary/20">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
