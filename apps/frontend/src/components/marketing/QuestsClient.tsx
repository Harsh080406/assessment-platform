"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyStackHowItWorks from "@/components/StickyStackHowItWorks";
import FloatingQuickAction from "@/components/FloatingQuickAction";

export default function QuestsClient() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-black font-sans selection:bg-[#A9B4E8] selection:text-black">
      <Navbar />

      <main className="flex-1">
        {/* Unified The 4 Stacking Cards Section */}
        <StickyStackHowItWorks />
      </main>

      <Footer />
      <FloatingQuickAction />
    </div>
  );
}
