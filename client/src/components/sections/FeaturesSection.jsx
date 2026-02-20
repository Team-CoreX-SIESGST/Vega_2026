import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { BarChart3, Brain, Shield, Zap } from 'lucide-react';
import {
  Psychology,
  BarChart,
  Security,
  Bolt,
} from '@mui/icons-material';

const features = [
  {
    icon: Psychology,
    title: 'AI-Powered Insights',
    description: 'Advanced machine learning algorithms analyze your data to uncover hidden patterns and opportunities.',
  },
  {
    icon: BarChart,
    title: 'Real-Time Analytics',
    description: 'Monitor your metrics in real-time with beautiful visualizations that update instantly.',
  },
  {
    icon: Bolt,
    title: 'Lightning Fast',
    description: 'Process millions of data points in milliseconds with our optimized infrastructure.',
  },
  {
    icon: Security,
    title: 'Enterprise Security',
    description: 'Bank-level encryption and compliance certifications keep your data safe and secure.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const FeaturesSection = () => {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;

    if (!window.UnicornStudio) {
      window.UnicornStudio = { isInitialized: false, init: () => {}, destroy: () => {} };
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.3/dist/unicornStudio.umd.js';
      script.onload = () => {
        if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
          window.UnicornStudio.init();
          window.UnicornStudio.isInitialized = true;
        }
      };
      document.head.appendChild(script);
    } else if (!window.UnicornStudio.isInitialized) {
      window.UnicornStudio.init();
      window.UnicornStudio.isInitialized = true;
    }

    scriptLoaded.current = true;
  }, []);

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Vintage Black Overlay - Added for blending with above layers */}
      <div className="absolute top-0 left-0 right-0 h-32 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900/20 via-transparent to-transparent" />
        {/* Subtle vintage texture */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* UnicornStudio Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div 
          data-us-project="TvsX3gOpieWTPMVGNpub" 
          className="w-full h-full"
          style={{ minWidth: '100%', minHeight: '100%' }}
        />
        {/* Enhanced gradient with vintage blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-background/70 to-background" />
        {/* Subtle vignette effect for vintage feel */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">
            Powerful Features for{' '}
            <span className="gradient-text">Modern Teams</span>
          </h2>
          <p className="section-subtitle mx-auto">
            Everything you need to turn data into actionable insights and drive business growth.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass-card-hover p-8 group relative"
            >
              {/* Vintage accent border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300 group-hover:shadow-[0_0_20px_rgba(var(--color-primary)/0.3)]">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;