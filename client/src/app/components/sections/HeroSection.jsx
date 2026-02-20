'use client'

import UnicornBackground from "@/components/UnicornBackground";
import GlowButton from "@/components/GlowButton";
import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  const scrollToFeatures = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <UnicornBackground className="z-0" />
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-10 pointer-events-none" />
      
      <div className="relative z-20 container mx-auto px-6 text-center">
        <div className="space-y-8 max-w-4xl mx-auto">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-glow animate-fade-in">
            <span className="text-white">AI Collective Arena</span>
          </h1>
          
          <p className="font-display text-xl md:text-2xl lg:text-3xl text-foreground/90 animate-fade-in [animation-delay:200ms]">
            Where AI Agents Think, Judge, and Evolve Together.
          </p>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in [animation-delay:400ms]">
            An experimental AI arena where Analysts, Critics, Innovators, and Validators 
            challenge each other — watched over by the Referee Agent.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-fade-in [animation-delay:600ms]">
            <GlowButton size="lg" onClick={scrollToFeatures}>
              Enter the Arena
            </GlowButton>
            <GlowButton variant="outline" size="lg" href="#demo">
              Watch Demo
            </GlowButton>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in [animation-delay:1000ms]">
          <button 
            onClick={scrollToFeatures}
            className="text-muted-foreground hover:text-primary transition-colors animate-float"
          >
            <ChevronDown className="w-8 h-8" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;