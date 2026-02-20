// // src/app/mobile/page.jsx
// 'use client';
// import Link from 'next/link';
// import { useAuth } from '../../contexts/AuthContext';
// import { GlassCard } from '../../components/GlassCard'; // adjust path if needed
// import { GlowButton } from '../../components/GlowButton';
// // import UnicornBackground from '../../components/sections/UnicornBackground';

// export default function MobileLandingPage() {
//   const { user } = useAuth();

//   const features = [
//     {
//       title: 'Quick Complaint Logging',
//       description: 'Log complaints in seconds with our simple form. Train number auto‑validation included.',
//       icon: '📝',
//     },
//     {
//       title: 'AI‑Powered Categorization',
//       description: 'Our NLP engine automatically classifies your issue and assigns severity and department.',
//       icon: '🤖',
//     },
//     {
//       title: 'Real‑Time Status Tracking',
//       description: 'View all your complaints and their current status (Pending, In Progress, Resolved).',
//       icon: '⏱️',
//     },
//     {
//       title: 'Works Offline (PWA)',
//       description: 'Install as a Progressive Web App for offline access and native‑like experience.',
//       icon: '📱',
//     },
//   ];

//   return (
//     <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white">
//       {/* <UnicornBackground /> optional decorative background */}

//       <div className="relative max-w-md mx-auto px-4 py-8">
//         {/* Header / Logo */}
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
//             RailMitra
//           </h1>
//           <p className="text-gray-600 mt-2">Your voice matters – complain smarter</p>
//         </div>

//         {/* Hero Section */}
//         <GlassCard className="p-6 mb-8 text-center">
//           <h2 className="text-2xl font-semibold mb-2">Report Issues Instantly</h2>
//           <p className="text-gray-600 mb-4">
//             AI‑powered complaint system for Indian Railways. Get your concerns heard and resolved faster.
//           </p>
//           {user ? (
//             <Link href="/mobile/issues">
//               <GlowButton className="w-full py-3">Go to My Issues</GlowButton>
//             </Link>
//           ) : (
//             <div className="space-y-3">
//               <Link href="/auth/login?redirect=/mobile">
//                 <GlowButton className="w-full py-3">Login / Register</GlowButton>
//               </Link>
//               <p className="text-xs text-gray-500">
//                 Secure login with email – no OTP hassle.
//               </p>
//             </div>
//           )}
//         </GlassCard>

//         {/* Features Grid */}
//         <h3 className="text-xl font-semibold mb-4 text-center">Why use RailMitra Mobile?</h3>
//         <div className="grid gap-4">
//           {features.map((feat, idx) => (
//             <GlassCard key={idx} className="p-4 flex items-start space-x-3">
//               <span className="text-3xl">{feat.icon}</span>
//               <div>
//                 <h4 className="font-semibold">{feat.title}</h4>
//                 <p className="text-sm text-gray-600">{feat.description}</p>
//               </div>
//             </GlassCard>
//           ))}
//         </div>

//         {/* Footer */}
//         <footer className="mt-8 text-center text-xs text-gray-400">
//           © {new Date().getFullYear()} RailMitra.
//         </footer>
//       </div>
//     </div>
//   );
// }

'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Train, ArrowRight, FileText, Bot, Clock, Smartphone, CheckCircle, Star } from 'lucide-react';
import ProfileDropdown from '../components/ProfileDropdown';

const features = [
  {
    icon: FileText,
    title: 'Quick Complaint Logging',
    description: 'Log complaints in seconds with our simple form. Train number auto-validation included.',
  },
  {
    icon: Bot,
    title: 'AI-Powered Categorization',
    description: 'Our NLP engine automatically classifies your issue and assigns severity and department.',
  },
  {
    icon: Clock,
    title: 'Real-Time Status Tracking',
    description: 'View all your complaints and their current status — Pending, In Progress, or Resolved.',
  },
  {
    icon: Smartphone,
    title: 'Works Offline (PWA)',
    description: 'Install as a Progressive Web App for offline access and a native-like experience.',
  },
];

const stats = [
  { value: '50K+', label: 'Complaints Filed' },
  { value: '4.8★', label: 'User Rating' },
  { value: '72%', label: 'Faster Resolution' },
  { value: '99.9%', label: 'Uptime' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function MobileLandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b transition-all duration-300"
        style={{ borderBottomColor: 'rgba(78,78,148,0.15)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="p-1.5 rounded-lg transition-all duration-200"
              style={{ backgroundColor: 'rgba(78,78,148,0.1)' }}
            >
              <Train size={20} style={{ color: '#4E4E94' }} />
            </div>
            <span className="font-outfit font-bold text-xl" style={{ color: '#1A1A2E' }}>
              Rail<span style={{ color: '#4E4E94' }}>Mind</span>
            </span>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/mobile/issues">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:shadow-md"
                    style={{ backgroundColor: '#4E4E94' }}
                  >
                    My Issues <ArrowRight size={14} />
                  </motion.button>
                </Link>
                <ProfileDropdown />
              </>
            ) : (
              <>
                <Link
                  href="/auth/login?redirect=/mobile"
                  className="text-sm font-medium transition-colors duration-200"
                  style={{ color: '#4E4E94' }}
                >
                  Sign In
                </Link>
                <Link href="/auth/login?redirect=/mobile">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:shadow-md"
                    style={{ backgroundColor: '#4E4E94' }}
                  >
                    Get Started <ArrowRight size={14} />
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-8 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5FF 60%, #FFFFFF 100%)' }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute top-20 left-10 w-72 h-72 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(78,78,148,0.10) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute bottom-40 right-10 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(78,78,148,0.08) 0%, transparent 70%)',
            filter: 'blur(50px)',
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
                backgroundColor: 'rgba(78,78,148,0.06)',
                color: '#4E4E94',
                borderColor: 'rgba(78,78,148,0.2)',
              }}
            >
              <Train size={12} />
              Indian Railways · Passenger Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="font-outfit text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight"
            style={{ color: '#1A1A2E' }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Your voice matters —<br />
            <span style={{ color: '#4E4E94' }}>complain smarter.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: '#4A4A6A' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            AI-powered complaint management for Indian Railways. Get your concerns heard, categorized, and resolved — faster than ever.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {user ? (
              <Link href="/mobile/issues">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5"
                  style={{ backgroundColor: '#4E4E94' }}
                >
                  Go to My Issues
                  <ArrowRight size={15} />
                </motion.button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login?redirect=/mobile">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5"
                    style={{ backgroundColor: '#4E4E94' }}
                  >
                    Login / Register
                    <ArrowRight size={15} />
                  </motion.button>
                </Link>
                <Link href="#features">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm border-2 transition-all duration-200 hover:bg-primary/5"
                    style={{ borderColor: 'rgba(78,78,148,0.35)', color: '#4E4E94' }}
                  >
                    Learn More
                  </motion.button>
                </Link>
              </>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xs mt-4"
            style={{ color: 'rgba(74,74,106,0.5)', letterSpacing: '0.05em' }}
          >
            Secure login with email — no OTP hassle.
          </motion.p>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="py-8 md:py-12 bg-white border-b px-4 sm:px-6" style={{ borderBottomColor: 'rgba(78,78,148,0.1)' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
          >
            {stats.map(({ value, label }) => (
              <motion.div
                key={label}
                variants={itemVariants}
                className="rounded-xl sm:rounded-2xl border p-4 sm:p-5 md:p-6 text-center bg-white shadow-sm min-w-0"
                style={{ borderColor: 'hsl(var(--primary) / 0.15)' }}
              >
                <div className="font-outfit text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2" style={{ color: '#4E4E94' }}>
                  {value}
                </div>
                <div className="text-[10px] sm:text-xs font-medium uppercase tracking-wider leading-tight line-clamp-2" style={{ color: '#4A4A6A' }}>
                  {label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-14 sm:py-20 md:py-24 section-white px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <motion.div
            className="text-center mb-10 sm:mb-14 md:mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span
              className="inline-block text-[10px] sm:text-xs font-semibold tracking-widest uppercase mb-3 sm:mb-4 px-2.5 sm:px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(78,78,148,0.08)', color: '#4E4E94' }}
            >
              Why RailMind Mobile?
            </span>
            <h2 className="font-outfit text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2" style={{ color: '#1A1A2E' }}>
              Everything you need,{' '}
              <span style={{ color: '#4E4E94' }}>in your pocket</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-snug" style={{ color: '#4A4A6A' }}>
              Built for passengers on the move — fast, intelligent, and always available.
            </p>
          </motion.div>

          {/* Feature Grid — mobile: stacked cards with icon+title row; desktop: grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map(({ icon: Icon, title, description }) => (
  <motion.div key={title} variants={itemVariants}>
    <div className="railmind-card h-full group cursor-default p-4 sm:p-5 md:p-6 flex flex-col min-h-0">
      {/* Changed to vertical layout */}
      <div className="flex flex-col items-center sm:items-start mb-4 sm:mb-5">
        <div
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 mb-3"
          style={{ backgroundColor: 'rgba(78,78,148,0.1)' }}
        >
          <Icon size={20} style={{ color: '#4E4E94' }} />
        </div>
        <h3
          className="font-outfit font-semibold text-base sm:text-lg text-center sm:text-left"
          style={{ color: '#1A1A2E' }}
        >
          {title}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-center sm:text-left" style={{ color: '#4A4A6A' }}>
        {description}
      </p>
    </div>
  </motion.div>
))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section id="cta" className="py-28" style={{ backgroundColor: '#4E4E94' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase mb-6 px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
            >
              Get Started
            </span>
            <h2 className="font-outfit text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to make your
              <br className="hidden md:block" />
              <span className="text-white/90">voice heard?</span>
            </h2>
            <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Join thousands of passengers already using RailMitra to resolve their complaints faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href="/mobile/issues">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                    style={{ backgroundColor: 'white', color: '#4E4E94' }}
                  >
                    Go to My Issues
                    <ArrowRight size={16} />
                  </motion.button>
                </Link>
              ) : (
                <Link href="/auth/login?redirect=/mobile">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                    style={{ backgroundColor: 'white', color: '#4E4E94' }}
                  >
                    Login / Register
                    <ArrowRight size={16} />
                  </motion.button>
                </Link>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
              {['No OTP hassle', 'Free to use', 'Secure & private'].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-2 text-xs"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  <CheckCircle size={14} style={{ color: '#28C840' }} /> {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t py-8" style={{ borderTopColor: 'rgba(78,78,148,0.1)' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className="p-1.5 rounded-lg"
              style={{ backgroundColor: 'rgba(78,78,148,0.1)' }}
            >
              <Train size={16} style={{ color: '#4E4E94' }} />
            </div>
            <span className="font-outfit font-bold text-lg" style={{ color: '#1A1A2E' }}>
              Rail<span style={{ color: '#4E4E94' }}>Mitra</span>
            </span>
          </div>
          <p className="text-xs" style={{ color: '#4A4A6A' }}>
            © {new Date().getFullYear()} RailMitra · Powered by RailMind AI · Ministry of Railways
          </p>
        </div>
      </footer>
    </div>
  );
}
