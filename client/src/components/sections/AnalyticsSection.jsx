import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { useEffect } from 'react';

const stats = [
  {
    icon: TrendingUp,
    value: 98.5,
    suffix: '%',
    label: 'Conversion Rate',
    trend: '+12.5%',
    trendUp: true,
  },
  {
    icon: DollarSign,
    value: 2.4,
    suffix: 'M',
    prefix: '$',
    label: 'Revenue Growth',
    trend: '+28.3%',
    trendUp: true,
  },
  {
    icon: Users,
    value: 847,
    suffix: 'K',
    label: 'Active Users',
    trend: '+18.2%',
    trendUp: true,
  },
  {
    icon: Activity,
    value: 99.9,
    suffix: '%',
    label: 'Uptime',
    trend: 'Enterprise SLA',
    trendUp: true,
  },
];

const AnimatedNumber = ({ value, prefix = '', suffix = '' }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (value < 10) return latest.toFixed(1);
    return Math.round(latest).toString();
  });

  useEffect(() => {
    const animation = animate(count, value, { duration: 2, ease: 'easeOut' });
    return animation.stop;
  }, [value, count]);

  return (
    <span className="stat-number">
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
};

const AnalyticsSection = () => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-4">
            Trusted by{' '}
            <span className="gradient-text">Industry Leaders</span>
          </h2>
          <p className="section-subtitle mx-auto">
            Join thousands of companies using our platform to drive growth and make data-driven decisions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card p-8 text-center group hover:border-primary/30 transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              
              <AnimatedNumber 
                value={stat.value} 
                prefix={stat.prefix} 
                suffix={stat.suffix} 
              />
              
              <p className="text-muted-foreground mt-2 mb-4">{stat.label}</p>
              
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                stat.trendUp 
                  ? 'bg-green-500/10 text-green-400' 
                  : 'bg-red-500/10 text-red-400'
              }`}>
                <TrendingUp className="w-3 h-3" />
                {stat.trend}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnalyticsSection;
