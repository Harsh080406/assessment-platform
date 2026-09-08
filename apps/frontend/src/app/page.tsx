"use client";

import { useState } from "react";
import ScrollProgress from "@/components/ScrollProgress";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MarqueeTicker from "@/components/MarqueeTicker";
import SocialProof from "@/components/SocialProof";
import AboutSection from "@/components/AboutSection";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import FloatingQuickAction from "@/components/FloatingQuickAction";
import AuthModal from "@/components/AuthModal";

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-pop-paper text-pop-ink font-sans selection:bg-pop-lime selection:text-pop-ink">
      {/* 1. Sticky Top Scroll Progress Tracker */}
      <ScrollProgress />

      {/* 2. Navigation */}
      <Navbar onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Main Content */}
      <main className="flex-1">
        {/* 3. Hero Section (Headline, Student Stickers, Primary CTAs) */}
        <Hero />

        {/* 4. Infinite Marquee Ticker 1 (Acid Lime) */}
        <MarqueeTicker theme="lime" />

        {/* 5. Sound Familiar? Real Student Dilemmas Grid */}
        <SocialProof />

        {/* 6. Infinite Marquee Ticker 2 (Hot Pink Reverse) */}
        <MarqueeTicker theme="pink" reverse />

        {/* 7. About Pathfinder / Why We Exist Section */}
        <AboutSection />

        {/* 8. Final High-Voltage CTA Banner */}
        <CtaBanner />
      </main>

      {/* 9. Footer */}
      <Footer />

      {/* 10. Floating Quick Quiz Action Button */}
      <FloatingQuickAction />

      {/* 11. Authentication Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
