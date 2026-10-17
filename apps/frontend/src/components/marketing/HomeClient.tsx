"use client";

import ScrollProgress from "@/components/ScrollProgress";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MarqueeTicker from "@/components/MarqueeTicker";
import VantageProblemSection from "@/components/VantageProblemSection";
import WhyVantageSection from "@/components/WhyVantageSection";
import ReviewsSection from "@/components/ReviewsSection";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import FloatingQuickAction from "@/components/FloatingQuickAction";

export default function HomeClient() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-black font-[family-name:var(--font-inter)] selection:bg-[#FED7CC] selection:text-black">
      {/* 1. Sticky Top Scroll Progress Tracker */}
      <ScrollProgress />

      {/* 2. Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* 3. Hero Section (Tagline, Headline, Sub-headline, CTAs, Credibility Bar) */}
        <Hero />

        {/* 4. Metric Ticker 1 */}
        <MarqueeTicker theme="dark" />

        {/* 5. The Problem (3 Points: Marks/Pressure, 10-min Quizzes, Leadership Demands) */}
        <VantageProblemSection />

        {/* 6. Why Alderwood Vantage (4 Points: Depth, Academic Rigor, Leadership-led, 5-Year Roadmap) */}
        <WhyVantageSection />

        {/* 7. Reviews & Real Outcomes */}
        <ReviewsSection />

        {/* 8. Metric Ticker 2 */}
        <MarqueeTicker theme="light" reverse />

        {/* 10. Frequently Asked Questions */}
        <FaqSection />
      </main>

      {/* 15. Footer */}
      <Footer />

      {/* 16. Floating Quick Action */}
      <FloatingQuickAction />
    </div>
  );
}
