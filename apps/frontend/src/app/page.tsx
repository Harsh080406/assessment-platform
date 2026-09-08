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
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-black font-[family-name:var(--font-inter)] selection:bg-[#A9B4E8] selection:text-black">
      {/* 1. Sticky Top Scroll Progress Tracker */}
      <ScrollProgress />

      {/* 2. Navigation */}
      <Navbar onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Main Content */}
      <main className="flex-1">
        {/* 3. Hero Section */}
        <Hero />

        {/* 4. Metric Ticker 1 */}
        <MarqueeTicker theme="dark" />

        {/* 5. Real Student Dilemmas */}
        <SocialProof />

        {/* 6. Metric Ticker 2 */}
        <MarqueeTicker theme="light" reverse />

        {/* 7. About AuraPath */}
        <AboutSection />

        {/* 8. Call-to-Action Banner */}
        <CtaBanner />
      </main>

      {/* 9. Footer */}
      <Footer />

      {/* 10. Floating Quick Action */}
      <FloatingQuickAction />

      {/* 11. Authentication Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
