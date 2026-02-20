'use client';

import Navbar from "@app/components/Navbar";
import HeroSection from "@app/components/sections/HeroSection";
import FeaturesSection from "@app/components/sections/FeaturesSection";
import ProblemSection from "@app/components/sections/ProblemsSection";
import SolutionSection from "@app/components/sections/SolutionSection";
import CTASection from "@app/components/sections/CTASection";
import Footer from "@app/components/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <main>
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
      </main>
    </div>
  );
}
