// src/app/mobile/page.jsx
'use client';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../../components/GlassCard'; // adjust path if needed
import { GlowButton } from '../../components/GlowButton';
// import UnicornBackground from '../../components/sections/UnicornBackground';

export default function MobileLandingPage() {
  const { user } = useAuth();

  const features = [
    {
      title: 'Quick Complaint Logging',
      description: 'Log complaints in seconds with our simple form. Train number auto‑validation included.',
      icon: '📝',
    },
    {
      title: 'AI‑Powered Categorization',
      description: 'Our NLP engine automatically classifies your issue and assigns severity and department.',
      icon: '🤖',
    },
    {
      title: 'Real‑Time Status Tracking',
      description: 'View all your complaints and their current status (Pending, In Progress, Resolved).',
      icon: '⏱️',
    },
    {
      title: 'Works Offline (PWA)',
      description: 'Install as a Progressive Web App for offline access and native‑like experience.',
      icon: '📱',
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* <UnicornBackground /> optional decorative background */}

      <div className="relative max-w-md mx-auto px-4 py-8">
        {/* Header / Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            RailMitra
          </h1>
          <p className="text-gray-600 mt-2">Your voice matters – complain smarter</p>
        </div>

        {/* Hero Section */}
        <GlassCard className="p-6 mb-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Report Issues Instantly</h2>
          <p className="text-gray-600 mb-4">
            AI‑powered complaint system for Indian Railways. Get your concerns heard and resolved faster.
          </p>
          {user ? (
            <Link href="/mobile/issues">
              <GlowButton className="w-full py-3">Go to My Issues</GlowButton>
            </Link>
          ) : (
            <div className="space-y-3">
              <Link href="/auth/login?redirect=/mobile">
                <GlowButton className="w-full py-3">Login / Register</GlowButton>
              </Link>
              <p className="text-xs text-gray-500">
                Secure login with email – no OTP hassle.
              </p>
            </div>
          )}
        </GlassCard>

        {/* Features Grid */}
        <h3 className="text-xl font-semibold mb-4 text-center">Why use RailMitra Mobile?</h3>
        <div className="grid gap-4">
          {features.map((feat, idx) => (
            <GlassCard key={idx} className="p-4 flex items-start space-x-3">
              <span className="text-3xl">{feat.icon}</span>
              <div>
                <h4 className="font-semibold">{feat.title}</h4>
                <p className="text-sm text-gray-600">{feat.description}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} RailMitra.
        </footer>
      </div>
    </div>
  );
}