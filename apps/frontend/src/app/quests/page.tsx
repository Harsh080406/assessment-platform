"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyStackHowItWorks from "@/components/StickyStackHowItWorks";
import FloatingQuickAction from "@/components/FloatingQuickAction";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function QuestsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-black font-sans selection:bg-[#A9B4E8] selection:text-black">
      <Navbar />

      <main className="flex-1">
        {/* Unified The 4 Stacking Cards Section */}
        <StickyStackHowItWorks />

        {/* Bottom Launch Banner */}
        <section className="py-14 sm:py-18 bg-[#1A1A1D] text-white border-t border-[#2E2E32]">
          <div className="max-w-4xl mx-auto px-3.5 sm:px-8 text-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-[#A9B4E8] text-black px-3.5 py-1 rounded-full shadow-sm mb-4">
              Ready to Begin?
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-[family-name:var(--font-dm-sans)]">
              START WITH QUEST 01 TODAY
            </h2>
            <p className="text-[#A9B4E8] font-medium text-sm sm:text-base mt-3 max-w-xl mx-auto px-1 leading-relaxed">
              It takes 60 seconds to calibrate your genesis stage. Zero spam, no test anxiety, and 100% private.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/assessment"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#A9B4E8] text-black font-extrabold text-sm sm:text-base hover:bg-[#8E9BDD] transition-all shadow-sm active:scale-[0.98]"
              >
                <span className="text-black font-extrabold">Launch Genesis Calibration</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] text-black" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingQuickAction />
    </div>
  );
}
