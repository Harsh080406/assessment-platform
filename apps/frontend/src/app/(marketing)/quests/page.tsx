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
        <section className="py-14 sm:py-18 bg-[#0F172A] text-white border-t border-[#1E293B]">
          <div className="max-w-4xl mx-auto px-3.5 sm:px-8 text-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-white/10 text-white px-3.5 py-1 rounded-full border border-white/20 mb-4 shadow-xs">
              Ready to Begin?
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              START MODULE A TODAY
            </h2>
            <p className="text-zinc-300 font-medium text-sm sm:text-base mt-3 max-w-xl mx-auto px-1 leading-relaxed">
              It takes 60 seconds to calibrate your genesis stage. Zero spam, no test anxiety, and 100% private.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/assessment"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#FF6B6B] hover:bg-[#F95858] text-white font-bold text-sm sm:text-base transition-all shadow-md active:scale-[0.98]"
              >
                <span>Launch Genesis Calibration</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
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
