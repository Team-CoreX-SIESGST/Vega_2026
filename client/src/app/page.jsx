'use client';

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import AnalyticsSection from "@/components/sections/AnalyticsSection";
import HowItWorksSection from "@/components/sections/HowItsWorksSection";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <main>
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <AnalyticsSection />
        <HowItWorksSection />
        <CTASection />
        <Footer />
      </main>
    </div>
  );
}
